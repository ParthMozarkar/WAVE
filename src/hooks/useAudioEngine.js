import { useState, useCallback } from "react";
import { audioEngine } from "../services/audioEngine.js";
import { KEY_OPTIONS } from "../services/chords/chordTheory.js";

export function useAudioEngine() {
  // Use the shared singleton so useHandTracking and useAudioEngine
  // operate on the same AudioContext — not two separate SynthEngine instances.
  const synth = audioEngine.synth;

  const [currentKey, setCurrentKey] = useState("A");
  const [currentTonicFreq, setCurrentTonicFreq] = useState(220.00);
  const [currentWaveform, setCurrentWaveform] = useState("triangle");
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  const startAudio = useCallback(() => {
    audioEngine.ensureContext();  // initialises the same SynthEngine used by useHandTracking
    setIsAudioStarted(true);
  }, []);

  const changeKey = useCallback((keyNote) => {
    const opt = KEY_OPTIONS.find((k) => k.note === keyNote);
    if (opt) {
      setCurrentKey(opt.note);
      setCurrentTonicFreq(opt.freq);
    }
  }, []);

  const changeWaveform = useCallback((waveform) => {
    setCurrentWaveform(waveform);
    synth.setWaveform(waveform);
  }, [synth]);

  return {
    synth,
    isAudioStarted,
    startAudio,
    currentKey,
    currentTonicFreq,
    changeKey,
    currentWaveform,
    changeWaveform,
  };
}
