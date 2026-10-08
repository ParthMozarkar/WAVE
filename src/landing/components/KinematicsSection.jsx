import React from "react";
import { HandRig3D } from "./HandRig3D.jsx";

export function KinematicsSection() {
  return (
    <section id="kinematics" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">02</span>
          <span className="yc-tag-divider">//</span>
          <span>3D SKELETAL ANATOMY</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Sculpted by your hands. <br />
            <span className="yc-gradient-highlight">Infinite acoustic freedom.</span>
          </h2>
          <p className="yc-section-lead">
            Your natural hand shapes become chords and melodies in 3D space.
            Explore the interactive hand model below and discover how each gesture creates music.
          </p>
        </div>

        <HandRig3D />
      </div>
    </section>
  );
}

export default KinematicsSection;
