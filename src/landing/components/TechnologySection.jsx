import React from "react";

const SPECS = [
  {
    val: "< 11ms",
    label: "End-to-End DSP Latency",
    desc: "From optical photon capture to audio buffer playback, completely undetectable to the human ear.",
  },
  {
    val: "60 FPS",
    label: "Vision AI Inference",
    desc: "Parallelized GPU landmark classification running on WebGL shaders and WebAssembly SIMD.",
  },
  {
    val: "21 Points",
    label: "3D Joint Topology",
    desc: "Sub-millimeter tracking of phalangeal joints, knuckles, and wrist orientation per hand.",
  },
  {
    val: "0 KB",
    label: "Cloud Transmission",
    desc: "100% client-side privacy. Video frames never leave your GPU memory or browser sandbox.",
  },
];

const STACK_TAGS = [
  "Google MediaPipe Vision AI",
  "WebAssembly (WASM SIMD)",
  "Web Audio API (32-bit Float)",
  "React 19 Concurrent UI",
  "WebGL GPU Shaders",
  "Biquad Analog Filter DSP",
];

export function TechnologySection() {
  return (
    <section id="tech" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">07</span>
          <span className="yc-tag-divider">//</span>
          <span>TECHNICAL SPECIFICATIONS & BENCHMARKS</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Built for studio performance. <br />
            <span className="yc-gradient-highlight">Zero compromises on latency.</span>
          </h2>
          <p className="yc-section-lead">
            Achieving real-time musical expression in the browser requires bleeding-edge optimization
            across computer vision, spatial geometry, and audio signal processing.
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
