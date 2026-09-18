/**
 * WAVE — useDrumTracking Hook
 *
 * Runs a real-time MediaPipe + canvas loop for Drum Mode.
 * Reuses setupCamera, setupHandLandmarker, drawVideoAndSkeleton
 * from the existing handTracking service — no duplication.
 *
 * Hit detection algorithm:
 *   1. Extract "stick tip" = index finger tip (landmark 8) per hand
 *   2. Track Y velocity across frames
 *   3. If velocityY > HIT_VEL_THRESHOLD AND tip inside a drum zone AND
 *      cooldown elapsed → fire DrumEngine.hit(drumId, velocity)
 *   4. Hi-hat distinguishes open/closed by thumb spread (landmark 4 vs 8 distance)
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  setupCamera,
  cleanupCamera,
  setupHandLandmarker,
  drawVideoAndSkeleton,
  computeCoverRect,
} from "../services/handTracking.js";
import { DRUM_ZONES, drawDrumKit } from "../audio/drawDrumKit.js";

// ── Tuning Constants ──────────────────────────────────────────────────────────
const HIT_VEL_THRESHOLD = 0.011;   // normalized Y units/frame; lower = more sensitive
const COOLDOWN_MS = 160;           // ms lockout per drum after a hit
const HIHAT_OPEN_SPREAD = 0.12;   // thumb-to-index normalized distance for open hat

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map a MediaPipe landmark (0-1 range, mirrored) to canvas pixel coords */
function landmarkToCanvas(lm, srcW, srcH, canvasW, canvasH) {
  const { sx, sy, sWidth, sHeight } = computeCoverRect(srcW, srcH, canvasW, canvasH);
  // MediaPipe x is in [0,1] where 0=left of video. After mirroring, canvas x = canvasW - mapped.
  const videoPx = lm.x * srcW;
  const videoPy = lm.y * srcH;
  const rawX = ((videoPx - sx) / sWidth) * canvasW;
  const rawY = ((videoPy - sy) / sHeight) * canvasH;
  // Mirror horizontally (canvas is drawn flipped)
  const canvasX = canvasW - rawX;
  const canvasY = rawY;
  return { x: canvasX / canvasW, y: canvasY / canvasH }; // normalized
}

/** Check if normalized (x, y) falls inside an ellipse zone */
function insideZone(zone, x, y) {
  const dx = (x - zone.cx) / zone.rx;
  const dy = (y - zone.cy) / zone.ry;
  return dx * dx + dy * dy <= 1;
}

/** Euclidean distance between two landmarks in [0,1] space */
function lmDist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// ─────────────────────────────────────────────────────────────────────────────

export function useDrumTracking({ videoRef, canvasRef, drumEngine, isAudioStarted }) {
  const [cameraStatus, setCameraStatus] = useState("loading");
  const [gestureEngineStatus, setGestureEngineStatus] = useState("loading");
  const [error, setError] = useState(null);

  const animFrameIdRef = useRef(null);
  const landmarkerRef  = useRef(null);
  const isRunningRef   = useRef(false);

  // Per-drum cooldown timestamps
  const cooldownsRef = useRef({});
  // Hit flash timestamps for canvas rendering
  const hitFlashesRef = useRef({});
  // Previous Y positions for each hand to compute velocity
  const prevYRef = useRef({ left: null, right: null });

  const handleResize = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.width  = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  }, [canvasRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  useEffect(() => {
    // Only run when drum mode is active
    if (!drumEngine) return;

    let isMounted = true;
    let streamInstance = null;


    async function init() {
      try {
        if (!videoRef.current) return;
        setCameraStatus("loading");
        streamInstance = await setupCamera(videoRef.current);
        if (!isMounted) { cleanupCamera(videoRef.current); return; }
        setCameraStatus("ready");

        setGestureEngineStatus("loading");
        const landmarker = await setupHandLandmarker();
        if (!isMounted) { landmarker.close(); return; }
        landmarkerRef.current = landmarker;
        setGestureEngineStatus("ready");

        isRunningRef.current = true;
        startLoop();
      } catch (err) {
        console.error("Drum tracking init failed:", err);
        if (isMounted) {
          setError(err.message || "Failed to initialize drum tracking");
          setCameraStatus("error");
          setGestureEngineStatus("error");
        }
      }
    }

    let lastVideoTime = -1;

    function startLoop() {
      function loop() {
        if (!isRunningRef.current) return;

        const videoEl  = videoRef.current;
        const canvasEl = canvasRef.current;

        if (videoEl && canvasEl && landmarkerRef.current) {
          const ctx = canvasEl.getContext("2d");
          const W = canvasEl.width;
          const H = canvasEl.height;
          const srcW = videoEl.videoWidth;
          const srcH = videoEl.videoHeight;

          const timestamp = performance.now();

          // ── Run MediaPipe ───────────────────────────────────────────────
          if (videoEl.currentTime !== lastVideoTime) {
            lastVideoTime = videoEl.currentTime;
            const results = landmarkerRef.current.detectForVideo(videoEl, timestamp);

            // Draw mirrored camera feed + skeleton dots
            drawVideoAndSkeleton(ctx, videoEl, results, W, H);

            // ── Process hand landmarks ────────────────────────────────────
            const stickTips = [];

            for (let i = 0; i < results.landmarks.length; i++) {
              const landmarks = results.landmarks[i];
              const handedness = results.handedness[i][0].categoryName; // "Left" | "Right"
              const key = handedness === "Left" ? "left" : "right";

              if (!srcW || !srcH) continue;

              // Stick tip = index finger tip (landmark 8)
              const tip = landmarkToCanvas(landmarks[8], srcW, srcH, W, H);
              const prevY = prevYRef.current[key];
              const velocityY = prevY !== null ? tip.y - prevY : 0;
              prevYRef.current[key] = tip.y;

              const isMovingDown = velocityY > HIT_VEL_THRESHOLD;

              // Hi-hat: check thumb spread for open/closed distinction
              // Thumb tip = landmark 4, index tip = landmark 8 (already in tip)
              const thumbNorm = landmarkToCanvas(landmarks[4], srcW, srcH, W, H);
              const thumbSpread = lmDist({ x: thumbNorm.x, y: thumbNorm.y }, { x: tip.x, y: tip.y });
              const hihatIsOpen = thumbSpread > HIHAT_OPEN_SPREAD;

              let isHittingAny = false;

              if (isAudioStarted && drumEngine && isMovingDown) {
                for (const zone of DRUM_ZONES) {
                  if (!insideZone(zone, tip.x, tip.y)) continue;

                  // Hi-hat special handling: swap id based on thumb spread
                  let drumId = zone.id;
                  if (drumId === "hihat_open") {
                    drumId = hihatIsOpen ? "hihat_open" : "hihat_closed";
                  }

                  // Cooldown check
                  const lastHit = cooldownsRef.current[drumId] || 0;
                  if (timestamp - lastHit < COOLDOWN_MS) continue;

                  // Velocity-to-loudness mapping
                  const hitVelocity = Math.min(1, (velocityY - HIT_VEL_THRESHOLD) / 0.04 + 0.45);

                  // Fire the drum
                  drumEngine.hit(drumId, hitVelocity);

                  // Update cooldown and flash
                  cooldownsRef.current[drumId] = timestamp;
                  hitFlashesRef.current[zone.id] = timestamp;
                  isHittingAny = true;
                  break; // one zone per hand per frame
                }
              }

              stickTips.push({ x: tip.x, y: tip.y, isHitting: isHittingAny });
            }

            // ── Render drum kit overlay ───────────────────────────────────
            drawDrumKit(ctx, hitFlashesRef.current, stickTips);
          }
        }

        animFrameIdRef.current = requestAnimationFrame(loop);
      }
      animFrameIdRef.current = requestAnimationFrame(loop);
    }

    init();

    return () => {
      isMounted = false;
      isRunningRef.current = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (videoRef.current) cleanupCamera(videoRef.current);
      if (landmarkerRef.current) {
        try { landmarkerRef.current.close(); } catch {}
      }
      prevYRef.current = { left: null, right: null };
    };
  }, [videoRef, canvasRef, drumEngine, isAudioStarted, handleResize]);

  return { cameraStatus, gestureEngineStatus, error };
}
