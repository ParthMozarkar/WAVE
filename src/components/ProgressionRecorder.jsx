import React from "react";

export function ProgressionRecorder({
  isOpen,
  recorderState,
  onStartRecord,
  onStopRecord,
  onPlay,
  onStopPlayback,
  onToggleLoop,
  onClear,
  onNotify,
}) {
  if (!isOpen) return null;

  const { isRecording, isPlaying, isLooping, events, activeIndex } = recorderState;

  const handleRecordToggle = () => {
    if (isRecording) {
      onStopRecord();
    } else {
      onStartRecord();
    }
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      onStopPlayback();
    } else {
      onPlay();
    }
  };

  const handleClear = () => {
    onClear();
    if (onNotify) onNotify("Recording cleared");
  };

  let statusText = "Ready to record";
  if (isRecording) {
    statusText = `Recording... (${events.length} chords)`;
  } else if (isPlaying) {
    statusText = `Playing loop (${events.length} chords)`;
  } else if (events.length > 0) {
    statusText = `${events.length} chords recorded`;
  }

  return (
    <div id="recorderStrip">
      <div className="recorder-header">
        <div className="recorder-controls">
          <button
            className={`rec-btn ${isRecording ? "recording" : ""}`}
            onClick={handleRecordToggle}
          >
            {isRecording ? "⏺ REC" : "⏺ Record"}
          </button>

          <button
            className="rec-btn"
            onClick={() => {
              onStopRecord();
              onStopPlayback();
            }}
          >
            ⏹ Stop
          </button>

          <button
            className={`rec-btn ${isPlaying ? "active" : ""}`}
            onClick={handlePlayToggle}
            disabled={events.length === 0 && !isPlaying}
          >
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>

          <button
            className={`rec-btn ${isLooping ? "active" : ""}`}
            onClick={onToggleLoop}
          >
            🔁 Loop
          </button>

          <button className="rec-btn btn-clear" onClick={handleClear}>
            🗑 Clear
          </button>
        </div>

        <div className="rec-status-text">{statusText}</div>
      </div>

      <div className="timeline-strip">
        {events.length === 0 ? (
          <span className="timeline-empty">Progression timeline is empty</span>
        ) : (
          events.map((ev, i) => {
            const isActive = i === activeIndex;
            const timeSec = (ev.time / 1000).toFixed(1);
            return (
              <div
                key={i}
                className={`timeline-chip ${isActive ? "active" : ""}`}
              >
                <span className="chip-chord">{ev.chord}</span>
                <span className="chip-time">{timeSec}s</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
