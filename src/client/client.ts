import { Client } from "discord.js";
import { config } from "../config.js";
import type { Config } from "../types/config.type.js";
import { EventsHandler } from "./handlers/event.js";
import { CommandHandler } from "./handlers/command.js";
import { VoiceManager } from "../features/voice/index.js";
import { Sqlite3 } from "../struct/sqlite3.js";
import { SoundBoardManager } from "../features/soundboard/index.js";
import "./extensions.js";

class BotClient extends Client {
  config: Config;
  eventsHandler: EventsHandler;
  commandsHandler: CommandHandler;
  voiceManager: VoiceManager;
  sqlite: Sqlite3;
  soundboardManager: SoundBoardManager;

  constructor() {
    super(config.client);

    this.config = config;
    this.eventsHandler = new EventsHandler(this);
    this.commandsHandler = new CommandHandler(this);
    this.voiceManager = new VoiceManager(this);
    this.sqlite = new Sqlite3();
    this.soundboardManager = new SoundBoardManager(this);
  }

  async run() {
    await this.eventsHandler.loadEvents();
    await this.commandsHandler.loadCommands();

    this.login(process.env.BOT_TOKEN);
  }
}

export { BotClient };
