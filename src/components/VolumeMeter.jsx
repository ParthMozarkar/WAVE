import React from "react";

const TOTAL_BARS = 12;

/* Heights (in px) for each bar to create an equalizer-curve shape */
const BAR_HEIGHTS = [10, 14, 20, 24, 28, 22, 26, 18, 24, 16, 12, 8];

export function VolumeMeter({ volume = 0, tiltPercentage = 0 }) {
  const litCount = Math.round(volume * TOTAL_BARS);

  return (
    <>
      <div id="volumeMeter">
        {Array.from({ length: TOTAL_BARS }, (_, i) => {
          const isLit = i < litCount;
          const h = BAR_HEIGHTS[i] || 12;
          return (
            <div
              key={i}
              className={`vol-bar ${isLit ? "lit" : ""}`}
              style={{ height: `${isLit ? h : h * 0.35}px` }}
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
