import React from "react";

const STEPS = [
  {
    num: "01",
    title: "SHOW YOUR HAND",
    desc: "Position your hand in front of your camera. WAVE instantly tracks 21 skeletal landmarks with low-latency GPU acceleration.",
  },
  {
    num: "02",
    title: "MAKE A GESTURE",
    desc: "Finger counts map to scale degrees. Inward and outward hand tilt toggles between Major and Minor chords with live confidence scoring.",
  },
  {
    num: "03",
    title: "HEAR THE CHORD",
    desc: "Web Audio synthesis triggers instantly with smooth polyphonic crossfading, while your right hand sculpts filter sweeps and volume.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="lp-how lp-container">
      <div className="lp-section-header">02 / ARCHITECTURE</div>

      <div className="lp-steps-grid">
        {STEPS.map((step) => (
          <div key={step.num} className="lp-step-card">
            <div className="lp-step-num">{step.num}</div>
            <h3 className="lp-step-title">{step.title}</h3>
            <p className="lp-step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
