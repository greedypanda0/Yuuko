import { EmbedBuilder, WebhookClient } from "discord.js";

let webhook: WebhookClient | null = null;

export async function sendWebhookLog(
  title: string,
  description: string,
  color: number,
) {
  const url = process.env.WEBHOOK_URL;
  if (!url) return;

  try {
    webhook ??= new WebhookClient({ url });
    await webhook.send({
      username: "Yuuko logs",
      embeds: [
        new EmbedBuilder()
          .setColor(color)
          .setTitle(title)
          .setDescription(description.slice(0, 4096))
          .setTimestamp(),
      ],
    });
  } catch (error) {
    console.error("Unable to send webhook log:", error);
  }
}
