import {
  createAudioPlayer,
  createAudioResource,
  entersState,
  getVoiceConnection,
  joinVoiceChannel,
  NoSubscriberBehavior,
  VoiceConnection,
  VoiceConnectionStatus,
  type VoiceConnectionState,
} from "@discordjs/voice";
import {
  VoiceState,
  type VoiceBasedChannel,
  type VoiceChannel,
} from "discord.js";
import type { BotClient } from "../../client/client.js";
import { Player } from "./player.js";

class VoiceManager {
  client: BotClient;
  private players: Map<string, Player>;

  constructor(client: BotClient) {
    this.client = client;
    this.players = new Map();
  }

  async joinChannel(ch: VoiceBasedChannel): Promise<VoiceConnection> {
    const conn = joinVoiceChannel({
      channelId: ch.id,
      guildId: ch.guild.id,
      adapterCreator: ch.guild.voiceAdapterCreator,
    });
    this.players.set(ch.guildId, new Player(ch.guildId));
    await entersState(conn, VoiceConnectionStatus.Ready, 15_000);

    conn.addListener("stateChange", (_, newState: VoiceConnectionState) => {
      if (newState.status == VoiceConnectionStatus.Destroyed) {
        this.players.delete(ch.guildId);
      }
    });

    return conn;
  }

  async playFile(ch: VoiceBasedChannel, file: string): Promise<Error | null> {
    const res = createAudioResource(file);
    const conn = getVoiceConnection(ch.guildId);
    const player = this.players.get(ch.guildId);
    if (!res || !conn || !player) {
      return new TypeError("No res or conn or player");
    }

    player.audioPlayer.play(res);
    conn?.subscribe(player.audioPlayer);
    return null;
  }
}

export { VoiceManager };
