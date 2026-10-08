import React, { useRef, useEffect } from "react";

// Canonical 3D hand skeletal topology for MediaPipe 21 landmarks
const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [0, 13], [13, 14], [14, 15], [15, 16],// Ring
  [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [5, 9], [9, 13], [13, 17],            // Knuckle arch
];

const GESTURE_POSES = [
  // 0: Open Hand
  [
    [0, 0.52, 0],
    [-0.18, 0.40, 0.05], [-0.32, 0.26, 0.08], [-0.42, 0.14, 0.1], [-0.50, 0.04, 0.12],
    [-0.18, 0.16, 0.02], [-0.22, -0.06, 0.04], [-0.25, -0.30, 0.06], [-0.28, -0.50, 0.08],
    [-0.04, 0.14, 0.01], [-0.05, -0.12, 0.03], [-0.06, -0.36, 0.05], [-0.07, -0.58, 0.07],
    [0.10, 0.16, -0.01], [0.12, -0.08, 0.01], [0.14, -0.30, 0.03], [0.15, -0.50, 0.05],
    [0.24, 0.20, -0.03], [0.28, 0.00, -0.02], [0.32, -0.20, 0.00], [0.35, -0.38, 0.02]
  ],
  // 1: Lead Index Point (1 finger)
  [
    [0, 0.52, 0],
    [-0.18, 0.40, 0.05], [-0.26, 0.30, 0.08], [-0.28, 0.24, 0.12], [-0.25, 0.20, 0.14],
    [-0.18, 0.16, 0.02], [-0.22, -0.10, 0.04], [-0.25, -0.36, 0.06], [-0.28, -0.60, 0.08],
    [-0.04, 0.14, 0.01], [-0.04, 0.22, 0.08], [-0.04, 0.30, 0.14], [-0.03, 0.34, 0.18],
    [0.10, 0.16, -0.01], [0.10, 0.23, 0.06], [0.10, 0.31, 0.12], [0.10, 0.34, 0.16],
    [0.24, 0.20, -0.03], [0.24, 0.26, 0.04], [0.24, 0.32, 0.09], [0.24, 0.35, 0.13]
  ],
  // 2: Harmonic Peace (2 fingers)
  [
    [0, 0.52, 0],
    [-0.18, 0.40, 0.05], [-0.26, 0.30, 0.08], [-0.28, 0.24, 0.12], [-0.22, 0.22, 0.14],
    [-0.18, 0.16, 0.02], [-0.26, -0.08, 0.04], [-0.34, -0.32, 0.06], [-0.40, -0.56, 0.08],
    [-0.04, 0.14, 0.01], [0.02, -0.10, 0.03], [0.08, -0.34, 0.05], [0.14, -0.58, 0.07],
    [0.10, 0.16, -0.01], [0.10, 0.23, 0.06], [0.10, 0.31, 0.12], [0.10, 0.34, 0.16],
    [0.24, 0.20, -0.03], [0.24, 0.26, 0.04], [0.24, 0.32, 0.09], [0.24, 0.35, 0.13]
  ],
  // 3: Rock Horns (Index + Pinky)
  [
    [0, 0.52, 0],
    [-0.18, 0.40, 0.05], [-0.22, 0.30, 0.08], [-0.22, 0.24, 0.14], [-0.15, 0.22, 0.16],
    [-0.18, 0.16, 0.02], [-0.22, -0.10, 0.04], [-0.25, -0.36, 0.06], [-0.28, -0.60, 0.08],
    [-0.04, 0.14, 0.01], [-0.04, 0.22, 0.08], [-0.04, 0.30, 0.14], [-0.03, 0.34, 0.18],
    [0.10, 0.16, -0.01], [0.10, 0.23, 0.06], [0.10, 0.31, 0.12], [0.10, 0.34, 0.16],
    [0.24, 0.20, -0.03], [0.28, -0.02, -0.01], [0.32, -0.24, 0.02], [0.36, -0.48, 0.05]
  ]
];

// Palette of neon blue, yellow, and red accents with RGB channels
const NEON_PALETTE = [
  { name: "blue",   rgb: "0, 229, 255",  hex: "#00E5FF", glow: "rgba(0, 229, 255, 0.7)" },
  { name: "yellow", rgb: "255, 214, 10", hex: "#FFD60A", glow: "rgba(255, 214, 10, 0.7)" },
  { name: "red",    rgb: "255, 69, 96",   hex: "#FF4560", glow: "rgba(255, 69, 96, 0.7)" },
];

const MUSICAL_SYMBOLS = ["♪", "♫", "♬", "𝄞", "𝄢", "♯", "♭"];
const MUSICAL_CHORDS = ["Cmaj7", "Am9", "Gadd9", "Fmaj9", "Em11", "Dm7", "Bdim"];

export function FloatingHandBackground3D() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;

    // Resize canvas
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Current interpolated joints
    const currentJoints = JSON.parse(JSON.stringify(GESTURE_POSES[0]));
    let poseIndex = 0;
    let nextPoseIndex = 1;
    let poseProgress = 0;
    let lastSwitchTime = performance.now();

    // ── Floating musical symbols, chords, and glowing bubbles ──
    const floatingElements = [];

    // 1. Musical note symbols (♪ ♫ ♬ 𝄞 𝄢 ♯ ♭)
    for (let i = 0; i < 18; i++) {
      floatingElements.push({
        type: "symbol",
        text: MUSICAL_SYMBOLS[i % MUSICAL_SYMBOLS.length],
        x: Math.random() * width,
        y: Math.random() * height,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -0.25 - Math.random() * 0.45,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        size: 14 + Math.random() * 16,
        color: NEON_PALETTE[i % NEON_PALETTE.length],
        baseAlpha: 0.18 + Math.random() * 0.18,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 2. Musical chord badges (Cmaj7, Am9, Gadd9, etc.)
    for (let i = 0; i < 9; i++) {
      floatingElements.push({
        type: "chord",
        text: MUSICAL_CHORDS[i % MUSICAL_CHORDS.length],
        x: Math.random() * width,
        y: Math.random() * height,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: -0.2 - Math.random() * 0.3,
        rot: (Math.random() - 0.5) * 0.2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        size: 11 + Math.random() * 4,
        color: NEON_PALETTE[(i + 1) % NEON_PALETTE.length],
        baseAlpha: 0.16 + Math.random() * 0.16,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 3. Tiny glowing bubbles / luminous spheres
    for (let i = 0; i < 36; i++) {
      floatingElements.push({
        type: "bubble",
        x: Math.random() * width,
        y: Math.random() * height,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -0.3 - Math.random() * 0.55,
        radius: 2 + Math.random() * 5,
        color: NEON_PALETTE[i % NEON_PALETTE.length],
        baseAlpha: 0.2 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      frame++;
      const now = performance.now();

      // Cycle gestures every 3.8 seconds
      if (now - lastSwitchTime > 3800) {
        poseIndex = nextPoseIndex;
        nextPoseIndex = (nextPoseIndex + 1) % GESTURE_POSES.length;
        lastSwitchTime = now;
        poseProgress = 0;
      }

      poseProgress = Math.min(1, poseProgress + 0.025);
      const ease = 0.5 - Math.cos(poseProgress * Math.PI) / 2;

      const pCurrent = GESTURE_POSES[poseIndex];
      const pNext = GESTURE_POSES[nextPoseIndex];

      for (let i = 0; i < currentJoints.length; i++) {
        currentJoints[i][0] = pCurrent[i][0] + (pNext[i][0] - pCurrent[i][0]) * ease;
        currentJoints[i][1] = pCurrent[i][1] + (pNext[i][1] - pCurrent[i][1]) * ease;
        currentJoints[i][2] = pCurrent[i][2] + (pNext[i][2] - pCurrent[i][2]) * ease;
      }

      ctx.clearRect(0, 0, width, height);

      // ── Render Floating Musical Symbols, Notes, Chords & Bubbles ──
      const t = frame * 0.008;

      floatingElements.forEach((el) => {
        // Drift movement
        el.x += el.speedX + Math.sin(t * 2 + el.phase) * 0.3;
        el.y += el.speedY;
        el.rot += el.rotSpeed;

        // Wrap around viewport edges seamlessly
        if (el.y < -50) el.y = height + 40;
        if (el.y > height + 50) el.y = -40;
        if (el.x < -60) el.x = width + 50;
        if (el.x > width + 60) el.x = -50;

        const pulseAlpha = el.baseAlpha * (0.8 + 0.2 * Math.sin(t * 3 + el.phase));

        ctx.save();
        ctx.translate(el.x, el.y);
        ctx.rotate(el.rot);

        if (el.type === "symbol") {
          ctx.font = `300 ${el.size}px "Inter", -apple-system, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(${el.color.rgb}, ${pulseAlpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = el.color.glow;
          ctx.fillText(el.text, 0, 0);
        } else if (el.type === "chord") {
          ctx.font = `600 ${el.size}px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Subtle rounded container capsule for chord
          const textWidth = ctx.measureText(el.text).width;
          const padX = 6;
          const padY = 3;
          ctx.fillStyle = `rgba(10, 14, 22, 0.45)`;
          ctx.strokeStyle = `rgba(${el.color.rgb}, ${pulseAlpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(-textWidth / 2 - padX, -el.size / 2 - padY, textWidth + padX * 2, el.size + padY * 2, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = `rgba(${el.color.rgb}, ${pulseAlpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = el.color.glow;
          ctx.fillText(el.text, 0, 0);
        } else if (el.type === "bubble") {
          // Soft glowing sphere
          const currentRadius = el.radius * (0.9 + 0.15 * Math.sin(t * 2.5 + el.phase));
          ctx.beginPath();
          ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);

          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
          grad.addColorStop(0, `rgba(${el.color.rgb}, ${pulseAlpha * 1.2})`);
          grad.addColorStop(0.6, `rgba(${el.color.rgb}, ${pulseAlpha * 0.6})`);
          grad.addColorStop(1, `rgba(${el.color.rgb}, 0)`);

          ctx.fillStyle = grad;
          ctx.shadowBlur = 12;
          ctx.shadowColor = el.color.glow;
          ctx.fill();

          // Tiny specular center pip
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(1, currentRadius * 0.35), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${pulseAlpha * 0.9})`;
          ctx.fill();
        }

        ctx.restore();
      });

      // ── 3D Hand Vector Projection & Animation ──
      const floatY = Math.sin(t * 1.2) * 24;
      const floatX = Math.cos(t * 0.8) * 16;
      const yaw = Math.sin(t * 0.7) * 0.38 + 0.25;
      const pitch = Math.cos(t * 0.9) * 0.22 - 0.12;
      const roll = Math.sin(t * 0.5) * 0.08;

      const cyaw = Math.cos(yaw);
      const syaw = Math.sin(yaw);
      const cpitch = Math.cos(pitch);
      const spitch = Math.sin(pitch);
      const croll = Math.cos(roll);
      const sroll = Math.sin(roll);

      const fov = 420;
      const scale = Math.min(width, height) * 0.52;
      const cx = width * 0.65 + floatX;
      const cy = height * 0.44 + floatY;

      // Project joints to 2D screen
      const projected = currentJoints.map(([x, y, z], idx) => {
        let x1 = x * cyaw - z * syaw;
        let z1 = x * syaw + z * cyaw;
        let y2 = y * cpitch - z1 * spitch;
        let z2 = y * spitch + z1 * cpitch;
        let x3 = x1 * croll - y2 * sroll;
        let y3 = x1 * sroll + y2 * croll;

        const camZ = z2 + 2.4;
        const pers = fov / (fov + camZ * 140);

        return {
          id: idx,
          sx: cx + x3 * scale * pers,
          sy: cy + y3 * scale * pers,
          depth: camZ,
          isTip: [4, 8, 12, 16, 20].includes(idx),
        };
      });

      // ── Draw 3D Translucent Bone Ligaments ──
      ctx.save();
      BONES.forEach(([a, b], boneIdx) => {
        const pA = projected[a];
        const pB = projected[b];
        if (!pA || !pB) return;

        // Tri-color accent gradient across bones
        const colorA = NEON_PALETTE[boneIdx % NEON_PALETTE.length];
        const colorB = NEON_PALETTE[(boneIdx + 1) % NEON_PALETTE.length];

        const grad = ctx.createLinearGradient(pA.sx, pA.sy, pB.sx, pB.sy);
        grad.addColorStop(0, `rgba(${colorA.rgb}, 0.28)`);
        grad.addColorStop(0.5, `rgba(255, 214, 10, 0.32)`);
        grad.addColorStop(1, `rgba(${colorB.rgb}, 0.28)`);

        ctx.beginPath();
        ctx.moveTo(pA.sx, pA.sy);
        ctx.lineTo(pB.sx, pB.sy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.stroke();

        // Outer soft bone glow
        ctx.beginPath();
        ctx.moveTo(pA.sx, pA.sy);
        ctx.lineTo(pB.sx, pB.sy);
        ctx.strokeStyle = `rgba(${colorA.rgb}, 0.08)`;
        ctx.lineWidth = 5;
        ctx.stroke();
      });
      ctx.restore();

      // ── Draw 3D Joint Nodes ──
      projected.forEach((p, idx) => {
        const baseRadius = p.isTip ? 5.5 : 3.2;
        const r = baseRadius * (fov / (fov + p.depth * 100));
        const nodeColor = NEON_PALETTE[idx % NEON_PALETTE.length];

        // Outer glow halo
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.isTip ? `rgba(255, 214, 10, 0.18)` : `rgba(${nodeColor.rgb}, 0.12)`;
        ctx.fill();

        // Inner solid core
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = p.isTip ? "#FFD60A" : nodeColor.hex;
        ctx.shadowBlur = p.isTip ? 16 : 9;
        ctx.shadowColor = p.isTip ? "rgba(255, 214, 10, 0.85)" : nodeColor.glow;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        opacity: 0.88,
        transition: "opacity 1s ease",
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {/* Subtle depth-of-field vignette so foreground text and interactive controls stay 100% readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 65% 45%, transparent 25%, rgba(10, 12, 16, 0.65) 65%, var(--mg-bg, #0A0C10) 95%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default FloatingHandBackground3D;
