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
            Feel the rhythm. <br />
            <span className="yc-gradient-highlight">Natural air percussion.</span>
          </h2>
          <p className="yc-section-lead">
            Play dynamic drum patterns right in the air. WAVE translates the speed and power of your strikes
            into lifelike acoustic impacts and expressive beats.
          </p>
        </div>

        <AirDrums3D />
      </div>
    </section>
  );
}

export default AirDrumsSection;
