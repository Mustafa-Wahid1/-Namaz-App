import { useMemo } from "react";
import { CalendarDays, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { getNextPrayer } from "@/data/prayers";
import { useCurrentTime, formatLongDate } from "@/hooks/useCurrentTime";
import PrayerSchedule from "@/components/prayer/PrayerSchedule";
import Button from "@/components/common/Button";
import { SkeletonCard } from "@/components/common/Skeleton";

export default function PrayerTimes() {
  const {
    prayers,
    prayerStatuses,
    settings,
    togglePrayerShutdown,
    addToast,
    loading,
    prayerError,
    refreshPrayerTimes,
    hijri,
  } = useApp();
  const now = useCurrentTime(1000);
  const next = useMemo(() => getNextPrayer(prayers, now), [prayers, now]);

  return (
    <div className="space-y-6">
      <section className="card-surface animate-fade-up flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex flex-wrap items-center gap-5">
          <span className="inline-flex items-center gap-2 text-sm text-foreground" suppressHydrationWarning>
            <CalendarDays className="size-4 text-primary" aria-hidden="true" />
            {formatLongDate(now)}
          </span>
          <span className="text-xs text-muted-foreground">{hijri}</span>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            {settings.city}, {settings.country}
          </span>
        </div>
        <Button
          size="sm"
          icon={RefreshCw}
          onClick={() => {
            refreshPrayerTimes();
            addToast("Refreshing prayer times", { description: `Fetching timings for ${settings.city}.` });
          }}
        >
          Refresh times
        </Button>
      </section>

      {prayerError ? (
        <div className="card-surface flex flex-wrap items-center justify-between gap-3 border-warning/30 bg-warning/8 p-4">
          <p className="inline-flex items-center gap-2 text-sm text-foreground">
            <AlertCircle className="size-4 text-warning" aria-hidden="true" />
            {prayerError}
          </p>
          <Button size="sm" variant="outline" onClick={refreshPrayerTimes}>
            Try again
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <PrayerSchedule
          prayers={prayers}
          nextPrayerId={next.prayer.id}
          statuses={prayerStatuses}
          timeFormat={settings.timeFormat}
          onToggle={togglePrayerShutdown}
        />
      )}
    </div>
  );
}
