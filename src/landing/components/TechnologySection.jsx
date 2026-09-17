import React from "react";

const TECH_STATS = [
  { val: "60 FPS", label: "Render Frame Rate" },
  { val: "<150ms", label: "Inference Latency" },
  { val: "12 KEYS", label: "Chromatic Scale Engine" },
  { val: "0 INSTALL", label: "Client-Side Web Audio" },
];

export function TechnologySection() {
  return (
    <section id="tech" className="lp-tech lp-container">
      <div className="lp-section-header">05 / SPECIFICATIONS</div>

      <h2 className="lp-tech-statement">
        BUILT FOR REAL-TIME.<br />
        ALL IN YOUR BROWSER.
      </h2>

      <p className="lp-tech-sub">
        High-precision hand landmarking, mathematical geometry classification,
        polyphonic Web Audio synthesis, and modern React state composition.
      </p>

      <div className="lp-tech-stats">
        {TECH_STATS.map((stat, i) => (
          <div key={i} className="lp-tech-stat-card">
            <div className="lp-stat-val">{stat.val}</div>
            <div className="lp-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
