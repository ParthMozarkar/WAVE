/**
 * WAVE — Sound Preview Service for Landing Page
 * 
 * Generates gentle, ambient polyphonic preview chimes for interactive gesture cards.
 */

class SoundPreviewService {
  constructor() {
    this.ctx = null;
    this.activeNodes = [];
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playChordPreview(freqs = [261.63, 329.63, 392.00]) {
    try {
      const ctx = this.ensureContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = 0.55;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, now);
      masterGain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      masterGain.connect(ctx.destination);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.connect(masterGain);

      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, now);
        osc.connect(filter);
        osc.start(now);
        osc.stop(now + duration + 0.05);
      });
    } catch (e) {
      // Audio autoplay policy or device without audio
    }
  }
}

export const soundPreview = new SoundPreviewService();
