import { useMemo, useState } from "react";
import { History as HistoryIcon } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { HISTORY_FILTERS } from "@/constants/appConstants";
import { STATUS_TONE } from "@/data/history";
import { formatTime } from "@/data/prayers";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import Skeleton from "@/components/common/Skeleton";
import { cn } from "@/lib/utils";

export default function History() {
  const { history, settings, loading } = useApp();
  const [filter, setFilter] = useState("all");

  const rows = useMemo(() => {
    if (filter === "all") return history;
    if (filter === "focus") return history.filter((h) => h.action === "Focus Mode");
    if (filter === "reminder") return history.filter((h) => h.status === "reminder");
    return history.filter((h) => h.status === filter && h.action !== "Focus Mode");
  }, [history, filter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="History filters">
        {HISTORY_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-xl border px-4 py-2 text-xs font-medium transition-all duration-200",
              filter === f.value
                ? "border-primary/40 bg-primary/12 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/25",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-surface space-y-3 p-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No history yet"
          description="Once shutdowns run, each attempt appears here with its outcome."
          actionLabel="Show all entries"
          onAction={() => setFilter("all")}
        />
      ) : (
        <>
        <div className="space-y-2 md:hidden">
          {rows.map((row, i) => (
            <div
              key={row.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="card-surface animate-fade-up grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {row.prayer} · <span className="font-normal text-muted-foreground">{row.action}</span>
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {row.date} · {formatTime(row.time, settings.timeFormat)}
                </p>
              </div>
              <StatusBadge tone={STATUS_TONE[row.status]} className="capitalize">
                {row.status}
              </StatusBadge>
            </div>
          ))}
        </div>
        <div className="card-surface animate-fade-up hidden overflow-hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-medium">Date</th>
                  <th scope="col" className="px-5 py-3 font-medium">Prayer</th>
                  <th scope="col" className="px-5 py-3 font-medium">Time</th>
                  <th scope="col" className="px-5 py-3 font-medium">Action</th>
                  <th scope="col" className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="animate-fade-up border-b border-border transition-colors last:border-b-0 hover:bg-accent/40"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-5 py-3.5 text-muted-foreground">{row.date}</td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.prayer}</td>
                    <td className="px-5 py-3.5 font-mono tabular-nums text-muted-foreground">
                      {formatTime(row.time, settings.timeFormat)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.action}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge tone={STATUS_TONE[row.status]} className="capitalize">
                        {row.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}
    </div>
  );
}