import React, { useState, useEffect, useRef, useCallback } from "react";
import { RealHumanHand } from "./RealHumanHand.jsx";
import { HeroSoundWave } from "../animations/HeroSoundWave.jsx";

// Musical gesture sequences for the two hands
const LEFT_GESTURES = [
  { key: "1finger", chord: "C" },
  { key: "2fingers", chord: "G" },
  { key: "3fingers", chord: "Am" },
  { key: "open", chord: "F" },
];

const RIGHT_GESTURES = [
  { key: "open", chord: "TIMBRE" },
  { key: "2fingers", chord: "OCTAVE" },
  { key: "1finger", chord: "LEAD" },
  { key: "horns", chord: "RESONANCE" },
];

export function Hero({ onEnter }) {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(0);
  const [leftPulse, setLeftPulse] = useState(false);
  const [rightPulse, setRightPulse] = useState(false);
  const [isHoveringCTA, setIsHoveringCTA] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const heroRef = useRef(null);

  // Track mouse coordinates across the hero stage
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to 1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to 1
    setMousePos({ x: Math.max(-1, Math.min(1, nx)), y: Math.max(-1, Math.min(1, ny)) });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  // Left hand independent musical cycle (every 4.2s)
  useEffect(() => {
    const timer = setInterval(() => {
      setLeftIndex((prev) => (prev + 1) % LEFT_GESTURES.length);
      setLeftPulse(true);
      setTimeout(() => setLeftPulse(false), 900);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  // Right hand independent musical cycle (offset by 2.1s, runs every 4.2s)
  useEffect(() => {
    const initialDelay = setTimeout(() => {
      setRightIndex((prev) => (prev + 1) % RIGHT_GESTURES.length);
      setRightPulse(true);
      setTimeout(() => setRightPulse(false), 900);

      const timer = setInterval(() => {
        setRightIndex((prev) => (prev + 1) % RIGHT_GESTURES.length);
        setRightPulse(true);
        setTimeout(() => setRightPulse(false), 900);
      }, 4200);

      return () => clearInterval(timer);
    }, 2100);

    return () => clearTimeout(initialDelay);
  }, []);

  const currentLeft = LEFT_GESTURES[leftIndex];
  const currentRight = RIGHT_GESTURES[rightIndex];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="lp-hero-stage"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background ambient noise and sound filaments */}
      <HeroSoundWave
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        leftPulse={leftPulse}
        rightPulse={rightPulse}
      />

      {/* LEFT REAL HUMAN HAND */}
      <RealHumanHand
        side="left"
        currentGesture={currentLeft.key}
        chordName={currentLeft.chord}
        isPulseActive={leftPulse}
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        isHoveringCTA={isHoveringCTA}
      />

      {/* CENTRAL COMPOSITION: W A V E & MINIMALIST HIERARCHY */}
      <div className="lp-hero-center">
        {/* Sub-label */}
        <div className="lp-hero-eyebrow">
          <span className="lp-eyebrow-line" />
          <span className="lp-eyebrow-text">AN INVISIBLE INSTRUMENT</span>
          <span className="lp-eyebrow-line" />
        </div>

        {/* Monumental Central Wordmark */}
        <h1 className="lp-wave-monumental" aria-label="WAVE">
          <span className={`lp-wave-char ${leftPulse ? "is-accented" : ""}`}>W</span>
          <span className="lp-wave-char">A</span>
          <span className="lp-wave-char">V</span>
          <span className={`lp-wave-char ${rightPulse ? "is-accented" : ""}`}>E</span>
        </h1>

        {/* Tagline */}
        <p className="lp-hero-tagline">
          YOUR HAND IS THE INSTRUMENT.
        </p>

        {/* Microcopy */}
        <div className="lp-hero-microcopy">
          Gesture-controlled music, in your browser.
        </div>

        {/* Minimal High-Impact CTA */}
        <div className="lp-hero-cta-wrap">
          <button
            className="lp-btn-enter-wave"
            onClick={onEnter}
            onMouseEnter={() => setIsHoveringCTA(true)}
            onMouseLeave={() => setIsHoveringCTA(false)}
            aria-label="Enter WAVE Instrument"
          >
            <span className="lp-btn-glow" />
            <span className="lp-btn-label">ENTER WAVE</span>
            <span className="lp-btn-arrow">➔</span>
          </button>
        </div>
      </div>

      {/* RIGHT REAL HUMAN HAND */}
      <RealHumanHand
        side="right"
        currentGesture={currentRight.key}
        chordName={currentRight.chord}
        isPulseActive={rightPulse}
        mouseX={mousePos.x}
        mouseY={mousePos.y}
        isHoveringCTA={isHoveringCTA}
      />
    </section>
  );
}

export default Hero;
