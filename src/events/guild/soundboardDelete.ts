import { Events, type GuildSoundboardSound } from "discord.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.GuildSoundboardSoundDelete,
  once: false,
  is_disabled: false,
  execute: async (client, sound: GuildSoundboardSound) => {
    await client.soundboardManager.removeDiscordSound(sound.soundId);
  },
};

export default event;
