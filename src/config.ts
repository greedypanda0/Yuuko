import { GatewayIntentBits } from "discord.js";
import type { Config } from "./types/config.type.js";
import { ActivityType } from "discord.js";

export const config: Config = {
  client: {
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildExpressions,
    ],
    presence: {
      activities: [
        {
          name: "Sounds | More than 100 sounds.",
          type: ActivityType.Playing,
        },
      ],
      status: "idle",
    },
  },
  in_dev: process.env.NODE_ENV != "production",
  guildId: "876705616607969330",
  events: {
    path: process.env.NODE_ENV === "production" ? "dist/events" : "src/events",
    subdirs: ["client", "guild"],
  },

  commands: {
    path:
      process.env.NODE_ENV === "production" ? "dist/commands" : "src/commands",
    debug: true,
  },

  database: {
    url: process.env.DATABASE_URL!,
  },
};
