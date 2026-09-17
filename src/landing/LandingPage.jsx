import React from "react";
import { LandingNav } from "./components/LandingNav.jsx";
import { Hero } from "./components/Hero.jsx";
import { ConceptSection } from "./components/ConceptSection.jsx";
import { HowItWorks } from "./components/HowItWorks.jsx";
import { GestureMusic } from "./components/GestureMusic.jsx";
import { LiveVisualization } from "./components/LiveVisualization.jsx";
import { TechnologySection } from "./components/TechnologySection.jsx";
import { Playground } from "./components/Playground.jsx";
import { WhyWave } from "./components/WhyWave.jsx";
import { FinalCTA } from "./components/FinalCTA.jsx";
import { Footer } from "./components/Footer.jsx";

import "./styles/landing.css";

export function LandingPage({ onEnter }) {
  return (
    <div className="landing-root">
      <div className="landing-noise" aria-hidden="true" />
      <LandingNav onEnter={onEnter} />
      <main>
        <Hero onEnter={onEnter} />
        <ConceptSection />
        <HowItWorks />
        <GestureMusic />
        <LiveVisualization />
        <TechnologySection />
        <Playground onEnter={onEnter} />
        <WhyWave />
        <FinalCTA onEnter={onEnter} />
      </main>
      <Footer onEnter={onEnter} />
    </div>
  );
}

export default LandingPage;
