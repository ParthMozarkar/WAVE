import React from "react";

export function CameraView({ videoRef, canvasRef, isDimmed }) {
  return (
    <div id="stage">
      <video ref={videoRef} id="webcam" autoPlay playsInline muted />
      <canvas
        ref={canvasRef}
        id="overlay"
        className={isDimmed ? "dimmed" : ""}
      />
    </div>
  );
}
