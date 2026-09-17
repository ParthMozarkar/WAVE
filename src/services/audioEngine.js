/**
 * WAVE — Audio Engine Service
 * 
 * Manages Web Audio API, polyphonic crossfade synthesizer,
 * filters, waveshapers, and volume automation outside of React renders.
 */

import { SynthEngine } from "../audio/SynthEngine.js";

class AudioEngineService {
  constructor() {
    this.synth = new SynthEngine();
    this.isReady = false;
  }

  ensureContext() {
    this.synth.ensureContext();
    this.isReady = true;
    return this.synth.ctx;
  }

  playChord(notes) {
    this.synth.playNotes(notes);
  }

  stop() {
    this.synth.stop();
  }

  fadeOut(duration = 0.12) {
    this.synth.fadeOut(duration);
  }

  setVolume(volume01) {
    this.synth.setVolume(volume01);
  }

  updateFilterSweep(tiltFactor) {
    this.synth.updateFilterSweep(tiltFactor);
  }

  setWaveform(waveform) {
    this.synth.setWaveform(waveform);
  }

  getStats() {
    return this.synth.getStats();
  }

  get state() {
    return this.synth.ctx ? this.synth.ctx.state : "uninitialized";
  }
}

export const audioEngine = new AudioEngineService();
