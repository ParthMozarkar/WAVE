/**
 * WAVE — Hand Tracking & Canvas Rendering Service
 * 
 * Runs real-time computer vision and 60fps canvas rendering outside React renders.
 */

import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export async function setupCamera(videoEl) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Webcam access is not supported by your browser");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });

  videoEl.srcObject = stream;
  return new Promise((resolve) => {
    videoEl.onloadedmetadata = () => {
      videoEl.play();
      resolve(stream);
    };
  });
}

export function cleanupCamera(videoEl) {
  if (videoEl && videoEl.srcObject) {
    const stream = videoEl.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoEl.srcObject = null;
  }
}

export async function setupHandLandmarker() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
  });
}

export function computeCoverRect(srcW, srcH, dstW, dstH) {
  const srcRatio = srcW / srcH;
  const dstRatio = dstW / dstH;

  if (srcRatio > dstRatio) {
    const sHeight = srcH;
    const sWidth = srcH * dstRatio;
    return { sx: (srcW - sWidth) / 2, sy: 0, sWidth, sHeight };
  } else {
    const sWidth = srcW;
    const sHeight = srcW / dstRatio;
    return { sx: 0, sy: (srcH - sHeight) / 2, sWidth, sHeight };
  }
}

export function drawVideoAndSkeleton(ctx, videoEl, results, canvasWidth, canvasHeight) {
  const srcW = videoEl.videoWidth;
  const srcH = videoEl.videoHeight;
  if (!srcW || !srcH || !ctx) return;

  const { sx, sy, sWidth, sHeight } = computeCoverRect(srcW, srcH, canvasWidth, canvasHeight);

  ctx.save();
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.translate(canvasWidth, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(videoEl, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "#ffffff80";
  if (results && results.landmarks) {
    for (const landmarks of results.landmarks) {
      for (const point of landmarks) {
        const videoPx = point.x * srcW;
        const videoPy = point.y * srcH;
        const canvasX = ((videoPx - sx) / sWidth) * canvasWidth;
        const canvasY = ((videoPy - sy) / sHeight) * canvasHeight;

        ctx.beginPath();
        ctx.arc(canvasX, canvasY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

export function drawEnergyWave(ctx, volume01, qualityIndex, tiltFactor, chordStr) {
  if (!ctx || qualityIndex === 0) return;
  const lineCount = Math.max(1, Math.min(4, qualityIndex));

  try {
    const centerY = ctx.canvas.height - 70;
    const canvasWidth = ctx.canvas.width;
    const maxThickness = 1 + volume01 * 8;

    const chaosScale = (tiltFactor + 1) / 2;
    const shakinessAmp = chaosScale * 25;
    const shakinessFreq = 0.05 + chaosScale * 0.15;

    let baseColorRGB = "232, 161, 61";
    let isChordActive = false;
    let isMajor = false;

    if (chordStr && chordStr !== "--") {
      isChordActive = true;
      const upperStr = chordStr.toUpperCase();
      isMajor = chordStr === upperStr;

      const SCALE_COLORS = {
        I:   "232, 161, 61",
        II:  "210, 50, 120",
        III: "180, 40, 150",
        IV:  "240, 210, 40",
        V:   "245, 120, 30",
        VI:  "230, 40, 40",
        VII: "100, 200, 250",
      };
      baseColorRGB = SCALE_COLORS[upperStr] || "232, 161, 61";
    }

    const brightnessAlpha = isChordActive ? (isMajor ? 1 : 0.7) : 0.3;

    ctx.save();
    const time = performance.now() * 0.004;
    const colorChannels = baseColorRGB.split(",");
    const r = parseInt(colorChannels[0]);
    const g = parseInt(colorChannels[1]);
    const b = parseInt(colorChannels[2]);

    ctx.shadowBlur = 10 + volume01 * 20;
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${0.5 * brightnessAlpha})`;

    for (let l = 0; l < lineCount; l++) {
      ctx.beginPath();
      const lineYOffset = centerY + (l - (lineCount - 1) / 2) * 12;

      for (let x = 0; x <= canvasWidth; x += 10) {
        const baseSine = Math.sin(x * 0.005 + time + l * 0.5) * 20;
        const jitter = (Math.random() - 0.5) * shakinessAmp * Math.sin(x * shakinessFreq + time);
        const y = lineYOffset + baseSine + jitter;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${brightnessAlpha})`;
      ctx.lineWidth = Math.max(1, maxThickness - l * 0.5);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
    ctx.restore();
  } catch (error) {
    console.error("Wave animation error:", error);
  }
}
