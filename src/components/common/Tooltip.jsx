import { cn } from "@/lib/utils";

export default function Tooltip({ label, children, side = "top", className }) {
  const position = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }[side];

  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5",
          "text-[11px] font-medium text-popover-foreground shadow-[var(--shadow-card)]",
          "opacity-0 translate-y-1 transition-all duration-200",
          "group-hover/tt:opacity-100 group-hover/tt:translate-y-0",
          "group-focus-within/tt:opacity-100 group-focus-within/tt:translate-y-0",
          position,
        )}
      >
        {label}
      </span>
    </span>
  );
}