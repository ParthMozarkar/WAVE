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
      {/* ─── Left side: Brand + navigation pills ─── */}
      <div className="top-bar-left">
        <span
          className="brand-label"
          onClick={onExitHome}
          style={{ cursor: onExitHome ? "pointer" : "default" }}
          title="Return to Home"
        >
          WAVE
        </span>

        <button
          className={`top-pill ${isGuideOpen ? "active" : ""}`}
          onClick={onToggleGuide}
          title="Gesture Guide"
        >
          Gesture
        </button>

        <button
          className={`top-pill ${isMappingOpen ? "active" : ""}`}
          onClick={onToggleMapping}
          title="Customize Gesture Mappings"
        >
          Mappings
        </button>

        <button
          className={`top-pill ${isRecorderOpen ? "active" : ""}`}
          onClick={onToggleRecorder}
          title="Chord Progression Recorder"
        >
          Recorder
        </button>

        <button
          className="top-pill"
          onClick={onToggleHelp}
          title="Help Reference"
        >
          Help
        </button>
      </div>

      {/* ─── Right side: mode, key, waveform, utils ─── */}
      <div className="top-bar-right">
        <button
          className={`top-pill ${mode === "drums" ? "active" : ""}`}
          onClick={() => onModeChange && onModeChange(mode === "synth" ? "drums" : "synth")}
          title="Toggle Drum Mode"
        >
          {mode === "drums" ? "🥁 Drums" : "🎸 Synth"}
        </button>

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
          <option value="triangle">Warm</option>
          <option value="sawtooth">Bright</option>
          <option value="square">Retro</option>
        </select>

        <button
          className={`top-pill ${isHistoryOpen ? "active" : ""}`}
          onClick={onToggleHistory}
          title="Session History"
        >
          History
        </button>

        {onExitHome && (
          <button
            className="top-pill"
            onClick={onExitHome}
            title="Return to Homepage"
          >
            ← Home
          </button>
        )}
      </div>
    </header>
  );
}
