import React from "react";

export function StartOverlay({ isAudioStarted, onStart }) {
  if (isAudioStarted) return null;

  return (
    <div id="startOverlay" onClick={onStart}>
      <div className="start-circle">▶</div>
      <div className="start-text">click to enable audio</div>
    </div>
  );
}
