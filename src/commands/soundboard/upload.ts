import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandSubcommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../struct/slashCommand.js";

const MAX_SOUNDBOARD_FILE_SIZE = 512 * 1024;

export default new SlashCommand({
  command: new SlashCommandSubcommandBuilder()
    .setName("upload")
    .setDescription("upload an MP3 to this guild soundboard")
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("MP3 file (maximum 512 KiB)")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("soundboard name (defaults to file name)")
        .setMinLength(2)
        .setMaxLength(32),
    ),
  execute: async (_client, int: ChatInputCommandInteraction) => {
    if (!int.guild)
      return int.sendE({
        description: "This command can only be used in a server.",
      });
    if (
      !int.memberPermissions?.has(PermissionFlagsBits.CreateGuildExpressions)
    ) {
      return int.sendE({
        description:
          "You need Create Guild Expressions permission to upload soundboard audio.",
      });
    }

    const file = int.options.getAttachment("file", true);
    if (!file.name.toLowerCase().endsWith(".mp3"))
      return int.sendE({ description: "Please attach an MP3 file." });
    if (file.size > MAX_SOUNDBOARD_FILE_SIZE) {
      return int.sendE({
        description:
          "That MP3 is too large for the Discord soundboard (maximum 512 KiB).",
      });
    }

    const name =
      int.options.getString("name")?.trim() ||
      file.name.replace(/\.mp3$/i, "").slice(0, 32);
    if (name.length < 2)
      return int.sendE({
        description: "The soundboard name must be between 2 and 32 characters.",
      });

    try {
      const sound = await int.guild.soundboardSounds.create({
        file: file.url,
        contentType: "audio/mpeg",
        name,
      });
      return int.sendE({
        description:
          "Uploaded **" + sound.name + "** to this guild soundboard.",
      });
    } catch (error) {
      console.error(error);
      return int.sendE({
        description:
          "Discord could not upload that file. Check soundboard limits and guild-expression permissions.",
      });
    }
  },
});
