import { PRAYER_ICONS, formatTime } from "@/data/prayers";
import Toggle from "@/components/common/Toggle";
import { cn } from "@/lib/utils";

export default function ShutdownSchedule({ prayers, timeFormat, onToggle, disabled }) {
  return (
    <div className="space-y-2">
      {prayers.map((prayer) => {
        const Icon = PRAYER_ICONS[prayer.name];
        return (
          <div
            key={prayer.id}
            className={cn(
              "flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4",
              "transition-all duration-200 hover:border-primary/30 hover:shadow-[var(--shadow-card)]",
              disabled && "opacity-60",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-xl",
                  prayer.shutdown ? "bg-primary/12 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                {Icon ? <Icon className="size-4.5" aria-hidden="true" /> : null}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{prayer.name}</p>
                <p className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatTime(prayer.time, timeFormat)}
                </p>
              </div>
            </div>
            <Toggle
              checked={prayer.shutdown}
              disabled={disabled}
              onChange={() => onToggle(prayer.id)}
              label={`Shutdown at ${prayer.name}`}
            />
          </div>
        );
      })}
    </div>
  );
}