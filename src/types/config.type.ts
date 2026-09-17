import type { Options } from "better-sqlite3";
import type { GatewayIntentBits } from "discord.js";

export interface Config {
  client: {
    intents: GatewayIntentBits[];
  };
  in_dev: boolean;
  guildId: string;
  events: EventsConfig;
  commands: CommandsConfig;
  sqlite: Sqlite;
}

export interface EventsConfig {
  path: string;
  subdirs: string[];
}

export interface CommandsConfig {
  path: string;
  debug?: boolean;
}

export interface Sqlite {
  path: string;
  options?: Options;
}
