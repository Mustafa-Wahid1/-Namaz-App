import { useEffect, useMemo, useState } from "react";

/**
 * Counts down to a target Date.
 */
export function useCountdown(target, totalWindowMs = 1000 * 60 * 60 * 6) {
  const targetMs = target ? new Date(target).getTime() : null;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!targetMs) return;
    setNowMs(Date.now());
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return useMemo(() => {
    if (!targetMs) {
      return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, formatted: "--:--:--", progress: 0, isDone: true };
    }
    const totalMs = Math.max(0, targetMs - nowMs);
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, "0");
    const progress = Math.min(1, Math.max(0, 1 - totalMs / totalWindowMs));
    return {
      hours,
      minutes,
      seconds,
      totalMs,
      formatted: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      progress,
      isDone: totalMs <= 0,
    };
  }, [targetMs, nowMs, totalWindowMs]);
}