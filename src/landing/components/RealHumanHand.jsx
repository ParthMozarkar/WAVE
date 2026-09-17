import React, { useMemo } from "react";

/**
 * RealHumanHand
 * Displays an authentic, photorealistic human musician's hand playing in dark space.
 * Smoothly transitions between real physical finger gestures with independent conductor timing.
 * 
 * @param {Object} props
 * @param {"left" | "right"} props.side - Hand side
 * @param {string} props.currentGesture - Current gesture key ("1finger" | "2fingers" | "3fingers" | "open" | "horns")
 * @param {string} props.chordName - Optional musical chord associated with this gesture (e.g. "C", "G", "Am", "F")
 * @param {boolean} props.isPulseActive - Whether a sound pulse just triggered
 * @param {number} props.mouseX - Normalized cursor X (-1 to 1)
 * @param {number} props.mouseY - Normalized cursor Y (-1 to 1)
 * @param {boolean} props.isHoveringCTA - Whether the user is hovering the CTA
 */
const GESTURE_IMAGES = {
  "1finger": "/assets/hands/hand_1finger.jpg",
  "2fingers": "/assets/hands/hand_2fingers.jpg",
  "3fingers": "/assets/hands/hand_3fingers.jpg",
  "open": "/assets/hands/hand_open.jpg",
  "horns": "/assets/hands/hand_horns.jpg",
};

export function RealHumanHand({
  side = "left",
  currentGesture = "open",
  chordName = "",
  isPulseActive = false,
  mouseX = 0,
  mouseY = 0,
  isHoveringCTA = false,
}) {
  const isLeft = side === "left";

  // Natural parallax and CTA anticipation transform
  const dynamicTransform = useMemo(() => {
    const factorX = isLeft ? 18 : -18;
    const factorY = 12;
    const ctaInward = isHoveringCTA ? (isLeft ? 26 : -26) : 0;
    const ctaLift = isHoveringCTA ? -8 : 0;

    const tx = mouseX * factorX + ctaInward;
    const ty = mouseY * factorY + ctaLift;
    const rot = (mouseX * 3.5) * (isLeft ? 1 : -1) + (isHoveringCTA ? (isLeft ? 2 : -2) : 0);

    return `translate3d(${tx}px, calc(-50% + ${ty}px), 0) rotate(${rot}deg)`;
  }, [isLeft, mouseX, mouseY, isHoveringCTA]);

  return (
    <div
      className={`lp-real-hand-wrap lp-real-hand-${side} ${isHoveringCTA ? "is-anticipating" : ""}`}
      style={{ transform: dynamicTransform }}
      aria-hidden="true"
    >
      {/* Container holding all gesture images for instantaneous crossfade */}
      <div className={`lp-real-hand-stage ${isLeft ? "" : "is-mirrored"}`}>
        {Object.entries(GESTURE_IMAGES).map(([gestureKey, imgSrc]) => {
          const isActive = currentGesture === gestureKey;
          return (
            <img
              key={gestureKey}
              src={imgSrc}
              alt={`Musician's real human hand forming ${gestureKey} gesture`}
              className={`lp-real-hand-img ${isActive ? "is-visible" : "is-hidden"}`}
              loading="eager"
            />
          );
        })}

        {/* Ambient acoustic rim light overlay */}
        <div className="lp-hand-acoustic-halo" />

        {/* Dynamic sound impulse emitter on fingertips */}
        <div className={`lp-hand-impulse ${isPulseActive ? "is-pulsing" : ""}`} />
      </div>

      {/* Floating Chord / Gesture Indicator */}
      <div className={`lp-hand-chord-badge ${chordName ? "is-active" : ""}`}>
        <span className="lp-chord-label">CHORD</span>
        <span className="lp-chord-val">{chordName || "—"}</span>
      </div>
    </div>
  );
}

export default RealHumanHand;
