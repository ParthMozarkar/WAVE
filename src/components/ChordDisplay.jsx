import React from "react";
import { getChordName, MAJOR_SCALE, NUMERAL_TO_DEGREE } from "../services/chords/chordTheory.js";

const MAJOR_LABELS = {
  1: "Major",
  2: "Major 1st Inv",
  3: "Major 7th",
  4: "Dominant 7th",
};

const MINOR_LABELS = {
  1: "Minor",
  2: "Minor 1st Inv",
  3: "Minor 7th",
  4: "Diminished 7th",
};

/* 7 scale degrees with gesture image + finger label mapping */
const DEGREE_CARDS = [
  { degree: 1, roman: "I",   img: "/assets/hands/hand_1finger.jpg",  fingers: "1 finger" },
  { degree: 2, roman: "II",  img: "/assets/hands/hand_2fingers.jpg", fingers: "2 fingers" },
  { degree: 3, roman: "III", img: "/assets/hands/hand_3fingers.jpg", fingers: "3 fingers" },
  { degree: 4, roman: "IV",  img: "/assets/hands/hand_open.jpg",     fingers: "4 fingers" },
  { degree: 5, roman: "V",   img: "/assets/hands/hand_open.jpg",     fingers: "5 (open)" },
  { degree: 6, roman: "VI",  img: "/assets/hands/hand_horns.jpg",    fingers: "idx + pinky" },
  { degree: 7, roman: "VII", img: "/assets/hands/hand_horns.jpg",    fingers: "horns+thumb" },
];

/* Diatonic quality suffixes for display: Maj scale = I ii iii IV V vi vii° */
const DIATONIC_SUFFIX = ["", "m", "m", "", "", "m", "dim"];

export function ChordDisplay({ activeChord, isMajorMode, qualityIndex, thumbDown, currentKey }) {
  const chordName = activeChord
    ? getChordName(activeChord, isMajorMode, currentKey)
    : "";

  const displayText = chordName || "—";

  const activeLabel = isMajorMode
    ? MAJOR_LABELS[qualityIndex]
    : MINOR_LABELS[qualityIndex];

  const qualityText = activeLabel
    ? `${activeLabel}${thumbDown ? " (-8ve)" : ""}`
    : "";

  const scale = MAJOR_SCALE[currentKey] || MAJOR_SCALE.C;

  /* Determine which degree is currently active */
  const activeDegree = activeChord ? (NUMERAL_TO_DEGREE[activeChord.toUpperCase()] || 0) : 0;

  return (
    <>
      {/* Hidden legacy elements — CSS hides them but DOM is needed for old refs */}
      <div id="chordDisplay">{displayText}</div>
      <div id="qualityDisplay">{qualityText}</div>

      {/* ─── Center chord display ─── */}
      <div className="chord-center-display">
        <div className="chord-center-name">{displayText}</div>
        {qualityText && <div className="chord-center-quality">{qualityText}</div>}
        {activeChord && <div className="chord-center-roman">{activeChord}</div>}
      </div>

      {/* ─── Bottom chord cards strip ─── */}
      <div className="chord-cards-strip">
        {DEGREE_CARDS.map((card) => {
          const root = scale[card.degree - 1];
          const suffix = DIATONIC_SUFFIX[card.degree - 1];
          const cardChordName = root + suffix;
          const isActive = activeDegree === card.degree;

          return (
            <div
              key={card.degree}
              className={`chord-card${isActive ? " is-active" : ""}`}
            >
              <img
                className="chord-card-img"
                src={card.img}
                alt={card.fingers}
                loading="lazy"
              />
              <span className="chord-card-note">{cardChordName}</span>
              <span className="chord-card-fingers">{card.fingers}</span>
              <span className="chord-card-roman">{card.roman}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
