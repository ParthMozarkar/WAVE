import React, { useMemo } from "react";

/**
 * RealisticHand
 * An anatomical, artistic vector rendering of a human hand playing an invisible instrument.
 * Features realistic palm anatomy, tendon highlights, and individually articulable fingers.
 * 
 * @param {Object} props
 * @param {"left" | "right"} props.side - Hand orientation
 * @param {string} props.gesture - Active gesture: "open" | "1finger" | "2fingers" | "3fingers" | "4fingers" | "horns" | "fist"
 * @param {number} props.mouseX - Normalized mouse X offset (-1 to 1)
 * @param {number} props.mouseY - Normalized mouse Y offset (-1 to 1)
 * @param {boolean} props.isHoveringCTA - Whether user is hovering the CTA button
 */
export function RealisticHand({
  side = "left",
  gesture = "open",
  mouseX = 0,
  mouseY = 0,
  isHoveringCTA = false,
  className = "",
}) {
  const isLeft = side === "left";

  // Finger states for the given gesture: true = extended, false = curled
  const fingerStates = useMemo(() => {
    switch (gesture) {
      case "1finger":
        return { thumb: false, index: true, middle: false, ring: false, pinky: false };
      case "2fingers":
        return { thumb: false, index: true, middle: true, ring: false, pinky: false };
      case "3fingers":
        return { thumb: false, index: true, middle: true, ring: true, pinky: false };
      case "4fingers":
        return { thumb: false, index: true, middle: true, ring: true, pinky: true };
      case "horns":
        return { thumb: true, index: true, middle: false, ring: false, pinky: true };
      case "fist":
        return { thumb: false, index: false, middle: false, ring: false, pinky: false };
      case "open":
      default:
        return { thumb: true, index: true, middle: true, ring: true, pinky: true };
    }
  }, [gesture]);

  // Subtle natural parallax based on cursor and CTA hover
  const parallaxTransform = useMemo(() => {
    const factorX = isLeft ? 14 : -14;
    const factorY = 10;
    const ctaShiftX = isHoveringCTA ? (isLeft ? 20 : -20) : 0;
    const ctaShiftY = isHoveringCTA ? -8 : 0;

    const tx = mouseX * factorX + ctaShiftX;
    const ty = mouseY * factorY + ctaShiftY;
    const rot = (mouseX * 4) * (isLeft ? 1 : -1) + (isHoveringCTA ? (isLeft ? 3 : -3) : 0);

    return `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
  }, [isLeft, mouseX, mouseY, isHoveringCTA]);

  const uniqueId = isLeft ? "hand-left" : "hand-right";

  return (
    <div
      className={`lp-realistic-hand lp-hand-${side} ${className}`}
      style={{ transform: parallaxTransform }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="lp-hand-svg"
      >
        <defs>
          {/* Subtle skin/metallic gradient */}
          <linearGradient id={`${uniqueId}-skin`} x1="80" y1="360" x2="240" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="45%" stopColor="#27272a" />
            <stop offset="85%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#52525b" />
          </linearGradient>

          {/* Warm acoustic rim backlight */}
          <linearGradient id={`${uniqueId}-rim`} x1="40" y1="200" x2="280" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(232, 161, 61, 0.55)" />
            <stop offset="25%" stopColor="rgba(232, 161, 61, 0.12)" />
            <stop offset="75%" stopColor="rgba(245, 243, 238, 0.08)" />
            <stop offset="100%" stopColor="rgba(232, 161, 61, 0.45)" />
          </linearGradient>

          {/* Palm shadow gradient */}
          <radialGradient id={`${uniqueId}-palm-shadow`} cx="160" cy="250" r="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#121214" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#1e1e24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Fingertip pulse glow */}
          <radialGradient id={`${uniqueId}-tip-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffbf5c" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#e8a13d" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#e8a13d" stopOpacity="0" />
          </radialGradient>

          {/* Filter for subtle hand shadow depth */}
          <filter id={`${uniqueId}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="16" stdDeviation="22" floodColor="rgba(0,0,0,0.85)" />
          </filter>
        </defs>

        <g filter={`url(#${uniqueId}-shadow)`} transform={isLeft ? "" : "translate(320, 0) scale(-1, 1)"}>
          {/* ================= WRIST & FOREARM ================= */}
          <path
            d="M 125 420 L 120 330 C 120 315, 125 305, 132 295 L 188 295 C 195 305, 200 315, 200 330 L 195 420 Z"
            fill={`url(#${uniqueId}-skin)`}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
          />
          {/* Wrist tendon lines */}
          <path d="M 148 420 C 147 360, 149 320, 152 295" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="3 3" />
          <path d="M 168 420 C 169 360, 167 320, 164 295" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="3 3" />

          {/* ================= PALM BASE ================= */}
          {/* Anatomical palm with thenar & hypothenar contours */}
          <path
            d="M 132 295
               C 105 285, 82 250, 80 215
               C 78 185, 95 160, 110 152
               L 132 145
               L 160 142
               L 190 146
               L 222 158
               C 238 170, 245 200, 242 235
               C 238 268, 218 290, 188 295
               Z"
            fill={`url(#${uniqueId}-skin)`}
            stroke={`url(#${uniqueId}-rim)`}
            strokeWidth="1.6"
          />

          {/* Inner palm shading & life/heart crease lines */}
          <ellipse cx="162" cy="225" rx="55" ry="45" fill={`url(#${uniqueId}-palm-shadow)`} />
          <path
            d="M 100 195 C 125 210, 155 220, 185 205"
            stroke="rgba(232, 161, 61, 0.28)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M 112 215 C 135 235, 170 255, 205 240"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 145 240 C 160 265, 175 282, 178 295"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth="1"
            fill="none"
          />

          {/* Knuckle arches */}
          <circle cx="120" cy="150" r="7" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle cx="150" cy="144" r="7.5" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle cx="180" cy="147" r="7" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />
          <circle cx="210" cy="156" r="6" fill="rgba(255, 255, 255, 0.05)" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="1" />

          {/* ================= FINGER: THUMB ================= */}
          <g
            className={`lp-finger lp-finger-thumb ${fingerStates.thumb ? "is-extended" : "is-curled"}`}
            style={{
              transformOrigin: "90px 220px",
              transition: "transform 0.75s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
              transform: fingerStates.thumb ? "rotate(0deg)" : "rotate(32deg) scale(0.92, 0.82)",
            }}
          >
            {/* Extended thumb shape */}
            <path
              d="M 86 220
                 C 70 205, 52 175, 46 145
                 C 42 128, 48 116, 58 118
                 C 68 120, 78 140, 88 165
                 L 100 190
                 Z"
              fill={`url(#${uniqueId}-skin)`}
              stroke={`url(#${uniqueId}-rim)`}
              strokeWidth="1.4"
            />
            {/* Thumb knuckle crease */}
            <path d="M 52 155 C 60 156, 70 162, 78 170" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            {/* Fingertip light node when extended */}
            {fingerStates.thumb && (
              <circle cx="51" cy="123" r="10" fill={`url(#${uniqueId}-tip-glow)`} className="lp-tip-pulse" />
            )}
          </g>

          {/* ================= FINGER: INDEX ================= */}
          <g
            className={`lp-finger lp-finger-index ${fingerStates.index ? "is-extended" : "is-curled"}`}
            style={{
              transformOrigin: "120px 148px",
              transition: "transform 0.75s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
              transform: fingerStates.index ? "rotate(0deg)" : "rotate(14deg) scaleY(0.48) translateY(24px)",
            }}
          >
            <path
              d="M 111 150
                 L 112 85
                 C 112 60, 116 42, 124 42
                 C 132 42, 136 60, 136 85
                 L 133 145
                 Z"
              fill={`url(#${uniqueId}-skin)`}
              stroke={`url(#${uniqueId}-rim)`}
              strokeWidth="1.4"
            />
            {/* Phalanx joint creases */}
            <path d="M 113 115 L 135 113" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <path d="M 114 78 L 134 76" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            {/* Fingernail contour */}
            <path d="M 118 52 C 120 48, 128 48, 130 52" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" fill="none" />
            {/* Fingertip pulse node */}
            {fingerStates.index && (
              <circle cx="124" cy="46" r="12" fill={`url(#${uniqueId}-tip-glow)`} className="lp-tip-pulse" />
            )}
          </g>

          {/* ================= FINGER: MIDDLE ================= */}
          <g
            className={`lp-finger lp-finger-middle ${fingerStates.middle ? "is-extended" : "is-curled"}`}
            style={{
              transformOrigin: "150px 144px",
              transition: "transform 0.75s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
              transform: fingerStates.middle ? "rotate(0deg)" : "rotate(8deg) scaleY(0.44) translateY(28px)",
            }}
          >
            <path
              d="M 140 144
                 L 141 75
                 C 141 48, 146 30, 154 30
                 C 162 30, 167 48, 167 75
                 L 164 144
                 Z"
              fill={`url(#${uniqueId}-skin)`}
              stroke={`url(#${uniqueId}-rim)`}
              strokeWidth="1.4"
            />
            {/* Phalanx joint creases */}
            <path d="M 142 108 L 165 106" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <path d="M 143 68 L 165 66" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            {/* Fingernail contour */}
            <path d="M 148 40 C 150 36, 158 36, 160 40" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" fill="none" />
            {/* Fingertip pulse node */}
            {fingerStates.middle && (
              <circle cx="154" cy="34" r="12" fill={`url(#${uniqueId}-tip-glow)`} className="lp-tip-pulse" />
            )}
          </g>

          {/* ================= FINGER: RING ================= */}
          <g
            className={`lp-finger lp-finger-ring ${fingerStates.ring ? "is-extended" : "is-curled"}`}
            style={{
              transformOrigin: "180px 147px",
              transition: "transform 0.75s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
              transform: fingerStates.ring ? "rotate(0deg)" : "rotate(2deg) scaleY(0.44) translateY(28px)",
            }}
          >
            <path
              d="M 171 147
                 L 172 85
                 C 172 58, 176 42, 184 42
                 C 192 42, 196 58, 196 85
                 L 192 149
                 Z"
              fill={`url(#${uniqueId}-skin)`}
              stroke={`url(#${uniqueId}-rim)`}
              strokeWidth="1.4"
            />
            {/* Phalanx joint creases */}
            <path d="M 173 115 L 194 113" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <path d="M 174 76 L 194 74" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            {/* Fingernail contour */}
            <path d="M 178 52 C 180 48, 188 48, 190 52" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" fill="none" />
            {/* Fingertip pulse node */}
            {fingerStates.ring && (
              <circle cx="184" cy="46" r="12" fill={`url(#${uniqueId}-tip-glow)`} className="lp-tip-pulse" />
            )}
          </g>

          {/* ================= FINGER: PINKY ================= */}
          <g
            className={`lp-finger lp-finger-pinky ${fingerStates.pinky ? "is-extended" : "is-curled"}`}
            style={{
              transformOrigin: "210px 156px",
              transition: "transform 0.75s cubic-bezier(0.2, 0.9, 0.3, 1.1)",
              transform: fingerStates.pinky ? "rotate(0deg)" : "rotate(-10deg) scaleY(0.42) translateY(28px)",
            }}
          >
            <path
              d="M 202 156
                 L 203 105
                 C 203 80, 206 66, 213 66
                 C 220 66, 224 80, 224 105
                 L 220 162
                 Z"
              fill={`url(#${uniqueId}-skin)`}
              stroke={`url(#${uniqueId}-rim)`}
              strokeWidth="1.4"
            />
            {/* Phalanx joint creases */}
            <path d="M 204 128 L 222 126" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <path d="M 205 92 L 222 90" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            {/* Fingernail contour */}
            <path d="M 208 74 C 210 70, 216 70, 218 74" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" fill="none" />
            {/* Fingertip pulse node */}
            {fingerStates.pinky && (
              <circle cx="213" cy="70" r="11" fill={`url(#${uniqueId}-tip-glow)`} className="lp-tip-pulse" />
            )}
          </g>

          {/* Dynamic palm knuckle cover for realistic curling overlap */}
          <path
            d="M 106 154 C 130 148, 185 148, 224 163 C 220 174, 110 174, 106 154 Z"
            fill={`url(#${uniqueId}-skin)`}
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}

export default RealisticHand;
