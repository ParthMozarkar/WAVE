import React from "react";
import { WaveCanvas } from "../animations/WaveCanvas.jsx";

export function Playground({ onEnter }) {
  return (
    <section className="lp-playground lp-container">
      <div className="lp-section-header">06 / INTERACTIVE TEASER</div>

      <div className="lp-playground-box">
        <div className="lp-playground-header">
          <div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.5rem", textTransform: "uppercase" }}>
              MOVE YOUR CURSOR. SCULPT THE WAVE.
            </h3>
            <p style={{ margin: 0, color: "var(--lp-text-secondary)", fontSize: "0.95rem" }}>
              Experience the fluid mathematical harmonic engine that powers WAVE.
            </p>
          </div>

          <button className="lp-btn-primary" onClick={onEnter}>
            PLAY WITH WAVE ➔
          </button>
        </div>

        <WaveCanvas height={240} interactive={true} lineCount={5} baseColor="245, 180, 60" />
      </div>
    </section>
  );
}
