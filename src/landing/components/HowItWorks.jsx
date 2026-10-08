import React from "react";

const STEPS = [
  {
    num: "01",
    tag: "SEE YOUR HANDS",
    title: "Natural Motion Tracking",
    desc: "Your camera instantly perceives your hand positions and finger shapes in real time, with zero video data ever leaving your device.",
    highlight: "100% private on-device processing.",
    stats: "Smooth & Responsive",
  },
  {
    num: "02",
    tag: "SHAPE HARMONY",
    title: "Intuitive Musical Gestures",
    desc: "Extend fingers to play lush chords, tilt your hands to sweep the filter warmth, or strike the air to trigger dynamic drum beats.",
    highlight: "Effortless, expressive control.",
    stats: "Instant Chord Voicings",
  },
  {
    num: "03",
    tag: "HEAR THE MUSIC",
    title: "Immersive Sound Engine",
    desc: "Rich polyphonic chords and resonant percussion respond instantaneously to every nuance of your movement.",
    highlight: "Zero delay. Pure musical expression.",
    stats: "Studio-Grade Acoustic Quality",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">02</span>
          <span className="yc-tag-divider">//</span>
          <span>HOW IT WORKS</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Music at the speed of thought. <br />
            <span className="yc-gradient-highlight">From hand motion directly to sound.</span>
          </h2>
          <p className="yc-section-lead">
            Experience fluid, instantaneous musical responsiveness designed for immediate creativity.
          </p>
        </div>

        <div className="yc-steps-grid">
          {STEPS.map((step) => (
            <div key={step.num} className="yc-step-card">
              <div className="yc-step-top">
                <span className="yc-step-num">{step.num}</span>
                <span className="yc-step-tag">{step.tag}</span>
              </div>
              <h3 className="yc-step-title">{step.title}</h3>
              <p className="yc-step-desc">{step.desc}</p>
              <div className="yc-step-highlight">
                <span className="yc-highlight-bullet">⚡</span>
                <span>{step.highlight}</span>
              </div>
              <div className="yc-step-footer">
                <span>{step.stats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
