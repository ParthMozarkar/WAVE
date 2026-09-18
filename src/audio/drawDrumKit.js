/**
 * WAVE — Drum Kit Canvas Overlay
 *
 * Draws a glassmorphic 7-piece drum kit over the live camera feed.
 * Called every rAF frame by useDrumTracking.
 *
 * drumZones format (same array used by useDrumTracking for hit detection):
 *   { id, label, cx, cy, rx, ry, color }
 *   cx/cy are normalized [0,1] canvas coords (already mirrored).
 *   rx/ry are radii in normalized units.
 */

export const DRUM_ZONES = [
  { id: "crash",        label: "Crash",   cx: 0.14, cy: 0.22, rx: 0.09, ry: 0.055, color: "255,230,100" },
  { id: "hihat_open",   label: "Hi-Hat",  cx: 0.28, cy: 0.28, rx: 0.08, ry: 0.050, color: "160,220,255" },
  { id: "tom1",         label: "Tom 1",   cx: 0.38, cy: 0.38, rx: 0.07, ry: 0.055, color: "200,140,255" },
  { id: "tom2",         label: "Tom 2",   cx: 0.62, cy: 0.38, rx: 0.07, ry: 0.055, color: "200,140,255" },
  { id: "ride",         label: "Ride",    cx: 0.82, cy: 0.22, rx: 0.09, ry: 0.055, color: "255,200,100" },
  { id: "snare",        label: "Snare",   cx: 0.30, cy: 0.60, rx: 0.09, ry: 0.065, color: "255,120,120" },
  { id: "kick",         label: "Kick",    cx: 0.50, cy: 0.75, rx: 0.13, ry: 0.075, color: "120,200,140" },
];

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} hitFlashes - map of drumId -> timestamp of last hit (ms)
 * @param {Array}  stickTips  - [{x, y}] normalized positions of detected stick tips (left/right)
 */
export function drawDrumKit(ctx, hitFlashes, stickTips) {
  if (!ctx) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const now = performance.now();

  ctx.save();

  // ── Draw drum zones ────────────────────────────────────────────────────────
  for (const zone of DRUM_ZONES) {
    const px = zone.cx * W;
    const py = zone.cy * H;
    const radX = zone.rx * W;
    const radY = zone.ry * H;

    const lastHit = hitFlashes[zone.id] || 0;
    const age = now - lastHit; // ms since last hit
    const isFlashing = age < 120;
    const flashAlpha = isFlashing ? Math.max(0, 1 - age / 120) : 0;

    // Glow halo on hit
    if (isFlashing) {
      ctx.save();
      ctx.shadowBlur = 32 + flashAlpha * 40;
      ctx.shadowColor = `rgba(${zone.color}, ${flashAlpha * 0.9})`;
      ctx.beginPath();
      ctx.ellipse(px, py, radX * 1.1, radY * 1.1, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${zone.color}, ${flashAlpha * 0.35})`;
      ctx.fill();
      ctx.restore();
    }

    // Glassmorphic pad body
    ctx.beginPath();
    ctx.ellipse(px, py, radX, radY, 0, 0, Math.PI * 2);

    const baseAlpha = isFlashing ? (0.18 + flashAlpha * 0.35) : 0.14;
    ctx.fillStyle = `rgba(${zone.color}, ${baseAlpha})`;
    ctx.fill();

    // Rim
    ctx.beginPath();
    ctx.ellipse(px, py, radX, radY, 0, 0, Math.PI * 2);
    const rimAlpha = isFlashing ? (0.7 + flashAlpha * 0.3) : 0.35;
    ctx.strokeStyle = `rgba(${zone.color}, ${rimAlpha})`;
    ctx.lineWidth = isFlashing ? 3 : 1.5;
    ctx.stroke();

    // Inner highlight ring
    ctx.beginPath();
    ctx.ellipse(px, py - radY * 0.2, radX * 0.7, radY * 0.35, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${isFlashing ? 0.35 : 0.12})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    ctx.font = `bold ${Math.round(radX * 0.28)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = `rgba(255,255,255,${isFlashing ? 1 : 0.65})`;
    ctx.shadowBlur = isFlashing ? 10 : 0;
    ctx.shadowColor = `rgba(${zone.color}, 0.8)`;
    ctx.fillText(zone.label, px, py);
    ctx.shadowBlur = 0;
  }

  // ── Draw stick tips ────────────────────────────────────────────────────────
  for (const tip of stickTips) {
    if (!tip) continue;
    const sx = tip.x * W;
    const sy = tip.y * H;

    // Outer glow
    ctx.beginPath();
    ctx.arc(sx, sy, 18, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();

    // Stick tip dot
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fillStyle = tip.isHitting
      ? "rgba(255, 240, 100, 0.95)"
      : "rgba(255, 255, 255, 0.75)";
    ctx.shadowBlur = tip.isHitting ? 24 : 8;
    ctx.shadowColor = tip.isHitting ? "rgba(255,220,60,0.9)" : "rgba(255,255,255,0.4)";
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}
