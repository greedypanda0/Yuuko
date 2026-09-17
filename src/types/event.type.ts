import type { BotClient } from "../client/client.js";

export interface Event {
  name: string;
  once?: boolean;
  is_disabled: boolean;
  execute: (client: BotClient, ...args: any[]) => Promise<any> | any;
}
