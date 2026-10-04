import React from "react";

export function LandingNav({ onEnter, onEnterMultiplayer }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="yc-nav-wrapper">
      <nav className="yc-nav" aria-label="Main Navigation">
        <div className="yc-nav-left">
          <a
            href="#hero"
            className="yc-brand"
            onClick={(e) => {
              e.preventDefault();
              scrollTo("hero");
            }}
          >
            <div className="yc-logo-mark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 12C3 12 5.5 4 8 4C10.5 4 11 20 13.5 20C16 20 16.5 9 18.5 9C20.5 9 21 12 21 12"
                  stroke="url(#yc-brand-grad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="yc-brand-grad" x1="3" y1="4" x2="21" y2="20" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#F43F5E" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="yc-brand-name">WAVE</span>
            <span className="yc-badge-ver">v2.0</span>
          </a>

          <div className="yc-nav-links">
            <button className="yc-nav-link" onClick={() => scrollTo("hero")}>
              Overview
            </button>
            <button className="yc-nav-link" onClick={() => scrollTo("kinematics")}>
              3D Rig
            </button>
            <button className="yc-nav-link" onClick={() => scrollTo("gestures")}>
              Gestures
            </button>
            <button className="yc-nav-link" onClick={() => scrollTo("drums")}>
              Air Drums
            </button>
            <button className="yc-nav-link" onClick={() => scrollTo("resonator")}>
              3D Audio
            </button>
            <button className="yc-nav-link" onClick={() => scrollTo("tech")}>
              Tech Specs
            </button>
          </div>
        </div>

        <div className="yc-nav-right">
          <a
            href="https://github.com/ParthMozarkar/WAVE"
            target="_blank"
            rel="noreferrer"
            className="yc-gh-pill"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Star</span>
            <span className="yc-gh-count">1.4k</span>
          </a>

          {onEnterMultiplayer && (
            <button className="yc-nav-cta" onClick={onEnterMultiplayer} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: '#3b82f6', marginRight: '10px' }}>
              <span>Virtual Band</span>
              <span className="yc-nav-arrow">➔</span>
            </button>
          )}

          <button className="yc-nav-cta" onClick={onEnter}>
            <span>Launch Solo</span>
            <span className="yc-nav-arrow">➔</span>
          </button>
        </div>
      </nav>
    </header>
  );
}

