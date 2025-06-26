import * as PlayHT from 'playht';

// Initialize PlayHT client
if (typeof window !== 'undefined') {
  PlayHT.init({
    userId: process.env.NEXT_PUBLIC_PLAYHT_USER_ID || '',
    apiKey: process.env.NEXT_PUBLIC_PLAYHT_API_KEY || '',
  });
}

export class TTSService {
  private static instance: TTSService;
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  private constructor() {}

  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  async speak(text: string): Promise<void> {
    try {
      // Stop any currently playing audio
      this.stop();

      // Create audio context if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Generate speech using PlayHT
      const stream = await PlayHT.stream(text, { 
        voiceEngine: 'PlayDialog',
        voice: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json'
      });

      // Convert stream to audio blob
      const chunks: Uint8Array[] = [];
      stream.on('data', (chunk: Uint8Array) => {
        chunks.push(chunk);
      });

      return new Promise((resolve, reject) => {
        stream.on('end', async () => {
          try {
            const blob = new Blob(chunks, { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            
            // Create and play audio
            this.currentAudio = new Audio(audioUrl);
            this.currentAudio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              this.currentAudio = null;
            };
            
            await this.currentAudio.play();
            resolve();
          } catch (error) {
            reject(error);
          }
        });

        stream.on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('TTS Error:', error);
      throw error;
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}

export const ttsService = TTSService.getInstance(); 