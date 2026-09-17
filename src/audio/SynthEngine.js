/**
 * WAVE — SynthEngine with Polyphonic Smooth Crossfading
 * 
 * Features:
 * - Click-free polyphonic chord crossfading via individual GainNode envelopes
 * - Configurable crossfade duration (default: 120ms)
 * - Safe oscillator termination after fade-out completion
 * - Integrated waveshaper distortion, biquad lowpass filter sweep, and master gain
 * - Real-time active voice tracking for performance diagnostics
 */

export const CROSSFADE_DURATION_SEC = 0.12; // 120ms smooth crossfade

class ChordVoice {
  /**
   * @param {AudioContext} ctx
   * @param {AudioNode} destination - typically waveShaper or master filter
   * @param {number[]} freqs - frequencies for this chord
   * @param {string} waveform - 'triangle' | 'sawtooth' | 'square'
   * @param {string} key - unique key representing this note set
   */
  constructor(ctx, destination, freqs, waveform, key) {
    this.ctx = ctx;
    this.destination = destination;
    this.freqs = freqs;
    this.waveform = waveform;
    this.key = key;
    this.isStopping = false;

    // Dedicated gain envelope for this chord
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 0.0001; // start silent

    this.oscillators = freqs.map((freq) => {
      const osc = ctx.createOscillator();
      osc.type = waveform;
      osc.frequency.value = freq;
      osc.connect(this.gainNode);
      return osc;
    });

    this.gainNode.connect(destination);

    const now = ctx.currentTime;
    this.oscillators.forEach((osc) => osc.start(now));

    // Smooth fade IN
    this.gainNode.gain.setValueAtTime(0.0001, now);
    this.gainNode.gain.linearRampToValueAtTime(1.0, now + CROSSFADE_DURATION_SEC);
  }

  /**
   * Smoothly fade out and schedule oscillator stop & disconnect
   * @param {number} duration - fade-out duration in seconds
   */
  fadeOutAndStop(duration = CROSSFADE_DURATION_SEC) {
    if (this.isStopping) return;
    this.isStopping = true;

    const now = this.ctx.currentTime;
    const currentGain = Math.max(0.0001, this.gainNode.gain.value);

    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(currentGain, now);
    this.gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    const stopTime = now + duration + 0.03;
    this.oscillators.forEach((osc) => {
      try {
        osc.stop(stopTime);
      } catch {
        // already stopped
      }
    });

    // Disconnect nodes after audio has fully stopped
    setTimeout(() => {
      try {
        this.oscillators.forEach((osc) => osc.disconnect());
        this.gainNode.disconnect();
      } catch {
        // ignore disconnect errors
      }
    }, (duration + 0.05) * 1000);
  }

  /**
   * Immediately terminate oscillators
   */
  stopImmediate() {
    this.isStopping = true;
    const now = this.ctx.currentTime;
    try {
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(0, now);
      this.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {}
      });
      this.gainNode.disconnect();
    } catch {}
  }
}

export class SynthEngine {
  constructor() {
    this.ctx = null;
    this.waveShaper = null;
    this.filter = null;
    this.masterGain = null;

    /** @type {ChordVoice|null} */
    this.currentVoice = null;
    /** @type {ChordVoice[]} */
    this.fadingVoices = [];

    this.currentKey = null;
    this.currentWaveform = "triangle";
    this.crossfadeDuration = CROSSFADE_DURATION_SEC;
  }

  ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.waveShaper = this.ctx.createWaveShaper();
    this.waveShaper.curve = null;
    this.waveShaper.oversample = "4x";

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1200;
    this.filter.Q.value = 0.7;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;

    // Signal chain: [Voice GainNodes] -> waveShaper -> filter -> masterGain -> output
    this.waveShaper.connect(this.filter);
    this.filter.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  setWaveform(waveform) {
    this.currentWaveform = waveform;
    // Force recreation on next chord trigger
    this.currentKey = null;
  }

  setVolume(volume01) {
    if (!this.ctx || !this.masterGain) return;
    const clamped = Math.max(0, Math.min(1, volume01));
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(clamped, now + 0.04);
  }

  updateFilterSweep(tiltFactor) {
    if (!this.filter || !this.ctx) return;

    let targetFrequency = 1200;
    let targetQ = 0.7;

    if (tiltFactor < 0) {
      // Inward tilt (Acoustic Warmth)
      const intensity = Math.abs(tiltFactor);
      targetFrequency = 1200 - intensity * 950;
      targetQ = 0.7 + intensity * 1.5;
    } else if (tiltFactor > 0) {
      // Outward tilt (EDM Filter Sweep)
      targetFrequency = 1200 + tiltFactor * 3800;
      targetQ = 0.7 + tiltFactor * 4.5;
    }

    const now = this.ctx.currentTime;
    this.filter.frequency.setTargetAtTime(targetFrequency, now, 0.04);
    this.filter.Q.setTargetAtTime(targetQ, now, 0.04);
  }

  /**
   * Play chords with smooth crossfade
   * @param {number[]} freqs
   */
  playNotes(freqs) {
    if (!this.ctx || freqs.length === 0) return;

    const key = freqs.map((f) => f.toFixed(1)).join(",") + `_${this.currentWaveform}`;

    // If identical notes are already playing in current voice, do nothing
    if (key === this.currentKey && this.currentVoice && !this.currentVoice.isStopping) {
      return;
    }

    // Clean up finished fading voices from list
    this.fadingVoices = this.fadingVoices.filter((v) => !v.isStopping);

    // Crossfade: fade out previous active voice
    if (this.currentVoice) {
      this.currentVoice.fadeOutAndStop(this.crossfadeDuration);
      this.fadingVoices.push(this.currentVoice);
      this.currentVoice = null;
    }

    // Spawn new voice and fade it in
    this.currentVoice = new ChordVoice(
      this.ctx,
      this.waveShaper,
      freqs,
      this.currentWaveform,
      key
    );
    this.currentKey = key;
  }

  /**
   * Smoothly fade out all voices
   * @param {number} duration
   */
  fadeOut(duration = CROSSFADE_DURATION_SEC) {
    if (this.currentVoice) {
      this.currentVoice.fadeOutAndStop(duration);
      this.fadingVoices.push(this.currentVoice);
      this.currentVoice = null;
    }
    this.currentKey = null;
    this.setVolume(0);
  }

  /**
   * Stop immediately and release all voices
   */
  stop() {
    if (this.currentVoice) {
      this.currentVoice.stopImmediate();
      this.currentVoice = null;
    }
    this.fadingVoices.forEach((v) => v.stopImmediate());
    this.fadingVoices = [];
    this.currentKey = null;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(0, now);
    }
  }

  /**
   * Diagnostic info for real performance monitor
   */
  getStats() {
    let oscCount = 0;
    if (this.currentVoice) {
      oscCount += this.currentVoice.oscillators.length;
    }
    this.fadingVoices.forEach((v) => {
      oscCount += v.oscillators.length;
    });

    return {
      audioState: this.ctx ? this.ctx.state : "uninitialized",
      activeVoices: (this.currentVoice ? 1 : 0) + this.fadingVoices.length,
      oscillatorCount: oscCount,
      sampleRate: this.ctx ? this.ctx.sampleRate : 0,
      currentTime: this.ctx ? this.ctx.currentTime.toFixed(2) : "0",
    };
  }
}
