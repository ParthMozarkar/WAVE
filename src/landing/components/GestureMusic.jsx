import React, { useState } from "react";
import { soundPreview } from "../animations/SoundPreview.js";

const GESTURE_ITEMS = [
  {
    id: "1_finger",
    gestureName: "1 Finger (Index)",
    symbol: "☝️",
    chord: "C Major 7",
    degree: "Degree I (Tonic)",
    notes: [261.63, 329.63, 392.00, 493.88],
    noteNames: "C4 · E4 · G4 · B4",
    mood: "Pure, Centered, Grounded",
  },
  {
    id: "2_fingers",
    gestureName: "2 Fingers (Peace)",
    symbol: "✌️",
    chord: "G Dominant 7",
    degree: "Degree V (Dominant)",
    notes: [196.00, 246.94, 293.66, 349.23],
    noteNames: "G3 · B3 · D4 · F4",
    mood: "Uplifting, Tense, Resolving",
  },
  {
    id: "3_fingers",
    gestureName: "3 Fingers",
    symbol: "🤟",
    chord: "A Minor 9",
    degree: "Degree vi (Relative Minor)",
    notes: [220.00, 261.63, 329.63, 392.00, 493.88],
    noteNames: "A3 · C4 · E4 · G4 · B4",
    mood: "Lush, Melancholic, Cinematic",
  },
  {
    id: "4_fingers",
    gestureName: "Open Hand (4-5)",
    symbol: "✋",
    chord: "F Major 9",
    degree: "Degree IV (Subdominant)",
    notes: [174.61, 220.00, 261.63, 329.63, 392.00],
    noteNames: "F3 · A3 · C4 · E4 · G4",
    mood: "Expansive, Ethereal, Floating",
  },
  {
    id: "rock",
    gestureName: "Rock On (Index + Pinky)",
    symbol: "🤘",
    chord: "E Minor 11",
    degree: "Degree iii (Mediant)",
    notes: [164.81, 196.00, 246.94, 329.63, 440.00],
    noteNames: "E3 · G3 · B3 · E4 · A4",
    mood: "Dark, Resonant, Mysterious",
  },
  {
    id: "horns",
    gestureName: "Love / Horns + Thumb",
    symbol: "🤟",
    chord: "B Diminished 7",
    degree: "Degree vii° (Leading Tone)",
    notes: [246.94, 293.66, 349.23, 493.88],
    noteNames: "B3 · D4 · F4 · B4",
    mood: "Tense, Dramatic, Unstable",
  },
];

export function GestureMusic() {
  const [activeItem, setActiveItem] = useState(GESTURE_ITEMS[3]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelect = (item) => {
    setActiveItem(item);
    setIsPlaying(true);
    soundPreview.playChordPreview(item.notes);
    setTimeout(() => setIsPlaying(false), 800);
  };

  return (
    <section id="gestures" className="yc-section">
      <div className="lp-container">
        <div className="yc-section-tag">
          <span className="yc-tag-num">04</span>
          <span className="yc-tag-divider">//</span>
          <span>GESTURE HARMONIC MATRIX</span>
        </div>

        <div className="yc-section-heading-wrap">
          <h2 className="yc-section-title">
            Physical gestures. <br />
            <span className="yc-gradient-highlight">Instant harmonic voicings.</span>
          </h2>
          <p className="yc-section-lead">
            Hover or tap any gesture card to preview harmonic voicings.
            Each finger pose shapes a distinct musical color and chord.
          </p>
        </div>

        <div className="yc-gestures-grid">
          {GESTURE_ITEMS.map((item) => {
            const isActive = activeItem.id === item.id;
            return (
              <div
                key={item.id}
                className={`yc-gesture-tile ${isActive ? "is-active" : ""}`}
                onMouseEnter={() => handleSelect(item)}
                onClick={() => handleSelect(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(item);
                  }
                }}
                aria-label={`${item.gestureName} triggers ${item.chord}`}
              >
                <div className="yc-tile-top">
                  <span className="yc-tile-symbol">{item.symbol}</span>
                  <span className="yc-tile-badge">{item.degree}</span>
                </div>
                <div className="yc-tile-chord">{item.chord}</div>
                <div className="yc-tile-gesture">{item.gestureName}</div>
                <div className="yc-tile-notes">{item.noteNames}</div>
                <div className="yc-tile-mood">{item.mood}</div>
                {isActive && <div className="yc-tile-active-bar" />}
              </div>
            );
          })}
        </div>

        {/* Live Audition Deck */}
        <div className="yc-audition-deck">
          <div className="yc-audition-info">
            <div className="yc-audition-name">
              <span className="yc-audition-tag">SELECTED VOICING:</span>
              <strong>{activeItem.chord}</strong>
              <span className="yc-audition-degree">({activeItem.degree})</span>
            </div>
            <div className="yc-audition-notes">
              Frequencies: {activeItem.notes.map((n) => Math.round(n) + "Hz").join(" · ")} | Tones: {activeItem.noteNames}
            </div>
          </div>

          <button
            className={`yc-btn-audition ${isPlaying ? "is-sounding" : ""}`}
            onClick={() => handleSelect(activeItem)}
            aria-label="Re-play selected chord voicing"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Audition Chord</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default GestureMusic;
