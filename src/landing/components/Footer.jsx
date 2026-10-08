import React from "react";

export function Footer({ onEnter }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="yc-footer">
      <div className="lp-container yc-footer-inner">
        <div className="yc-footer-brand-col">
          <div className="yc-brand" onClick={scrollToTop} style={{ cursor: "pointer" }}>
            <div className="yc-logo-mark">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12C3 12 5.5 4 8 4C10.5 4 11 20 13.5 20C16 20 16.5 9 18.5 9C20.5 9 21 12 21 12"
                  stroke="#F59E0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="yc-brand-name">WAVE</span>
          </div>
          <p className="yc-footer-desc">
            Next-generation spatial musical instrument. Play chords, melodies, and air drums through pure hand motion.
          </p>
          <div className="yc-footer-status">
            <span className="yc-status-dot" />
            <span>WebAudio Engine: Operational</span>
          </div>
        </div>

        <div className="yc-footer-links-grid">
          <div className="yc-footer-col">
            <div className="yc-col-title">PRODUCT</div>
            <button className="yc-footer-link" onClick={onEnter}>Launch Studio</button>
            <a href="#how-it-works" className="yc-footer-link">Architecture</a>
            <a href="#gestures" className="yc-footer-link">Gesture Matrix</a>
            <a href="#tech" className="yc-footer-link">Benchmarks</a>
          </div>

          <div className="yc-footer-col">
            <div className="yc-col-title">RESOURCES</div>
            <a
              href="https://github.com/ParthMozarkar/WAVE"
              target="_blank"
              rel="noopener noreferrer"
              className="yc-footer-link"
            >
              GitHub Repository
            </a>
            <a
              href="https://github.com/google-ai-edge/mediapipe"
              target="_blank"
              rel="noopener noreferrer"
              className="yc-footer-link"
            >
              MediaPipe Vision
            </a>
            <a
              href="https://webaudio.github.io/web-audio-api/"
              target="_blank"
              rel="noopener noreferrer"
              className="yc-footer-link"
            >
              Web Audio Spec
            </a>
          </div>

          <div className="yc-footer-col">
            <div className="yc-col-title">PRIVACY</div>
            <span className="yc-footer-note">100% Client-Side Processing</span>
            <span className="yc-footer-note">No cookies, tracking, or cloud video logging</span>
            <button className="yc-footer-link" onClick={scrollToTop}>Back to Top ↑</button>
          </div>
        </div>
      </div>

      <div className="yc-footer-bottom lp-container">
        <div>© {new Date().getFullYear()} WAVE. Licensed under MIT. Open Source.</div>
        <div className="yc-built-with">Engineered for low-latency musical expression</div>
      </div>
    </footer>
  );
}

export default Footer;
