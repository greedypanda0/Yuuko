import { Events } from "discord.js";
import type { Event } from "../../types/event.type.js";
import { logger } from "../../struct/logger.js";

const event: Event = {
  name: Events.ClientReady,
  once: false,
  is_disabled: false,
  execute: async (client) => {
    logger.log(client.user?.displayName, "is ready to roll.");
    await client.commandsHandler.registerSlashCommands();
  },
};

export default event;
