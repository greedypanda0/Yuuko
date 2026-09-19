import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../struct/slashCommand.js";

export default new SlashCommand({
  command: new SlashCommandBuilder()
    .setName("support")
    .setDescription("get a link to our support server"),
  execute: async (_client, int: ChatInputCommandInteraction) => {
    const supportServer = process.env.SUPPORT_SERVER;
    if (!supportServer) {
      return int.sendE({
        description: "The support server link is not configured.",
      });
    }

    return int.sendE({
      title: "Yuuko support",
      description: `[Join our support server](${supportServer})`,
    });
  },
});
