import React from "react";
import { KEY_OPTIONS } from "../services/chords/chordTheory.js";

export function Header({
  currentKey,
  onKeyChange,
  currentWaveform,
  onWaveformChange,
  onToggleGuide,
  isGuideOpen,
  onToggleMapping,
  isMappingOpen,
  onToggleRecorder,
  isRecorderOpen,
  onToggleHistory,
  isHistoryOpen,
  onTogglePerf,
  isPerfOpen,
  onToggleHelp,
  onExitHome,
  mode = "synth",
  onModeChange,
}) {
  return (
    <header id="topControlBar">
      <span
        className="brand-label"
        onClick={onExitHome}
        style={{ cursor: onExitHome ? "pointer" : "default" }}
        title="Return to Home"
      >
        WAVE
      </span>

      {onExitHome && (
        <button
          className="top-nav-btn"
          onClick={onExitHome}
          title="Return to Homepage"
        >
          ← Home
        </button>
      )}

      <select
        className="top-select"
        value={currentKey}
        onChange={(e) => onKeyChange(e.target.value)}
        title="Musical Key"
      >
        {KEY_OPTIONS.map((k) => (
          <option key={k.note} value={k.note}>
            {k.label}
          </option>
        ))}
      </select>

      <select
        className="top-select"
        value={currentWaveform}
        onChange={(e) => onWaveformChange(e.target.value)}
        title="Waveform Tone"
      >
        <option value="triangle">Warm Synth</option>
        <option value="sawtooth">Bright Synth</option>
        <option value="square">Retro Synth</option>
      </select>

      {/* Mode Toggle */}
      <button
        className={`top-nav-btn ${mode === "drums" ? "active" : ""}`}
        onClick={() => onModeChange && onModeChange(mode === "synth" ? "drums" : "synth")}
        title="Toggle Drum Mode"
        style={mode === "drums" ? { background: "rgba(255,160,60,0.25)", color: "#ffb347" } : {}}
      >
        {mode === "drums" ? "🥁 Drums" : "🎸 Synth"}
      </button>

      <button
        className={`top-nav-btn ${isGuideOpen ? "active" : ""}`}
        onClick={onToggleGuide}
      >
        {isGuideOpen ? "Close Guide" : "Guide"}
      </button>

      <button
        className={`top-nav-btn ${isMappingOpen ? "active" : ""}`}
        onClick={onToggleMapping}
        title="Customize Gesture Mappings"
      >
        🖐 Mappings
      </button>

      <button
        className={`top-nav-btn ${isRecorderOpen ? "active" : ""}`}
        onClick={onToggleRecorder}
        title="Chord Progression Recorder"
      >
        ⏺ Recorder
      </button>

      <button
        className={`top-nav-btn ${isHistoryOpen ? "active" : ""}`}
        onClick={onToggleHistory}
        title="Session History"
      >
        📜 History
      </button>

      <button
        className={`top-nav-btn ${isPerfOpen ? "active" : ""}`}
        onClick={onTogglePerf}
        title="Real Performance Diagnostics"
      >
        ⚡ Perf
      </button>

      <button
        className="top-nav-btn"
        onClick={onToggleHelp}
        title="Help Reference"
      >
        ?
      </button>
    </header>
  );
}
