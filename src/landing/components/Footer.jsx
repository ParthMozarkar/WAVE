import React from "react";

export function Footer({ onEnter }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="lp-footer">
      <div className="lp-container lp-footer-inner">
        <div>
          WAVE &bull; Gesture Maestro &bull; Experimental Music Instrument
        </div>

        <div className="lp-footer-links">
          <a
            href="https://github.com/ParthMozarkar/WAVE"
            target="_blank"
            rel="noopener noreferrer"
            className="lp-footer-link"
          >
            GitHub
          </a>
          <button
            className="lp-footer-link"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={onEnter}
          >
            Launch Instrument
          </button>
          <button
            className="lp-footer-link"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={scrollToTop}
          >
            Back to Top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
