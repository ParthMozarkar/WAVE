import React, { useRef, useEffect, useState, useCallback } from "react";
import { soundPreview } from "../animations/SoundPreview.js";

const MODES = [
  { id: "orb", label: "3D Harmonic Orb", formula: "Spherical Fibonacci Shell" },
  { id: "wave", label: "3D Spatial Lattice", formula: "Hyperbolic Sound Plane" },
  { id: "torus", label: "Acoustic Ring Vortex", formula: "Toroidal Phase Resonator" },
];

export function HeroSpatialField3D() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [activeMode, setActiveMode] = useState("orb");
  const [soundFeedback, setSoundFeedback] = useState(false);

  // 3D camera & rotation
  const rotRef = useRef({ yaw: 0, pitch: 0.1, targetYaw: 0, targetPitch: 0.1 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const mouseNormRef = useRef({ x: 0, y: 0 }); // -1 to +1

  // Ripple shockwaves in 3D
  const shockwavesRef = useRef([]);

  // Generate 3D point cloud according to selected geometry mode
  const pointsRef = useRef([]);

  const generatePoints = useCallback((mode) => {
    const pts = [];
    const count = 180;

    if (mode === "orb") {
      // Golden Spiral / Fibonacci Sphere
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        pts.push({
          x: x * 1.35,
          y: y * 1.35,
          z: z * 1.35,
          baseX: x * 1.35,
          baseY: y * 1.35,
          baseZ: z * 1.35,
          phase: Math.random() * Math.PI * 2,
          speed: 0.8 + Math.random() * 0.8,
          layer: i % 3,
        });
      }
    } else if (mode === "wave") {
      // 3D Spatial Grid / Lattice
      const rows = 14;
      const cols = 14;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c / (cols - 1) - 0.5) * 3.2;
          const z = (r / (rows - 1) - 0.5) * 3.2;
          const dist = Math.sqrt(x * x + z * z);
          const y = Math.sin(dist * 3.5) * 0.45;
          pts.push({
            x,
            y,
            z,
            baseX: x,
            baseY: y,
            baseZ: z,
            dist,
            phase: dist * 2,
            speed: 1.2,
            layer: (r + c) % 2,
          });
        }
      }
    } else {
      // Toroidal Acoustic Vortex
      const numRings = 15;
      const ringPts = 12;
      const R = 1.3; // Major radius
      const r = 0.55; // Minor radius
      for (let i = 0; i < numRings; i++) {
        const u = (i / numRings) * Math.PI * 2;
        for (let j = 0; j < ringPts; j++) {
          const v = (j / ringPts) * Math.PI * 2;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const z = (R + r * Math.cos(v)) * Math.sin(u);
          const y = r * Math.sin(v);
          pts.push({
            x,
            y,
            z,
            baseX: x,
            baseY: y,
            baseZ: z,
            phase: u + v,
            speed: 1.0,
            layer: j % 2,
          });
        }
      }
    }

    pointsRef.current = pts;
  }, []);

  useEffect(() => {
    generatePoints(activeMode);
  }, [activeMode, generatePoints]);

  // Click trigger: emit shockwave & play high-harmonic chime
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width * 0.5;
    const cy = rect.height * 0.5;
    const clickX = (e.clientX - rect.left - cx) / (rect.width * 0.5);
    const clickY = (e.clientY - rect.top - cy) / (rect.height * 0.5);

    shockwavesRef.current.push({
      x: clickX * 1.5,
      y: clickY * 1.5,
      z: 0,
      radius: 0.1,
      maxRadius: 2.8,
      strength: 1.0,
    });

    setSoundFeedback(true);
    soundPreview.playChordPreview([523.25, 659.25, 783.99, 1046.5]); // C6 crystal chord
    setTimeout(() => setSoundFeedback(false), 300);
  };

  // Mouse parallax
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    mouseNormRef.current = { x: nx * 2, y: ny * 2 };

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      rotRef.current.targetYaw += dx * 0.008;
      rotRef.current.targetPitch += dy * 0.008;
      rotRef.current.targetPitch = Math.max(-0.8, Math.min(0.8, rotRef.current.targetPitch));
    }
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

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
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Auto gentle rotation + interactive cursor parallax
      if (!isDraggingRef.current) {
        rotRef.current.targetYaw += 0.0025;
        // Cursor tilt
        const targetPitch = 0.15 + mouseNormRef.current.y * 0.25;
        rotRef.current.targetPitch += (targetPitch - rotRef.current.targetPitch) * 0.05;
      }

      rotRef.current.yaw += (rotRef.current.targetYaw - rotRef.current.yaw) * 0.07;
      rotRef.current.pitch += (rotRef.current.targetPitch - rotRef.current.pitch) * 0.07;

      const cyaw = Math.cos(rotRef.current.yaw);
      const syaw = Math.sin(rotRef.current.yaw);
      const cpitch = Math.cos(rotRef.current.pitch);
      const spitch = Math.sin(rotRef.current.pitch);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const fov = 380;
      const scale = Math.min(width, height) * 0.44;

      // Update shockwaves
      const waves = shockwavesRef.current;
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].radius += 0.06;
        waves[i].strength *= 0.94;
        if (waves[i].radius > waves[i].maxRadius || waves[i].strength < 0.02) {
          waves.splice(i, 1);
        }
      }

      // Project all 3D points
      const projected = [];
      const pts = pointsRef.current;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        // Harmonic acoustic pulsation
        const waveDisp = Math.sin(time * 2.2 * p.speed + p.phase) * 0.08;
        let px = p.baseX * (1 + waveDisp);
        let py = p.baseY * (1 + waveDisp);
        let pz = p.baseZ * (1 + waveDisp);

        // Apply shockwaves
        for (let j = 0; j < waves.length; j++) {
          const w = waves[j];
          const dx = px - w.x;
          const dy = py - w.y;
          const dz = pz - w.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          const diff = Math.abs(dist - w.radius);
          if (diff < 0.35) {
            const push = (1 - diff / 0.35) * w.strength * 0.22;
            px += (dx / dist) * push;
            py += (dy / dist) * push;
            pz += (dz / dist) * push;
          }
        }

        // Yaw
        const x1 = px * cyaw - pz * syaw;
        const z1 = px * syaw + pz * cyaw;

        // Pitch
        const y2 = py * cpitch - z1 * spitch;
        const z2 = py * spitch + z1 * cpitch;

        // Perspective
        const camZ = z2 + 3.0;
        const pers = fov / (fov + camZ * 120);

        projected.push({
          sx: cx + x1 * scale * pers,
          sy: cy + y2 * scale * pers,
          depth: camZ,
          layer: p.layer,
          intensity: Math.sin(time * 1.5 + p.phase),
        });
      }

      // Draw subtle connecting constellation filaments (Matte finish hairline)
      const maxConnDist = 58;
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i += 2) {
        const p1 = projected[i];
        for (let j = i + 1; j < Math.min(i + 8, projected.length); j++) {
          const p2 = projected[j];
          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxConnDist * maxConnDist) {
            const dist = Math.sqrt(d2);
            const alpha = (1 - dist / maxConnDist) * 0.22 * (1.6 / p1.depth);
            ctx.strokeStyle = `rgba(229, 149, 0, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }
        }
      }

      // Sort points by 3D depth for correct occlusion
      projected.sort((a, b) => b.depth - a.depth);

      // Render 3D node points with matte specular core
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const depthAlpha = Math.max(0.2, Math.min(1.0, 1.8 / p.depth));
        const radius = Math.max(1.8, Math.min(4.8, 3.8 / (p.depth * 0.4)));

        // Color tone: amber highlights, slate white cores
        const isAccent = p.layer === 0;

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        if (isAccent) {
          ctx.fillStyle = `rgba(229, 149, 0, ${depthAlpha * 0.9})`;
        } else if (p.layer === 1) {
          ctx.fillStyle = `rgba(14, 165, 233, ${depthAlpha * 0.75})`;
        } else {
          ctx.fillStyle = `rgba(236, 239, 244, ${depthAlpha * 0.7})`;
        }
        ctx.fill();

        // Crisp inner center pip
        if (radius > 2.8) {
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 1, 0, Math.PI * 2);
          ctx.fillStyle = "#0A0C10";
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="yc-hero-3d-stage">
      {/* 3D Mode Selector Badge */}
      <div className="yc-hero-3d-nav">
        <div className="yc-hero-3d-modes">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`yc-3d-mode-pill ${activeMode === m.id ? "is-active" : ""}`}
              onClick={() => setActiveMode(m.id)}
            >
              <span className="yc-3d-mode-dot" />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        <div className="yc-hero-3d-meta">
          <span className="yc-meta-hint">Click canvas to pulse · Drag to rotate 3D</span>
          {soundFeedback && <span className="yc-meta-chime">♪ RESONANCE PULSE</span>}
        </div>
      </div>

      {/* High-Performance 3D Vector Canvas */}
      <div
        className="yc-hero-canvas-wrap"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <canvas ref={canvasRef} className="yc-hero-3d-canvas" />

        {/* Tactile Coordinate Corner Ticks */}
        <div className="yc-3d-corner yc-corner-tl">+</div>
        <div className="yc-3d-corner yc-corner-tr">+</div>
        <div className="yc-3d-corner yc-corner-bl">+</div>
        <div className="yc-3d-corner yc-corner-br">+</div>
      </div>
    </div>
  );
}

export default HeroSpatialField3D;
