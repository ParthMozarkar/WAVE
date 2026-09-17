import React from "react";

export function SessionHistory({ isOpen, onClose, entries, onClear, onNotify }) {
  if (!isOpen) return null;

  const handleClear = () => {
    onClear();
    if (onNotify) onNotify("Session history cleared");
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card history-card">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <h2>📜 Session History</h2>
        <p className="modal-subtitle">
          Real-time log of chords, gestures, and detection confidence.
        </p>

        <div className="history-table-header">
          <span>Time</span>
          <span>Gesture</span>
          <span>Chord</span>
          <span>Conf</span>
        </div>

        <div className="history-list">
          {entries.length === 0 ? (
            <div className="history-empty">
              No chords played yet this session.<br />
              Play chords with hand gestures to build history!
            </div>
          ) : (
            entries.map((item) => (
              <div key={item.id} className="history-row">
                <span className="hist-time">{item.time}</span>
                <span className="hist-gesture">{item.gesture}</span>
                <span className="hist-chord">{item.chord}</span>
                <span className="hist-conf">{item.confidence}%</span>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={handleClear}>
            Clear History
          </button>
        </div>
      </div>
    </div>
  );
}
