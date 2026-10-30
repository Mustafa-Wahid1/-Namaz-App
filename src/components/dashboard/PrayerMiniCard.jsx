import { PRAYER_ICONS, formatTime, STATUS_LABELS } from "@/data/prayers";
import { cn } from "@/lib/utils";

export default function PrayerMiniCard({ prayer, isNext, status, timeFormat, delay = 0 }) {
  const Icon = PRAYER_ICONS[prayer.name];
  const statusClass =
    status === "completed"
      ? "text-success"
      : status === "current"
        ? "text-warning"
        : status === "next"
          ? "text-primary"
          : "text-muted-foreground";

  return (
    <div
      className={cn(
        "group card-surface hover-lift animate-fade-up p-4 text-center",
        isNext && "border-primary/40 shadow-[var(--shadow-glow)]",
        status === "completed" && "opacity-80",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={cn(
          "mx-auto grid size-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          isNext ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:text-primary",
        )}
      >
        {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
      </span>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{prayer.name}</p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
        {formatTime(prayer.time, timeFormat)}
      </p>
      {status ? (
        <p className={cn("mt-1.5 text-[10px] font-semibold uppercase tracking-wide", statusClass)}>
          {STATUS_LABELS[status]}
        </p>
      ) : null}
      <p className={cn("mt-2 text-[10px] font-medium", prayer.shutdown ? "text-primary" : "text-muted-foreground")}>
        {prayer.shutdown ? "Shutdown on" : "Shutdown off"}
      </p>
    </div>
  );
}