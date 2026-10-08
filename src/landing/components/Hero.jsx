import React from "react";
import { HeroStudioConsole } from "./HeroStudioConsole.jsx";
import { HeroSpatialField3D } from "./HeroSpatialField3D.jsx";

export function Hero({ onEnter }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="yc-hero-section">
      <div className="lp-container yc-hero-container">
        {/* Top Product Announcement Pill */}
        <div className="yc-hero-badge-wrap">
          <div className="yc-hero-badge" onClick={() => scrollTo("how-it-works")}>
            <span className="yc-badge-dot" />
            <span className="yc-badge-text">WAVE • Spatial Musical Instrument</span>
            <span className="yc-badge-pill">YC S24</span>
            <span className="yc-badge-arrow">→</span>
          </div>
        </div>

        {/* Hero Monumental Headline */}
        <h1 className="yc-hero-headline">
          Play music out of <br />
          <span className="yc-gradient-highlight">thin air.</span>
        </h1>

        {/* High-Impact Consumer Musical Sub-headline */}
        <p className="yc-hero-subheadline">
          Transform your hand movements into rich chords, expressive melodies, and dynamic air percussion.
          No instruments or cables needed — just your hands and your music.
        </p>

        {/* Dual Primary Call-to-Actions */}
        <div className="yc-hero-actions">
          <button className="yc-btn-launch" onClick={onEnter} aria-label="Launch Instrument Studio">
            <span className="yc-btn-shimmer" />
            <span className="yc-btn-text">Launch Studio Free</span>
            <span className="yc-btn-icon">➔</span>
          </button>

          <button
            className="yc-btn-secondary"
            onClick={() => scrollTo("how-it-works")}
            aria-label="Learn how WAVE works"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            <span>How It Works</span>
          </button>
        </div>

        {/* Trust & Musical Capabilities Bar */}
        <div className="yc-trust-metrics">
          <div className="yc-metric-pill">
            <span className="yc-metric-icon">⚡</span>
            <span className="yc-metric-bold">Instant</span>
            <span className="yc-metric-label">Zero Delay Audio</span>
          </div>
          <div className="yc-metric-divider" />
          <div className="yc-metric-pill">
            <span className="yc-metric-icon">✋</span>
            <span className="yc-metric-bold">Natural</span>
            <span className="yc-metric-label">Fluid Hand Motion</span>
          </div>
          <div className="yc-metric-divider" />
          <div className="yc-metric-pill">
            <span className="yc-metric-icon">🔒</span>
            <span className="yc-metric-bold">100% Private</span>
            <span className="yc-metric-label">Runs In Browser</span>
          </div>
          <div className="yc-metric-divider" />
          <div className="yc-metric-pill">
            <span className="yc-metric-icon">🎹</span>
            <span className="yc-metric-bold">Dual Mode</span>
            <span className="yc-metric-label">Chords & Air Drums</span>
          </div>
        </div>

        {/* Monumental 3D Interactive Spatial Soundfield */}
        <div className="yc-hero-3d-wrapper">
          <HeroSpatialField3D />
        </div>

        {/* Centerpiece: Interactive Product Console */}
        <div className="yc-hero-showcase-wrap">
          <HeroStudioConsole onEnter={onEnter} />
        </div>
      </div>
    </section>
  );
}

export default Hero;
