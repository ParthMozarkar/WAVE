import React, { useRef, useState, useCallback, useEffect } from "react";
import { Header } from "../components/Header.jsx";
import { CameraView } from "../components/CameraView.jsx";
import { ChordDisplay } from "../components/ChordDisplay.jsx";
import { ConfidenceIndicator } from "../components/ConfidenceIndicator.jsx";
import { VolumeMeter } from "../components/VolumeMeter.jsx";
import { GestureGuide } from "../components/GestureGuide.jsx";
import { GestureMapping } from "../components/GestureMapping.jsx";
import { ProgressionRecorder } from "../components/ProgressionRecorder.jsx";
import { SessionHistory } from "../components/SessionHistory.jsx";
import { PerformancePanel } from "../components/PerformancePanel.jsx";
import { StatusIndicator } from "../components/StatusIndicator.jsx";
import { HelpModal } from "../components/HelpModal.jsx";
import { StartOverlay } from "../components/StartOverlay.jsx";
import { Notification } from "../components/Notification.jsx";

import { useAudioEngine } from "../hooks/useAudioEngine.js";
import { useGestureMapping } from "../hooks/useGestureMapping.js";
import { useProgressionRecorder } from "../hooks/useProgressionRecorder.js";
import { useSessionHistory } from "../hooks/useSessionHistory.js";
import { usePerformanceMonitor } from "../hooks/usePerformanceMonitor.js";
import { useGestureDetection } from "../hooks/useGestureDetection.js";
import { useHandTracking } from "../hooks/useHandTracking.js";

import { audioEngine } from "../services/audioEngine.js";
import { getChordName, getChordTones, getSolidNotes } from "../services/chords/chordTheory.js";
import "../styles/app.css";

export function GestureMaestro({ onExitHome }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("instrument-mode");
    return () => {
      document.body.classList.remove("instrument-mode");
    };
  }, []);

  // Audio Engine Hook
  const {
    isAudioStarted,
    startAudio,
    currentKey,
    currentTonicFreq,
    changeKey,
    currentWaveform,
    changeWaveform,
  } = useAudioEngine();

  // Custom Mappings Hook
  const {
    mappingManager,
    mappings,
    setMapping,
    saveMappings,
    resetToDefault,
    applyPreset,
  } = useGestureMapping();

  // Session History Hook
  const { entries: historyEntries, logEvent, clearHistory } = useSessionHistory();

  // Progression Recorder Hook
  const {
    recorderState,
    startRecording,
    stopRecording,
    play: playProgression,
    stopPlayback,
    toggleLoop,
    clear: clearProgression,
    recordEvent,
  } = useProgressionRecorder(audioEngine.synth);

  // Performance Monitor Hook
  const {
    perf: perfMonitor,
    metrics: perfMetrics,
  } = usePerformanceMonitor(audioEngine.synth);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Accepted Chord Change Callback
  const handleChordChange = useCallback(
    (chordData) => {
      const chordName = getChordName(chordData.roman, chordData.isMajorMode, currentKey);

      // Log to Session History
      logEvent({
        gesture: chordData.gestureLabel || "Gesture",
        chord: `${chordName} (${chordData.roman})`,
        roman: chordData.roman,
        confidence: chordData.confidence,
      });

      // Record to progression if active
      if (recorderState.isRecording) {
        const tones = getChordTones(chordData.roman, chordData.isMajorMode, currentTonicFreq);
        let notes = getSolidNotes(tones, chordData.qualityIndex, chordData.isMajorMode);
        if (chordData.thumbDown) {
          notes = notes.map((f) => f / 2);
        }

        recordEvent({
          chord: chordName,
          degree: chordData.degree,
          roman: chordData.roman,
          isMajorMode: chordData.isMajorMode,
          qualityIndex: chordData.qualityIndex,
          thumbDown: chordData.thumbDown,
          notes,
        });
      }
    },
    [currentKey, currentTonicFreq, logEvent, recordEvent, recorderState.isRecording]
  );

  // Gesture Detection Hook
  const { gestureState, processHandFrame } = useGestureDetection(
    mappingManager,
    handleChordChange
  );

  // Hand Tracking Hook (Runs Real-time MediaPipe & Canvas loop outside React render cycle)
  const { cameraStatus, gestureEngineStatus, error: visionError } = useHandTracking({
    videoRef,
    canvasRef,
    audioEngine,
    currentTonicFreq,
    processHandFrame,
    perfMonitor,
    isRecordingActive: recorderState.isRecording,
    isPlaybackActive: recorderState.isPlaying,
    isAudioStarted,
  });

  // Modal Visibility States
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isMappingOpen, setIsMappingOpen] = useState(false);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isPerfOpen, setIsPerfOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <Header
        currentKey={currentKey}
        onKeyChange={changeKey}
        currentWaveform={currentWaveform}
        onWaveformChange={changeWaveform}
        onToggleGuide={() => setIsGuideOpen((prev) => !prev)}
        isGuideOpen={isGuideOpen}
        onToggleMapping={() => setIsMappingOpen((prev) => !prev)}
        isMappingOpen={isMappingOpen}
        onToggleRecorder={() => setIsRecorderOpen((prev) => !prev)}
        isRecorderOpen={isRecorderOpen}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        isHistoryOpen={isHistoryOpen}
        onTogglePerf={() => setIsPerfOpen((prev) => !prev)}
        isPerfOpen={isPerfOpen}
        onToggleHelp={() => setIsHelpOpen(true)}
        onExitHome={onExitHome}
      />

      <main>
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          isDimmed={!isAudioStarted}
        />

        <ConfidenceIndicator
          confidence={gestureState.confidence}
          gestureLabel={gestureState.gestureLabel}
          isConfident={gestureState.isConfident}
          warning={gestureState.warning}
        />

        <ChordDisplay
          activeChord={gestureState.activeChord}
          isMajorMode={gestureState.isMajorMode}
          qualityIndex={gestureState.qualityIndex}
          thumbDown={gestureState.thumbDown}
          currentKey={currentKey}
        />

        <VolumeMeter
          volume={gestureState.volume}
          tiltPercentage={gestureState.tiltPercentage}
        />

        <GestureGuide isOpen={isGuideOpen} currentKey={currentKey} />

        <GestureMapping
          isOpen={isMappingOpen}
          onClose={() => setIsMappingOpen(false)}
          mappings={mappings}
          onSetMapping={setMapping}
          onSave={saveMappings}
          onReset={resetToDefault}
          onApplyPreset={applyPreset}
          currentKey={currentKey}
          onNotify={showToast}
        />

        <ProgressionRecorder
          isOpen={isRecorderOpen}
          recorderState={recorderState}
          onStartRecord={startRecording}
          onStopRecord={stopRecording}
          onPlay={playProgression}
          onStopPlayback={stopPlayback}
          onToggleLoop={toggleLoop}
          onClear={clearProgression}
          onNotify={showToast}
        />

        <SessionHistory
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          entries={historyEntries}
          onClear={clearHistory}
          onNotify={showToast}
        />

        <PerformancePanel
          isOpen={isPerfOpen}
          onClose={() => setIsPerfOpen(false)}
          metrics={perfMetrics}
        />

        <StatusIndicator
          cameraStatus={cameraStatus}
          gestureEngineStatus={gestureEngineStatus}
          isAudioStarted={isAudioStarted}
        />

        <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

        <StartOverlay
          isAudioStarted={isAudioStarted}
          onStart={startAudio}
        />

        {visionError && <Notification message={visionError} type="error" />}
        {toast && <Notification message={toast.msg} type={toast.type} />}
      </main>
    </>
  );
}

export default GestureMaestro;
