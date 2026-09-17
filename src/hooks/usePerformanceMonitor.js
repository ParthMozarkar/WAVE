import { useState, useRef, useEffect, useCallback } from "react";
import { PerformanceMonitor } from "../performance/perfMonitor.js";

export function usePerformanceMonitor(synth) {
  const perfRef = useRef(null);
  if (!perfRef.current) {
    perfRef.current = new PerformanceMonitor();
  }
  const perf = perfRef.current;

  const [metrics, setMetrics] = useState({
    fps: "--",
    latencyMs: "--",
    gestureAccuracy: "--",
    acceptanceRate: "--",
    activeVoices: 0,
    oscillatorCount: 0,
    audioState: "Ready",
  });

  const tickFrame = useCallback(() => {
    perf.tickFrame();
  }, [perf]);

  const recordLatency = useCallback((durationMs) => {
    perf.recordLatency(durationMs);
  }, [perf]);

  const recordConfidence = useCallback((score, isHandPresent, isAccepted) => {
    perf.recordConfidence(score, isHandPresent, isAccepted);
  }, [perf]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(perf.getMetrics(synth));
    }, 200);

    return () => clearInterval(timer);
  }, [perf, synth]);

  return {
    perf,
    metrics,
    tickFrame,
    recordLatency,
    recordConfidence,
  };
}
