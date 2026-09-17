import React from "react";

export function LandingNav({ onEnter }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="lp-nav" aria-label="Main Navigation">
      <div className="lp-container lp-nav-inner">
        <a href="#hero" className="lp-brand" onClick={(e) => { e.preventDefault(); scrollTo("hero"); }}>
          <span className="lp-dot-pulse" aria-hidden="true" />
          <span className="lp-wordmark">W A V E</span>
        </a>

        <div className="lp-nav-links">
          <button className="lp-nav-link" onClick={() => scrollTo("concept")}>
            THE IDEA
          </button>
          <button className="lp-nav-link" onClick={() => scrollTo("how-it-works")}>
            HOW IT WORKS
          </button>
          <button className="lp-nav-link" onClick={() => scrollTo("gestures")}>
            GESTURES
          </button>
          <button className="lp-nav-link" onClick={() => scrollTo("tech")}>
            TECH
          </button>
          <button className="lp-nav-cta" onClick={onEnter}>
            ENTER WAVE ➔
          </button>
        </div>
      </div>
    </nav>
  );
}
