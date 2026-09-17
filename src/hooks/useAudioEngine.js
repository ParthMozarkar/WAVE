import { useRef, useState, useCallback } from "react";
import { SynthEngine } from "../audio/SynthEngine.js";
import { KEY_OPTIONS } from "../services/chords/chordTheory.js";

export function useAudioEngine() {
  const synthRef = useRef(null);
  if (!synthRef.current) {
    synthRef.current = new SynthEngine();
  }
  const synth = synthRef.current;

  const [currentKey, setCurrentKey] = useState("A");
  const [currentTonicFreq, setCurrentTonicFreq] = useState(220.00);
  const [currentWaveform, setCurrentWaveform] = useState("triangle");
  const [isAudioStarted, setIsAudioStarted] = useState(false);

  const startAudio = useCallback(() => {
    synth.ensureContext();
    setIsAudioStarted(true);
  }, [synth]);

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
