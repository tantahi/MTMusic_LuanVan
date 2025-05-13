class AudioManager {
    private static instance: AudioManager;
    private audio: HTMLAudioElement;
  
    private constructor() {
      this.audio = typeof window !== 'undefined' ? new Audio() : null as any;
    }
  
    public static getInstance(): AudioManager {
      if (!AudioManager.instance) {
        AudioManager.instance = new AudioManager();
      }
      return AudioManager.instance;
    }
  
    public getAudio(): HTMLAudioElement {
      return this.audio;
    }
  
    public play(): Promise<void> {
      return this.audio.play();
    }
  
    public pause(): void {
      this.audio.pause();
    }
  
    public setVolume(volume: number): void {
      this.audio.volume = volume;
    }
  
    public setCurrentTime(time: number): void {
      this.audio.currentTime = time;
    }
  
    public setSrc(src: string): void {
      this.audio.src = src;
    }
  
    public addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
      this.audio.addEventListener(type, listener);
    }
  
    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
      this.audio.removeEventListener(type, listener);
    }
  }
  
  export default AudioManager.getInstance();