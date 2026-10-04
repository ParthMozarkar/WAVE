import React, { useState, useEffect, useRef, useCallback } from "react";
import { soundPreview } from "../animations/SoundPreview.js";

const CHORD_PRESETS = [
  { id: "cmaj7", name: "Cmaj7", gesture: "1 Finger (Index)", freqs: [261.63, 329.63, 392.00, 493.88], degree: "Tonic I" },
  { id: "gadd9", name: "Gadd9", gesture: "2 Fingers (Peace)", freqs: [196.00, 246.94, 293.66, 440.00], degree: "Dominant V" },
  { id: "am7", name: "Am7", gesture: "3 Fingers", freqs: [220.00, 261.63, 329.63, 392.00], degree: "Relative Minor vi" },
  { id: "fmaj9", name: "Fmaj9", gesture: "Open Palm (5)", freqs: [174.61, 220.00, 261.63, 329.63, 392.00], degree: "Subdominant IV" },
  { id: "em9", name: "Em9", gesture: "Rock Sign 🤘", freqs: [164.81, 196.00, 246.94, 293.66, 370.00], degree: "Mediant iii" },
];

const DRUM_PADS = [
  { id: "kick", name: "KICK", key: "Q", desc: "Sub 808 Strike", color: "#F59E0B" },
  { id: "snare", name: "SNARE", key: "W", desc: "Crisp Crack", color: "#EC4899" },
  { id: "hihat", name: "HI-HAT", key: "E", desc: "Metallic 8k", color: "#06B6D4" },
  { id: "crash", name: "CRASH", key: "R", desc: "Cymbal Wash", color: "#8B5CF6" },
];

export function HeroStudioConsole({ onEnter }) {
  const [activeChord, setActiveChord] = useState(CHORD_PRESETS[3]); // Fmaj9 default
  const [activeDrum, setActiveDrum] = useState(null);
  const [instrumentMode, setInstrumentMode] = useState("synth"); // "synth" | "drums"
  const [filterCutoff, setFilterCutoff] = useState(2800);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const audioEnergyRef = useRef(0.2);

  // Trigger chord with sound and visual pulse
  const triggerChord = useCallback((chord) => {
    setActiveChord(chord);
    audioEnergyRef.current = 1.0;
    soundPreview.playChordPreview(chord.freqs, filterCutoff);
  }, [filterCutoff]);

  // Trigger drum hit
  const triggerDrum = useCallback((drumId) => {
    setActiveDrum(drumId);
    audioEnergyRef.current = 1.0;
    soundPreview.playDrumPreview(drumId);
    setTimeout(() => {
      setActiveDrum((cur) => (cur === drumId ? null : cur));
    }, 180);
  }, []);

  // Keyboard shortcut listener for drum triggers
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();
      const pad = DRUM_PADS.find((p) => p.key === key);
      if (pad) {
        triggerDrum(pad.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerDrum]);

  // Handle cursor tracking inside console for spatial filter modulation
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x: nx, y: ny });
    // Modulate cutoff: 800Hz to 6000Hz based on X
    const newCutoff = Math.round(800 + nx * 5200);
    setFilterCutoff(newCutoff);
  };

  // High-performance canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      frame++;
      // Decay audio energy smoothly
      audioEnergyRef.current = Math.max(0.12, audioEnergyRef.current * 0.94);

      ctx.clearRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw dynamic multi-harmonic oscilloscope wave (matte vector lines)
      const energy = audioEnergyRef.current;
      const t = frame * 0.035;

      const waveConfigs = [
        { color: "#E59500", freq: 0.018, speed: 1.0, amp: 24 * energy, width: 2.0 },
        { color: "rgba(225, 29, 72, 0.75)", freq: 0.032, speed: 1.4, amp: 16 * energy, width: 1.5 },
        { color: "rgba(14, 165, 233, 0.75)", freq: 0.012, speed: 0.8, amp: 28 * energy, width: 1.5 },
      ];

      waveConfigs.forEach((wc) => {
        ctx.beginPath();
        ctx.strokeStyle = wc.color;
        ctx.lineWidth = wc.width;

        const cy = height * 0.5;
        const mouseMod = (mousePos.y - 0.5) * 30;

        for (let x = 0; x <= width; x += 4) {
          const envelope = Math.sin((x / width) * Math.PI); // Pin ends to zero
          const y =
            cy +
            Math.sin(x * wc.freq + t * wc.speed) * wc.amp * envelope +
            Math.cos(x * 0.008 - t * 0.5) * (wc.amp * 0.5) * envelope +
            mouseMod * envelope;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Spatial tracking node (tactile crosshairs & target reticle)
      const nodeX = width * mousePos.x;
      const nodeY = height * mousePos.y;

      // Outer precision ring
      ctx.strokeStyle = "rgba(229, 149, 0, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Inner center pip
      ctx.fillStyle = "#E59500";
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Crosshairs
      ctx.strokeStyle = "rgba(229, 149, 0, 0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nodeX - 10, nodeY);
      ctx.lineTo(nodeX + 10, nodeY);
      ctx.moveTo(nodeX, nodeY - 10);
      ctx.lineTo(nodeX, nodeY + 10);
      ctx.stroke();

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [mousePos]);

  return (
    <div
      className="yc-studio-console"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Window Bar */}
      <div className="yc-console-header">
        <div className="yc-console-dots">
          <span className="yc-dot yc-dot-red" />
          <span className="yc-dot yc-dot-yellow" />
          <span className="yc-dot yc-dot-green" />
          <span className="yc-console-title">wave_dsp_engine.v2.wasm — Live Spatial Studio</span>
        </div>

        <div className="yc-console-status">
          <span className="yc-live-indicator">
            <span className="yc-live-pulse" />
            ENGINE: ACTIVE (60 FPS)
          </span>
          <span className="yc-status-pill">LATENCY: &lt;11ms</span>
          <span className="yc-status-pill">DSP: 48 kHz / 32-bit</span>
        </div>

        <div className="yc-mode-switch">
          <button
            className={`yc-mode-btn ${instrumentMode === "synth" ? "is-active" : ""}`}
            onClick={() => setInstrumentMode("synth")}
          >
            🎹 Chords & Lead
          </button>
          <button
            className={`yc-mode-btn ${instrumentMode === "drums" ? "is-active" : ""}`}
            onClick={() => setInstrumentMode("drums")}
          >
            🥁 Air Drums
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="yc-console-stage">
        {/* Background Visualizer Canvas */}
        <canvas ref={canvasRef} className="yc-console-canvas" />

        {/* Floating Telemetry HUD (Left) */}
        <div className="yc-hud-card yc-hud-left">
          <div className="yc-hud-label">AI GESTURE RECOGNITION</div>
          <div className="yc-hud-val-large">{activeChord.name}</div>
          <div className="yc-hud-meta">
            <span>Landmarks: 21 (3D)</span>
            <span>Confidence: 99.4%</span>
          </div>
          <div className="yc-gesture-tag">
            <span className="yc-tag-icon">✋</span>
            <span>{activeChord.gesture}</span>
          </div>
        </div>

        {/* Floating Spatial Radar HUD (Right) */}
        <div className="yc-hud-card yc-hud-right">
          <div className="yc-hud-label">SPATIAL FILTER MODULATION</div>
          <div className="yc-hud-val-large">{filterCutoff} <span className="yc-unit">Hz</span></div>
          <div className="yc-hud-meta">
            <span>Cutoff X: {Math.round(mousePos.x * 100)}%</span>
            <span>Volume Y: {Math.round((1 - mousePos.y) * 100)}%</span>
          </div>
          <div className="yc-spatial-hint">
            Move cursor over canvas to sweep analog low-pass filter
          </div>
        </div>

        {/* Center Prompt Banner */}
        <div className="yc-stage-overlay">
          <div className="yc-overlay-badge">INTERACTIVE PREVIEW</div>
          <div className="yc-overlay-sub">Click chords or drum pads below to audition real WebAudio synthesis</div>
        </div>
      </div>

      {/* Bottom Interactive Deck */}
      <div className="yc-console-deck">
        {instrumentMode === "synth" ? (
          <div className="yc-chords-row">
            {CHORD_PRESETS.map((chord) => {
              const isSelected = activeChord.id === chord.id;
              return (
                <button
                  key={chord.id}
                  className={`yc-chord-pad ${isSelected ? "is-selected" : ""}`}
                  onClick={() => triggerChord(chord)}
                  onMouseEnter={() => triggerChord(chord)}
                  title={`Trigger ${chord.name} (${chord.gesture})`}
                >
                  <div className="yc-pad-header">
                    <span className="yc-pad-chord">{chord.name}</span>
                    <span className="yc-pad-degree">{chord.degree}</span>
                  </div>
                  <div className="yc-pad-gesture">{chord.gesture}</div>
                  <div className="yc-pad-freqs">
                    {chord.freqs.slice(0, 3).map((f) => Math.round(f) + "Hz").join(" · ")}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="yc-drums-row">
            {DRUM_PADS.map((pad) => {
              const isHit = activeDrum === pad.id;
              return (
                <button
                  key={pad.id}
                  className={`yc-drum-pad ${isHit ? "is-hit" : ""}`}
                  style={{ "--pad-glow": pad.color }}
                  onClick={() => triggerDrum(pad.id)}
                  title={`Hit ${pad.name} (Key: ${pad.key})`}
                >
                  <div className="yc-drum-key">Key [{pad.key}]</div>
                  <div className="yc-drum-name">{pad.name}</div>
                  <div className="yc-drum-desc">{pad.desc}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* Footer Quick Launch Strip */}
        <div className="yc-deck-footer">
          <div className="yc-footer-info">
            <span className="yc-pulse-text">● Ready for full webcam performance</span>
            <span>No sensors • No MIDI cords • Instant browser access</span>
          </div>

          <button className="yc-console-launch-btn" onClick={onEnter}>
            <span>Open Full Instrument Studio</span>
            <span className="yc-btn-arrow">➔</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroStudioConsole;
