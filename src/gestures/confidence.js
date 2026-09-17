/**
 * WAVE — Real Gesture Confidence System
 * 
 * Computes a grounded, multi-factor confidence score (0–100%) based on:
 * 1. MediaPipe detection probability score (handedness score)
 * 2. Hand distance / palm scale relative to camera frame
 * 3. Boundary proximity / screen clipping prevention
 * 4. Finger extension margin (unambiguous extended vs folded posture)
 * 5. Frame-to-frame landmark position stability / jitter
 * 
 * Configurable threshold: GESTURE_CONFIDENCE_THRESHOLD = 70
 */

export const GESTURE_CONFIDENCE_THRESHOLD = 70;

const FINGER_PAIRS = [
  { pip: 6, tip: 8 },   // index
  { pip: 10, tip: 12 }, // middle
  { pip: 14, tip: 16 }, // ring
  { pip: 18, tip: 20 }, // pinky
];

export class ConfidenceCalculator {
  constructor() {
    this.prevLandmarks = {
      Left: null,
      Right: null,
    };
    this.confidenceHistory = {
      Left: [],
      Right: [],
    };
    this.maxHistory = 5;
  }

  /**
   * Reset state (e.g. when tracking is lost)
   */
  reset(handedness) {
    if (handedness) {
      this.prevLandmarks[handedness] = null;
      this.confidenceHistory[handedness] = [];
    } else {
      this.prevLandmarks.Left = null;
      this.prevLandmarks.Right = null;
      this.confidenceHistory.Left = [];
      this.confidenceHistory.Right = [];
    }
  }

  /**
   * Calculate confidence score for a detected hand
   * @param {Array<{x: number, y: number, z: number}>} landmarks - 21 hand landmarks
   * @param {number} detectionScore - MediaPipe handedness confidence (0.0 to 1.0)
   * @param {'Left' | 'Right'} handedness
   * @returns {{
   *   score: number,
   *   isConfident: boolean,
   *   breakdown: {
   *     detection: number,
   *     scale: number,
   *     boundary: number,
   *     extensionClarity: number,
   *     stability: number
   *   },
   *   warning: string | null
   * }}
   */
  calculate(landmarks, detectionScore = 0.9, handedness = "Left") {
    if (!landmarks || landmarks.length < 21) {
      return {
        score: 0,
        isConfident: false,
        breakdown: { detection: 0, scale: 0, boundary: 0, extensionClarity: 0, stability: 0 },
        warning: "No hand detected",
      };
    }

    // 1. MediaPipe Model Detection Score factor (0 - 100)
    // MediaPipe scores are usually 0.7 - 0.99 for good detections
    const detectionFactor = Math.min(1, Math.max(0, detectionScore));

    // 2. Palm scale factor
    // Distance from wrist (0) to middle MCP (9)
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    const palmDx = middleMcp.x - wrist.x;
    const palmDy = middleMcp.y - wrist.y;
    const palmScale = Math.sqrt(palmDx * palmDx + palmDy * palmDy);

    // Optimal palm scale in normalized coords is roughly 0.12 to 0.40
    let scaleFactor = 1.0;
    if (palmScale < 0.08) {
      // Too far away
      scaleFactor = Math.max(0.2, palmScale / 0.08);
    } else if (palmScale > 0.55) {
      // Too close to camera
      scaleFactor = Math.max(0.3, 1 - (palmScale - 0.55) * 2);
    }

    // 3. Boundary clipping factor
    // If landmarks approach frame edges (0 or 1), fingers may be clipped
    let minX = 1, maxX = 0, minY = 1, maxY = 0;
    for (let i = 0; i < landmarks.length; i++) {
      const pt = landmarks[i];
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }

    let boundaryFactor = 1.0;
    const EDGE_MARGIN = 0.03;
    if (minX < EDGE_MARGIN || maxX > (1 - EDGE_MARGIN) || minY < EDGE_MARGIN || maxY > (1 - EDGE_MARGIN)) {
      boundaryFactor = 0.65; // penalized for partial clipping
    } else if (minX < 0.06 || maxX > 0.94 || minY < 0.06 || maxY > 0.94) {
      boundaryFactor = 0.85;
    }

    // 4. Finger extension clarity
    // Clear extended vs folded margins:
    // When extended, tip is far above pip in screen space (tip.y << pip.y).
    // Ambiguity occurs when tip is near pip (delta close to 0).
    let claritySum = 0;
    const effectivePalm = Math.max(0.1, palmScale);
    for (const { pip, tip } of FINGER_PAIRS) {
      const dy = (landmarks[pip].y - landmarks[tip].y) / effectivePalm;
      // dy > 0.35 => cleanly extended
      // dy < -0.15 => cleanly folded
      // |dy - 0.1| near 0 => ambiguous intermediate position
      const ambiguity = Math.abs(dy - 0.1);
      const clarity = Math.min(1, ambiguity / 0.3);
      claritySum += clarity;
    }
    const extensionClarityFactor = claritySum / FINGER_PAIRS.length;

    // 5. Landmark position stability / jitter between frames
    let stabilityFactor = 1.0;
    const prev = this.prevLandmarks[handedness];
    if (prev && prev.length === 21) {
      // Check displacement of wrist and knuckles (0, 5, 9, 13, 17)
      const keyPoints = [0, 5, 9, 13, 17];
      let totalDisp = 0;
      for (const idx of keyPoints) {
        const dx = landmarks[idx].x - prev[idx].x;
        const dy = landmarks[idx].y - prev[idx].y;
        totalDisp += Math.sqrt(dx * dx + dy * dy);
      }
      const avgDisp = totalDisp / keyPoints.length;
      // Movement > 0.15 in one frame suggests flicker or rapid blur
      if (avgDisp > 0.12) {
        stabilityFactor = Math.max(0.3, 1 - (avgDisp - 0.12) * 4);
      } else if (avgDisp > 0.06) {
        stabilityFactor = 0.85;
      }
    }
    // Update cache
    this.prevLandmarks[handedness] = landmarks.map((pt) => ({ x: pt.x, y: pt.y, z: pt.z }));

    // Weighted composite score (0 - 100)
    // Detection score: 25%, Scale: 20%, Boundary: 15%, Clarity: 25%, Stability: 15%
    let rawScore =
      detectionFactor * 25 +
      scaleFactor * 20 +
      boundaryFactor * 15 +
      extensionClarityFactor * 25 +
      stabilityFactor * 15;

    // Hard physical gates: if hand is too far or severely clipped, suppress overall score
    if (scaleFactor < 0.6) {
      rawScore *= scaleFactor;
    }
    if (boundaryFactor < 0.8) {
      rawScore *= boundaryFactor;
    }

    const clampedScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    // Temporal smoothing over recent frames
    const history = this.confidenceHistory[handedness];
    history.push(clampedScore);
    if (history.length > this.maxHistory) history.shift();
    const smoothedScore = Math.round(history.reduce((a, b) => a + b, 0) / history.length);

    const isConfident = smoothedScore >= GESTURE_CONFIDENCE_THRESHOLD;

    // Determine warning message if below threshold
    let warning = null;
    if (!isConfident) {
      if (scaleFactor < 0.6) {
        warning = palmScale < 0.08 ? "Hand too far — bring closer" : "Hand too close to camera";
      } else if (boundaryFactor < 0.8) {
        warning = "Move your hand into full camera view";
      } else if (extensionClarityFactor < 0.55) {
        warning = "Extend fingers clearly";
      } else if (stabilityFactor < 0.6) {
        warning = "Hold hand steady";
      } else {
        warning = "Gesture unclear — adjust hand position";
      }
    }

    return {
      score: smoothedScore,
      isConfident,
      breakdown: {
        detection: Math.round(detectionFactor * 100),
        scale: Math.round(scaleFactor * 100),
        boundary: Math.round(boundaryFactor * 100),
        extensionClarity: Math.round(extensionClarityFactor * 100),
        stability: Math.round(stabilityFactor * 100),
      },
      warning,
    };
  }
}
