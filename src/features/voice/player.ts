import {
  AudioPlayerStatus,
  createAudioPlayer,
  getVoiceConnection,
  NoSubscriberBehavior,
  type AudioPlayer,
} from "@discordjs/voice";

class Player {
  audioPlayer: AudioPlayer;
  guildId: string;

  constructor(guildId: string) {
    this.audioPlayer = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause,
      },
    });
    this.guildId = guildId;
    this.attachEvents();
  }

  private attachEvents() {
    this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      const conn = getVoiceConnection(this.guildId);
      conn?.destroy();
    });

    this.audioPlayer.on("error", (err) => {
      console.error("Audio error:", err);
    });
  }
}

export { Player };
