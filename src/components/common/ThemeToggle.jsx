import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/AppStore";

const OPTIONS = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "System theme", icon: Monitor },
];

export default function ThemeToggle({ className }) {
  const { theme, setTheme } = useApp();

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn("inline-flex items-center gap-0.5 rounded-xl border border-border bg-secondary p-1", className)}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              "rounded-lg p-2 transition-all duration-200",
              active
                ? "bg-card text-primary shadow-[var(--shadow-card)]"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}