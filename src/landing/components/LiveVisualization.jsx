import React from "react";
import { WaveCanvas } from "../animations/WaveCanvas.jsx";

export function LiveVisualization() {
  return (
    <section className="lp-live-vis lp-container">
      <div className="lp-section-header">04 / EXPRESSION ENGINE</div>

      <div className="lp-vis-container">
        <WaveCanvas height={400} interactive={true} lineCount={6} baseColor="240, 160, 50" />

        <div className="lp-vis-overlay">
          <h2 className="lp-vis-title">SEE THE MUSIC.</h2>
          <p className="lp-vis-subtitle">
            Gesture &bull; Chord &bull; Low-Pass Filter Modulation &bull; Real-Time Synthesis
          </p>
        </div>
      </div>
    </section>
  );
}
