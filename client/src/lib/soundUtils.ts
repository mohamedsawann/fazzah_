// Sound utility functions for game interactions
class GameAudio {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize audio context on user interaction
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private createBeep(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private createMultiToneBeep(frequencies: number[], duration: number, volume: number = 0.2) {
    if (!this.audioContext) return;

    frequencies.forEach(frequency => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext!.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + duration);

      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + duration);
    });
  }

  // Button click sound
  async playButtonClick() {
    await this.ensureAudioContext();
    this.createBeep(800, 0.1, 0.2);
  }

  // Correct answer sound - happy chord
  async playCorrectAnswer() {
    await this.ensureAudioContext();
    this.createMultiToneBeep([523, 659, 784], 0.4, 0.3); // C-E-G major chord
  }

  // Wrong answer sound - sad tone
  async playWrongAnswer() {
    await this.ensureAudioContext();
    this.createBeep(220, 0.6, 0.4); // Low A note
  }

  // Countdown tick sound
  async playCountdownTick() {
    await this.ensureAudioContext();
    this.createBeep(600, 0.1, 0.15);
  }

  // Final countdown warning (last 5 seconds)
  async playWarningTick() {
    await this.ensureAudioContext();
    this.createBeep(900, 0.15, 0.25);
  }

  // Game start sound
  async playGameStart() {
    await this.ensureAudioContext();
    // Ascending scale
    const notes = [262, 330, 392, 523]; // C-E-G-C
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.2, 0.2);
      }, index * 100);
    });
  }

  // Game complete sound
  async playGameComplete() {
    await this.ensureAudioContext();
    // Victory fanfare
    const melody = [523, 523, 659, 784, 659, 523, 392, 523];
    melody.forEach((freq, index) => {
      setTimeout(() => {
        this.createBeep(freq, 0.15, 0.25);
      }, index * 150);
    });
  }

  // Time running out warning
  async playTimeWarning() {
    await this.ensureAudioContext();
    this.createMultiToneBeep([440, 554], 0.2, 0.3); // Dissonant warning
  }
}

// Export singleton instance
export const gameAudio = new GameAudio();

// Utility functions for easy use
export const playSound = {
  buttonClick: () => gameAudio.playButtonClick(),
  correctAnswer: () => gameAudio.playCorrectAnswer(),
  wrongAnswer: () => gameAudio.playWrongAnswer(),
  countdownTick: () => gameAudio.playCountdownTick(),
  warningTick: () => gameAudio.playWarningTick(),
  gameStart: () => gameAudio.playGameStart(),
  gameComplete: () => gameAudio.playGameComplete(),
  timeWarning: () => gameAudio.playTimeWarning(),
};