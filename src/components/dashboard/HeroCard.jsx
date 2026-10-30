import { PRAYER_ICONS, formatTime, HIJRI_DATE } from "@/data/prayers";
import CountdownRing from "@/components/common/CountdownRing";
import StatusBadge from "@/components/common/StatusBadge";

export default function HeroCard({ prayer, countdown, timeFormat, location }) {
  const Icon = PRAYER_ICONS[prayer.name];

  return (
    <section
      className="card-surface animate-fade-up relative overflow-hidden p-6 lg:p-8"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <StatusBadge tone="accent" pulse>
            Next prayer
          </StatusBadge>
          <div className="mt-4 flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary">
              {Icon ? <Icon className="size-7" aria-hidden="true" /> : null}
            </span>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">{prayer.name}</h2>
              <p className="text-sm text-muted-foreground">
                {prayer.arabic} · {formatTime(prayer.time, timeFormat)} · {location}
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm text-muted-foreground">
            {HIJRI_DATE} — take a calm pause. Your PC will handle the rest.
          </p>
        </div>

        <CountdownRing progress={countdown.progress} label={countdown.formatted} caption="until adhan" />
      </div>
    </section>
  );
}