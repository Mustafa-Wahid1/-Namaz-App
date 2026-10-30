import { cn } from "@/lib/utils";

export default function QuickActionCard({ icon: Icon, title, description, onClick, tone = "default", delay = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "card-surface hover-lift animate-fade-up group w-full p-5 text-left",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span
        className={cn(
          "grid size-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          tone === "danger" ? "bg-destructive/12 text-destructive" : "bg-primary/12 text-primary",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}