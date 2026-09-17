import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { SynthEngine } from "./src/audio/SynthEngine.js";
import { ConfidenceCalculator, GESTURE_CONFIDENCE_THRESHOLD } from "./src/gestures/confidence.js";
import { GestureMappingManager } from "./src/gestures/mapping.js";
import {
  classifyLeftHandGesture,
  getRightHandQualityIndex,
  getVolumeFromHeight,
  getHandHorizontalTilt,
  isThumbExtended,
} from "./src/gestures/classifier.js";
import { ProgressionRecorder } from "./src/recording/progressionRecorder.js";
import { SessionHistory } from "./src/history/sessionHistory.js";
import { PerformanceMonitor } from "./src/performance/perfMonitor.js";
import { UIManager } from "./src/ui/UIManager.js";

// ---- DOM References ----
const videoEl = document.getElementById("webcam");
const canvasEl = document.getElementById("overlay");
const ctx = canvasEl.getContext("2d");

const gestureGuideEl = document.getElementById("gestureGuide");
const guideToggleEl = document.getElementById("guideToggle");
const chordDisplayEl = document.getElementById("chordDisplay");
const qualityDisplayEl = document.getElementById("qualityDisplay");
const distortionDisplayEl = document.getElementById("distortionDisplay");
const volumeBarEls = Array.from(document.querySelectorAll(".vol-bar"));
const startOverlayEl = document.getElementById("startOverlay");
const keySelectEl = document.getElementById("keySelect");
const toneSelectEl = document.getElementById("toneSelect");

const helpButton = document.getElementById("helpButton");
const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");

function trackClarityEvent(eventName) {
  if (typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }
}

// ---- Musical Constants & Scale Logic ----
const MAJOR_SCALE = {
  A:  ["A","B","C#","D","E","F#","G#"],
  Bb: ["Bb","C","D","Eb","F","G","A"],
  B:  ["B","C#","D#","E","F#","G#","A#"],
  C:  ["C","D","E","F","G","A","B"],
  Db: ["Db","Eb","F","Gb","Ab","Bb","C"],
  D:  ["D","E","F#","G","A","B","C#"],
  Eb: ["Eb","F","G","Ab","Bb","C","D"],
  E:  ["E","F#","G#","A","B","C#","D#"],
  F:  ["F","G","A","Bb","C","D","E"],
  Gb: ["Gb","Ab","Bb","Cb","Db","Eb","F"],
  G:  ["G","A","B","C","D","E","F#"],
  Ab: ["Ab","Bb","C","Db","Eb","F","G"],
};

const DEGREE_SEMITONES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };

const NUMERAL_TO_DEGREE = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

let currentTonicFreq = Number(keySelectEl.value);
let currentKeyName = keySelectEl.selectedOptions[0].dataset.note;

function getDegreeFreq(degree) {
  const semitones = DEGREE_SEMITONES[degree] ?? 0;
  let tonic = currentTonicFreq;

  if (tonic === 369.99 || tonic === 392.00 || tonic === 415.30) {
    tonic /= 2;
  }
  return tonic * Math.pow(2, semitones / 12);
}

function getChordName(roman, isMajorMode) {
  if (!roman || roman === "--") return "";
  const degree = NUMERAL_TO_DEGREE[roman.toUpperCase()];
  if (!degree) return "";

  const root = MAJOR_SCALE[currentKeyName][degree - 1];
  return isMajorMode ? root : root + "m";
}

function getChordTones(numeralStr, isMajorMode) {
  if (!numeralStr || numeralStr === "--") return null;
  const degree = NUMERAL_TO_DEGREE[numeralStr.toUpperCase()];
  if (!degree) return null;

  const root = getDegreeFreq(degree);
  const thirdSemitones = isMajorMode ? 4 : 3;
  const fifthSemitones = 7;

  const maj7Semitones = 11;
  const dom7Semitones = 10;
  const dim7Semitones = 9;

  const third = root * Math.pow(2, thirdSemitones / 12);
  const fifth = root * Math.pow(2, fifthSemitones / 12);
  const octaveRoot = root * 2;
  const octaveThird = third * 2;

  const maj7Tone = root * Math.pow(2, maj7Semitones / 12);
  const dom7Tone = root * Math.pow(2, dom7Semitones / 12);
  const dim7Tone = root * Math.pow(2, dim7Semitones / 12);
  const dim5Tone = root * Math.pow(2, 6 / 12);

  return {
    root, third, fifth, octaveRoot, octaveThird,
    maj7Tone, dom7Tone, dim7Tone, dim5Tone,
  };
}

function getSolidNotes(tones, rightHandCount, isMajorMode) {
  if (!tones) return [];
  const { root, third, fifth, octaveRoot, octaveThird, maj7Tone, dom7Tone, dim7Tone, dim5Tone } = tones;

  if (isMajorMode) {
    switch (rightHandCount) {
      case 1: return [root, fifth, octaveRoot, octaveThird];
      case 2: return [third, fifth, octaveRoot, octaveThird];
      case 3: return [root, third, fifth, maj7Tone];
      case 4: return [root, third, fifth, dom7Tone];
      default: return [root, fifth, octaveRoot, octaveThird];
    }
  } else {
    switch (rightHandCount) {
      case 1: return [root, fifth, octaveRoot, octaveThird];
      case 2: return [third, fifth, octaveRoot, octaveThird];
      case 3: return [root, third, fifth, dom7Tone];
      case 4: return [root, third, dim5Tone, dim7Tone];
      default: return [root, fifth, octaveRoot, octaveThird];
    }
  }
}

// ---- Visual Guide Updates ----
const GESTURE_GUIDE = [
  { degree: 1, gesture: "1️⃣" },
  { degree: 2, gesture: "2️⃣" },
  { degree: 3, gesture: "3️⃣" },
  { degree: 4, gesture: "4️⃣" },
  { degree: 5, gesture: "5️⃣" },
  { degree: 6, gesture: "🤘" },
  { degree: 7, gesture: "🤟" },
];

function updateGestureGuide() {
  if (!gestureGuideEl) return;
  const scale = MAJOR_SCALE[currentKeyName];
  gestureGuideEl.innerHTML = GESTURE_GUIDE
    .map(({ degree, gesture }) => `
      <div class="gesture-guide-row">
        <span class="gesture-guide-note">${scale[degree - 1]}</span>
        <span class="gesture-guide-gesture">${gesture}</span>
      </div>
    `)
    .join("");
}

updateGestureGuide();

// ---- Instantiating Architecture Modules ----
const synth = new SynthEngine();
const confidenceCalc = new ConfidenceCalculator();
const mappingManager = new GestureMappingManager();
const progressionRecorder = new ProgressionRecorder();
const sessionHistory = new SessionHistory();
const perfMonitor = new PerformanceMonitor();

const uiManager = new UIManager({
  mappingManager,
  progressionRecorder,
  sessionHistory,
  perfMonitor,
  synth,
  getKeyName: () => currentKeyName,
  getScaleNotes: (k) => MAJOR_SCALE[k] || MAJOR_SCALE.C,
});

// Key & Tone Change Listeners
keySelectEl.addEventListener("change", () => {
  currentTonicFreq = Number(keySelectEl.value);
  currentKeyName = keySelectEl.selectedOptions[0].dataset.note;
  updateGestureGuide();
  uiManager.renderMappingRows();
});

toneSelectEl.addEventListener("change", () => {
  synth.setWaveform(toneSelectEl.value);
});

// Audio Start Interaction
startOverlayEl.addEventListener("click", () => {
  synth.ensureContext();
  startOverlayEl.style.display = "none";
  canvasEl.classList.remove("dimmed");
  trackClarityEvent("first_audio_enable");
});

// Guide & Help Modals
guideToggleEl.addEventListener("click", () => {
  const isHidden = gestureGuideEl.classList.toggle("hidden");
  guideToggleEl.classList.toggle("active", !isHidden);
  guideToggleEl.textContent = isHidden ? "Guide" : "Close Guide";
  if (!isHidden) trackClarityEvent("guide_opened");
});

helpButton.addEventListener("click", () => {
  helpModal.classList.remove("hidden");
  trackClarityEvent("help_opened");
});

closeHelp.addEventListener("click", (e) => {
  e.stopPropagation();
  helpModal.classList.add("hidden");
});

helpModal.addEventListener("click", (e) => {
  if (e.target === helpModal) helpModal.classList.add("hidden");
});

// ---- Volume Meter ----
function updateVolumeMeter(volume01) {
  const litCount = Math.round(volume01 * volumeBarEls.length);
  volumeBarEls.forEach((bar) => {
    const index = Number(bar.dataset.index);
    bar.classList.toggle("lit", index >= volumeBarEls.length - litCount);
  });
}

// ---- Canvas Energy Visualization ----
function drawEnergy(ctx, volume01, qualityIndex, tiltFactor, chordStr) {
  if (!ctx || qualityIndex === 0) return;
  const lineCount = Math.max(1, Math.min(4, qualityIndex));

  try {
    const centerY = ctx.canvas.height - 70;
    const canvasWidth = ctx.canvas.width;
    const maxThickness = 1 + volume01 * 8;

    const chaosScale = (tiltFactor + 1) / 2;
    const shakinessAmp = chaosScale * 25;
    const shakinessFreq = 0.05 + chaosScale * 0.15;

    let baseColorRGB = "232, 161, 61";
    let isChordActive = false;
    let isMajor = false;

    if (chordStr && chordStr !== "--") {
      isChordActive = true;
      const upperStr = chordStr.toUpperCase();
      isMajor = chordStr === upperStr;

      const SCALE_COLORS = {
        I:   "232, 161, 61",
        II:  "210, 50, 120",
        III: "180, 40, 150",
        IV:  "240, 210, 40",
        V:   "245, 120, 30",
        VI:  "230, 40, 40",
        VII: "100, 200, 250",
      };
      baseColorRGB = SCALE_COLORS[upperStr] || "232, 161, 61";
    }

    const brightnessAlpha = isChordActive ? (isMajor ? 1 : 0.7) : 0.3;

    ctx.save();
    const time = performance.now() * 0.004;
    const colorChannels = baseColorRGB.split(",");
    const r = parseInt(colorChannels[0]);
    const g = parseInt(colorChannels[1]);
    const b = parseInt(colorChannels[2]);

    ctx.shadowBlur = 10 + volume01 * 20;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.5 * brightnessAlpha})`;

    for (let l = 0; l < lineCount; l++) {
      ctx.beginPath();
      const lineYOffset = centerY + (l - (lineCount - 1) / 2) * 12;

      for (let x = 0; x <= canvasWidth; x += 10) {
        const baseSine = Math.sin(x * 0.005 + time + l * 0.5) * 20;
        const jitter = (Math.random() - 0.5) * shakinessAmp * Math.sin(x * shakinessFreq + time);
        const y = lineYOffset + baseSine + jitter;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${brightnessAlpha})`;
      ctx.lineWidth = Math.max(1, maxThickness - l * 0.5);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    ctx.restore();
  } catch (error) {
    console.error("Wave animation failed:", error);
  }
}

// ---- Camera & MediaPipe ----
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  videoEl.srcObject = stream;
  return new Promise((resolve) => {
    videoEl.onloadedmetadata = () => {
      videoEl.play();
      resolve();
    };
  });
}

async function setupHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

function computeCoverRect(srcW, srcH, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;

  if (srcRatio > dstRatio) {
    const sHeight = srcH;
    const sWidth = srcH * dstRatio;
    return { sx: (srcW - sWidth) / 2, sy: 0, sWidth, sHeight };
  } else {
    const sWidth = srcW;
    const sHeight = srcW / dstRatio;
    return { sx: 0, sy: (srcH - sHeight) / 2, sWidth, sHeight };
  }
}

function drawFrame(results, canvasWidth, canvasHeight) {
  const srcW = videoEl.videoWidth;
  const srcH = videoEl.videoHeight;
  if (!srcW || !srcH) return;

  const { sx, sy, sWidth, sHeight } = computeCoverRect(srcW, srcH, canvasWidth, canvasHeight);

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.translate(canvasWidth, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(videoEl, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "#ffffff80";
  for (const landmarks of results.landmarks) {
    for (const point of landmarks) {
      const videoPx = point.x * srcW;
      const videoPy = point.y * srcH;
      const canvasX = ((videoPx - sx) / sWidth) * canvasWidth;
      const canvasY = ((videoPy - sy) / sHeight) * canvasHeight;

      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function resizeCanvas() {
  canvasEl.width = window.innerWidth;
  canvasEl.height = window.innerHeight;
}

// ---- Chord State Stabilizer ----
const CHORD_HOLD_TIME_MS = 100;
const VIBE_NULL_WINDOW_MS = 60;

let stableChordState = null;
let candidateChordState = null;
let candidateChordSince = 0;
let lastChordSeenValidTime = 0;

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

function stabilizeChordState(rawState, now) {
  if (rawState !== null) {
    lastChordSeenValidTime = now;
  }

  let effectiveState = rawState;
  if (rawState === null && now - lastChordSeenValidTime < VIBE_NULL_WINDOW_MS) {
    effectiveState = candidateChordState;
  }

  if (!sameChordState(effectiveState, candidateChordState)) {
    candidateChordState = effectiveState;
    candidateChordSince = now;
  }

  if (now - candidateChordSince >= CHORD_HOLD_TIME_MS) {
    stableChordState = candidateChordState;
  }

  return stableChordState;
}

// ---- Main Interactive Loop ----
async function main() {
  await setupCamera();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const handLandmarker = await setupHandLandmarker();

  let lastVideoTime = -1;
  let cachedLeftLandmarks = null;
  let cachedRightLandmarks = null;
  let leftDetectionScore = 0.9;
  let rightDetectionScore = 0.9;

  let lastTrackedChordKey = null;

  function loop() {
    const timestampNow = performance.now();
    perfMonitor.tickFrame();

    // 1. Video Frame & MediaPipe Hand Landmark Detection
    if (videoEl.currentTime !== lastVideoTime) {
      lastVideoTime = videoEl.currentTime;

      const inferenceStart = performance.now();
      const results = handLandmarker.detectForVideo(videoEl, timestampNow);
      const inferenceDuration = performance.now() - inferenceStart;
      perfMonitor.recordLatency(inferenceDuration);

      drawFrame(results, canvasEl.width, canvasEl.height);

      cachedLeftLandmarks = null;
      cachedRightLandmarks = null;

      results.landmarks.forEach((landmarks, i) => {
        const handData = results.handedness[i][0];
        const handedness = handData.categoryName;
        const score = handData.score;

        if (handedness === "Left") {
          cachedLeftLandmarks = landmarks;
          leftDetectionScore = score;
        } else if (handedness === "Right") {
          cachedRightLandmarks = landmarks;
          rightDetectionScore = score;
        }
      });
    }

    // 2. Real Gesture Confidence Calculation
    let leftConfidence = 0;
    let isLeftConfident = false;
    let leftWarning = null;

    if (cachedLeftLandmarks) {
      const confData = confidenceCalc.calculate(
        cachedLeftLandmarks,
        leftDetectionScore,
        "Left"
      );
      leftConfidence = confData.score;
      isLeftConfident = confData.isConfident;
      leftWarning = confData.warning;

      perfMonitor.recordConfidence(leftConfidence, true, isLeftConfident);
    } else {
      confidenceCalc.reset("Left");
      perfMonitor.recordConfidence(0, false, false);
    }

    // 3. Gesture Classification & Mapping
    let rawChordState = null;
    let gestureClassification = null;

    if (cachedLeftLandmarks) {
      gestureClassification = classifyLeftHandGesture(
        cachedLeftLandmarks,
        "Left",
        mappingManager
      );

      // EXPRESS REQUIREMENT:
      // When confidence is below threshold, do not change currently playing chord; show warning!
      if (isLeftConfident && gestureClassification) {
        let rawQualityIndex = 0;
        let rawThumbDown = false;

        if (cachedRightLandmarks) {
          rawQualityIndex = getRightHandQualityIndex(cachedRightLandmarks);
          rawThumbDown = isThumbExtended(cachedRightLandmarks, "Right");
        }

        rawChordState = {
          chord: gestureClassification.roman,
          degree: gestureClassification.degree,
          isMajorMode: gestureClassification.isMajorMode,
          qualityIndex: rawQualityIndex,
          thumbDown: rawThumbDown,
          gestureLabel: gestureClassification.gestureLabel,
        };
      }
    }

    // Update Real-Time Confidence HUD & Unclear Gesture Warning
    uiManager.updateConfidenceHud(
      leftConfidence,
      gestureClassification ? gestureClassification.gestureLabel : null,
      isLeftConfident,
      cachedLeftLandmarks ? leftWarning : null
    );

    // 4. Stabilize Chord State
    const stableState = stabilizeChordState(rawChordState, timestampNow);

    let currentChord = null;
    let isMajorMode = true;
    let qualityIndex = 0;
    let thumbDown = false;
    let activeDegree = "I";
    let activeGestureLabel = null;

    if (stableState) {
      currentChord = stableState.chord;
      isMajorMode = stableState.isMajorMode;
      qualityIndex = stableState.qualityIndex;
      thumbDown = stableState.thumbDown;
      activeDegree = stableState.degree || "I";
      activeGestureLabel = stableState.gestureLabel || "Gesture";
    }

    // 5. Update Center Feedback Displays
    let chordName = "";
    if (currentChord) {
      chordName = getChordName(currentChord, isMajorMode);
      chordDisplayEl.textContent = `${chordName} (${currentChord})`;
    } else {
      chordDisplayEl.textContent = "--";
    }

    const MAJOR_LABELS = {
      1: "Major",
      2: "Major 1st Inv",
      3: "Major 7th",
      4: "Dominant 7th",
    };
    const MINOR_LABELS = {
      1: "Minor",
      2: "Minor 1st Inv",
      3: "Minor 7th",
      4: "Diminished 7th",
    };

    const activeLabel = isMajorMode ? MAJOR_LABELS[qualityIndex] : MINOR_LABELS[qualityIndex];
    qualityDisplayEl.textContent = activeLabel
      ? `${activeLabel}${thumbDown ? " (-8ve)" : ""}`
      : "--";

    // 6. Right Hand Expression & Audio Processing
    if (cachedRightLandmarks) {
      const currentVolume = getVolumeFromHeight(cachedRightLandmarks);
      updateVolumeMeter(currentVolume);

      const horizontalTilt = getHandHorizontalTilt(cachedRightLandmarks, "Right");
      const tiltPercentage = Math.round(horizontalTilt * 100);

      if (distortionDisplayEl) {
        distortionDisplayEl.textContent = `Filter: ${tiltPercentage > 0 ? "+" : ""}${tiltPercentage}%`;
      }
      synth.updateFilterSweep(horizontalTilt);

      // Check if chord notes can be played
      if (currentChord && qualityIndex >= 1) {
        const tones = getChordTones(currentChord, isMajorMode);
        let notes = getSolidNotes(tones, qualityIndex, isMajorMode);

        if (thumbDown) {
          notes = notes.map((f) => f / 2);
        }

        const chordTrackingKey = `${currentChord}-${isMajorMode ? "M" : "m"}-${qualityIndex}-${thumbDown ? "low" : "norm"}`;

        // If chord changed and is confident, log to Session History
        if (chordTrackingKey !== lastTrackedChordKey) {
          lastTrackedChordKey = chordTrackingKey;
          trackClarityEvent("chord_changed");

          sessionHistory.logEvent({
            gesture: activeGestureLabel,
            chord: `${chordName} (${currentChord})`,
            roman: currentChord,
            confidence: leftConfidence,
          });
        }

        // If progression recording is active, capture the event
        if (progressionRecorder.isRecording) {
          progressionRecorder.recordEvent({
            chord: chordName,
            degree: activeDegree,
            roman: currentChord,
            isMajorMode,
            qualityIndex,
            thumbDown,
            notes,
          });
        }

        // Live Audio Playback (when not overridden by progression playback)
        if (!progressionRecorder.isPlaying) {
          synth.playNotes(notes);
          synth.setVolume(currentVolume);
        }
      } else {
        if (!progressionRecorder.isPlaying) {
          synth.fadeOut(0.12);
        }
      }
    } else {
      updateVolumeMeter(0);
      if (!progressionRecorder.isPlaying) {
        synth.fadeOut(0.12);
      }
    }

    // 7. Visual Energy Drawing
    const liveVolume = cachedRightLandmarks ? getVolumeFromHeight(cachedRightLandmarks) : 0;
    const liveTilt = cachedRightLandmarks ? getHandHorizontalTilt(cachedRightLandmarks, "Right") : 0;

    drawEnergy(ctx, liveVolume, qualityIndex, liveTilt, currentChord);

    requestAnimationFrame(loop);
  }

  loop();
}

main().catch((err) => console.error(err));
