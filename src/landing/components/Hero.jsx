import React from "react";
import { WaveCanvas } from "../animations/WaveCanvas.jsx";

export function Hero({ onEnter }) {
  const scrollToExplore = () => {
    const el = document.getElementById("concept");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="lp-hero lp-container">
      <div className="lp-hero-tag">BROWSER-BASED GESTURE SYNTHESIZER</div>

      <h1 className="lp-hero-headline">
        YOUR HAND<br />
        IS THE<br />
        <span className="accent">INSTRUMENT.</span>
      </h1>

      <div className="lp-hero-meta">
        <p className="lp-hero-desc">
          No keys. No strings. No hardware controllers. WAVE transforms computer
          vision hand tracking into polyphonic chords, expressive filter sweeps, and real-time audio synthesis.
        </p>

        <div className="lp-hero-actions">
          <button className="lp-btn-primary" onClick={onEnter}>
            ENTER WAVE ➔
          </button>
          <button className="lp-btn-secondary" onClick={scrollToExplore}>
            EXPLORE THE SYSTEM ↓
          </button>
        </div>
      </div>

      <div className="lp-hero-canvas-wrap">
        <WaveCanvas height={320} interactive={true} lineCount={4} baseColor="232, 161, 61" />
        <div className="lp-canvas-caption">Harmonic Wave Simulator — Move cursor across the canvas</div>
      </div>
    </section>
  );
}
