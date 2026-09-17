/**
 * WAVE — Custom Gesture Mapping Store & Manager
 * 
 * Supports mapping left-hand gestures to any scale degree (I through VII).
 * Automatically resolves to key-specific chords (e.g. C, Dm, Em, F, G, Am, Bdim).
 * Persists to localStorage with schema validation and fallback safety.
 */

export const STORAGE_KEY = "wave_gesture_mapping_v2";

export const GESTURE_DEFINITIONS = [
  { id: "1_finger", label: "1 Finger", defaultDegree: "I" },
  { id: "2_fingers", label: "2 Fingers", defaultDegree: "II" },
  { id: "3_fingers", label: "3 Fingers", defaultDegree: "III" },
  { id: "4_fingers", label: "4 Fingers", defaultDegree: "IV" },
  { id: "5_fingers", label: "5 Fingers", defaultDegree: "V" },
  { id: "rock", label: "Index + Pinky (VI)", defaultDegree: "VI" },
  { id: "horns", label: "Index + Pinky + Thumb (VII)", defaultDegree: "VII" },
];

export const VALID_DEGREES = ["I", "II", "III", "IV", "V", "VI", "VII"];

export const PRESET_STANDARD = {
  "1_finger": "I",
  "2_fingers": "II",
  "3_fingers": "III",
  "4_fingers": "IV",
  "5_fingers": "V",
  "rock": "VI",
  "horns": "VII",
};

export const PRESET_POP = {
  "1_finger": "I",   // e.g. C
  "2_fingers": "V",   // e.g. G
  "3_fingers": "VI",  // e.g. Am
  "4_fingers": "IV",  // e.g. F
  "5_fingers": "II",  // e.g. Dm
  "rock": "III",      // e.g. Em
  "horns": "VII",     // e.g. Bdim
};

export class GestureMappingManager {
  constructor() {
    this.mappings = { ...PRESET_STANDARD };
    this.listeners = [];
    this.load();
  }

  /**
   * Load stored mappings with validation
   */
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return;

      const validated = {};
      for (const def of GESTURE_DEFINITIONS) {
        const val = parsed[def.id];
        if (typeof val === "string" && VALID_DEGREES.includes(val.toUpperCase())) {
          validated[def.id] = val.toUpperCase();
        } else {
          validated[def.id] = def.defaultDegree;
        }
      }
      this.mappings = validated;
    } catch (e) {
      console.warn("Failed to load custom mappings from localStorage, using defaults:", e);
      this.mappings = { ...PRESET_STANDARD };
    }
  }

  /**
   * Save current mappings to localStorage
   */
  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.mappings));
      this.notify();
      return true;
    } catch (e) {
      console.error("Failed to persist mappings to localStorage:", e);
      return false;
    }
  }

  /**
   * Update a specific gesture's degree
   * @param {string} gestureId
   * @param {string} degree
   */
  setMapping(gestureId, degree) {
    const upper = degree.toUpperCase();
    if (VALID_DEGREES.includes(upper)) {
      this.mappings[gestureId] = upper;
    }
  }

  /**
   * Get mapped scale degree for a gesture
   * @param {string} gestureId
   * @returns {string}
   */
  getDegree(gestureId) {
    return this.mappings[gestureId] || PRESET_STANDARD[gestureId] || "I";
  }

  /**
   * Reset to standard default mappings
   */
  resetToDefault() {
    this.mappings = { ...PRESET_STANDARD };
    this.save();
  }

  /**
   * Apply a preset
   * @param {'standard' | 'pop'} presetName
   */
  applyPreset(presetName) {
    if (presetName === "pop") {
      this.mappings = { ...PRESET_POP };
    } else {
      this.mappings = { ...PRESET_STANDARD };
    }
    this.save();
  }

  onChange(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.mappings);
      } catch (e) {
        console.error("Mapping listener error:", e);
      }
    });
  }
}
