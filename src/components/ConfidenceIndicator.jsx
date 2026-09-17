import React from "react";

export function ConfidenceIndicator({ confidence, gestureLabel, isConfident, warning }) {
  let hudText = "--";
  let hudClass = "";

  if (isConfident && gestureLabel) {
    hudText = `● ${confidence}% ${gestureLabel}`;
    hudClass = "high";
  } else if (confidence > 0) {
    hudText = `○ ${confidence}% (Unstable)`;
    hudClass = "low";
  }

  return (
    <div id="hudContainer">
      <div id="confidenceHud" className={hudClass}>
        {hudText}
      </div>

      {!isConfident && warning && (
        <div id="gestureWarning">
          ⚠ {warning}
        </div>
      )}
    </div>
  );
}
