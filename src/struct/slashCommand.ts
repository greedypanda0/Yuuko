import { Collection } from "discord.js";
import type { SlashCommandOptions } from "../types/command.type.js";
import { X509Certificate } from "crypto";

class SlashCommand {
  options: SlashCommandOptions;
  private cooldowns: Collection<string, number>;

  constructor(options: SlashCommandOptions) {
    this.options = options;
    this.cooldowns = new Collection();
  }

  setCooldown(key: string) {
    const d = this.options.cooldown ?? 5000;
    this.cooldowns.set(key, Date.now() + d);

    setTimeout(() => this.deleteCooldown(key), d);
  }

  deleteCooldown(key: string) {
    this.cooldowns.delete(key);
  }

  getCooldown(key: string): number {
    const ct = Date.now();
    const d = this.cooldowns.get(key);
    if (!d) return 0;

    return d - ct;
  }
}

export { SlashCommand };
