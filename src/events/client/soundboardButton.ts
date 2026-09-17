import {
  Events,
  MessageFlags,
  PermissionFlagsBits,
  type ButtonInteraction,
} from "discord.js";
import type { Event } from "../../types/event.type.js";

const event: Event = {
  name: Events.InteractionCreate,
  once: false,
  is_disabled: false,
  execute: async (client, interaction: ButtonInteraction) => {
    if (!interaction.isButton() || !interaction.customId.startsWith("soundboard:")) return;

    const [, action, rawId] = interaction.customId.split(":");
    const soundId = Number(rawId);
    const sound = client.soundboardManager.getById(soundId);
    if (!sound) {
      await interaction.reply({ content: "That sound is no longer available.", flags: [MessageFlags.Ephemeral] });
      return;
    }

    if (action === "play") {
      if (!interaction.guild) {
        await interaction.reply({ content: "Sounds can only be played in a server.", flags: [MessageFlags.Ephemeral] });
        return;
      }

      const member = await interaction.guild.members.fetch(interaction.user.id);
      const result = await client.soundboardManager.playSound(member, sound.id);
      await interaction.reply({ content: result, flags: [MessageFlags.Ephemeral] });
      return;
    }

    if (action === "upload") {
      if (!interaction.guild) {
        await interaction.reply({ content: "Sounds can only be uploaded in a server.", flags: [MessageFlags.Ephemeral] });
        return;
      }
      if (!interaction.memberPermissions?.has(PermissionFlagsBits.CreateGuildExpressions)) {
        await interaction.reply({ content: "You need Create Guild Expressions permission to upload soundboard audio.", flags: [MessageFlags.Ephemeral] });
        return;
      }

      const name = sound.name.slice(0, 32);
      if (name.length < 2) {
        await interaction.reply({ content: "This sound has a name that Discord cannot use.", flags: [MessageFlags.Ephemeral] });
        return;
      }

      try {
        const created = await interaction.guild.soundboardSounds.create({
          file: sound.url,
          contentType: "audio/mpeg",
          name,
        });
        await interaction.reply({
          content: "Uploaded **" + created.name + "** to this guild soundboard.",
          flags: [MessageFlags.Ephemeral],
        });
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "Discord could not upload this sound. Check the bot permissions and soundboard limits.",
          flags: [MessageFlags.Ephemeral],
        });
      }
    }
  },
};

export default event;
