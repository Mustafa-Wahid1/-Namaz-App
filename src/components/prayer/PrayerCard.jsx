import { PRAYER_ICONS, formatTime, STATUS_LABELS, STATUS_TONES } from "@/data/prayers";
import { cn } from "@/lib/utils";
import Toggle from "@/components/common/Toggle";
import StatusBadge from "@/components/common/StatusBadge";

export default function PrayerCard({ prayer, isNext = false, status, timeFormat = "12h", onToggle, delay = 0 }) {
  const Icon = PRAYER_ICONS[prayer.name];

  return (
    <article
      className={cn(
        "group card-surface hover-lift animate-fade-up p-5",
        isNext && "border-primary/40 shadow-[var(--shadow-glow)] animate-breathe",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-11 place-items-center rounded-xl transition-all duration-300 group-hover:scale-110",
              isNext ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:text-primary",
            )}
          >
            {Icon ? <Icon className="size-5" aria-hidden="true" /> : null}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{prayer.name}</p>
            <p className="text-xs text-muted-foreground">
              {prayer.arabic} · {prayer.label}
            </p>
          </div>
        </div>
        {status ? (
          <StatusBadge tone={STATUS_TONES[status]} pulse={status === "next" || status === "current"}>
            {STATUS_LABELS[status]}
          </StatusBadge>
        ) : isNext ? (
          <StatusBadge tone="accent" pulse>Next</StatusBadge>
        ) : null}
      </div>

      <p className="mt-5 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {formatTime(prayer.time, timeFormat)}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div>
          <p className="text-xs font-medium text-foreground">Auto shutdown</p>
          <p className="text-[11px] text-muted-foreground">{prayer.shutdown ? "Active" : "Inactive"}</p>
        </div>
        <Toggle
          checked={prayer.shutdown}
          onChange={() => onToggle?.(prayer.id)}
          label={`Toggle automatic shutdown for ${prayer.name}`}
        />
      </div>
    </article>
  );
}