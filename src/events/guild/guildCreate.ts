import { Events, type Guild } from "discord.js";
import { sendWebhookLog } from "../../struct/webhookLogger.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.GuildCreate,
  once: false,
  is_disabled: false,
  execute: async (_client, guild: Guild) => {
    await sendWebhookLog(
      "Joined guild",
      "**Name:** " +
        guild.name +
        "\n**ID:** `" +
        guild.id +
        "`\n**Members:** " +
        guild.memberCount,
      0x57f287,
    );
  },
};

export default event;
