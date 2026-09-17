import React, { useRef, useEffect } from "react";

/**
 * HeroSoundWave
 * High-performance canvas that draws dynamic acoustic waveform filaments connecting
 * the left real hand, the central W A V E wordmark, and the right real hand.
 *
 * @param {Object} props
 * @param {number} props.mouseX - Normalized mouse position X (-1 to 1)
 * @param {number} props.mouseY - Normalized mouse position Y (-1 to 1)
 * @param {boolean} props.leftPulse - Wave trigger when left hand changes gesture
 * @param {boolean} props.rightPulse - Wave trigger when right hand changes gesture
 */
export function HeroSoundWave({
  mouseX = 0,
  mouseY = 0,
  leftPulse = false,
  rightPulse = false,
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const pulseRef = useRef({ left: 0, right: 0 });

  // Update target mouse
  useEffect(() => {
    mousePosRef.current.targetX = mouseX;
    mousePosRef.current.targetY = mouseY;
  }, [mouseX, mouseY]);

  // Trigger left pulse
  useEffect(() => {
    if (leftPulse) {
      pulseRef.current.left = 1.0;
    }
  }, [leftPulse]);

  // Trigger right pulse
  useEffect(() => {
    if (rightPulse) {
      pulseRef.current.right = 1.0;
    }
  }, [rightPulse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

    const handleResize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const render = () => {
      time += prefersReducedMotion ? 0 : 0.016;

      // Decay pulses
      pulseRef.current.left = Math.max(0, pulseRef.current.left - 0.02);
      pulseRef.current.right = Math.max(0, pulseRef.current.right - 0.02);

      // Smooth mouse interpolation
      mousePosRef.current.x +=
        (mousePosRef.current.targetX - mousePosRef.current.x) * 0.05;
      mousePosRef.current.y +=
        (mousePosRef.current.targetY - mousePosRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Coordinates for endpoints
      // Left Hand fingertip region ~ (width * 0.20, height * 0.42)
      // Center W A V E region ~ (width * 0.50, height * 0.48)
      // Right Hand fingertip region ~ (width * 0.80, height * 0.42)
      const leftTipX = width * 0.22;
      const leftTipY = height * 0.44 + mousePosRef.current.y * 12;
      const centerX = width * 0.5;
      const centerY = height * 0.50 + mousePosRef.current.y * 6;
      const rightTipX = width * 0.78;
      const rightTipY = height * 0.44 + mousePosRef.current.y * 12;

      // Draw 5 organic harmonic filaments
      const strands = [
        { freq: 1.8, speed: 1.2, amp: 14, color: "rgba(232, 161, 61, 0.40)", width: 1.4 },
        { freq: 2.6, speed: 0.9, amp: 20, color: "rgba(245, 243, 238, 0.22)", width: 1.0 },
        { freq: 3.2, speed: 1.6, amp: 10, color: "rgba(232, 161, 61, 0.25)", width: 0.8 },
        { freq: 1.2, speed: 0.8, amp: 26, color: "rgba(255, 255, 255, 0.15)", width: 1.0 },
        { freq: 4.0, speed: 2.0, amp: 8, color: "rgba(232, 161, 61, 0.30)", width: 0.7 },
      ];

      strands.forEach((s, idx) => {
        ctx.beginPath();
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.width;

        const pulseLeftBoost = pulseRef.current.left * 22;
        const pulseRightBoost = pulseRef.current.right * 22;

        const steps = 80;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps; // 0 to 1
          let x, y;

          if (t <= 0.5) {
            // Left to Center curve
            const localT = t * 2; // 0 to 1
            x = leftTipX + (centerX - leftTipX) * localT;
            const baseY = leftTipY + (centerY - leftTipY) * localT;

            // Envelope: 0 at tips and center, max in between
            const envelope = Math.sin(localT * Math.PI);
            const wave =
              Math.sin(localT * Math.PI * s.freq + time * s.speed + idx) *
              (s.amp + pulseLeftBoost * (1 - localT));
            
            // Mouse bend
            const mouseBend = (1 - localT) * mousePosRef.current.x * 15;

            y = baseY + envelope * wave + mouseBend;
          } else {
            // Center to Right curve
            const localT = (t - 0.5) * 2; // 0 to 1
            x = centerX + (rightTipX - centerX) * localT;
            const baseY = centerY + (rightTipY - centerY) * localT;

            const envelope = Math.sin(localT * Math.PI);
            const wave =
              Math.sin(localT * Math.PI * s.freq - time * s.speed + idx * 2) *
              (s.amp + pulseRightBoost * localT);

            const mouseBend = localT * mousePosRef.current.x * 15;

            y = baseY + envelope * wave + mouseBend;
          }

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      });

      // Draw subtle energy nodes at fingertip anchor points
      const drawTipNode = (x, y, pulseVal) => {
        const rad = 4 + pulseVal * 8;
        const alpha = 0.4 + pulseVal * 0.5;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, rad * 3);
        grad.addColorStop(0, `rgba(232, 161, 61, ${alpha})`);
        grad.addColorStop(1, "rgba(232, 161, 61, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, rad * 3, 0, Math.PI * 2);
        ctx.fill();
      };

      drawTipNode(leftTipX, leftTipY, pulseRef.current.left);
      drawTipNode(rightTipX, rightTipY, pulseRef.current.right);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="lp-hero-sound-canvas"
      aria-hidden="true"
    />
  );
}

export default HeroSoundWave;
