import React, { useState, useEffect, useCallback } from "react";
import { soundPreview } from "../animations/SoundPreview.js";

const DRUM_KIT = [
  { id: "kick", name: "BASS KICK", key: "Space", keyShort: "SPC", desc: "Sub-harmonic 38Hz 808 punch", color: "#E59500" },
  { id: "snare", name: "SNARE CRACK", key: "KeyW", keyShort: "W", desc: "High-velocity acoustic snap", color: "#E11D48" },
  { id: "hihat", name: "CLOSED HAT", key: "KeyE", keyShort: "E", desc: "Crisp 8kHz metallic chick", color: "#0EA5E9" },
  { id: "crash", name: "CYMBAL CRASH", key: "KeyR", keyShort: "R", desc: "Sustained resonant wash", color: "#A855F7" },
];

export function AirDrums3D() {
  const [activePad, setActivePad] = useState(null);
  const [lastVelocity, setLastVelocity] = useState(118);
  const [hitCount, setHitCount] = useState(0);

  const hitDrum = useCallback((id) => {
    // Generate organic velocity variation
    const vel = Math.floor(100 + Math.random() * 27);
    setLastVelocity(vel);
    setActivePad(id);
    setHitCount((c) => c + 1);
    soundPreview.playDrumPreview(id);

    setTimeout(() => {
      setActivePad((cur) => (cur === id ? null : cur));
    }, 180);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        hitDrum("kick");
      } else if (e.code === "KeyW") {
        hitDrum("snare");
      } else if (e.code === "KeyE") {
        hitDrum("hihat");
      } else if (e.code === "KeyR") {
        hitDrum("crash");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hitDrum]);

  return (
    <div className="yc-3d-drums-wrapper">
      <div className="yc-drums-header">
        <div className="yc-drums-title-bar">
          <span className="yc-rig-badge">3D KINETIC ARENA</span>
          <span className="yc-rig-info">Downward Acceleration Vector Triggers • Keyboard or Click</span>
        </div>
        <div className="yc-rig-telemetry">
          <span className="yc-rig-pill">HITS: {hitCount}</span>
          <span className="yc-rig-pill">MIDI VELOCITY: {lastVelocity}/127</span>
          <span className="yc-rig-pill">PHYSICS DSP: ACTIVE</span>
        </div>
      </div>

      <div className="yc-drums-arena">
        <div className="yc-drums-perspective-stage">
          {DRUM_KIT.map((drum) => {
            const isHit = activePad === drum.id;
            return (
              <div
                key={drum.id}
                className={`yc-3d-drum-card ${isHit ? "is-struck" : ""}`}
                style={{ "--drum-color": drum.color }}
                onClick={() => hitDrum(drum.id)}
                role="button"
                tabIndex={0}
                aria-label={`Trigger ${drum.name}`}
              >
                <div className="yc-drum-key-tag">[{drum.keyShort}]</div>
                <div className="yc-drum-plate">
                  <div className="yc-plate-rim" />
                  <div className="yc-plate-core">
                    <span className="yc-drum-glyph">●</span>
                  </div>
                </div>
                <div className="yc-drum-meta">
                  <div className="yc-drum-title">{drum.name}</div>
                  <div className="yc-drum-detail">{drum.desc}</div>
                </div>
                {isHit && <div className="yc-drum-shockwave" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="yc-drums-footer">
        <div className="yc-drums-tip">
          <span>⚡ Tap keys <strong>[SPACE]</strong>, <strong>[W]</strong>, <strong>[E]</strong>, <strong>[R]</strong> to jam live</span>
        </div>
        <div className="yc-drums-tech-spec">
          <span>Vector Threshold: 1.4 m/s² • Sub-sample Interpolation: Enabled</span>
        </div>
      </div>
    </div>
  );
}

export default AirDrums3D;
