import React from "react";
import { AirDrums3D } from "./AirDrums3D.jsx";

export function AirDrumsSection() {
  return (
    <section id="drums" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">05</span>
          <span className="yc-tag-divider">//</span>
          <span>KINETIC AIR PERCUSSION ARENA</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Down to the millisecond. <br />
            <span className="yc-gradient-highlight">Velocity-sensitive strike physics.</span>
          </h2>
          <p className="yc-section-lead">
            Optical velocity vectors detect downward wrist and fingertip acceleration at 60 FPS,
            triggering acoustic drum impacts with dynamic 7-bit MIDI velocity gradation.
          </p>
        </div>

        <AirDrums3D />
      </div>
    </section>
  );
}

export default AirDrumsSection;
