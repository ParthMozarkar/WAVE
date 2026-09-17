import React from "react";
import { getChordName } from "../services/chords/chordTheory.js";

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

export function ChordDisplay({ activeChord, isMajorMode, qualityIndex, thumbDown, currentKey }) {
  const chordName = activeChord
    ? getChordName(activeChord, isMajorMode, currentKey)
    : "";

  const displayText = activeChord && chordName
    ? `${chordName} (${activeChord})`
    : "--";

  const activeLabel = isMajorMode
    ? MAJOR_LABELS[qualityIndex]
    : MINOR_LABELS[qualityIndex];

  const qualityText = activeLabel
    ? `${activeLabel}${thumbDown ? " (-8ve)" : ""}`
    : "--";

  return (
    <>
      <div id="chordDisplay">{displayText}</div>
      <div id="qualityDisplay">{qualityText}</div>
    </>
  );
}
