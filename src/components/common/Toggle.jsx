import { cn } from "@/lib/utils";

export default function Toggle({ checked, onChange, label, disabled = false, size = "md", id }) {
  const dims =
    size === "sm"
      ? { track: "h-5 w-9", thumb: "size-4", shift: "translate-x-4" }
      : { track: "h-6 w-11", thumb: "size-5", shift: "translate-x-5" };

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full border border-transparent p-0.5",
        "transition-colors duration-300 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-muted border-border",
        checked && !disabled && "animate-breathe",
        dims.track,
      )}
    >
      <span
        className={cn(
          "rounded-full bg-card shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          dims.thumb,
          checked ? dims.shift : "translate-x-0",
        )}
      />
    </button>
  );
}