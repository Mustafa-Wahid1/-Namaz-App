import { useEffect, useState } from "react";
import { Settings as SettingsIcon, MapPin, ShieldCheck } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { PAGE_META } from "@/data/navigation";
import { useApp } from "@/store/AppStore";
import { useCurrentTime, formatClock, formatLongDate } from "@/hooks/useCurrentTime";
import ThemeToggle from "@/components/common/ThemeToggle";
import StatusBadge from "@/components/common/StatusBadge";
import Tooltip from "@/components/common/Tooltip";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export default function Header() {
  const { settings, autoShutdown } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = PAGE_META[pathname] ?? { title: "Salah Shutdown", subtitle: "Prayer-aware productivity" };
  const now = useCurrentTime();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-8">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">{meta.title}</h1>
          <p className="truncate text-sm text-muted-foreground">{meta.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden text-right lg:block">
            <p suppressHydrationWarning className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {mounted ? formatClock(now, settings.timeFormat) : "--:--:--"}
            </p>
            <p suppressHydrationWarning className="text-[11px] text-muted-foreground">
              {mounted ? formatLongDate(now) : ""}
            </p>
          </div>

          <span className="hidden items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground sm:inline-flex">
            <MapPin className="size-3.5 text-primary" aria-hidden="true" />
            {settings.city}, {settings.country}
          </span>

          <StatusBadge tone={autoShutdown ? "success" : "muted"} icon={ShieldCheck}>
            {autoShutdown ? "Automation active" : "Automation paused"}
          </StatusBadge>

          <NotificationCenter />

          <ThemeToggle />

          <Tooltip label="Settings">
            <Link
              to="/settings"
              aria-label="Open settings"
              className="rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
            >
              <SettingsIcon className="size-4" aria-hidden="true" />
            </Link>
          </Tooltip>

          <span
            className="grid size-9 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary"
            aria-label="User avatar"
          >
            SS
          </span>
        </div>
      </div>
    </header>
  );
}