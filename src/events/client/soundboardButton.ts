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
    if (
      !interaction.isButton() ||
      !interaction.customId.startsWith("soundboard:")
    )
      return;
    await interaction.deferReply({
      flags: [MessageFlags.Ephemeral],
    });

    const [, action, rawId] = interaction.customId.split(":");
    const soundId = Number(rawId);
    const sound = await client.soundboardManager.getById(soundId);
    if (!sound) {
      await interaction.sendE({
        description: "That sound is no longer available.",
      });
      return;
    }

    if (action === "play") {
      if (!interaction.guild) {
        await interaction.sendE({
          description: "Sounds can only be played in a server.",
        });
        return;
      }

      const member = await interaction.guild.members.fetch(interaction.user.id);
      const result = await client.soundboardManager.playSound(member, sound.id);
      await interaction.sendE({
        description: result,
      });
      return;
    }

    if (action === "upload") {
      if (!interaction.guild) {
        await interaction.sendE({
          description: "Sounds can only be uploaded in a server.",
        });
        return;
      }
      if (
        !interaction.memberPermissions?.has(
          PermissionFlagsBits.CreateGuildExpressions,
        )
      ) {
        await interaction.sendE({
          description:
            "You need Create Guild Expressions permission to upload soundboard audio.",
        });
        return;
      }

      const name = sound.name.slice(0, 32);
      if (name.length < 2) {
        await interaction.sendE({
          description: "This sound has a name that Discord cannot use.",
        });
        return;
      }

      try {
        const created = await interaction.guild.soundboardSounds.create({
          file: sound.url,
          contentType: "audio/mpeg",
          name,
        });
        await interaction.sendE({
          description:
            "Uploaded **" + created.name + "** to this guild soundboard.",
        });
      } catch (error) {
        await interaction.sendE({
          description:
            "Discord could not upload this sound. Check the bot permissions and soundboard limits.",
        });
      }
    }
  },
};

export default event;
