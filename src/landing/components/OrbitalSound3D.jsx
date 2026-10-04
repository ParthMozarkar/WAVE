import React, { useRef, useEffect } from "react";

export function OrbitalSound3D({ height = 360, interactive = true }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const handleMouseMove = (e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseRef.current.targetX = nx;
    mouseRef.current.targetY = ny;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let h = 0;
    let time = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      h = rect.height;
      canvas.width = width * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, h);

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const cx = width * 0.5;
      const cy = h * 0.5;
      const baseRadius = Math.min(width, h) * 0.32;

      // Draw 3D Gimbal / Harmonic Orbital Rings
      const rings = [
        { rotSpeedX: 0.8, rotSpeedY: 1.1, radMult: 1.0, color: "rgba(229, 149, 0, 0.75)", width: 1.6 },
        { rotSpeedX: 1.3, rotSpeedY: 0.7, radMult: 0.82, color: "rgba(225, 29, 72, 0.65)", width: 1.4 },
        { rotSpeedX: 0.9, rotSpeedY: 1.5, radMult: 0.64, color: "rgba(14, 165, 233, 0.7)", width: 1.3 },
        { rotSpeedX: 1.6, rotSpeedY: 1.2, radMult: 0.46, color: "rgba(168, 85, 247, 0.6)", width: 1.2 },
        { rotSpeedX: 0.5, rotSpeedY: 0.9, radMult: 0.28, color: "rgba(236, 239, 244, 0.5)", width: 1.0 },
      ];

      const mouseRotX = mouseRef.current.y * 1.2;
      const mouseRotY = mouseRef.current.x * 1.5;

      rings.forEach((ring, idx) => {
        const theta = time * ring.rotSpeedY + mouseRotY + idx * 0.4;
        const phi = time * ring.rotSpeedX + mouseRotX + idx * 0.3;

        const points = 72;
        const radius = baseRadius * ring.radMult;

        ctx.beginPath();
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = ring.width;

        let first = true;
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          // Point on circle in ring plane
          const x0 = Math.cos(angle) * radius;
          const y0 = Math.sin(angle) * radius;
          const z0 = 0;

          // 3D rotation: Yaw then Pitch
          const x1 = x0 * Math.cos(theta) - z0 * Math.sin(theta);
          const z1 = x0 * Math.sin(theta) + z0 * Math.cos(theta);

          const y2 = y0 * Math.cos(phi) - z1 * Math.sin(phi);
          const z2 = y0 * Math.sin(phi) + z1 * Math.cos(phi);

          // Perspective projection
          const fov = 320;
          const pers = fov / (fov + z2);

          const sx = cx + x1 * pers;
          const sy = cy + y2 * pers;

          if (first) {
            ctx.moveTo(sx, sy);
            first = false;
          } else {
            ctx.lineTo(sx, sy);
          }
        }
        ctx.stroke();

        // Draw orbital acoustic node beads along the ring
        const nodeAngle = time * (ring.rotSpeedY * 1.5) + idx;
        const nx0 = Math.cos(nodeAngle) * radius;
        const ny0 = Math.sin(nodeAngle) * radius;
        const nx1 = nx0 * Math.cos(theta);
        const nz1 = nx0 * Math.sin(theta);
        const ny2 = ny0 * Math.cos(phi) - nz1 * Math.sin(phi);
        const nz2 = ny0 * Math.sin(phi) + nz1 * Math.cos(phi);
        const pers = 320 / (320 + nz2);

        const beadX = cx + nx1 * pers;
        const beadY = cy + ny2 * pers;

        ctx.beginPath();
        ctx.arc(beadX, beadY, Math.max(1.8, 3.5 * pers), 0, Math.PI * 2);
        ctx.fillStyle = ring.color;
        ctx.fill();
      });

      // Central core node (Acoustic Monopole)
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ECEFF4";
      ctx.fill();

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [interactive]);

  return (
    <div
      className="yc-orbital-wrapper"
      style={{ height: `${height}px` }}
      onMouseMove={handleMouseMove}
    >
      <canvas ref={canvasRef} className="yc-orbital-canvas" />
    </div>
  );
}

export default OrbitalSound3D;
