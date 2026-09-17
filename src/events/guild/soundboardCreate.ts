import { Events, type GuildSoundboardSound } from "discord.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.GuildSoundboardSoundCreate,
  once: false,
  is_disabled: false,
  execute: async (client, sound: GuildSoundboardSound) => {
    if (client.soundboardManager.get(sound.name)) return;

    client.soundboardManager.add(sound.soundId, sound.name, sound.guildId, sound.url);
  },
};

export default event;
