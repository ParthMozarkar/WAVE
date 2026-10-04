import React from "react";

export function ConceptSection() {
  return (
    <section id="concept" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">03</span>
          <span className="yc-tag-divider">//</span>
          <span>THE PARADIGM SHIFT</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Physical keys chained musicians to desks. <br />
            <span className="yc-gradient-highlight">WAVE releases sound into thin air.</span>
          </h2>
          <p className="yc-section-lead">
            For decades, electronic music production has forced human expression into plastic piano keyboards,
            rubber drum pads, and twisted MIDI cables. We built WAVE to make physical space the ultimate canvas.
          </p>
        </div>

        <div className="yc-comparison-grid">
          <div className="yc-compare-card yc-card-old">
            <div className="yc-card-badge">LEGACY HARDWARE</div>
            <h3 className="yc-compare-title">Traditional MIDI Controllers</h3>
            <ul className="yc-compare-list">
              <li>
                <span className="yc-list-icon yc-cross">✕</span>
                <span>Requires $300+ physical keyboards, drum pads & audio interfaces</span>
              </li>
              <li>
                <span className="yc-list-icon yc-cross">✕</span>
                <span>Clunky USB cables, proprietary driver installations, and DAW setup</span>
              </li>
              <li>
                <span className="yc-list-icon yc-cross">✕</span>
                <span>Constrained to 1-dimensional key strikes and mechanical switches</span>
              </li>
              <li>
                <span className="yc-list-icon yc-cross">✕</span>
                <span>Ties the performer to a stationary studio desk</span>
              </li>
            </ul>
          </div>

          <div className="yc-compare-card yc-card-new">
            <div className="yc-card-badge yc-badge-featured">WAVE SPATIAL AI</div>
            <h3 className="yc-compare-title">The Invisible Instrument</h3>
            <ul className="yc-compare-list">
              <li>
                <span className="yc-list-icon yc-check">✓</span>
                <span><strong>Zero hardware:</strong> Works instantly on any laptop or phone camera</span>
              </li>
              <li>
                <span className="yc-list-icon yc-check">✓</span>
                <span><strong>Sub-millimeter 3D tracking:</strong> 21 joints per hand at 60 FPS GPU</span>
              </li>
              <li>
                <span className="yc-list-icon yc-check">✓</span>
                <span><strong>Continuous multidimensional expression:</strong> Pitch, filter cutoff & air drum strike velocity</span>
              </li>
              <li>
                <span className="yc-list-icon yc-check">✓</span>
                <span><strong>Instant browser execution:</strong> Zero install, pure WebAudio + WASM DSP</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConceptSection;
