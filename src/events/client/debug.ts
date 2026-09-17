import { Events } from "discord.js";
import { sendWebhookLog } from "../../struct/webhookLogger.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.Debug,
  once: false,
  is_disabled: false,
  execute: async (_client, message: string) => {
    await sendWebhookLog("Client debug", "```\n" + message + "\n```", 0x5865f2);
  },
};

export default event;
