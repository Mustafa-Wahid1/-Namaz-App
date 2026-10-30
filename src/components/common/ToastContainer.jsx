import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE_MAP = {
  success: { icon: CheckCircle2, color: "text-success", bar: "bg-success" },
  info: { icon: Info, color: "text-primary", bar: "bg-primary" },
  warning: { icon: AlertTriangle, color: "text-warning", bar: "bg-warning" },
  danger: { icon: AlertTriangle, color: "text-destructive", bar: "bg-destructive" },
};

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-200 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const tone = TONE_MAP[toast.tone] ?? TONE_MAP.success;
        const Icon = tone.icon;
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto relative overflow-hidden card-surface p-3.5 pr-9",
              toast.leaving ? "animate-toast-out" : "animate-toast-in",
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn("mt-0.5 size-4 shrink-0", tone.color)} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{toast.message}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
            <span
              className={cn("absolute bottom-0 left-0 h-0.5 w-full origin-left", tone.bar)}
              style={{ animation: `ss-progress ${toast.duration}ms linear forwards` }}
              aria-hidden="true"
            />
          </div>
        );
      })}
    </div>
  );
}