import React, { useState } from "react";
import { soundPreview } from "../animations/SoundPreview.js";

const GESTURE_ITEMS = [
  {
    id: "1_finger",
    icon: "1️⃣",
    name: "1 Finger",
    chord: "C Major",
    degree: "Degree I (Tonic)",
    notes: [261.63, 329.63, 392.00, 523.25],
    noteNames: "C - E - G - C",
  },
  {
    id: "2_fingers",
    icon: "2️⃣",
    name: "2 Fingers",
    chord: "G Major",
    degree: "Degree V (Dominant)",
    notes: [196.00, 246.94, 293.66, 392.00],
    noteNames: "G - B - D - G",
  },
  {
    id: "3_fingers",
    icon: "3️⃣",
    name: "3 Fingers",
    chord: "A Minor",
    degree: "Degree vi (Relative Minor)",
    notes: [220.00, 261.63, 329.63, 440.00],
    noteNames: "A - C - E - A",
  },
  {
    id: "4_fingers",
    icon: "4️⃣",
    name: "4 Fingers",
    chord: "F Major",
    degree: "Degree IV (Subdominant)",
    notes: [174.61, 220.00, 261.63, 349.23],
    noteNames: "F - A - C - F",
  },
  {
    id: "rock",
    icon: "🤘",
    name: "Index + Pinky",
    chord: "E Minor",
    degree: "Degree iii (Mediant)",
    notes: [164.81, 196.00, 246.94, 329.63],
    noteNames: "E - G - B - E",
  },
  {
    id: "horns",
    icon: "🤟",
    name: "Index + Pinky + Thumb",
    chord: "B Diminished",
    degree: "Degree vii° (Leading Tone)",
    notes: [246.94, 293.66, 349.23, 493.88],
    noteNames: "B - D - F - B",
  },
];

export function GestureMusic() {
  const [activeItem, setActiveItem] = useState(GESTURE_ITEMS[0]);

  const handleSelect = (item) => {
    setActiveItem(item);
    soundPreview.playChordPreview(item.notes);
  };

  return (
    <section id="gestures" className="lp-gestures lp-container">
      <div className="lp-section-header">03 / GESTURE TO SOUND</div>

      <h2 className="lp-concept-title">
        PHYSICAL GESTURES.<br />
        INSTANT HARMONY.
      </h2>

      <p className="lp-hero-desc">
        Hover or tap any gesture below to audition chords and see how physical hands map into musical progression.
      </p>

      <div className="lp-gestures-grid">
        {GESTURE_ITEMS.map((item) => {
          const isActive = activeItem.id === item.id;
          return (
            <div
              key={item.id}
              className={`lp-gesture-card ${isActive ? "active" : ""}`}
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
              aria-label={`${item.name} plays ${item.chord}`}
            >
              <div className="lp-gesture-icon">{item.icon}</div>
              <div className="lp-gesture-name">{item.name}</div>
              <div className="lp-gesture-chord">{item.chord}</div>
              <div className="lp-gesture-hint">{item.degree}</div>
            </div>
          );
        })}
      </div>

      <div className="lp-gestures-preview-box">
        <div className="lp-preview-details">
          <div className="lp-preview-chord">{activeItem.chord}</div>
          <div className="lp-preview-sub">
            {activeItem.degree} &bull; Tones: {activeItem.noteNames}
          </div>
        </div>

        <button
          className="btn-sm"
          onClick={() => soundPreview.playChordPreview(activeItem.notes)}
          title="Play chord chime"
        >
          🔊 AUDITION CHORD
        </button>
      </div>
    </section>
  );
}
