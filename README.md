# WAVE 🎵👋

**WAVE** is an interactive, camera-based musical instrument that transforms computer vision hand gestures into real-time audio synthesis. Powered by MediaPipe Hand Landmarking and the Web Audio API, it allows musicians, creators, and enthusiasts to play chords, control expression, apply dynamic audio filters, and adjust octaves purely through hand gestures.

Original project created by **[Eric Wei](https://indecisiveeric.com)**.

---

## 🎥 Demo & Tutorial

Watch the video tutorial on Instagram:  
👉 **[WAVE Instagram Tutorial by Eric Wei](https://www.instagram.com/p/DbH1BACxNCG/)**

---

## ✨ Features

- **Real-Time Hand Tracking:** High-precision 21-point hand landmark detection using Google MediaPipe.
- **Left-Hand Chord Control:** Dynamic chord selection (Scale Degrees I through VII) and Major/Minor triad toggling based on hand tilt and finger counts.
- **Right-Hand Expressive Control:**
  - **Voicing & Inversions:** Root position, 1st inversion, Major/Minor 7th, and Dominant/Diminished 7th.
  - **Octave Shifts:** Instant pitch shifting based on thumb position.
  - **Filter Control:** Low-pass filter frequency modulation via hand tilt.
  - **Dynamic Volume:** Vertical height mapped to synth output volume with an active visual VU meter.
- **Customizable Audio Synth:**
  - **Key Selector:** Choose base keys across all 12 chromatic pitches (A, A#, B, C, etc.).
  - **Waveform Tones:** Warm Synth (Triangle), Bright Synth (Sawtooth), and Retro Synth (Square).
- **Interactive UI & Visualizer:** Canvas overlay rendering live skeleton tracking, gesture guides, chord displays, and audio filters.

---

## 🖐️ Gesture Control Reference

### ✋ Left Hand (Chord Selection & Quality)
| Gesture / State | Function |
| :--- | :--- |
| **Tilt Inward** | Major Chord |
| **Tilt Outward** | Minor Chord |
| **1 Finger** | Scale Degree **I** |
| **2 Fingers** | Scale Degree **II** |
| **3 Fingers** | Scale Degree **III** |
| **4 Fingers** | Scale Degree **IV** |
| **5 Fingers** | Scale Degree **V** |
| **Index + Pinky** | Scale Degree **VI** |
| **Index + Pinky + Thumb** | Scale Degree **VII** |

### ✋ Right Hand (Expression, Inversion & Filter)
| Gesture / State | Function |
| :--- | :--- |
| **1 Finger** | Root Position Triad |
| **2 Fingers** | 1st Inversion Triad |
| **3 Fingers** | Major / Minor 7th Chord |
| **4 Fingers** | Dominant / Diminished 7th Chord |
| **Thumb Inward** | Higher Octave (+1) |
| **Thumb Outward** | Lower Octave (-1) |
| **Tilt Inward / Outward** | Low-Pass Audio Filter Cutoff Frequency |
| **Hand Height (Y-axis)** | Output Volume (Higher = Louder, Lower = Softer) |

---

## 🛠️ Built With

- **[JavaScript (ES6+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)** - Application Logic & Web Audio synth engine
- **[@mediapipe/tasks-vision](https://www.npmjs.com/package/@mediapipe/tasks-vision)** - Real-time hand tracking model
- **[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)** - Custom polyphonic sound synthesis & audio node processing
- **[Vite](https://vitejs.dev/)** - Lightning-fast frontend build tool & dev server
- **[HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)** - Hardware-accelerated visual feedback & landmark overlay

---

## 🚀 Quick Start

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v16+ recommended) installed on your machine.

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

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in Browser:**  
   Navigate to `http://localhost:5173/` (or the URL provided in terminal), enable webcam access, click the screen to enable audio context, and start making music!

---

## 📂 Project Structure

```text
WAVE/
├── index.html        # Main HTML layout, UI overlays, and modal guides
├── main.js           # Hand tracking pipeline, gesture recognition & Web Audio synthesis
├── package.json      # Dependencies and script definitions
├── package-lock.json # Lockfile for npm dependencies
├── README.md         # Project documentation
├── LICENSE           # License agreement
└── .gitignore        # Git ignore rules
```

---

## 📜 License & Credits

- Created by **Eric Wei** ([indecisiveeric.com](https://indecisiveeric.com)).
- Free to use, modify, and share for educational and non-commercial purposes.

