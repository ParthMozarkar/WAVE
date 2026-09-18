/**
 * WAVE — DrumEngine
 *
 * Synthesizes a 7-piece drum kit entirely via Web Audio API.
 * No audio sample files needed — uses oscillators + noise buffers.
 * Fire-and-forget API: DrumEngine.hit(drumId, velocity)
 *
 * Drum IDs:
 *   "kick" | "snare" | "hihat_closed" | "hihat_open"
 *   "tom1" | "tom2" | "crash" | "ride"
 */

export class DrumEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
  }

  // ─── Context Lifecycle ────────────────────────────────────────────────────

  ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.92;
    this.masterGain.connect(this.ctx.destination);
  }

  get state() {
    return this.ctx ? this.ctx.state : "uninitialized";
  }

  // ─── Public Hit API ───────────────────────────────────────────────────────

  /**
   * Fire a drum hit.
   * @param {string} drumId - see drum IDs above
   * @param {number} velocity - 0.0 to 1.0
   */
  hit(drumId, velocity = 0.8) {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const vel = Math.max(0.05, Math.min(1, velocity));

    switch (drumId) {
      case "kick":         this._kick(vel);         break;
      case "snare":        this._snare(vel);         break;
      case "hihat_closed": this._hihatClosed(vel);   break;
      case "hihat_open":   this._hihatOpen(vel);     break;
      case "tom1":         this._tom(vel, 180, 100); break;
      case "tom2":         this._tom(vel, 120, 70);  break;
      case "crash":        this._crash(vel);          break;
      case "ride":         this._ride(vel);           break;
      default: break;
    }
  }

  // ─── Synthesis Internals ──────────────────────────────────────────────────

  /** Kick drum: pitched sine drop + low thump */
  _kick(vel) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(vel * 1.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    gainNode.connect(this.masterGain);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + 0.52);

    // Punch layer — short click
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(vel * 0.6, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
    clickGain.connect(this.masterGain);

    const clickOsc = ctx.createOscillator();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(800, now);
    clickOsc.connect(clickGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.02);
  }

  /** Snare: noise burst + body tone */
  _snare(vel) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Noise component
    const noiseBuffer = this._makeNoiseBuffer(0.22);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1800;
    noiseFilter.Q.value = 0.5;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(vel * 1.0, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.25);

    // Body tone
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(vel * 0.7, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    bodyGain.connect(this.masterGain);

    const bodyOsc = ctx.createOscillator();
    bodyOsc.type = "triangle";
    bodyOsc.frequency.setValueAtTime(200, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
    bodyOsc.connect(bodyGain);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.12);
  }

  /** Closed hi-hat: short filtered noise */
  _hihatClosed(vel) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const noiseBuffer = this._makeNoiseBuffer(0.08);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 8000;
    filter.Q.value = 0.8;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(vel * 0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.09);
  }

  /** Open hi-hat: longer filtered noise with shimmer */
  _hihatOpen(vel) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const noiseBuffer = this._makeNoiseBuffer(0.5);
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 7000;
    filter.Q.value = 0.5;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(vel * 0.7, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.52);
  }

  /** Tom: pitched body hit with pitch drop */
  _tom(vel, freqStart, freqEnd) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(vel * 1.0, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    gainNode.connect(this.masterGain);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(freqEnd, now + 0.12);
    osc.connect(gainNode);
    osc.start(now);
    osc.stop(now + 0.38);

    // Noise attack transient
    const nb = this._makeNoiseBuffer(0.02);
    const ns = ctx.createBufferSource();
    ns.buffer = nb;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(vel * 0.4, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
    ns.connect(ng);
    ng.connect(this.masterGain);
    ns.start(now);
    ns.stop(now + 0.025);
  }

  /** Crash cymbal: long metallic noise wash */
  _crash(vel) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Long noise wash
    const nb = this._makeNoiseBuffer(1.8);
    const ns = ctx.createBufferSource();
    ns.buffer = nb;

    const hiFilter = ctx.createBiquadFilter();
    hiFilter.type = "highpass";
    hiFilter.frequency.value = 5000;

    const shimFilter = ctx.createBiquadFilter();
    shimFilter.type = "peaking";
    shimFilter.frequency.value = 10000;
    shimFilter.gain.value = 8;
    shimFilter.Q.value = 0.5;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(vel * 0.9, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    ns.connect(hiFilter);
    hiFilter.connect(shimFilter);
    shimFilter.connect(gainNode);
    gainNode.connect(this.masterGain);
    ns.start(now);
    ns.stop(now + 1.85);

    // Metallic ping
    const pingGain = ctx.createGain();
    pingGain.gain.setValueAtTime(vel * 0.5, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    pingGain.connect(this.masterGain);
    const pingOsc = ctx.createOscillator();
    pingOsc.type = "sawtooth";
    pingOsc.frequency.value = 3200;
    pingOsc.connect(pingGain);
    pingOsc.start(now);
    pingOsc.stop(now + 0.85);
  }

  /** Ride cymbal: sustained metallic shimmer + ping */
  _ride(vel) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Metallic ping
    const pingGain = ctx.createGain();
    pingGain.gain.setValueAtTime(vel * 0.7, now);
    pingGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    pingGain.connect(this.masterGain);

    const pingOsc = ctx.createOscillator();
    pingOsc.type = "sawtooth";
    pingOsc.frequency.value = 2100;
    pingOsc.connect(pingGain);
    pingOsc.start(now);
    pingOsc.stop(now + 1.25);

    // Shimmer noise
    const nb = this._makeNoiseBuffer(0.6);
    const ns = ctx.createBufferSource();
    ns.buffer = nb;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 7000;
    const shimGain = ctx.createGain();
    shimGain.gain.setValueAtTime(vel * 0.35, now);
    shimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    ns.connect(filter);
    filter.connect(shimGain);
    shimGain.connect(this.masterGain);
    ns.start(now);
    ns.stop(now + 0.65);
  }

  // ─── Utility ──────────────────────────────────────────────────────────────

  /**
   * Create a mono white-noise buffer of given duration.
   * @param {number} durationSec
   */
  _makeNoiseBuffer(durationSec) {
    const ctx = this.ctx;
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

export const drumEngine = new DrumEngine();
