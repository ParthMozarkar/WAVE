/**
 * WAVE — Gesture Classifier
 * 
 * Classifies left-hand chords with custom mapping support and
 * right-hand expressive parameters (voicing, inversion, octave, filter, volume).
 */

const FINGERS = {
  index:  { pip: 6, tip: 8 },
  middle: { pip: 10, tip: 12 },
  ring:   { pip: 14, tip: 16 },
  pinky:  { pip: 18, tip: 20 },
};

export function isFingerExtended(landmarks, name) {
  if (!landmarks || landmarks.length < 21) return false;
  const { pip, tip } = FINGERS[name];
  return landmarks[tip].y < landmarks[pip].y;
}

export function isThumbExtended(landmarks, handedness) {
  if (!landmarks || landmarks.length < 21) return false;
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];

  if (handedness === "Right") {
    return thumbTip.x > thumbIp.x;
  } else {
    return thumbTip.x < thumbIp.x;
  }
}

export function getChordQuality(landmarks) {
  if (!landmarks || landmarks.length < 21) return "major";
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  return middleMcp.x > wrist.x ? "minor" : "major";
}

/**
 * Calculates horizontal hand tilt (-1.0 to 1.0)
 */
export function getHandHorizontalTilt(landmarks, handedness) {
  if (!landmarks || typeof landmarks.length === "undefined" || landmarks.length < 18) {
    return 0;
  }

  try {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    const ringMcp = landmarks[13];

    if (!wrist || !middleMcp || !ringMcp) return 0;

    const minX = Math.min(middleMcp.x, ringMcp.x);
    const maxX = Math.max(middleMcp.x, ringMcp.x);

    let tiltFactor = 0;
    const MAX_TRAVEL = 0.12;

    if (wrist.x < minX) {
      tiltFactor = (wrist.x - minX) / MAX_TRAVEL;
    } else if (wrist.x > maxX) {
      tiltFactor = (wrist.x - maxX) / MAX_TRAVEL;
    } else {
      tiltFactor = 0;
    }

    tiltFactor = Math.max(-1, Math.min(1, tiltFactor));

    if (handedness === "Right") {
      tiltFactor = -tiltFactor;
    }

    return tiltFactor;
  } catch (error) {
    console.error("Tilt calculation failed:", error);
    return 0;
  }
}

/**
 * Classify left-hand gesture and map to scale degree using mappingManager
 * @param {Array} landmarks
 * @param {'Left'|'Right'} handedness
 * @param {import('./mapping.js').GestureMappingManager} mappingManager
 * @returns {{
 *   gestureId: string,
 *   gestureLabel: string,
 *   degree: string,
 *   roman: string,
 *   isMajorMode: boolean
 * } | null}
 */
export function classifyLeftHandGesture(landmarks, handedness, mappingManager) {
  if (!landmarks || landmarks.length < 21) return null;

  const thumb = isThumbExtended(landmarks, handedness);
  const index = isFingerExtended(landmarks, "index");
  const middle = isFingerExtended(landmarks, "middle");
  const ring = isFingerExtended(landmarks, "ring");
  const pinky = isFingerExtended(landmarks, "pinky");

  const quality = getChordQuality(landmarks);
  const isMajorMode = quality === "major";

  let gestureId = null;
  let gestureLabel = null;

  // Rock gesture: Index + Pinky (middle & ring down, thumb down)
  if (index && pinky && !middle && !ring && !thumb) {
    gestureId = "rock";
    gestureLabel = "Index + Pinky (🤘)";
  }
  // Horns / Spiderman: Index + Pinky + Thumb (middle & ring down)
  else if (index && pinky && !middle && !ring && thumb) {
    gestureId = "horns";
    gestureLabel = "Index + Pinky + Thumb (🤟)";
  } else {
    const fingerCount = [thumb, index, middle, ring, pinky].filter(Boolean).length;
    if (fingerCount >= 1 && fingerCount <= 5) {
      gestureId = `${fingerCount}_finger${fingerCount > 1 ? "s" : ""}`;
      gestureLabel = `${fingerCount} Finger${fingerCount > 1 ? "s" : ""}`;
    }
  }

  if (!gestureId) return null;

  const rawDegree = mappingManager
    ? mappingManager.getDegree(gestureId)
    : "I";

  const roman = isMajorMode ? rawDegree.toUpperCase() : rawDegree.toLowerCase();

  return {
    gestureId,
    gestureLabel,
    degree: rawDegree,
    roman,
    isMajorMode,
  };
}

/**
 * Right-hand quality index (1-4 fingers extended)
 */
export function getRightHandQualityIndex(landmarks) {
  if (!landmarks || landmarks.length < 21) return 0;
  const index = isFingerExtended(landmarks, "index");
  const middle = isFingerExtended(landmarks, "middle");
  const ring = isFingerExtended(landmarks, "ring");
  const pinky = isFingerExtended(landmarks, "pinky");

  return [index, middle, ring, pinky].filter(Boolean).length;
}

/**
 * Volume from wrist vertical height (0.0 to 1.0)
 */
export function getVolumeFromHeight(landmarks) {
  if (!landmarks || landmarks.length < 21) return 0;
  const wrist = landmarks[0];
  const TOP = 0.05;
  const BOTTOM = 0.95;

  const clamped = Math.max(TOP, Math.min(BOTTOM, wrist.y));
  const t = (clamped - TOP) / (BOTTOM - TOP);
  return 1 - t;
}
