import { useMemo } from "react";
import { MoonStar, Power, BellRing, RefreshCw, AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useApp } from "@/store/AppStore";
import { getNextPrayer, formatTime, PRAYER_ICONS, STATUS_LABELS, STATUS_TONES } from "@/data/prayers";
import { useCountdown } from "@/hooks/useCountdown";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

/**
 * Mobile-first Salah companion view: current/next prayer, countdown,
 * today's list, progress and Focus Mode. Not a shrunken desktop dashboard.
 */
export default function MobileDashboard() {
  const {
    prayers,
    prayerStatuses,
    settings,
    autoShutdown,
    nextShutdown,
    prayerError,
    refreshPrayerTimes,
    focusSession,
    startFocus,
  } = useApp();
  const now = useCurrentTime(1000);
  const next = useMemo(() => getNextPrayer(prayers, now), [prayers, now]);
  const countdown = useCountdown(next.target);
  const completed = prayers.filter((p) => prayerStatuses[p.id] === "completed").length;
  const progress = Math.round((completed / prayers.length) * 100);

  return (
    <div className="space-y-4">
      {prayerError ? (
        <div className="card-surface flex items-center justify-between gap-3 border-warning/30 bg-warning/8 p-3">
          <p className="inline-flex items-center gap-2 text-xs text-foreground">
            <AlertCircle className="size-4 shrink-0 text-warning" aria-hidden="true" />
            {prayerError}
          </p>
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={refreshPrayerTimes}>
            Retry
          </Button>
        </div>
      ) : null}

      <section className="card-surface animate-fade-up relative overflow-hidden p-5 text-center">
        {settings.focusAutoPrompt && settings.focusModeEnabled && !focusSession && countdown.totalMs <= 5 * 60_000 ? (
          <p className="relative mb-3 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2 text-xs text-foreground">
            🕌 {next.prayer.name} is approaching — prepare for Salah.
          </p>
        ) : null}
        <div className="pointer-events-none absolute inset-0 islamic-pattern opacity-40" aria-hidden="true" />
        <div className="relative space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Next prayer</p>
          <h2 className="text-2xl font-semibold text-foreground">{next.prayer.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatTime(next.prayer.time, settings.timeFormat)} · {settings.city}
          </p>
          <p className="font-mono text-4xl font-semibold tabular-nums text-primary">{countdown.formatted}</p>
          <div className="pt-2">
            <Button
              size="md"
              icon={MoonStar}
              className="w-full justify-center"
              disabled={!settings.focusModeEnabled || Boolean(focusSession)}
              onClick={() => startFocus(next.prayer, next.target)}
            >
              {focusSession ? "Focus Mode running" : "Start Focus Mode"}
            </Button>
            {!settings.focusModeEnabled ? (
              <p className="pt-2 text-[11px] text-muted-foreground">
                Enable Focus Mode in Settings to use it.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="card-surface animate-fade-up p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Today's Salah progress</span>
          <span className="font-medium text-foreground">
            {completed}/{prayers.length}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Today's prayers</h2>
        {prayers.map((prayer, i) => {
          const Icon = PRAYER_ICONS[prayer.name];
          const status = prayerStatuses[prayer.id] ?? "upcoming";
          return (
            <div
              key={prayer.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className={cn(
                "card-surface animate-fade-up grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3",
                status === "current" && "border-primary/40",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                {Icon ? <Icon className="size-4" aria-hidden="true" /> : null}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{prayer.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {formatTime(prayer.time, settings.timeFormat)}
                </p>
              </div>
              <StatusBadge tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</StatusBadge>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="card-surface animate-fade-up p-4">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Power className="size-3.5" aria-hidden="true" /> Automation
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{autoShutdown ? "Active" : "Paused"}</p>
          <p className="text-[11px] text-muted-foreground">
            {nextShutdown ? `Next: ${nextShutdown.prayer.name}` : "No shutdown scheduled"}
          </p>
        </div>
        <div className="card-surface animate-fade-up p-4">
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <BellRing className="size-3.5" aria-hidden="true" /> Reminders
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {settings.prayerNotification ? "On" : "Off"}
          </p>
          <Link to="/settings" className="text-[11px] text-primary underline-offset-4 hover:underline">
            Manage in Settings
          </Link>
        </div>
      </section>
    </div>
  );
}
