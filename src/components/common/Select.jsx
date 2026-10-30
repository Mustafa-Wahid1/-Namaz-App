import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Select({ value, onChange, options, label, id, className, disabled }) {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const raw = e.target.value;
          const match = options.find((o) => String(o.value) === raw);
          onChange?.(match ? match.value : raw);
        }}
        className={cn(
          "w-full appearance-none rounded-xl border border-input bg-card px-3 py-2.5 pr-9 text-sm text-foreground",
          "transition-colors duration-200 hover:border-primary/40",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:opacity-50",
        )}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  );
}