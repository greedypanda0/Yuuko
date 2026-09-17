import { glob } from "glob";
import type { EventsConfig } from "../../types/config.type.js";
import type { BotClient } from "../client.js";
import { pathToFileURL } from "url";
import path from "node:path";
import { logger } from "../../struct/logger.js";

class EventsHandler {
  client: BotClient;
  private config: EventsConfig;

  constructor(client: BotClient) {
    this.client = client;
    this.config = client.config.events;
  }

  async loadEvents() {
    for (const dir of this.config.subdirs) {
      const files = await glob(`${this.config.path}/${dir}/*.{ts,js}`);

      for (const file of files) {
        await this.attachEvent(file);
      }

      logger.success("Loaded events:", dir);
    }
  }

  private async attachEvent(file: string) {
    const url = pathToFileURL(path.resolve(file)).href;

    const { default: event } = await import(url);

    if (!event || !event.name || !event.execute) {
      logger.warn("skipping invalid event file:", file);
      return;
    }

    if (event.is_disabled) {
      return;
    }

    if (event.once) {
      this.client.once(event.name, (...args) =>
        event.execute(this.client, ...args),
      );
    } else {
      this.client.on(event.name, (...args) =>
        event.execute(this.client, ...args),
      );
    }
  }
}

export { EventsHandler };
