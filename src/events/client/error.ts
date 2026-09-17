import { Events } from "discord.js";
import { sendWebhookLog } from "../../struct/webhookLogger.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.Error,
  once: false,
  is_disabled: false,
  execute: async (_client, error: Error) => {
    console.error(error);
    await sendWebhookLog(
      "Client error",
      "```\n" + (error.stack || error.message) + "\n```",
      0xed4245,
    );
  },
};

export default event;
