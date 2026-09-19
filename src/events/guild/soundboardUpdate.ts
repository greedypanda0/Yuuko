import { Events, type GuildSoundboardSound } from "discord.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.GuildSoundboardSoundUpdate,
  once: false,
  is_disabled: false,
  execute: async (
    _client,
    _oldSound: GuildSoundboardSound | null,
    sound: GuildSoundboardSound,
  ) => {
    _client.soundboardManager.updateDiscordSound(
      sound.soundId,
      sound.name,
      sound.guildId,
      sound.url,
    );
  },
};

export default event;
