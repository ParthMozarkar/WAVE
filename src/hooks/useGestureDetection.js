import { useState, useRef, useCallback } from "react";
import { ConfidenceCalculator, GESTURE_CONFIDENCE_THRESHOLD } from "../gestures/confidence.js";
import {
  classifyLeftHandGesture,
  getRightHandQualityIndex,
  getHandHorizontalTilt,
  getVolumeFromHeight,
  isThumbExtended,
} from "../gestures/classifier.js";

const CHORD_HOLD_TIME_MS = 100;
const VIBE_NULL_WINDOW_MS = 60;

function sameChordState(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return (
    a.chord === b.chord &&
    a.isMajorMode === b.isMajorMode &&
    a.qualityIndex === b.qualityIndex &&
    a.thumbDown === b.thumbDown
  );
}

export function useGestureDetection(mappingManager, onChordChange) {
  const confidenceCalcRef = useRef(null);
  if (!confidenceCalcRef.current) {
    confidenceCalcRef.current = new ConfidenceCalculator();
  }
  const confidenceCalc = confidenceCalcRef.current;

  // React state for UI display
  const [gestureState, setGestureState] = useState({
    activeChord: null,
    degree: "I",
    isMajorMode: true,
    qualityIndex: 0,
    thumbDown: false,
    gestureLabel: null,
    confidence: 0,
    isConfident: false,
    warning: null,
    volume: 0,
    tiltPercentage: 0,
    horizontalTilt: 0,
  });

  // Stabilization refs (outside React render cycle)
  const stableChordStateRef = useRef(null);
  const candidateChordStateRef = useRef(null);
  const candidateChordSinceRef = useRef(0);
  const lastChordSeenValidTimeRef = useRef(0);
  const lastTrackedKeyRef = useRef(null);

  // Throttled UI update ref to prevent React rendering every frame
  const lastUiUpdateRef = useRef(0);

  const processHandFrame = useCallback(
    (leftLandmarks, leftScore, rightLandmarks, now) => {
      // 1. Calculate Confidence
      let leftConfidence = 0;
      let isLeftConfident = false;
      let leftWarning = null;

      if (leftLandmarks) {
        const confData = confidenceCalc.calculate(leftLandmarks, leftScore, "Left");
        leftConfidence = confData.score;
        isLeftConfident = confData.isConfident;
        leftWarning = confData.warning;
      } else {
        confidenceCalc.reset("Left");
      }

      // 2. Classify Gesture if confident
      let rawChordState = null;
      let gestureClass = null;

      if (leftLandmarks) {
        gestureClass = classifyLeftHandGesture(leftLandmarks, "Left", mappingManager);

        // Chords only change when confident
        if (isLeftConfident && gestureClass) {
          let rawQualityIndex = 0;
          let rawThumbDown = false;

          if (rightLandmarks) {
            rawQualityIndex = getRightHandQualityIndex(rightLandmarks);
            rawThumbDown = isThumbExtended(rightLandmarks, "Right");
          }

          rawChordState = {
            chord: gestureClass.roman,
            degree: gestureClass.degree,
            isMajorMode: gestureClass.isMajorMode,
            qualityIndex: rawQualityIndex,
            thumbDown: rawThumbDown,
            gestureLabel: gestureClass.gestureLabel,
          };
        }
      }

      // 3. Stabilize Chord State
      if (rawChordState !== null) {
        lastChordSeenValidTimeRef.current = now;
      }

      let effectiveState = rawChordState;
      if (rawChordState === null && now - lastChordSeenValidTimeRef.current < VIBE_NULL_WINDOW_MS) {
        effectiveState = candidateChordStateRef.current;
      }

      if (!sameChordState(effectiveState, candidateChordStateRef.current)) {
        candidateChordStateRef.current = effectiveState;
        candidateChordSinceRef.current = now;
      }

      if (now - candidateChordSinceRef.current >= CHORD_HOLD_TIME_MS) {
        stableChordStateRef.current = candidateChordStateRef.current;
      }

      const stable = stableChordStateRef.current;

      // 4. Expression Parameters
      const volume = rightLandmarks ? getVolumeFromHeight(rightLandmarks) : 0;
      const horizontalTilt = rightLandmarks ? getHandHorizontalTilt(rightLandmarks, "Right") : 0;
      const tiltPercentage = Math.round(horizontalTilt * 100);

      // Check if accepted chord changed
      if (stable) {
        const chordKey = `${stable.chord}-${stable.isMajorMode ? "M" : "m"}-${stable.qualityIndex}-${stable.thumbDown ? "low" : "norm"}`;
        if (chordKey !== lastTrackedKeyRef.current) {
          lastTrackedKeyRef.current = chordKey;
          if (onChordChange) {
            onChordChange({
              roman: stable.chord,
              degree: stable.degree,
              isMajorMode: stable.isMajorMode,
              qualityIndex: stable.qualityIndex,
              thumbDown: stable.thumbDown,
              gestureLabel: stable.gestureLabel,
              confidence: leftConfidence,
            });
          }
        }
      }

      // 5. Update React UI state at controlled rate (every ~60ms max, or immediately on chord change)
      if (now - lastUiUpdateRef.current > 60) {
        lastUiUpdateRef.current = now;
        setGestureState({
          activeChord: stable ? stable.chord : null,
          degree: stable ? stable.degree : "I",
          isMajorMode: stable ? stable.isMajorMode : true,
          qualityIndex: stable ? stable.qualityIndex : 0,
          thumbDown: stable ? stable.thumbDown : false,
          gestureLabel: gestureClass ? gestureClass.gestureLabel : null,
          confidence: leftConfidence,
          isConfident: isLeftConfident,
          warning: leftLandmarks ? leftWarning : null,
          volume,
          tiltPercentage,
          horizontalTilt,
        });
      }

      return {
        stableChord: stable,
        volume,
        horizontalTilt,
        confidence: leftConfidence,
        isConfident: isLeftConfident,
      };
    },
    [mappingManager, confidenceCalc, onChordChange]
  );

  return {
    gestureState,
    processHandFrame,
  };
}
