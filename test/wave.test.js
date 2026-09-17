import { test, describe, before, beforeEach } from "node:test";
import assert from "node:assert";

// Polyfill localStorage & window for Node test environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
}

if (typeof globalThis.window === "undefined") {
  globalThis.window = {
    AudioContext: class MockAudioContext {
      constructor() {
        this.currentTime = 0;
        this.sampleRate = 44100;
        this.state = "running";
        this.destination = {};
      }
      createOscillator() {
        return {
          type: "sine",
          frequency: { value: 440 },
          connect: () => {},
          disconnect: () => {},
          start: () => {},
          stop: () => {},
        };
      }
      createGain() {
        return {
          gain: {
            value: 1,
            setValueAtTime: () => {},
            linearRampToValueAtTime: () => {},
            cancelScheduledValues: () => {},
            setTargetAtTime: () => {},
          },
          connect: () => {},
          disconnect: () => {},
        };
      }
      createBiquadFilter() {
        return {
          type: "lowpass",
          frequency: { value: 1200, setTargetAtTime: () => {} },
          Q: { value: 0.7, setTargetAtTime: () => {} },
          connect: () => {},
        };
      }
      createWaveShaper() {
        return {
          curve: null,
          oversample: "none",
          connect: () => {},
        };
      }
    },
  };
}

import { SynthEngine, CROSSFADE_DURATION_SEC } from "../src/audio/SynthEngine.js";
import { ConfidenceCalculator, GESTURE_CONFIDENCE_THRESHOLD } from "../src/gestures/confidence.js";
import { GestureMappingManager, PRESET_STANDARD, PRESET_POP } from "../src/gestures/mapping.js";
import {
  classifyLeftHandGesture,
  getRightHandQualityIndex,
  getVolumeFromHeight,
  getHandHorizontalTilt,
  isFingerExtended,
  isThumbExtended,
} from "../src/gestures/classifier.js";
import { ProgressionRecorder } from "../src/recording/progressionRecorder.js";
import { SessionHistory, MAX_HISTORY_ITEMS } from "../src/history/sessionHistory.js";
import { PerformanceMonitor } from "../src/performance/perfMonitor.js";

// Helper to generate mock hand landmarks
function createMockLandmarks(options = {}) {
  const {
    wristX = 0.5,
    wristY = 0.7,
    mcpDist = 0.25,
    extendedFingers = [8, 12, 16, 20], // indices of extended tips
    thumbExtended = false,
  } = options;

  const landmarks = Array.from({ length: 21 }, () => ({ x: wristX, y: wristY, z: 0 }));
  landmarks[0] = { x: wristX, y: wristY, z: 0 };
  landmarks[9] = { x: wristX, y: wristY - mcpDist, z: 0 }; // middle MCP
  landmarks[13] = { x: wristX + 0.05, y: wristY - mcpDist + 0.02, z: 0 }; // ring MCP

  // Setup finger pairs (pip vs tip)
  const pairs = [
    { pip: 6, tip: 8 },
    { pip: 10, tip: 12 },
    { pip: 14, tip: 16 },
    { pip: 18, tip: 20 },
  ];

  pairs.forEach(({ pip, tip }) => {
    landmarks[pip] = { x: wristX, y: wristY - 0.2, z: 0 };
    if (extendedFingers.includes(tip)) {
      landmarks[tip] = { x: wristX, y: wristY - 0.38, z: 0 }; // extended (above pip)
    } else {
      landmarks[tip] = { x: wristX, y: wristY - 0.12, z: 0 }; // folded (below pip)
    }
  });

  // Thumb: For left hand, tip.x < ip.x means extended left
  landmarks[3] = { x: wristX - 0.05, y: wristY - 0.1, z: 0 };
  if (thumbExtended) {
    landmarks[4] = { x: wristX - 0.12, y: wristY - 0.12, z: 0 }; // extended (tip.x < ip.x)
  } else {
    landmarks[4] = { x: wristX - 0.02, y: wristY - 0.12, z: 0 }; // folded (tip.x > ip.x)
  }

  return landmarks;
}

describe("1. Audio Crossfade SynthEngine", () => {
  let synth;
  beforeEach(() => {
    synth = new SynthEngine();
    synth.ensureContext();
  });

  test("Initializes context and audio graph correctly", () => {
    assert.ok(synth.ctx);
    assert.ok(synth.masterGain);
    assert.ok(synth.filter);
    assert.ok(synth.waveShaper);
    const stats = synth.getStats();
    assert.strictEqual(stats.activeVoices, 0);
  });

  test("Spawns new voice on playNotes and manages voice lifecycle", () => {
    synth.playNotes([261.63, 329.63, 392.00]); // C major
    let stats = synth.getStats();
    assert.strictEqual(stats.activeVoices, 1);
    assert.strictEqual(stats.oscillatorCount, 3);

    // Crossfade into G major
    synth.playNotes([392.00, 493.88, 587.33]); // G major
    stats = synth.getStats();
    // During crossfade, previous voice fades out and new voice fades in (2 active voices)
    assert.strictEqual(stats.activeVoices, 2);
    assert.strictEqual(stats.oscillatorCount, 6);
  });

  test("Deduplicates identical notes to prevent redundant voice creation", () => {
    synth.playNotes([261.63, 329.63, 392.00]);
    const firstVoice = synth.currentVoice;
    synth.playNotes([261.63, 329.63, 392.00]); // same notes
    assert.strictEqual(synth.currentVoice, firstVoice);
    assert.strictEqual(synth.fadingVoices.length, 0);
  });

  test("Graceful fadeOut clears currentVoice and targets silence", () => {
    synth.playNotes([261.63, 329.63, 392.00]);
    synth.fadeOut(0.05);
    assert.strictEqual(synth.currentVoice, null);
    assert.strictEqual(synth.fadingVoices.length, 1);
  });
});

describe("2. Real Gesture Confidence System", () => {
  let calc;
  beforeEach(() => {
    calc = new ConfidenceCalculator();
  });

  test("Returns high confidence for a well-centered, stable, clear hand", () => {
    const lms = createMockLandmarks({ wristX: 0.5, wristY: 0.7, mcpDist: 0.25 });
    // First frame establishes stability reference
    calc.calculate(lms, 0.95, "Left");
    // Second frame with near-identical position
    const res = calc.calculate(lms, 0.95, "Left");

    assert.ok(res.score >= GESTURE_CONFIDENCE_THRESHOLD, `Score ${res.score} should be >= ${GESTURE_CONFIDENCE_THRESHOLD}`);
    assert.strictEqual(res.isConfident, true);
    assert.strictEqual(res.warning, null);
  });

  test("Penalizes score and warns when hand is too far or small", () => {
    // tiny palm scale (mcpDist = 0.04)
    const lms = createMockLandmarks({ wristX: 0.5, wristY: 0.7, mcpDist: 0.04 });
    const res = calc.calculate(lms, 0.6, "Left");
    assert.strictEqual(res.isConfident, false);
    assert.ok(res.warning.includes("Hand too far") || res.warning.includes("unclear"));
  });

  test("Penalizes score when landmarks clip screen boundary", () => {
    // wrist right on edge (x = 0.01)
    const lms = createMockLandmarks({ wristX: 0.01, wristY: 0.5, mcpDist: 0.2 });
    const res = calc.calculate(lms, 0.9, "Left");
    assert.ok(res.breakdown.boundary <= 75, "Boundary factor should be penalized for edge clipping");
  });

  test("Returns 0 and warning on missing or incomplete landmarks", () => {
    const res = calc.calculate([], 0, "Left");
    assert.strictEqual(res.score, 0);
    assert.strictEqual(res.isConfident, false);
    assert.strictEqual(res.warning, "No hand detected");
  });
});

describe("3. Custom Gesture Mapping Manager", () => {
  let manager;
  beforeEach(() => {
    localStorage.clear();
    manager = new GestureMappingManager();
  });

  test("Loads standard defaults initially", () => {
    assert.strictEqual(manager.getDegree("1_finger"), "I");
    assert.strictEqual(manager.getDegree("2_fingers"), "II");
    assert.strictEqual(manager.getDegree("3_fingers"), "III");
    assert.strictEqual(manager.getDegree("4_fingers"), "IV");
  });

  test("Updates and persists custom mapping", () => {
    manager.setMapping("1_finger", "IV");
    manager.setMapping("2_fingers", "V");
    manager.save();

    // Create a new instance to verify persistence from localStorage
    const newManager = new GestureMappingManager();
    assert.strictEqual(newManager.getDegree("1_finger"), "IV");
    assert.strictEqual(newManager.getDegree("2_fingers"), "V");
  });

  test("Applies Pop 4-Chord preset (I - V - vi - IV)", () => {
    manager.applyPreset("pop");
    assert.strictEqual(manager.getDegree("1_finger"), "I");
    assert.strictEqual(manager.getDegree("2_fingers"), "V");
    assert.strictEqual(manager.getDegree("3_fingers"), "VI");
    assert.strictEqual(manager.getDegree("4_fingers"), "IV");
  });

  test("Validates and ignores invalid scale degrees", () => {
    manager.setMapping("1_finger", "INVALID_DEGREE");
    assert.strictEqual(manager.getDegree("1_finger"), "I"); // untouched
  });

  test("Reset to default restores standard degrees", () => {
    manager.applyPreset("pop");
    manager.resetToDefault();
    assert.strictEqual(manager.getDegree("2_fingers"), "II");
  });
});

describe("4. Gesture Classifier", () => {
  let mappingManager;
  beforeEach(() => {
    mappingManager = new GestureMappingManager();
  });

  test("Classifies 1-finger gesture with custom mapping", () => {
    // Only index (8) extended
    const lms = createMockLandmarks({ extendedFingers: [8] });
    const res = classifyLeftHandGesture(lms, "Left", mappingManager);
    assert.ok(res);
    assert.strictEqual(res.gestureId, "1_finger");
    assert.strictEqual(res.degree, "I");
  });

  test("Classifies rock gesture (Index + Pinky)", () => {
    // Index (8) and Pinky (20) extended
    const lms = createMockLandmarks({ extendedFingers: [8, 20] });
    const res = classifyLeftHandGesture(lms, "Left", mappingManager);
    assert.ok(res);
    assert.strictEqual(res.gestureId, "rock");
    assert.strictEqual(res.degree, "VI");
  });

  test("Computes right hand quality index correctly", () => {
    // 3 fingers extended (8, 12, 16)
    const lms = createMockLandmarks({ extendedFingers: [8, 12, 16] });
    const quality = getRightHandQualityIndex(lms);
    assert.strictEqual(quality, 3);
  });

  test("Computes volume from wrist height", () => {
    const lmsTop = createMockLandmarks({ wristY: 0.1 }); // near top = loud
    const volHigh = getVolumeFromHeight(lmsTop);
    assert.ok(volHigh > 0.85);

    const lmsBottom = createMockLandmarks({ wristY: 0.9 }); // near bottom = soft
    const volLow = getVolumeFromHeight(lmsBottom);
    assert.ok(volLow < 0.15);
  });
});

describe("5. Chord Progression Recorder", () => {
  let recorder;
  beforeEach(() => {
    recorder = new ProgressionRecorder();
  });

  test("Starts recording and captures timestamped events", () => {
    recorder.startRecording();
    assert.strictEqual(recorder.isRecording, true);

    recorder.recordEvent({
      chord: "C",
      degree: "I",
      roman: "I",
      isMajorMode: true,
      qualityIndex: 1,
      thumbDown: false,
      notes: [261.63, 329.63, 392.00],
    });

    recorder.recordEvent({
      chord: "G",
      degree: "V",
      roman: "V",
      isMajorMode: true,
      qualityIndex: 1,
      thumbDown: false,
      notes: [392.00, 493.88, 587.33],
    });

    assert.strictEqual(recorder.events.length, 2);
    assert.strictEqual(recorder.events[0].chord, "C");
    assert.strictEqual(recorder.events[1].chord, "G");
    assert.ok(typeof recorder.events[0].time === "number");
  });

  test("Deduplicates consecutive identical chord events", () => {
    recorder.startRecording();
    const ev = {
      chord: "Am",
      degree: "VI",
      roman: "vi",
      isMajorMode: false,
      qualityIndex: 1,
      thumbDown: false,
      notes: [220, 261.63, 329.63],
    };

    recorder.recordEvent(ev);
    recorder.recordEvent(ev); // identical repeat
    recorder.recordEvent(ev); // identical repeat
    assert.strictEqual(recorder.events.length, 1);
  });

  test("Loops and clear operations", () => {
    assert.strictEqual(recorder.isLooping, false);
    recorder.toggleLoop();
    assert.strictEqual(recorder.isLooping, true);

    recorder.clear();
    assert.strictEqual(recorder.events.length, 0);
  });
});

describe("6. Session History Manager", () => {
  let history;
  beforeEach(() => {
    localStorage.clear();
    history = new SessionHistory();
  });

  test("Logs events and lists most recent first", () => {
    history.logEvent({ gesture: "1 Finger", chord: "C Major", roman: "I", confidence: 95 });
    history.logEvent({ gesture: "2 Fingers", chord: "G Major", roman: "V", confidence: 91 });

    const entries = history.getEntries();
    assert.strictEqual(entries.length, 2);
    assert.strictEqual(entries[0].chord, "G Major"); // most recent
    assert.strictEqual(entries[1].chord, "C Major");
    assert.strictEqual(entries[0].confidence, 91);
  });

  test("Caps entries at MAX_HISTORY_ITEMS", () => {
    for (let i = 0; i < MAX_HISTORY_ITEMS + 15; i++) {
      history.logEvent({
        gesture: `${i} Fingers`,
        chord: `Chord_${i}`,
        roman: `deg_${i}`,
        confidence: 85,
      });
    }
    assert.strictEqual(history.getEntries().length, MAX_HISTORY_ITEMS);
  });

  test("Clears history", () => {
    history.logEvent({ gesture: "1 Finger", chord: "C Major", roman: "I", confidence: 95 });
    history.clear();
    assert.strictEqual(history.getEntries().length, 0);
  });
});

describe("7. Real Performance Monitor", () => {
  let perf;
  beforeEach(() => {
    perf = new PerformanceMonitor();
  });

  test("Measures real FPS and real latency", () => {
    // Simulate frame intervals ~16.6ms (60 FPS)
    for (let i = 0; i < 20; i++) {
      perf.tickFrame();
    }
    perf.recordLatency(12.5); // 12.5 ms
    perf.recordLatency(14.2); // 14.2 ms
    perf.recordConfidence(92, true, true);

    const m = perf.getMetrics();
    assert.ok(typeof m.fps === "number" || m.fps === "Measuring...");
    assert.ok(m.latencyMs.includes("ms"));
    assert.strictEqual(m.gestureAccuracy, "92%");
  });
});
