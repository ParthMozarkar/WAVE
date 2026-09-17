import React, { useRef, useEffect } from "react";

export function WaveCanvas({
  height = 360,
  interactive = true,
  lineCount = 4,
  baseColor = "232, 161, 61",
  style = {},
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const animIdRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      mouseRef.current.targetX = Math.max(0, Math.min(1, nx));
      mouseRef.current.targetY = Math.max(0, Math.min(1, ny));
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let time = 0;

    const render = () => {
      // Lerp mouse towards target
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.05;
      m.y += (m.targetY - m.y) * 0.05;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!prefersReducedMotion) {
        time += 0.015;
      }

      const centerY = h / 2;
      const dpr = window.devicePixelRatio || 1;

      // Color parsing
      const [r, g, b] = baseColor.split(",").map((v) => parseInt(v.trim()));

      for (let l = 0; l < lineCount; l++) {
        ctx.beginPath();
        const layerOffset = (l - (lineCount - 1) / 2) * (14 * dpr * (0.8 + m.y * 0.6));
        const freqMultiplier = 0.003 + l * 0.0008 + (m.x - 0.5) * 0.002;
        const amp = (28 + l * 8 + (1 - m.y) * 20) * dpr;

        for (let x = 0; x <= w; x += 6 * dpr) {
          const wave1 = Math.sin(x * freqMultiplier + time + l * 0.4) * amp;
          const wave2 = Math.cos(x * 0.0015 - time * 0.7 + l * 0.2) * (amp * 0.4);
          const y = centerY + layerOffset + wave1 + wave2;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const alpha = 0.25 + (l / lineCount) * 0.5;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = Math.max(1, (1.8 + l * 0.4) * dpr);
        ctx.lineCap = "round";
        ctx.shadowBlur = 12 * dpr;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.35)`;
        ctx.stroke();
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      window.removeEventListener("resize", resize);
      if (interactive) window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [baseColor, interactive, lineCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        display: "block",
        ...style,
      }}
    />
  );
}
