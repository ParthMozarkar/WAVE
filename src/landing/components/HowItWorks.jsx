import React from "react";

const STEPS = [
  {
    num: "01",
    tag: "COMPUTER VISION",
    title: "Optical Landmark Detection",
    desc: "Your webcam stream is processed locally at 60 FPS using MediaPipe Vision on WebAssembly. 21 skeletal 3D coordinates per hand are extracted with sub-millimeter precision.",
    highlight: "Zero video frames leave your device.",
    stats: "60 FPS • WebGL GPU Accelerated",
  },
  {
    num: "02",
    tag: "SPATIAL HEURISTICS",
    title: "Kinematic Vector Classification",
    desc: "WAVE measures joint curvature, finger extension states, palm inclination, and downward strike velocity vectors to differentiate chords, pitch bends, and drum hits.",
    highlight: "Sub-pixel jitter dampening filter.",
    stats: "99.4% Detection Confidence",
  },
  {
    num: "03",
    tag: "AUDIO DSP",
    title: "Polyphonic WebAudio Synthesis",
    desc: "Chords crossfade smoothly through dual-oscillator subtractive synthesis while your right hand sculpts analog biquad filter sweeps and stereo panning in 3D Euclidean space.",
    highlight: "Zero cloud latency. Pure browser audio.",
    stats: "48 kHz • 32-bit Float Pipeline",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">02</span>
          <span className="yc-tag-divider">//</span>
          <span>ENGINEERING & ARCHITECTURE</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Engineered for zero latency. <br />
            <span className="yc-gradient-highlight">From webcam photon to speaker wave.</span>
          </h2>
          <p className="yc-section-lead">
            Three decoupled real-time pipelines running simultaneously inside your browser thread,
            delivering sub-12ms end-to-end responsiveness.
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
