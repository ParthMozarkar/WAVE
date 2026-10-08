import React from "react";

const SPECS = [
  {
    val: "Instant",
    label: "Zero-Lag Response",
    desc: "From the moment your fingers move to the sound reaching your ears, audio playback feels completely instantaneous.",
  },
  {
    val: "Smooth",
    label: "Fluid Motion Tracking",
    desc: "Real-time recognition captures every subtle finger articulate and nuance naturally without stutter or jitter.",
  },
  {
    val: "Natural",
    label: "Full Spatial Freedom",
    desc: "Move freely in front of your camera with intuitive, comfortable gesture interaction mapped to musical harmony.",
  },
  {
    val: "Private",
    label: "100% On-Device",
    desc: "Complete privacy. Video stream is processed entirely within your local browser and never transmitted anywhere.",
  },
];

const STACK_TAGS = [
  "Spatial Gesture Recognition",
  "High-Fidelity Audio Engine",
  "Zero Hardware Setup",
  "Polyphonic Synthesis",
  "Acoustic Filter Shaping",
  "Dynamic Air Percussion",
];

export function TechnologySection() {
  return (
    <section id="tech" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">07</span>
          <span className="yc-tag-divider">//</span>
          <span>CRAFTED FOR PURE MUSICAL EXPRESSION</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Built for effortless playing. <br />
            <span className="yc-gradient-highlight">Zero barriers between you and your music.</span>
          </h2>
          <p className="yc-section-lead">
            Designed from the ground up to give anyone instant access to rich musical harmony
            and natural acoustic expression right inside their browser.
          </p>
        </div>

        <div className="yc-specs-grid">
          {SPECS.map((spec, i) => (
            <div key={i} className="yc-spec-card">
              <div className="yc-spec-val">{spec.val}</div>
              <div className="yc-spec-label">{spec.label}</div>
              <p className="yc-spec-desc">{spec.desc}</p>
            </div>
          ))}
        </div>

        <div className="yc-stack-strip">
          <div className="yc-stack-title">ENGINEERING STACK:</div>
          <div className="yc-stack-pills">
            {STACK_TAGS.map((tag, idx) => (
              <span key={idx} className="yc-stack-pill">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TechnologySection;
