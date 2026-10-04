import React from "react";

export function FinalCTA({ onEnter }) {
  return (
    <section id="conduct" className="yc-final-section">
      <div className="lp-container yc-final-container">
        <div className="yc-section-tag" style={{ justifyContent: "center" }}>
          <span className="yc-tag-num">09</span>
          <span className="yc-tag-divider">//</span>
          <span>THE INVISIBLE CONDUCTOR</span>
        </div>

        <div className="yc-final-badge">
          <span className="yc-badge-dot" />
          <span>ZERO HARDWARE · ZERO INSTALL</span>
        </div>

        <h2 className="yc-final-headline">
          Make your first gesture. <br />
          <span className="yc-gradient-highlight">Conduct the future.</span>
        </h2>

        <p className="yc-final-sub">
          Instant access in any modern browser. No credit card, no hardware purchase, no software downloads.
        </p>

        <div className="yc-final-actions">
          <button className="yc-btn-launch yc-btn-large" onClick={onEnter} aria-label="Launch Instrument Studio">
            <span className="yc-btn-shimmer" />
            <span className="yc-btn-text">Launch Studio Free</span>
            <span className="yc-btn-icon">➔</span>
          </button>

          <a
            href="https://github.com/ParthMozarkar/WAVE"
            target="_blank"
            rel="noreferrer"
            className="yc-btn-secondary yc-btn-large"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Star on GitHub (1.4k)</span>
          </a>
        </div>

        <div className="yc-final-privacy">
          <span>🔒 100% Client-Side · Video data stays strictly in local browser memory</span>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
