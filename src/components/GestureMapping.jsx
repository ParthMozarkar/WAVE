import React from "react";
import { GESTURE_DEFINITIONS, VALID_DEGREES } from "../gestures/mapping.js";
import { MAJOR_SCALE } from "../services/chords/chordTheory.js";

export function GestureMapping({
  isOpen,
  onClose,
  mappings,
  onSetMapping,
  onSave,
  onReset,
  onApplyPreset,
  currentKey,
  onNotify,
}) {
  if (!isOpen) return null;

  const scaleNotes = MAJOR_SCALE[currentKey] || MAJOR_SCALE.A;

  const degreeNames = {
    I: `${scaleNotes[0]} Major`,
    II: `${scaleNotes[1]} Minor`,
    III: `${scaleNotes[2]} Minor`,
    IV: `${scaleNotes[3]} Major`,
    V: `${scaleNotes[4]} Major`,
    VI: `${scaleNotes[5]} Minor`,
    VII: `${scaleNotes[6]} Diminished`,
  };

  const handleSave = () => {
    onSave();
    if (onNotify) onNotify("✓ Custom mappings saved!");
    onClose();
  };

  const handleReset = () => {
    onReset();
    if (onNotify) onNotify("Restored standard degree mappings");
  };

  const handlePreset = (name) => {
    onApplyPreset(name);
    if (onNotify) {
      onNotify(
        name === "pop"
          ? "Applied Four-Chord Pop Preset (I - V - vi - IV)"
          : "Applied Standard Scale Degree Preset (I - VII)"
      );
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card mapping-card">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>🖐 Custom Gesture Mapping</h2>
        <p className="modal-subtitle">
          Assign scale degrees or custom chords to each left-hand gesture.
        </p>

        <div className="mapping-key-banner">
          Current Key: {currentKey} Major ({scaleNotes.join(" - ")})
        </div>

        <div className="preset-row">
          <span className="preset-label">Presets:</span>
          <button className="btn-sm" onClick={() => handlePreset("standard")}>
            Scale Degrees (I - VII)
          </button>
          <button className="btn-sm" onClick={() => handlePreset("pop")}>
            Pop 4-Chords (I - V - vi - IV)
          </button>
        </div>

        <div className="mapping-list">
          {GESTURE_DEFINITIONS.map((def) => {
            const currentDegree = mappings[def.id] || def.defaultDegree;
            return (
              <div key={def.id} className="mapping-row">
                <div className="mapping-gesture-label">{def.label}</div>
                <div className="mapping-arrow">➔</div>
                <select
                  className="mapping-select"
                  value={currentDegree}
                  onChange={(e) => onSetMapping(def.id, e.target.value)}
                >
                  {VALID_DEGREES.map((deg) => (
                    <option key={deg} value={deg}>
                      Degree {deg} ({degreeNames[deg] || deg})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={handleReset}>
            Reset Defaults
          </button>
          <button className="btn-primary" onClick={handleSave}>
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
