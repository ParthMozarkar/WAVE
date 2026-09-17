import React from "react";

const TOTAL_BARS = 8;

export function VolumeMeter({ volume = 0, tiltPercentage = 0 }) {
  const litCount = Math.round(volume * TOTAL_BARS);

  return (
    <>
      <div id="volumeMeter">
        {Array.from({ length: TOTAL_BARS }, (_, i) => {
          // Bottom bar is index 0, top is index 7
          const isLit = i < litCount;
          return (
            <div
              key={i}
              className={`vol-bar ${isLit ? "lit" : ""}`}
              data-index={i}
            />
          );
        })}
      </div>

      <div id="distortionDisplay">
        Filter: {tiltPercentage > 0 ? "+" : ""}{tiltPercentage}%
      </div>
    </>
  );
}
