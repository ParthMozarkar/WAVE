import React from "react";
import { GESTURE_GUIDE_DATA, MAJOR_SCALE } from "../services/chords/chordTheory.js";

export function GestureGuide({ isOpen, currentKey }) {
  if (!isOpen) return null;

  const scale = MAJOR_SCALE[currentKey] || MAJOR_SCALE.A;

  return (
    <div id="gestureGuide">
      {GESTURE_GUIDE_DATA.map(({ degree, gesture }) => (
        <div key={degree} className="gesture-guide-row">
          <span className="gesture-guide-note">
            {scale[degree - 1]}
          </span>
          <span className="gesture-guide-gesture">
            {gesture}
          </span>
        </div>
      ))}
    </div>
  );
}
