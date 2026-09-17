import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../struct/slashCommand.js";

export default new SlashCommand({
  command: new SlashCommandSubcommandBuilder()
    .setName("play")
    .setDescription("play a sound from soundboard")
    .addNumberOption((s) =>
      s
        .setAutocomplete(true)
        .setName("sound")
        .setDescription("name of the sound you would like to play")
        .setRequired(true),
    ),
  autocomplete: async (client, int: AutocompleteInteraction) => {
    const q = int.options.getFocused();
    const { sounds } = client.soundboardManager.search(q);

    return await int.respond(
      sounds.map((l) => ({
        name: l.name,
        value: l.id,
      })),
    );
  },
  execute: async (client, int: ChatInputCommandInteraction) => {
    if (!int.guild) {
      int.sendE({
        description: "oh dear, it is a server only command",
      });
      return;
    }

    const soundId = int.options.getNumber("sound", true);
    const member = await int.guild.members.fetch(int.user.id);
    const res = await client.soundboardManager.playSound(member, soundId);

    return int.sendE({
      description: res,
    });
  },
});
