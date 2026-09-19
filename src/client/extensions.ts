import {
  Base,
  BaseInteraction,
  EmbedBuilder,
  type InteractionReplyOptions,
} from "discord.js";

declare module "discord.js" {
  interface BaseInteraction {
    sendE(args: SendEArgs): Promise<unknown>;
  }
}

interface SendEArgs {
  content?: string;
  title?: string;
  description?: string;
  color?: number;
}

BaseInteraction.prototype.sendE = async function (args) {
  if (!this.isRepliable()) {
    throw new Error("Interaction is not repliable");
  }

  const user = this.client.user;

  const embed = new EmbedBuilder().setColor(args.color ?? 0x36393f).setFooter({
    text: user?.username ?? "Yuuko",
    iconURL: user?.displayAvatarURL(),
  });

  if (args.title) {
    embed.setTitle(args.title);
  }

  if (args.description) {
    embed.setDescription(args.description);
  }

  const options: InteractionReplyOptions = {
    embeds: [embed],
  };
  if (args.content) {
    options.content = args.content;
  }

  return this.followUp(options);
};
