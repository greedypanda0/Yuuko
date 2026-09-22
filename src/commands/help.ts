import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../struct/slashCommand.js";

export default new SlashCommand({
  command: new SlashCommandBuilder()
    .setName("help")
    .setDescription("show Yuuko's available commands"),
  execute: async (_client, int: ChatInputCommandInteraction) => {
    return int.sendE({
      title: "Yuuko commands",
      description: [
        "`/help` — show this help message",
        "`/ping` — check if Yuuko is online",
        "`/support` — get the support server link",
        "`/report <report>` — report an issue",
        "",
        "**Soundboard**",
        "`/soundboard browse` — browse available sounds",
        "`/soundboard search <query>` — search for a sound",
        "`/soundboard play <sound>` — play a sound",
        "`/soundboard upload` — upload a sound to this guild",
        "`/soundboard delete <sound>` — delete a guild sound",
        "`/soundboard list` — list this guild's sounds",
      ].join("\n"),
    });
  },
});
