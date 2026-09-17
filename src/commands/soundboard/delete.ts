import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../struct/slashCommand.js";

export default new SlashCommand({
  command: new SlashCommandSubcommandBuilder()
    .setName("delete")
    .setDescription("delete a sound from this guild soundboard")
    .addStringOption((option) =>
      option
        .setName("sound")
        .setDescription("soundboard sound to delete")
        .setAutocomplete(true)
        .setRequired(true),
    ),
  autocomplete: async (_client, int: AutocompleteInteraction) => {
    if (!int.guild) return int.respond([]);
    const query = int.options.getFocused().toLowerCase();
    const sounds = await int.guild.soundboardSounds.fetch();
    return int.respond(
      [...sounds.values()]
        .filter((sound) => sound.name.toLowerCase().includes(query))
        .slice(0, 25)
        .map((sound) => ({ name: sound.name, value: sound.soundId })),
    );
  },
  execute: async (_client, int: ChatInputCommandInteraction) => {
    if (!int.guild)
      return int.sendE({
        description: "This command can only be used in a server.",
      });
    if (
      !int.memberPermissions?.has(PermissionFlagsBits.ManageGuildExpressions)
    ) {
      return int.sendE({
        description:
          "You need Manage Guild Expressions permission to delete soundboard audio.",
      });
    }
    const soundId = int.options.getString("sound", true);

    try {
      const sound = await int.guild.soundboardSounds.fetch(soundId);
      await sound.delete();
      return int.sendE({
        description:
          "Deleted **" + sound.name + "** from this guild soundboard.",
      });
    } catch (error) {
      console.error(error);
      return int.sendE({
        description:
          "I could not find or delete that sound. It may already be gone, or the bot is missing permission.",
      });
    }
  },
});
