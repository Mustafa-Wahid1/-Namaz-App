import { Link, useRouterState } from "@tanstack/react-router";
import { MapPin, PanelLeftClose, PanelLeftOpen, MoonStar } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/data/navigation";
import { APP_NAME, APP_VERSION } from "@/constants/appConstants";
import { useApp } from "@/store/AppStore";
import Tooltip from "@/components/common/Tooltip";

export default function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed, settings } = useApp();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex",
        "transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        sidebarCollapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
          <MoonStar className="size-5" aria-hidden="true" />
        </span>
        {!sidebarCollapsed && (
          <div className="min-w-0 animate-fade-in-soft">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{APP_NAME}</p>
            <p className="truncate text-[11px] text-muted-foreground">Prayer-aware automation</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          const link = (
            <Link
              to={to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                "transition-colors duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                sidebarCollapsed && "justify-center px-0",
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary",
                  "origin-center transition-transform duration-300",
                  active ? "scale-y-100" : "scale-y-0",
                )}
                aria-hidden="true"
              />
              <Icon
                className={cn(
                  "size-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
                  active && "text-sidebar-primary",
                )}
                aria-hidden="true"
              />
              {!sidebarCollapsed && <span className="truncate">{label}</span>}
            </Link>
          );
          return (
            <div key={to}>
              {sidebarCollapsed ? (
                <Tooltip label={label} side="right" className="w-full [&>*:first-child]:w-full">
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </div>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-3 rounded-xl bg-sidebar-accent/40 p-2.5", sidebarCollapsed && "justify-center")}>
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          {!sidebarCollapsed && (
            <div className="min-w-0 text-xs">
              <p className="truncate font-medium text-sidebar-foreground">{settings.city}</p>
              <p className="truncate text-muted-foreground">{settings.country}</p>
            </div>
          )}
        </div>

        <div className={cn("flex items-center gap-3 px-1", sidebarCollapsed && "justify-center")}>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            SS
          </span>
          {!sidebarCollapsed && (
            <div className="min-w-0 text-xs">
              <p className="truncate font-medium text-sidebar-foreground">Local user</p>
              <p className="truncate text-muted-foreground">v{APP_VERSION}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground",
            "transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            sidebarCollapsed && "justify-center px-0",
          )}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4" aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose className="size-4" aria-hidden="true" />
              Collapse
            </>
          )}
        </button>
      </div>
    </aside>
  );
}