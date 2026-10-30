import { useEffect } from "react";
import { MoonStar, Check, X } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { useCountdown } from "@/hooks/useCountdown";
import { formatTime } from "@/data/prayers";
import Button from "@/components/common/Button";

/**
 * Distraction-free Salah screen. Purely encouraging — the web app cannot
 * disable other apps on a phone, so it simply asks the user to step away.
 */
export default function FocusModeOverlay() {
  const { focusSession, completeFocus, exitFocus, settings } = useApp();
  const countdown = useCountdown(focusSession ? focusSession.target : null);

  useEffect(() => {
    if (!focusSession) return;
    const onKey = (e) => e.key === "Escape" && exitFocus();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [focusSession, exitFocus]);

  if (!focusSession) return null;

  const started = countdown.totalMs <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Salah focus mode"
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background px-6 text-center animate-fade-up"
    >
      <div className="pointer-events-none absolute inset-0 islamic-pattern opacity-30" aria-hidden="true" />
      <button
        type="button"
        onClick={exitFocus}
        aria-label="Exit focus mode"
        className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <X className="size-5" aria-hidden="true" />
      </button>

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        <span className="grid size-16 place-items-center rounded-2xl bg-primary/12 text-primary animate-breathe">
          <MoonStar className="size-8" aria-hidden="true" />
        </span>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Focus Mode</p>
          <h2 className="text-3xl font-semibold text-foreground">{focusSession.prayerName}</h2>
          <p className="font-mono text-sm text-muted-foreground">
            {formatTime(focusSession.time, settings.timeFormat)}
          </p>
        </div>

        <p className="font-mono text-4xl font-semibold tabular-nums text-primary">
          {started ? "It's time" : countdown.formatted}
        </p>

        <p className="text-sm leading-relaxed text-muted-foreground">
          Put your phone aside and give this time to your Salah. Your screen stays quiet here until
          you come back.
        </p>

        <Button size="lg" icon={Check} className="w-full justify-center" onClick={completeFocus}>
          I'm Done
        </Button>
        <button
          type="button"
          onClick={exitFocus}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Leave focus mode
        </button>
      </div>
    </div>
  );
}
