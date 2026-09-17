import React from "react";

export function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>WAVE Guide</h2>
        <p>
          WAVE is an interactive, gesture-controlled musical instrument.
          Use your hands to create chords, harmonies, and expressive filter sweeps in real-time!
        </p>

        <h3>Left Hand</h3>
        <p>
          <b>Tilt</b><br />
          Inward → Major Mode<br />
          Outward → Minor Mode
        </p>

        <p>
          <b>Fingers (Scale Degree / Chord)</b><br />
          1 Finger → Degree I (Tonic)<br />
          2 Fingers → Degree II<br />
          3 Fingers → Degree III<br />
          4 Fingers → Degree IV<br />
          5 Fingers → Degree V<br />
          Index + Pinky → Degree VI<br />
          Index + Pinky + Thumb → Degree VII<br />
          <i>* Customize any gesture in the Mappings editor!</i>
        </p>

        <h3>Right Hand</h3>
        <p>
          <b>Fingers (Voicing & Inversion)</b><br />
          1 Finger → Root Position Triad<br />
          2 Fingers → 1st Inversion Triad<br />
          3 Fingers → Major / Minor 7th Chord<br />
          4 Fingers → Dominant / Diminished 7th Chord
        </p>

        <p>
          <b>Octave Shift</b><br />
          Thumb Out → Lower Octave (-8ve)
        </p>

        <p>
          <b>Horizontal Tilt</b><br />
          Inward → Warm Acoustic Cutoff<br />
          Outward → Bright EDM Filter Squelch
        </p>

        <p>
          <b>Vertical Height</b><br />
          Higher → Louder Volume<br />
          Lower → Softer Volume
        </p>
      </div>
    </div>
  );
}
