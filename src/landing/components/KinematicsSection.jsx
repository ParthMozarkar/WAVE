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
            21 spatial landmarks. <br />
            <span className="yc-gradient-highlight">Infinite acoustic freedom.</span>
          </h2>
          <p className="yc-section-lead">
            WAVE maps your webcam stream into a sub-millimeter 3D spatial coordinate mesh.
            Click and drag to rotate the skeletal rig in full 3D, toggle poses, and explore the mathematical vectors powering each chord.
          </p>
        </div>

        <HandRig3D />
      </div>
    </section>
  );
}

export default KinematicsSection;
