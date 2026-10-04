import React, { useEffect } from "react";
import { LandingNav } from "./components/LandingNav.jsx";
import { StorylineRail } from "./components/StorylineRail.jsx";
import { Hero } from "./components/Hero.jsx";
import { KinematicsSection } from "./components/KinematicsSection.jsx";
import { ConceptSection } from "./components/ConceptSection.jsx";
import { GestureMusic } from "./components/GestureMusic.jsx";
import { AirDrumsSection } from "./components/AirDrumsSection.jsx";
import { LiveVisualization } from "./components/LiveVisualization.jsx";
import { TechnologySection } from "./components/TechnologySection.jsx";
import { WhyWave } from "./components/WhyWave.jsx";
import { FinalCTA } from "./components/FinalCTA.jsx";
import { Footer } from "./components/Footer.jsx";

import "./styles/landing.css";

export function LandingPage({ onEnter, onEnterMultiplayer }) {
  // Smooth scroll-driven 3D transition observer
  useEffect(() => {
    const targets = document.querySelectorAll(
      ".yc-section, .yc-manifesto-section, .yc-final-section, .yc-hero-showcase-wrap, .yc-hero-3d-wrapper"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -50px 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    // Also trigger for elements already in viewport initially
    setTimeout(() => {
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          el.classList.add("is-revealed");
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-root">
      <div className="landing-noise" aria-hidden="true" />
      <LandingNav onEnter={onEnter} onEnterMultiplayer={onEnterMultiplayer} />
      <StorylineRail />
      <main>
        {/* ACT 01: The Spatial Instrument Vision */}
        <Hero onEnter={onEnter} />

        {/* ACT 02: 3D Kinematics & Interactive Hand Rig */}
        <KinematicsSection />

        {/* ACT 03: The Paradigm Shift (Problem / Solution) */}
        <ConceptSection />

        {/* ACT 04: Gesture Harmonic Matrix Soundboard */}
        <GestureMusic />

        {/* ACT 05: 3D Air Percussion Kinetic Arena */}
        <AirDrumsSection />

        {/* ACT 06: 3D Harmonic Orbital Resonator */}
        <LiveVisualization />

        {/* ACT 07: Technical Specifications & Benchmarks */}
        <TechnologySection />

        {/* ACT 08: The Architectural Manifesto */}
        <WhyWave />

        {/* ACT 09: Finale Call to Action */}
        <FinalCTA onEnter={onEnter} />
      </main>
      <Footer onEnter={onEnter} />
    </div>
  );
}

export default LandingPage;
