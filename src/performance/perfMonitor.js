/**
 * WAVE — Real Performance & Diagnostics Monitor
 * 
 * Accurately measures:
 * - Real FPS via rolling frame timestamp delta window (last 60 frames)
 * - Real Inference Latency (ms) around MediaPipe detection calls
 * - Real Gesture Accuracy / Confidence percentage based on live detections
 * - Web Audio API state and active polyphonic voice count
 * 
 * Strict rule: All metrics are computed from real runtime measurements; never faked.
 */

export class PerformanceMonitor {
  constructor() {
    this.frameTimes = [];
    this.maxFrameWindow = 60;

    this.latencyHistory = [];
    this.maxLatencyWindow = 20;

    this.confidenceHistory = [];
    this.maxConfidenceWindow = 40;

    this.confidentFrameCount = 0;
    this.totalHandFrames = 0;

    this.lastRenderTime = performance.now();
    this.currentFps = 0;
    this.currentLatencyMs = 0;
    this.avgConfidence = 0;
    this.gestureAccuracy = 0;
  }

  /**
   * Called on every requestAnimationFrame tick
   */
  tickFrame() {
    const now = performance.now();
    const delta = now - this.lastRenderTime;
    this.lastRenderTime = now;

    if (delta > 0) {
      this.frameTimes.push(delta);
      if (this.frameTimes.length > this.maxFrameWindow) {
        this.frameTimes.shift();
      }

      const totalDelta = this.frameTimes.reduce((a, b) => a + b, 0);
      const avgDelta = totalDelta / this.frameTimes.length;
      this.currentFps = Math.round(1000 / avgDelta);
    }
  }

  /**
   * Record real inference latency measured in milliseconds
   * @param {number} durationMs
   */
  recordLatency(durationMs) {
    if (typeof durationMs === "number" && !isNaN(durationMs)) {
      this.latencyHistory.push(durationMs);
      if (this.latencyHistory.length > this.maxLatencyWindow) {
        this.latencyHistory.shift();
      }
      const sum = this.latencyHistory.reduce((a, b) => a + b, 0);
      this.currentLatencyMs = Math.round((sum / this.latencyHistory.length) * 10) / 10;
    }
  }

  /**
   * Record confidence and hand detection validity for accuracy metric
   * @param {number} confidenceScore - 0 to 100
   * @param {boolean} isHandPresent
   * @param {boolean} isAccepted
   */
  recordConfidence(confidenceScore, isHandPresent, isAccepted) {
    if (isHandPresent) {
      this.totalHandFrames++;
      if (isAccepted) {
        this.confidentFrameCount++;
      }

      this.confidenceHistory.push(confidenceScore);
      if (this.confidenceHistory.length > this.maxConfidenceWindow) {
        this.confidenceHistory.shift();
      }

      const sum = this.confidenceHistory.reduce((a, b) => a + b, 0);
      this.avgConfidence = Math.round(sum / this.confidenceHistory.length);

      // Percentage of hand frames that yielded an accepted gesture
      const windowRatio = (this.confidentFrameCount / Math.max(1, this.totalHandFrames)) * 100;
      this.gestureAccuracy = Math.round(windowRatio);
    }
  }

  /**
   * Get formatted metrics for display
   * @param {import('../audio/SynthEngine.js').SynthEngine} [synth]
   */
  getMetrics(synth) {
    const audioStats = synth ? synth.getStats() : null;

    return {
      fps: this.frameTimes.length > 5 ? this.currentFps : "Measuring...",
      latencyMs: this.latencyHistory.length > 0 ? `${this.currentLatencyMs} ms` : "Measuring...",
      gestureAccuracy: this.confidenceHistory.length > 0 ? `${this.avgConfidence}%` : "No Hand",
      acceptanceRate: this.totalHandFrames > 10 ? `${this.gestureAccuracy}%` : "Evaluating...",
      audioState: audioStats ? audioStats.audioState : "Ready",
      activeVoices: audioStats ? audioStats.activeVoices : 0,
      oscillatorCount: audioStats ? audioStats.oscillatorCount : 0,
    };
  }
}
