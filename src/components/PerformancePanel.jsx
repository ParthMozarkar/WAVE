import React from "react";

export function PerformancePanel({ isOpen, onClose, metrics }) {
  if (!isOpen) return null;

  return (
    <div id="perfPanel" className="perf-hud">
      <div className="perf-header">
        <span>⚡ PERFORMANCE</span>
        <button className="perf-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="perf-row">
        <span className="perf-label">FPS:</span>
        <span className="perf-val">{metrics.fps}</span>
      </div>

      <div className="perf-row">
        <span className="perf-label">Latency:</span>
        <span className="perf-val">{metrics.latencyMs}</span>
      </div>

      <div className="perf-row">
        <span className="perf-label">Confidence:</span>
        <span className="perf-val">{metrics.gestureAccuracy}</span>
      </div>

      <div className="perf-row">
        <span className="perf-label">Acceptance:</span>
        <span className="perf-val">{metrics.acceptanceRate}</span>
      </div>

      <div className="perf-row">
        <span className="perf-label">Voices:</span>
        <span className="perf-val">
          {metrics.activeVoices} ({metrics.oscillatorCount} osc)
        </span>
      </div>

      <div className="perf-row">
        <span className="perf-label">Audio Engine:</span>
        <span className="perf-val">{metrics.audioState}</span>
      </div>
    </div>
  );
}
