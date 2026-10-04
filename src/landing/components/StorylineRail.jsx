import React, { useState, useEffect } from "react";

const ACTS = [
  { id: "hero", num: "01", label: "The Spatial Vision" },
  { id: "kinematics", num: "02", label: "3D Joint Anatomy" },
  { id: "concept", num: "03", label: "The Paradigm Shift" },
  { id: "gestures", num: "04", label: "Gesture Harmonic Matrix" },
  { id: "drums", num: "05", label: "Kinetic Air Percussion" },
  { id: "resonator", num: "06", label: "3D Orbital Resonator" },
  { id: "tech", num: "07", label: "Specs & Benchmarks" },
  { id: "manifesto", num: "08", label: "The Manifesto" },
  { id: "conduct", num: "09", label: "Finale Conduct" },
];

export function StorylineRail() {
  const [activeAct, setActiveAct] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(progress);

      // Determine active section based on scroll offset
      const offsets = ACTS.map((act) => {
        const el = document.getElementById(act.id);
        if (!el) return { id: act.id, top: 0, distance: 99999 };
        const rect = el.getBoundingClientRect();
        return {
          id: act.id,
          top: rect.top,
          distance: Math.abs(rect.top - 180),
        };
      });

      // Find section closest to top offset 180px
      offsets.sort((a, b) => a.distance - b.distance);
      if (offsets[0] && offsets[0].distance < 800) {
        setActiveAct(offsets[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToAct = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside className="yc-storyline-rail" aria-label="Storyline Navigation">
      <div className="yc-rail-track">
        <div
          className="yc-rail-progress-laser"
          style={{ height: `${Math.min(100, Math.max(0, scrollProgress))}%` }}
        />
        {ACTS.map((act) => {
          const isActive = activeAct === act.id;
          return (
            <div
              key={act.id}
              className={`yc-rail-node ${isActive ? "is-active" : ""}`}
              onClick={() => scrollToAct(act.id)}
              role="button"
              tabIndex={0}
              aria-label={`Jump to Act ${act.num}: ${act.label}`}
            >
              <span className="yc-rail-pip" />
              <div className="yc-rail-tooltip">
                <span className="yc-tooltip-num">{act.num}</span>
                <span className="yc-tooltip-label">{act.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="yc-rail-percent">{Math.round(scrollProgress)}%</div>
    </aside>
  );
}

export default StorylineRail;
