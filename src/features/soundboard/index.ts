import { all } from "soundboard-src";
import type { BotClient } from "../../client/client.js";
import type { Sound } from "./types.js";
import type { GuildMember } from "discord.js";

class SoundBoardManager {
  client: BotClient;
  constructor(client: BotClient) {
    this.client = client;
    this.setSoundBoardTable();

    // this.fetchFromPackage();
  }

  async playSound(member: GuildMember, soundId: number): Promise<string> {
    const sound = this.getById(soundId);
    if (!sound) return "I dont have this sound.....";

    const voiceChannel = member.voice.channel;
    if (!voiceChannel) return "You are not even in voice channel....";

    const conn = await this.client.voiceManager.joinChannel(voiceChannel);
    if (!conn) return "I could not join your channel....";

    await this.client.voiceManager.playFile(voiceChannel, sound.url);
    return `<a:cd:1542916813485117470> Playing ~> ${sound.name}`;
  }

  add(id: string | null, name: string, guildId: string | null, url: string) {
    this.client.sqlite
      .prepare(
        "insert into sounds (discord_id, name, guild_id, url) VALUES (?, ?, ?, ?)",
      )
      .run(id, name, guildId, url);
  }

  removeDiscordSound(discordId: string) {
    this.client.sqlite
      .prepare("delete from sounds where discord_id = ?")
      .run(discordId);
  }

  updateDiscordSound(
    discordId: string,
    name: string,
    guildId: string,
    url: string,
  ) {
    this.client.sqlite
      .prepare(
        "update sounds set name = ?, guild_id = ?, url = ? where discord_id = ?",
      )
      .run(name, guildId, url, discordId);
  }

  get(name: string): Sound | null {
    const getSounds = this.client.sqlite.prepare<[string], Sound>(
      "select * from sounds where name = ?",
    );
    return getSounds.get(name) ?? null;
  }

  getById(id: number): Sound | null {
    const getSounds = this.client.sqlite.prepare<[number], Sound>(
      "select * from sounds where id = ?",
    );
    return getSounds.get(id) ?? null;
  }

  all(page = 1, limit = 10): { count: number; sounds: Sound[] } {
    const countStmt = this.client.sqlite.prepare<[], { total: number }>(
      "SELECT COUNT(*) AS total FROM sounds",
    );
    const { total } = countStmt.get() || { total: 0 };
    const stmt = this.client.sqlite.prepare<[number, number], Sound>(
      "SELECT * FROM sounds ORDER BY id LIMIT ? OFFSET ?",
    );
    return { count: total, sounds: stmt.all(limit, (page - 1) * limit) };
  }

  search(
    query: string,
    page = 1,
    limit = 10,
  ): { count: number; sounds: Sound[] } {
    const searchTerm = `%${query}%`;
    const countStmt = this.client.sqlite.prepare<[string], { total: number }>(
      "SELECT COUNT(*) AS total FROM sounds WHERE name LIKE ?",
    );
    const { total } = countStmt.get(searchTerm) || { total: 0 };
    const searchSounds = this.client.sqlite.prepare<
      [string, number, number],
      Sound
    >("SELECT * FROM sounds WHERE name LIKE ? ORDER BY id LIMIT ? OFFSET ?");
    return {
      count: total,
      sounds: searchSounds.all(searchTerm, limit, (page - 1) * limit),
    };
  }

  private async fetchFromPackage() {
    const sounds = await all();
    const sources = sounds
      .filter((c) => c.cat != "nsfw")
      .flatMap((c) => c.sounds);
    for (const sound of sources) this.add(null, sound.name, null, sound.path);
  }

  private setSoundBoardTable() {
    this.client.sqlite.exec(
      "create table if not exists sounds (id INTEGER PRIMARY KEY AUTOINCREMENT, discord_id TEXT, name TEXT NOT NULL, guild_id TEXT, url TEXT NOT NULL); CREATE INDEX IF NOT EXISTS idx_sounds_name ON sounds(name);",
    );
  }
}

export { SoundBoardManager };
