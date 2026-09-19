import type { GatewayIntentBits } from "discord.js";

export interface Config {
  client: {
    intents: GatewayIntentBits[];
  };
  in_dev: boolean;
  guildId: string;
  events: EventsConfig;
  commands: CommandsConfig;
  database: DatabaseConfig;
}

export interface EventsConfig {
  path: string;
  subdirs: string[];
}

export interface CommandsConfig {
  path: string;
  debug?: boolean;
}

export interface DatabaseConfig {
  url: string;
}
