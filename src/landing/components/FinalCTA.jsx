import React from "react";

export function FinalCTA({ onEnter }) {
  return (
    <section className="lp-final-cta">
      <div className="lp-container">
        <h2 className="lp-final-title">
          READY<br />
          TO PLAY?
        </h2>

        <button className="lp-final-btn" onClick={onEnter}>
          ENTER WAVE ➔
        </button>
      </div>
    </section>
  );
}
