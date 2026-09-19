import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  WebhookClient,
} from "discord.js";
import { SlashCommand } from "../struct/slashCommand.js";

let reportWebhook: WebhookClient | null = null;

export default new SlashCommand({
  command: new SlashCommandBuilder()
    .setName("report")
    .setDescription("send a report to the Yuuko team")
    .addStringOption((option) =>
      option
        .setName("report")
        .setDescription("describe the issue or concern")
        .setMinLength(1)
        .setMaxLength(4000)
        .setRequired(true),
    ),
  execute: async (_client, int: ChatInputCommandInteraction) => {
    const webhookUrl = process.env.REPORT_WEBHOOK;
    if (!webhookUrl) {
      return int.sendE({
        description: "Reports are not configured right now.",
      });
    }

    const report = int.options.getString("report", true);

    try {
      reportWebhook ??= new WebhookClient({ url: webhookUrl });
      await reportWebhook.send({
        username: "Yuuko reports",
        embeds: [
          new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle("New report")
            .setDescription(report)
            .addFields(
              { name: "User", value: `${int.user.tag} (${int.user.id})` },
              {
                name: "Guild",
                value: int.guild
                  ? `${int.guild.name} (${int.guild.id})`
                  : "Direct message",
              },
            )
            .setTimestamp(),
        ],
      });

      return int.sendE({
        description:
          "Your report has been sent. Thank you for letting us know.",
      });
    } catch (error) {
      console.error("Unable to send report webhook:", error);
      return int.sendE({
        description: "I could not send your report. Please try again later.",
      });
    }
  },
});
