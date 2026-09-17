import React from "react";

export function StatusIndicator({ cameraStatus, gestureEngineStatus, isAudioStarted }) {
  // Only show status badge when there's an active loading state or issue
  const isInitializing = cameraStatus === "loading" || gestureEngineStatus === "loading";

  if (!isInitializing) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "60px",
        right: "12px",
        background: "rgba(20, 20, 20, 0.85)",
        border: "1px solid #e8a13d",
        borderRadius: "6px",
        padding: "6px 10px",
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#ffbf5c",
        zIndex: 20,
      }}
    >
      {cameraStatus === "loading" && <div>⏳ Starting camera...</div>}
      {gestureEngineStatus === "loading" && <div>⏳ Loading vision model...</div>}
    </div>
  );
}
