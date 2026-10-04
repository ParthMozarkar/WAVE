import React from "react";
import { OrbitalSound3D } from "./OrbitalSound3D.jsx";

export function LiveVisualization() {
  return (
    <section id="resonator" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">06</span>
          <span className="yc-tag-divider">//</span>
          <span>3D HARMONIC ORBITAL RESONATOR</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Sound in 3D spherical space. <br />
            <span className="yc-gradient-highlight">Concentric harmonic resonance.</span>
          </h2>
          <p className="yc-section-lead">
            Move your cursor across the orbital gyro field to warp multidimensional acoustic phases.
            Five concentric frequency rings simulate harmonic overtone resonance in 3D space.
          </p>
        </div>

        <div className="yc-vis-card">
          <OrbitalSound3D height={380} interactive={true} />
          <div className="yc-vis-footer">
            <div className="yc-vis-stat">
              <span className="yc-vis-dot" />
              <span>3D Gimbal Resonance: 5 Concentric Overtone Shells</span>
            </div>
            <div className="yc-vis-stat">
              <span>Projection: 320px Perspective Matrix • 60 FPS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LiveVisualization;

