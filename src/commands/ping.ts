import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../struct/slashCommand.js";

export default new SlashCommand({
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("get the ping"),
  execute: async (client, int: ChatInputCommandInteraction) => {
    int.sendE({
      description: "hi, I am Yuuko.",
    });
  },
});
