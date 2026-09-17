import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ComponentType,
  MessageFlags,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../struct/slashCommand.js";
import { ButtonBuilder, ContainerBuilder } from "@discordjs/builders";
import { ButtonStyle } from "discord.js";
import type { BotClient } from "../../client/client.js";

export default new SlashCommand({
  command: new SlashCommandSubcommandBuilder()
    .setName("search")
    .setDescription("search a sound in sea of sounds")
    .addStringOption((s) =>
      s.setName("query").setDescription("query to search").setRequired(true),
    ),
  execute: async (client, int: ChatInputCommandInteraction) => {
    const query = int.options.getString("query", true);
    let page = 1;
    const { can, pages } = getCan(client, page, query);
    const row = getButtons(page, pages);

    const m = await int.followUp({
      components: [can, row],
      flags: [MessageFlags.IsComponentsV2],
    });

    const collector = m.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60_000 * 5,
    });

    collector.on("collect", async (i) => {
      if (i.customId == "next") {
        page += 1;
        const { can, pages } = getCan(client, page, query);
        const row = getButtons(page, pages);
        await i.update({
          components: [can, row],
          flags: [MessageFlags.IsComponentsV2],
        });
      }

      if (i.customId == "prev") {
        page -= 1;
        if (page < 1) page = 1;

        const { can, pages } = getCan(client, page, query);
        const row = getButtons(page, pages);
        await i.update({
          components: [can, row],
          flags: [MessageFlags.IsComponentsV2],
        });
      }
    });

    collector.on("end", async (i) => {
      try {
        await m.edit({
          components: [],
          flags: [],
        });
      } catch (e) {
        console.error(e);
      }
    });
  },
});

function getCan(
  client: BotClient,
  page: number,
  query: string,
): { can: ContainerBuilder; pages: number } {
  const can = new ContainerBuilder()
    .setAccentColor(0x36393f)
    .addTextDisplayComponents((t) => t.setContent("## The sounds i have"));
  const { count, sounds } = client.soundboardManager.search(query, page, 5);
  const pages = Math.ceil(count / 5);

  for (const sound of sounds) {
    can
      .addTextDisplayComponents((t) =>
        t.setContent(`<:redarrow:1547571264607100969> **${sound.name}**`),
      )
      .addActionRowComponents((t) =>
        t.addComponents(
          new ButtonBuilder()
            .setCustomId(`play_${sound.name}`)
            .setLabel("Play")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId(`upload_${sound.name}`)
            .setLabel("Upload")
            .setStyle(ButtonStyle.Secondary),
        ),
      )
      .addSeparatorComponents((t) => t);
  }

  can.addTextDisplayComponents((t) =>
    t.setContent(
      `\n**Page:** \`${page}\` / \`${pages}\`  •  **Total Tracks:** \`${count}\``,
    ),
  );
  return { can, pages };
}

function getButtons(
  currentPage: number,
  pages: number,
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
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
}
