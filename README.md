# WAVE 🎵👋 — Gesture Maestro

**WAVE** is an interactive, browser-based musical instrument that transforms computer vision hand gestures into expressive, polyphonic real-time audio synthesis. Powered by Google MediaPipe Hand Landmarking and the Web Audio API, WAVE allows musicians, creators, and enthusiasts to play chords, sculpt filters, trigger smooth crossfades, record progressions, and customize gesture mappings purely through intuitive hand gestures in front of a webcam.

---

## ✨ Features

- **Smooth Polyphonic Chord Crossfading:** Seamless audio transitions between chord changes using dedicated `GainNode` envelopes with zero clicks, pops, or abrupt terminations. Configurable crossfade envelope duration.
- **Real-Time Hand Tracking:** High-precision 21-point hand landmark detection using Google MediaPipe Tasks Vision.
- **Real Gesture Confidence & Boundary System:**
  - Multi-factor confidence score (0–100%) grounded in landmark visibility, palm scale/distance, boundary clipping avoidance, finger extension clarity, and frame-to-frame stability.
  - Configurable confidence threshold (`70%`). Low-confidence gestures prevent false chord triggers and surface visual warning alerts.
- **Custom Gesture Mapping Editor:**
  - Interactive UI modal to assign scale degrees (I through VII) or custom chords to any left-hand gesture.
  - Live key preview across all 12 musical keys.
  - One-click presets: *Standard Degrees (I–VII)* and *Four-Chord Pop Progression (I–V–vi–IV)*.
  - Saved and validated automatically via `localStorage`.
- **Chord Progression Recording & Looper:**
  - Record gesture-triggered chord sequences with exact relative timestamps.
  - Interactive progression strip displaying chord chips.
  - Replay progressions using original relative timing and smooth audio crossfades.
  - Seamless loop toggle and clear controls.
- **Session History:**
  - Chronological audit log of played chords, gestures, timestamps, and detection confidence.
  - Most recent events displayed first with capped persistent session memory and clear action.
- **Real Performance Diagnostics:**
  - Measured runtime FPS across sliding frame intervals.
  - Actual MediaPipe inference latency in milliseconds.
  - Live gesture accuracy and acceptance rate.
  - Active Web Audio voice and oscillator counts.
- **Expressive Right-Hand Controls:**
  - **Voicing & Inversions:** Root position triad, 1st inversion, Major/Minor 7th, and Dominant/Diminished 7th.
  - **Octave Shift:** Pitch-shift down (-8ve) via thumb extension.
  - **Low-Pass Filter Modulation:** Acoustic warmth (inward tilt) and bright EDM squelch (outward tilt).
  - **Dynamic Volume:** Vertical height mapped to synth output volume with an active visual VU meter.
- **Customizable Synth Engine:**
  - **Key Selector:** Choose base keys across all 12 chromatic pitches (A, Bb, B, C, Db, D, Eb, E, F, Gb, G, Ab).
  - **Waveform Tones:** Warm Synth (Triangle), Bright Synth (Sawtooth), and Retro Synth (Square).
  - **Fluid Energy Visualizer:** HTML5 Canvas reactive wave ribbons visualizing volume, tilt distortion, and scale degree hues.

---

## 🖐️ Gesture Control Reference

### ✋ Left Hand (Chord Triggering & Mode)
| Gesture / State | Default Function | Custom Mapping |
| :--- | :--- | :--- |
| **Tilt Inward** | Major Mode | Tilt-sensitive |
| **Tilt Outward** | Minor Mode | Tilt-sensitive |
| **1 Finger** | Scale Degree **I** (Tonic) | Fully Customizable |
| **2 Fingers** | Scale Degree **II** | Fully Customizable |
| **3 Fingers** | Scale Degree **III** | Fully Customizable |
| **4 Fingers** | Scale Degree **IV** | Fully Customizable |
| **5 Fingers** | Scale Degree **V** | Fully Customizable |
| **Index + Pinky (🤘)** | Scale Degree **VI** | Fully Customizable |
| **Index + Pinky + Thumb (🤟)** | Scale Degree **VII** | Fully Customizable |

### ✋ Right Hand (Expression, Voicing & Filter)
| Gesture / State | Function |
| :--- | :--- |
| **1 Finger** | Root Position Triad |
| **2 Fingers** | 1st Inversion Triad |
| **3 Fingers** | Major / Minor 7th Chord |
| **4 Fingers** | Dominant / Diminished 7th Chord |
| **Thumb Extended** | Lower Octave (-8ve) |
| **Horizontal Tilt** | Low-Pass Audio Filter Cutoff Frequency & Resonance Sweep |
| **Vertical Height (Y-axis)** | Output Volume (Higher = Louder, Lower = Softer) |

---

## 🛠️ Built With

- **[JavaScript (ES6+ Modules)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)** - Clean separation of concerns across audio, vision, recording, and UI modules.
- **[@mediapipe/tasks-vision](https://www.npmjs.com/package/@mediapipe/tasks-vision)** - Real-time hand landmarking model running on GPU.
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - Custom polyphonic synthesizer with gain envelopes, biquad filter, waveshaper, and crossfade scheduling.
- **[Vite](https://vitejs.dev/)** - Frontend bundler & dev server.
- **[HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** - Hardware-accelerated visual wave visualizer and skeleton landmark overlays.
- **[Node.js Built-in Test Runner](https://nodejs.org/api/test.html)** - Automated unit tests for audio lifecycle, confidence calculation, mapping validation, and recorders.

---

## 🚀 Quick Start

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ParthMozarkar/WAVE.git
   cd WAVE
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run automated tests:**
   ```bash
   npm test
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

6. **Open in Browser:**  
   Navigate to the local URL (e.g. `http://localhost:5173/`), allow camera access, click the start screen to enable the Web Audio context, and start playing!

---

## 📂 Project Structure

```text
WAVE/
├── index.html                     # Main HTML layout, HUD overlays, modals, and styling
├── main.js                        # Pipeline orchestrator: camera, vision loop, audio sync
├── package.json                   # Scripts and project dependencies
├── package-lock.json              # Dependency lockfile
├── README.md                      # Documentation and usage guide
├── LICENSE                        # License agreement
├── src/
│   ├── audio/
│   │   └── SynthEngine.js         # Polyphonic synthesizer with click-free crossfade Gain envelopes
│   ├── gestures/
│   │   ├── classifier.js          # Finger posture detection, tilt angle, and degree classification
│   │   ├── confidence.js          # Real multi-factor confidence calculator and boundary analysis
│   │   └── mapping.js             # Custom mapping store, presets (Standard & Pop), and localStorage
│   ├── recording/
│   │   └── progressionRecorder.js # Chord sequence recorder, timeline scheduler, and looper
│   ├── history/
│   │   └── sessionHistory.js      # Timestamped audit log with capped persistence
│   ├── performance/
│   │   └── perfMonitor.js         # Real FPS, inference latency, accuracy, and audio node diagnostics
│   └── ui/
│       └── UIManager.js           # Controls dock, modal dialogs, timeline strips, and HUD alerts
└── test/
    └── wave.test.js               # Comprehensive unit test suite (24 automated tests)
```

---

## 📄 License

MIT License. See [LICENSE](file:///d:/WAVE%20OJT/LICENSE) for details.
