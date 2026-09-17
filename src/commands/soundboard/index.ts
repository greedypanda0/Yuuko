import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../struct/slashCommand.js";

export default new SlashCommand({
  command: new SlashCommandBuilder()
    .setName("soundboard")
    .setDescription("shows the soundboard"),
});
