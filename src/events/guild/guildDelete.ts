import { Events, type Guild } from "discord.js";
import { sendWebhookLog } from "../../struct/webhookLogger.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.GuildDelete,
  once: false,
  is_disabled: false,
  execute: async (_client, guild: Guild) => {
    await sendWebhookLog(
      "Left guild",
      "**Name:** " +
        guild.name +
        "\n**ID:** `" +
        guild.id +
        "`\n**Members:** " +
        guild.memberCount,
      0xed4245,
    );
  },
};

export default event;
