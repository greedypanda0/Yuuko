import type {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import type { BotClient } from "../client/client.js";

export interface SlashCommandOptions {
  command:
    | SlashCommandBuilder
    | SlashCommandSubcommandBuilder
    | SlashCommandSubcommandGroupBuilder;
  execute?: (client: BotClient, ...args: any[]) => Promise<unknown> | unknown;
  autocomplete?: (
    client: BotClient,
    ...args: any[]
  ) => Promise<unknown> | unknown;
  ephemeral?: boolean;
  cooldown?: number;
}
