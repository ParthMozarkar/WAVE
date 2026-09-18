import { useEffect, useRef, useState, useCallback } from "react";
import {
  setupCamera,
  cleanupCamera,
  setupHandLandmarker,
  drawVideoAndSkeleton,
  drawEnergyWave,
} from "../services/handTracking.js";
import { getChordTones, getSolidNotes } from "../services/chords/chordTheory.js";

export function useHandTracking({
  videoRef,
  canvasRef,
  audioEngine,
  currentTonicFreq,
  processHandFrame,
  perfMonitor,
  isRecordingActive,
  isPlaybackActive,
  isAudioStarted,
  active = true,
}) {
  const [cameraStatus, setCameraStatus] = useState("loading");
  const [gestureEngineStatus, setGestureEngineStatus] = useState("loading");
  const [error, setError] = useState(null);

  const animFrameIdRef = useRef(null);
  const landmarkerRef = useRef(null);
  const isRunningRef = useRef(false);

  // Resize canvas to window dimensions
  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, [canvasRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    // Yield camera control to drum mode when inactive
    if (!active) return;

    let streamInstance = null;
    let isMounted = true;

    async function initializeVision() {
      try {
        if (!videoRef.current) return;

        setCameraStatus("loading");
        streamInstance = await setupCamera(videoRef.current);
        if (!isMounted) {
          cleanupCamera(videoRef.current);
          return;
        }
        setCameraStatus("ready");

        setGestureEngineStatus("loading");
        const landmarker = await setupHandLandmarker();
        if (!isMounted) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setGestureEngineStatus("ready");

        isRunningRef.current = true;
        startTrackingLoop();
      } catch (err) {
        console.error("Hand tracking initialization failed:", err);
        if (isMounted) {
          setError(err.message || "Failed to initialize camera or vision model");
          setCameraStatus("error");
          setGestureEngineStatus("error");
        }
      }
    }

    let lastVideoTime = -1;
    let cachedLeftLandmarks = null;
    let cachedRightLandmarks = null;
    let leftScore = 0.9;

    function startTrackingLoop() {
      function loop() {
        if (!isRunningRef.current) return;

        const timestampNow = performance.now();
        if (perfMonitor) {
          perfMonitor.tickFrame();
        }

        const videoEl = videoRef.current;
        const canvasEl = canvasRef.current;

        if (videoEl && canvasEl && landmarkerRef.current) {
          const ctx = canvasEl.getContext("2d");

          // 1. Run MediaPipe Detection when video frame advances
          if (videoEl.currentTime !== lastVideoTime) {
            lastVideoTime = videoEl.currentTime;

            const tStart = performance.now();
            const results = landmarkerRef.current.detectForVideo(videoEl, timestampNow);
            const latency = performance.now() - tStart;
            if (perfMonitor) {
              perfMonitor.recordLatency(latency);
            }

            // Draw video feed and landmarks onto canvas
            drawVideoAndSkeleton(ctx, videoEl, results, canvasEl.width, canvasEl.height);

            cachedLeftLandmarks = null;
            cachedRightLandmarks = null;

            results.landmarks.forEach((landmarks, i) => {
              const handData = results.handedness[i][0];
              const handedness = handData.categoryName;
              if (handedness === "Left") {
                cachedLeftLandmarks = landmarks;
                leftScore = handData.score;
              } else if (handedness === "Right") {
                cachedRightLandmarks = landmarks;
              }
            });
          }

          // 2. Process Hand Frame through Confidence and Stabilization
          let trackingResult = null;
          if (processHandFrame) {
            trackingResult = processHandFrame(
              cachedLeftLandmarks,
              leftScore,
              cachedRightLandmarks,
              timestampNow
            );
          }

          if (perfMonitor && trackingResult) {
            perfMonitor.recordConfidence(
              trackingResult.confidence,
              !!cachedLeftLandmarks,
              trackingResult.isConfident
            );
          }

          // 3. Drive Real-Time Audio Engine outside React rendering
          if (audioEngine && !isPlaybackActive) {
            if (cachedRightLandmarks && trackingResult) {
              audioEngine.setVolume(trackingResult.volume);
              audioEngine.updateFilterSweep(trackingResult.horizontalTilt);

              const stable = trackingResult.stableChord;
              if (stable && stable.qualityIndex >= 1) {
                const tones = getChordTones(stable.chord, stable.isMajorMode, currentTonicFreq);
                let notes = getSolidNotes(tones, stable.qualityIndex, stable.isMajorMode);
                if (stable.thumbDown) {
                  notes = notes.map((f) => f / 2);
                }
                audioEngine.playChord(notes);
              } else {
                audioEngine.fadeOut(0.12);
              }
            } else {
              audioEngine.fadeOut(0.12);
            }
          }

          // 4. Draw Reactive Wave Energy Overlay
          if (ctx) {
            const vol = trackingResult ? trackingResult.volume : 0;
            const qIdx = trackingResult && trackingResult.stableChord ? trackingResult.stableChord.qualityIndex : 0;
            const tilt = trackingResult ? trackingResult.horizontalTilt : 0;
            const chStr = trackingResult && trackingResult.stableChord ? trackingResult.stableChord.chord : "--";
            drawEnergyWave(ctx, vol, qIdx, tilt, chStr);
          }
        }

        animFrameIdRef.current = requestAnimationFrame(loop);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    }

    initializeVision();

    return () => {
      isMounted = false;
      isRunningRef.current = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (videoRef.current) {
        cleanupCamera(videoRef.current);
      }
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {}
      }
    };
  }, [
    videoRef,
    canvasRef,
    audioEngine,
    currentTonicFreq,
    processHandFrame,
    perfMonitor,
    isPlaybackActive,
    handleResize,
    active,
  ]);


  return {
    cameraStatus,
    gestureEngineStatus,
    error,
  };
}
