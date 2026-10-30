import { Power, Timer, CalendarClock, MonitorCog } from "lucide-react";
import Toggle from "@/components/common/Toggle";
import StatusBadge from "@/components/common/StatusBadge";
import { formatTime } from "@/data/prayers";
import { useApp } from "@/store/AppStore";

export default function AutoShutdownCard({
  enabled,
  onToggle,
  selectedPrayers,
  warningMinutes,
  nextShutdown,
  timeFormat,
  countdown,
}) {
  const { isDesktop, shutdownStatus } = useApp();
  const windowsStatus = !isDesktop
    ? "Browser mode"
    : shutdownStatus?.scheduled
      ? "Scheduled"
      : shutdownStatus?.cancelled
        ? "Cancelled"
        : "Not scheduled";

  return (
    <section className="card-surface animate-fade-up p-6" style={{ animationDelay: "120ms" }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
            <Power className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Automatic shutdown</h3>
            <p className="text-xs text-muted-foreground">Powers down your PC around prayer time</p>
          </div>
        </div>
        <Toggle checked={enabled} onChange={onToggle} label="Toggle automatic shutdown" />
      </div>

      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Status</span>
          <StatusBadge tone={enabled ? "success" : "muted"}>{enabled ? "Enabled" : "Disabled"}</StatusBadge>
        </div>
        <div className="flex items-start justify-between gap-3">
          <span className="text-muted-foreground">Selected prayers</span>
          <span className="text-right text-xs font-medium text-foreground">
            {selectedPrayers.length ? selectedPrayers.map((p) => p.name).join(", ") : "None selected"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <Timer className="size-4" aria-hidden="true" /> Warning time
          </span>
          <span className="text-xs font-medium text-foreground">{warningMinutes} minutes before</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="size-4" aria-hidden="true" /> Next shutdown
          </span>
          <span className="font-mono text-xs font-medium tabular-nums text-foreground">
            {enabled && nextShutdown
              ? `${nextShutdown.prayer.name} · ${formatTime(nextShutdown.prayer.time, timeFormat)}`
              : "Not scheduled"}
          </span>
        </div>
        {enabled && nextShutdown && countdown ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/8 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">Starts in</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-primary">{countdown}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <MonitorCog className="size-4" aria-hidden="true" /> Windows shutdown
          </span>
          <StatusBadge tone={windowsStatus === "Scheduled" ? "warning" : "muted"}>{windowsStatus}</StatusBadge>
        </div>
      </div>
    </section>
  );
}