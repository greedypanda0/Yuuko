import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  MessageFlags,
  SlashCommandSubcommandBuilder,
  type Guild,
  type GuildSoundboardSound,
} from "discord.js";
import { ContainerBuilder } from "@discordjs/builders";
import { SlashCommand } from "../../struct/slashCommand.js";

const PAGE_SIZE = 10;

export default new SlashCommand({
  command: new SlashCommandSubcommandBuilder()
    .setName("list")
    .setDescription("list this guild soundboard sounds"),
  execute: async (_client, int: ChatInputCommandInteraction) => {
    if (!int.guild) {
      return int.sendE({
        description: "This command can only be used in a server.",
      });
    }

    let page = 1;
    const message = await int.followUp({
      components: await buildComponents(int.guild, page),
      flags: [MessageFlags.IsComponentsV2],
    });
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60_000,
    });

    collector.on("collect", async (button) => {
      if (button.user.id !== int.user.id) {
        await button.reply({
          content: "Only the command user can change pages.",
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      page += button.customId === "next" ? 1 : -1;
      await button.update({
        components: await buildComponents(int.guild!, page),
        flags: [MessageFlags.IsComponentsV2],
      });
    });

    collector.on("end", async () => {
      await message.edit({ components: [] }).catch(() => undefined);
    });
  },
});

async function buildComponents(guild: Guild, page: number) {
  const sounds = [...(await guild.soundboardSounds.fetch()).values()].sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  const pages = Math.max(1, Math.ceil(sounds.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), pages);
  const container = new ContainerBuilder()
    .setAccentColor(0x36393f)
    .addTextDisplayComponents((text) =>
      text.setContent("## Guild's soundboard"),
    );
  const pageSounds: GuildSoundboardSound[] = sounds.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  if (pageSounds.length === 0) {
    container.addTextDisplayComponents((text) =>
      text.setContent("No custom soundboard sounds yet."),
    );
  }

  for (const sound of pageSounds) {
    container.addTextDisplayComponents((text) =>
      text.setContent(
        "** <:redarrow:1547571264607100969> " + sound.name + "**",
      ),
    );
  }

  container.addTextDisplayComponents((text) =>
    text.setContent(
      "**Page:** `" +
        currentPage +
        "` / `" +
        pages +
        "`  •  **Total sounds:** `" +
        sounds.length +
        "`",
    ),
  );
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setEmoji({ name: "◀️" })
      .setCustomId("prev")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setEmoji({ name: "▶️" })
      .setCustomId("next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= pages),
  );

  return [container, row];
}
