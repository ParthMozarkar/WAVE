/**
 * WAVE — Chord & Scale Theory Engine
 * 
 * Provides musical scales, degree-to-frequency conversions,
 * chord tone synthesis intervals, and voicing notes for all 12 keys.
 */

export const MAJOR_SCALE = {
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

export const DEGREE_SEMITONES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };

export const NUMERAL_TO_DEGREE = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
};

export const KEY_OPTIONS = [
  { note: "A", freq: 220.00, label: "Key: A" },
  { note: "Bb", freq: 233.08, label: "Key: A#/Bb" },
  { note: "B", freq: 246.94, label: "Key: B" },
  { note: "C", freq: 261.63, label: "Key: C" },
  { note: "Db", freq: 277.18, label: "Key: C#/Db" },
  { note: "D", freq: 293.66, label: "Key: D" },
  { note: "Eb", freq: 311.13, label: "Key: D#/Eb" },
  { note: "E", freq: 329.63, label: "Key: E" },
  { note: "F", freq: 349.23, label: "Key: F" },
  { note: "Gb", freq: 369.99, label: "Key: F#/Gb" },
  { note: "G", freq: 392.00, label: "Key: G" },
  { note: "Ab", freq: 415.30, label: "Key: G#/Ab" },
];

export const GESTURE_GUIDE_DATA = [
  { degree: 1, gesture: "1️⃣" },
  { degree: 2, gesture: "2️⃣" },
  { degree: 3, gesture: "3️⃣" },
  { degree: 4, gesture: "4️⃣" },
  { degree: 5, gesture: "5️⃣" },
  { degree: 6, gesture: "🤘" },
  { degree: 7, gesture: "🤟" },
];

/**
 * Calculates fundamental frequency for a scale degree
 * @param {number} degree - 1 to 7
 * @param {number} tonicFreq - base tonic frequency
 */
export function getDegreeFreq(degree, tonicFreq) {
  const semitones = DEGREE_SEMITONES[degree] ?? 0;
  let tonic = tonicFreq;

  if (tonic === 369.99 || tonic === 392.00 || tonic === 415.30) {
    tonic /= 2;
  }
  return tonic * Math.pow(2, semitones / 12);
}

/**
 * Converts Roman numeral to letter chord name in current key
 * @param {string} roman - "I", "ii", etc.
 * @param {boolean} isMajorMode
 * @param {string} currentKeyName - "C", "A", etc.
 */
export function getChordName(roman, isMajorMode, currentKeyName) {
  if (!roman || roman === "--") return "";
  const degree = NUMERAL_TO_DEGREE[roman.toUpperCase()];
  if (!degree) return "";

  const scale = MAJOR_SCALE[currentKeyName] || MAJOR_SCALE.C;
  const root = scale[degree - 1];
  return isMajorMode ? root : root + "m";
}

/**
 * Calculates raw chord interval frequencies
 */
export function getChordTones(numeralStr, isMajorMode, tonicFreq) {
  if (!numeralStr || numeralStr === "--") return null;
  const degree = NUMERAL_TO_DEGREE[numeralStr.toUpperCase()];
  if (!degree) return null;

  const root = getDegreeFreq(degree, tonicFreq);
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

/**
 * Generates solid note array based on right-hand quality count
 */
export function getSolidNotes(tones, rightHandCount, isMajorMode) {
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
