import { GatewayIntentBits } from "discord.js";
import type { Config } from "./types/config.type.js";

export const config: Config = {
  client: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildExpressions,
    ],
  },
  in_dev: true,
  guildId: "876705616607969330",
  events: {
    path: "src/events",
    subdirs: ["client", "guild"],
  },

  commands: {
    path: "src/commands",
    debug: true,
  },

  sqlite: {
    path: "sqlite3.db",
  },
};
