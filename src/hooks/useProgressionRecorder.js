import { useState, useRef, useEffect, useCallback } from "react";
import { ProgressionRecorder } from "../recording/progressionRecorder.js";

export function useProgressionRecorder(synth) {
  const recorderRef = useRef(null);
  if (!recorderRef.current) {
    recorderRef.current = new ProgressionRecorder();
  }
  const recorder = recorderRef.current;

  const [recorderState, setRecorderState] = useState({
    isRecording: false,
    isPlaying: false,
    isLooping: false,
    events: [],
    activeIndex: -1,
  });

  useEffect(() => {
    recorder.onStateChange((state) => {
      setRecorderState((prev) => ({
        ...prev,
        isRecording: state.isRecording,
        isPlaying: state.isPlaying,
        isLooping: state.isLooping,
        events: state.events,
        activeIndex: state.activeIndex,
      }));
    });

    recorder.onStep((event, activeIndex) => {
      setRecorderState((prev) => ({ ...prev, activeIndex }));
    });
  }, [recorder]);

  const startRecording = useCallback(() => {
    recorder.startRecording();
  }, [recorder]);

  const stopRecording = useCallback(() => {
    recorder.stopRecording();
  }, [recorder]);

  const play = useCallback(() => {
    recorder.play(synth);
  }, [recorder, synth]);

  const stopPlayback = useCallback(() => {
    recorder.stopPlayback(synth);
  }, [recorder, synth]);

  const toggleLoop = useCallback(() => {
    return recorder.toggleLoop();
  }, [recorder]);

  const clear = useCallback(() => {
    recorder.clear();
  }, [recorder]);

  const recordEvent = useCallback((chordEvent) => {
    recorder.recordEvent(chordEvent);
  }, [recorder]);

  return {
    recorder,
    recorderState,
    startRecording,
    stopRecording,
    play,
    stopPlayback,
    toggleLoop,
    clear,
    recordEvent,
  };
}
