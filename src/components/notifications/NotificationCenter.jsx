import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { useApp } from "@/store/AppStore";
import Tooltip from "@/components/common/Tooltip";
import { cn } from "@/lib/utils";

const TONE_DOT = {
  success: "bg-success",
  warning: "bg-warning",
  info: "bg-primary",
};

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationCenter() {
  const { notifications, markNotificationsRead, clearNotifications } = useApp();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = mounted ? notifications.filter((n) => !n.read).length : 0;

  return (
    <div className="relative" ref={ref}>
      <Tooltip label="Notifications">
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => !v);
            if (!open) markNotificationsRead();
          }}
          className="relative rounded-xl border border-border bg-card p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="size-4" aria-hidden="true" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </button>
      </Tooltip>

      {open ? (
        <div className="card-surface animate-scale-in-soft absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {mounted && notifications.length ? (
              <button
                type="button"
                onClick={clearNotifications}
                className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!mounted || notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <BellOff className="size-5 text-muted-foreground" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">
                  No notifications yet. Prayer and shutdown alerts will appear here.
                </p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-border px-4 py-3 last:border-b-0">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", TONE_DOT[n.tone] ?? TONE_DOT.info)}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground">{n.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{n.body}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Check className="size-3" aria-hidden="true" />
                          {relativeTime(n.at)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
