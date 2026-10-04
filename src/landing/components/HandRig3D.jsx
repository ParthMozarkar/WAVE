import React, { useRef, useEffect, useState, useCallback } from "react";
import { soundPreview } from "../animations/SoundPreview.js";

// Canonical 3D hand poses with normalized [x, y, z] coordinates for all 21 MediaPipe landmarks
// 0: Wrist, 1-4: Thumb, 5-8: Index, 9-12: Middle, 13-16: Ring, 17-20: Pinky
const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],     // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17],          // Palm knuckle bridge
];

// 3D coordinates for distinct gestures
const POSES = {
  open: {
    label: "Open Expression (Fmaj9)",
    chord: "Fmaj9",
    freqs: [174.61, 220.0, 261.63, 329.63, 392.0],
    points: [
      [0, 0.55, 0],         // 0: wrist
      [-0.18, 0.42, 0.05],  // 1: thumb CMC
      [-0.32, 0.28, 0.08],  // 2: thumb MCP
      [-0.42, 0.16, 0.1],   // 3: thumb IP
      [-0.5, 0.05, 0.12],   // 4: thumb tip
      [-0.18, 0.18, 0.02],  // 5: index MCP
      [-0.22, -0.05, 0.04], // 6: index PIP
      [-0.25, -0.28, 0.06], // 7: index DIP
      [-0.28, -0.48, 0.08], // 8: index tip
      [-0.04, 0.16, 0.01],  // 9: middle MCP
      [-0.05, -0.1, 0.03],  // 10: middle PIP
      [-0.06, -0.34, 0.05], // 11: middle DIP
      [-0.07, -0.56, 0.07], // 12: middle tip
      [0.1, 0.18, -0.01],   // 13: ring MCP
      [0.12, -0.06, 0.01],  // 14: ring PIP
      [0.14, -0.28, 0.03],  // 15: ring DIP
      [0.15, -0.48, 0.05],  // 16: ring tip
      [0.24, 0.22, -0.03],  // 17: pinky MCP
      [0.28, 0.02, -0.02],  // 18: pinky PIP
      [0.32, -0.18, 0.0],   // 19: pinky DIP
      [0.35, -0.36, 0.02],  // 20: pinky tip
    ],
  },
  point: {
    label: "Lead Melodic (1 Finger / Cmaj7)",
    chord: "Cmaj7",
    freqs: [261.63, 329.63, 392.0, 493.88],
    points: [
      [0, 0.55, 0],
      [-0.18, 0.42, 0.05],
      [-0.26, 0.32, 0.08],
      [-0.28, 0.26, 0.12],
      [-0.25, 0.22, 0.14], // thumb folded
      [-0.18, 0.18, 0.02],
      [-0.22, -0.08, 0.04],
      [-0.25, -0.34, 0.06],
      [-0.28, -0.58, 0.08], // index extended
      [-0.04, 0.16, 0.01],
      [-0.04, 0.24, 0.08],
      [-0.04, 0.32, 0.14],
      [-0.03, 0.36, 0.18], // middle curled
      [0.1, 0.18, -0.01],
      [0.1, 0.25, 0.06],
      [0.1, 0.33, 0.12],
      [0.1, 0.36, 0.16], // ring curled
      [0.24, 0.22, -0.03],
      [0.24, 0.28, 0.04],
      [0.24, 0.34, 0.09],
      [0.24, 0.37, 0.13], // pinky curled
    ],
  },
  peace: {
    label: "Harmonic Split (2 Fingers / Gadd9)",
    chord: "Gadd9",
    freqs: [196.0, 246.94, 293.66, 440.0],
    points: [
      [0, 0.55, 0],
      [-0.18, 0.42, 0.05],
      [-0.26, 0.32, 0.08],
      [-0.28, 0.26, 0.12],
      [-0.22, 0.24, 0.14],
      [-0.18, 0.18, 0.02],
      [-0.25, -0.06, 0.04],
      [-0.32, -0.3, 0.06],
      [-0.38, -0.54, 0.08], // index angled left
      [-0.04, 0.16, 0.01],
      [0.02, -0.08, 0.03],
      [0.08, -0.32, 0.05],
      [0.14, -0.56, 0.07], // middle angled right
      [0.1, 0.18, -0.01],
      [0.1, 0.25, 0.06],
      [0.1, 0.33, 0.12],
      [0.1, 0.36, 0.16], // ring curled
      [0.24, 0.22, -0.03],
      [0.24, 0.28, 0.04],
      [0.24, 0.34, 0.09],
      [0.24, 0.37, 0.13], // pinky curled
    ],
  },
  horns: {
    label: "Resonance Drive (Rock Horns / Em9)",
    chord: "Em9",
    freqs: [164.81, 196.0, 246.94, 329.63, 370.0],
    points: [
      [0, 0.55, 0],
      [-0.18, 0.42, 0.05],
      [-0.22, 0.32, 0.08],
      [-0.22, 0.26, 0.14],
      [-0.15, 0.24, 0.16], // thumb across
      [-0.18, 0.18, 0.02],
      [-0.22, -0.08, 0.04],
      [-0.25, -0.34, 0.06],
      [-0.28, -0.58, 0.08], // index up
      [-0.04, 0.16, 0.01],
      [-0.04, 0.24, 0.08],
      [-0.04, 0.32, 0.14],
      [-0.03, 0.36, 0.18], // middle curled
      [0.1, 0.18, -0.01],
      [0.1, 0.25, 0.06],
      [0.1, 0.33, 0.12],
      [0.1, 0.36, 0.16], // ring curled
      [0.24, 0.22, -0.03],
      [0.28, 0.0, -0.01],
      [0.32, -0.22, 0.02],
      [0.36, -0.46, 0.05], // pinky up
    ],
  },
};

export function HandRig3D() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [activePoseKey, setActivePoseKey] = useState("open");
  const [selectedJoint, setSelectedJoint] = useState(null);

  // Rotation angles for 3D orbital perspective
  const rotRef = useRef({ yaw: 0.35, pitch: -0.15, targetYaw: 0.35, targetPitch: -0.15 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Current interpolated coordinates for smooth joint morphing
  const currentCoordsRef = useRef(JSON.parse(JSON.stringify(POSES.open.points)));
  const targetCoordsRef = useRef(POSES.open.points);

  const selectPose = useCallback((key) => {
    setActivePoseKey(key);
    targetCoordsRef.current = POSES[key].points;
    soundPreview.playChordPreview(POSES[key].freqs);
  }, []);

  // Mouse drag listeners for 3D rotation
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    rotRef.current.targetYaw += dx * 0.01;
    rotRef.current.targetPitch += dy * 0.01;
    // Clamp pitch to avoid gimbal flip
    rotRef.current.targetPitch = Math.max(-0.9, Math.min(0.9, rotRef.current.targetPitch));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // High-performance 3D vector canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Smooth orbital rotation interpolation
      rotRef.current.yaw += (rotRef.current.targetYaw - rotRef.current.yaw) * 0.08;
      rotRef.current.pitch += (rotRef.current.targetPitch - rotRef.current.pitch) * 0.08;

      // Subtle ambient hover if not dragging
      if (!isDraggingRef.current) {
        rotRef.current.targetYaw += 0.002;
      }

      // Smoothly morph 3D joint points toward target pose
      const current = currentCoordsRef.current;
      const target = targetCoordsRef.current;
      for (let i = 0; i < current.length; i++) {
        current[i][0] += (target[i][0] - current[i][0]) * 0.12;
        current[i][1] += (target[i][1] - current[i][1]) * 0.12;
        current[i][2] += (target[i][2] - current[i][2]) * 0.12;
      }

      const cyaw = Math.cos(rotRef.current.yaw);
      const syaw = Math.sin(rotRef.current.yaw);
      const cpitch = Math.cos(rotRef.current.pitch);
      const spitch = Math.sin(rotRef.current.pitch);

      const fov = 340;
      const scale = Math.min(width, height) * 0.65;
      const cx = width * 0.5;
      const cy = height * 0.52;

      // Project 3D point [x, y, z] to 2D screen coordinate
      const projected = current.map(([x, y, z], idx) => {
        // Yaw (Y-axis) rotation
        let x1 = x * cyaw - z * syaw;
        let z1 = x * syaw + z * cyaw;

        // Pitch (X-axis) rotation
        let y2 = y * cpitch - z1 * spitch;
        let z2 = y * spitch + z1 * cpitch;

        // Camera offset Z
        const camZ = z2 + 2.2;
        const pers = fov / (fov + camZ * 120);

        return {
          id: idx,
          sx: cx + x1 * scale * pers,
          sy: cy + y2 * scale * pers,
          depth: camZ,
          orig: [x, y, z],
        };
      });

      // Draw subtle 3D floor spatial grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      const gridRings = 4;
      for (let r = 1; r <= gridRings; r++) {
        ctx.beginPath();
        const rad = (scale * 0.45 * r) / gridRings;
        ctx.ellipse(cx, cy + scale * 0.38, rad, rad * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Bones (Lines connecting joint nodes)
      BONES.forEach(([a, b]) => {
        const p1 = projected[a];
        const p2 = projected[b];
        const avgDepth = (p1.depth + p2.depth) * 0.5;
        const alpha = Math.max(0.18, Math.min(0.85, 1.8 / avgDepth));

        ctx.beginPath();
        ctx.strokeStyle = `rgba(229, 149, 0, ${alpha * 0.75})`;
        ctx.lineWidth = Math.max(1, 2.2 / (avgDepth * 0.5));
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.stroke();
      });

      // Sort joint nodes by depth for correct 3D occlusions
      const sorted = [...projected].sort((a, b) => b.depth - a.depth);

      // Draw 3D Landmark Joint Spheres (Matte finish)
      sorted.forEach((p) => {
        const isSelected = selectedJoint === p.id;
        const radius = Math.max(2.5, Math.min(7, 5.2 / (p.depth * 0.5)));
        const depthAlpha = Math.max(0.3, Math.min(1.0, 1.9 / p.depth));

        // Joint outer ring
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius + (isSelected ? 3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isSelected
          ? "#ECEFF4"
          : `rgba(229, 149, 0, ${depthAlpha})`;
        ctx.fill();

        // Joint inner center pip
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.max(1.2, radius * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = "#0C0E12";
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [selectedJoint]);

  const activePose = POSES[activePoseKey];

  return (
    <div className="yc-3d-rig-wrapper">
      <div className="yc-rig-header">
        <div className="yc-rig-title-bar">
          <span className="yc-rig-badge">3D KINEMATICS ENGINE</span>
          <span className="yc-rig-info">MediaPipe 21 Joint Rig • Drag to Rotate 360°</span>
        </div>
        <div className="yc-rig-telemetry">
          <span className="yc-rig-pill">POSE: {activePose.chord}</span>
          <span className="yc-rig-pill">DOF: 21 JOINTS (60 FPS)</span>
        </div>
      </div>

      <div
        className="yc-rig-stage"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        title="Click and drag to rotate hand in 3D"
      >
        <canvas ref={canvasRef} className="yc-rig-canvas" />

        <div className="yc-rig-hint-pill">
          <span>⤾ Drag to orbit 3D topology</span>
        </div>
      </div>

      <div className="yc-rig-controls">
        <div className="yc-rig-btn-group">
          {Object.entries(POSES).map(([key, pose]) => (
            <button
              key={key}
              className={`yc-rig-tab-btn ${activePoseKey === key ? "is-active" : ""}`}
              onClick={() => selectPose(key)}
            >
              <span className="yc-tab-chord">{pose.chord}</span>
              <span className="yc-tab-name">{pose.label.split("(")[0]}</span>
            </button>
          ))}
        </div>

        <div className="yc-rig-status-strip">
          <div className="yc-status-item">
            <span className="yc-status-label">VOICING:</span>
            <span className="yc-status-val">{activePose.label}</span>
          </div>
          <div className="yc-status-item">
            <span className="yc-status-label">TONAL FREQS:</span>
            <span className="yc-status-val">{activePose.freqs.map(f => Math.round(f) + "Hz").join(" · ")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HandRig3D;
