import { cn } from "@/lib/utils";

const TONES = {
  success: "bg-success/12 text-success border-success/25",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  warning: "bg-warning/15 text-warning border-warning/30",
  muted: "bg-muted text-muted-foreground border-border",
  accent: "bg-accent text-accent-foreground border-primary/20",
};

export default function StatusBadge({ tone = "muted", children, className, icon: Icon, pulse = false }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide",
        TONES[tone] ?? TONES.muted,
        className,
      )}
    >
      {Icon ? (
        <Icon className="size-3" aria-hidden="true" />
      ) : pulse ? (
        <span className="size-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
      ) : null}
      {children}
    </span>
  );
}