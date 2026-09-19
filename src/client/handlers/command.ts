import {
  BaseInteraction,
  Collection,
  Events,
  MessageFlags,
  REST,
  Routes,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import type { CommandsConfig } from "../../types/config.type.js";
import type { BotClient } from "../client.js";
import { SlashCommand } from "../../struct/slashCommand.js";
import { glob, type Path } from "glob";
import { logger } from "../../struct/logger.js";

class CommandHandler {
  client: BotClient;
  collections: {
    slashCommands: Collection<string, SlashCommand>;
  };
  private config: CommandsConfig;
  private rawCommands: {
    path: Path;
    command: SlashCommand;
  }[];

  constructor(client: BotClient) {
    this.client = client;
    this.config = client.config.commands;
    this.collections = {
      slashCommands: new Collection(),
    };
    this.rawCommands = [];

    this.handleCommands();
  }

  async handleCommands() {
    this.client.on(Events.InteractionCreate, (int: BaseInteraction) =>
      this.handleInteractionCommands(int),
    );
  }

  private async handleInteractionCommands(int: BaseInteraction) {
    if (!int.isChatInputCommand() && !int.isAutocomplete()) return;

    const key = [
      int.commandName,
      int.options.getSubcommandGroup(false),
      int.options.getSubcommand(false),
    ]
      .filter(Boolean)
      .join(".");

    const command = this.collections.slashCommands.get(key);
    if (!command || !command.options.execute) return;

    if (int.isAutocomplete()) {
      if (command.options.autocomplete) {
        try {
          await command.options.autocomplete(this.client, int);
        } catch (error) {
          logger.error("Autocomplete failed:", error);
          if (!int.responded) await int.respond([]);
        }
      }
      return;
    }

    try {
      await int.deferReply({
        flags: command.options.ephemeral ? [MessageFlags.Ephemeral] : [],
      });
    } catch (error) {
      logger.error("Unable to acknowledge interaction:", error);
      return;
    }

    const cooldown = command.getCooldown(int.user.id);
    if (cooldown > 0) {
      await int.followUp({
        content: `You'll get what you wished for… <t:${Math.floor((Date.now() + cooldown) / 1000)}:R>`,
      });
      return;
    }

    try {
      await command.options.execute(this.client, int);
      command.setCooldown(int.user.id);
    } catch (error) {
      logger.error("Command failed:", error);

      await int.followUp({
        content: "Running this command was not written in destiny today.",
      });
    }
  }

  async loadCommands() {
    const extension = process.env.NODE_ENV === "production" ? "js" : "ts";

    const files = await glob(`${this.config.path}/**/**.${extension}`, {
      withFileTypes: true,
    });

    for (const f of files) {
      const { default: c } = await import(f.fullpath());

      if (!(c instanceof SlashCommand)) continue;

      this.rawCommands.push({
        path: f,
        command: c,
      });
    }
  }

  async registerSlashCommands() {
    const raw = await this.formatSlashCommands();

    const rest = new REST().setToken(this.client.token!);

    if (this.client.config.in_dev) {
      const guildId = this.client.config.guildId;
      if (!guildId) {
        logger.error(
          "unable to register commands since no id was given in config",
        );
        return;
      }

      await rest.put(
        Routes.applicationGuildCommands(this.client.user?.id!, guildId),
        {
          body: raw,
        },
      );

      logger.success(
        "registerd slash commands for guild:",
        this.client.guilds.cache.get(guildId)?.name,
        "[",
        raw.length,
        "]",
      );
    } else {
      await rest.put(Routes.applicationCommands(this.client.user?.id!), {
        body: raw,
      });

      logger.success("registerd slash commands for all guilds");
    }
  }

  private async formatSlashCommands(): Promise<SlashCommandBuilder[]> {
    const data: SlashCommandBuilder[] = [];

    const rootCommands = this.rawCommands.filter(
      (c) => c.command.options.command instanceof SlashCommandBuilder,
    );

    const groupCommands = this.rawCommands.filter(
      (c) =>
        c.command.options.command instanceof SlashCommandSubcommandGroupBuilder,
    );

    const subCommands = this.rawCommands.filter(
      (c) => c.command.options.command instanceof SlashCommandSubcommandBuilder,
    );

    for (const r of rootCommands) {
      const builder = r.command.options.command as SlashCommandBuilder;
      data.push(builder);
      this.collections.slashCommands.set(builder.name, r.command);
    }

    for (const g of groupCommands) {
      const group = g.command.options
        .command as SlashCommandSubcommandGroupBuilder;

      const index = this.rawCommands.find(
        (c) =>
          c.path.parentPath === g.path.parent?.parentPath &&
          c.path.name.split(".")[0] === "index",
      );

      if (!index) {
        logger.warn(
          "Invalid slash group:",
          group.name,
          "[",
          g.path.fullpath(),
          "]",
        );
        continue;
      }

      const root = index.command.options.command as SlashCommandBuilder;
      root.addSubcommandGroup(group);
      this.collections.slashCommands.set(
        `${root.name}.${group.name}`,
        g.command,
      );
    }

    for (const s of subCommands) {
      const sub = s.command.options.command as SlashCommandSubcommandBuilder;
      const index = this.rawCommands.find(
        (c) =>
          c.path.parentPath === s.path.parentPath &&
          c.path.name.split(".")[0] === "index",
      );

      if (!index) {
        logger.warn(
          "Invalid slash sub:",
          sub.name,
          "[",
          s.path.fullpath(),
          "]",
        );
        continue;
      }

      const parent = index.command.options.command;
      if (parent instanceof SlashCommandBuilder) {
        parent.addSubcommand(sub);

        this.collections.slashCommands.set(
          `${parent.name}.${sub.name}`,
          s.command,
        );

        continue;
      }

      if (parent instanceof SlashCommandSubcommandGroupBuilder) {
        const root = this.rawCommands.find(
          (c) =>
            c.path.parentPath === index.path.parent?.parentPath &&
            c.path.name.split(".")[0] === "index" &&
            c.command.options.command instanceof SlashCommandBuilder,
        );

        if (!root) {
          logger.warn(
            "Unable to find root command for group:",
            parent.name,
            "[",
            index.path.fullpath(),
            "]",
          );
          continue;
        }

        parent.addSubcommand(sub);
        const rootBuilder = root.command.options.command as SlashCommandBuilder;
        this.collections.slashCommands.set(
          `${rootBuilder.name}.${parent.name}.${sub.name}`,
          s.command,
        );
      }
    }

    return data;
  }
}

export { CommandHandler };
