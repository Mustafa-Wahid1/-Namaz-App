import { useMemo, useState } from "react";
import { Power, Timer, CalendarClock, BellRing, RefreshCw, AlertCircle } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { getNextPrayer, STATUS_LABELS } from "@/data/prayers";
import { useCountdown } from "@/hooks/useCountdown";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import HeroCard from "@/components/dashboard/HeroCard";
import PrayerMiniCard from "@/components/dashboard/PrayerMiniCard";
import AutoShutdownCard from "@/components/dashboard/AutoShutdownCard";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import { SkeletonCard } from "@/components/common/Skeleton";
import Skeleton from "@/components/common/Skeleton";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import StatusBadge from "@/components/common/StatusBadge";
import WarningPreview from "@/components/shutdown/WarningPreview";
import MobileDashboard from "@/components/mobile/MobileDashboard";

export default function Dashboard() {
  const {
    prayers,
    prayerStatuses,
    settings,
    autoShutdown,
    toggleAutoShutdown,
    loading,
    prayerError,
    refreshPrayerTimes,
    nextShutdown,
    snoozeNextShutdown,
    addToast,
  } = useApp();
  const now = useCurrentTime(1000);
  const [previewOpen, setPreviewOpen] = useState(false);

  const next = useMemo(() => getNextPrayer(prayers, now), [prayers, now]);
  const countdown = useCountdown(next.target);
  const shutdownCountdown = useCountdown(nextShutdown ? nextShutdown.target : null);
  const selected = prayers.filter((p) => p.shutdown);
  const completed = prayers.filter((p) => prayerStatuses[p.id] === "completed").length;
  const progress = Math.round((completed / prayers.length) * 100);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile-first Salah companion view */}
      <div className="md:hidden">
        <MobileDashboard />
      </div>

      <div className="hidden space-y-6 md:block">
      {prayerError ? (
        <div className="card-surface flex flex-wrap items-center justify-between gap-3 border-warning/30 bg-warning/8 p-4">
          <p className="inline-flex items-center gap-2 text-sm text-foreground">
            <AlertCircle className="size-4 text-warning" aria-hidden="true" />
            {prayerError} Showing the last known times.
          </p>
          <Button size="sm" variant="outline" icon={RefreshCw} onClick={refreshPrayerTimes}>
            Retry
          </Button>
        </div>
      ) : null}

      <HeroCard
        prayer={next.prayer}
        countdown={countdown}
        timeFormat={settings.timeFormat}
        location={`${settings.city}, ${settings.country}`}
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface animate-fade-up p-4">
          <p className="text-xs text-muted-foreground">Today's progress</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {completed}/{prayers.length} prayers passed
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="card-surface animate-fade-up p-4" style={{ animationDelay: "60ms" }}>
          <p className="text-xs text-muted-foreground">Next shutdown</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {autoShutdown && nextShutdown ? nextShutdown.prayer.name : "Not scheduled"}
          </p>
          <p className="mt-2 font-mono text-sm tabular-nums text-primary">
            {autoShutdown && nextShutdown ? `in ${shutdownCountdown.formatted}` : "—"}
          </p>
        </div>
        <div className="card-surface animate-fade-up p-4" style={{ animationDelay: "120ms" }}>
          <p className="text-xs text-muted-foreground">Automation</p>
          <div className="mt-2">
            <StatusBadge tone={autoShutdown ? "success" : "muted"}>
              {autoShutdown ? "Active" : "Paused"}
            </StatusBadge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {selected.length} prayer{selected.length === 1 ? "" : "s"} · {settings.warningMinutes} min warning
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Today's prayers</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
          {prayers.map((prayer, i) => (
            <PrayerMiniCard
              key={prayer.id}
              prayer={prayer}
              isNext={prayer.id === next.prayer.id}
              status={prayerStatuses[prayer.id]}
              timeFormat={settings.timeFormat}
              delay={i * 60}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <AutoShutdownCard
          enabled={autoShutdown}
          onToggle={toggleAutoShutdown}
          selectedPrayers={selected}
          warningMinutes={settings.warningMinutes}
          nextShutdown={nextShutdown}
          timeFormat={settings.timeFormat}
          countdown={shutdownCountdown.formatted}
        />

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <QuickActionCard
              icon={Power}
              title={autoShutdown ? "Pause automation" : "Resume automation"}
              description="Toggle every scheduled prayer shutdown at once."
              onClick={() => toggleAutoShutdown(!autoShutdown)}
              delay={40}
            />
            <QuickActionCard
              icon={BellRing}
              title="Preview warning"
              description="See exactly what appears before shutdown."
              onClick={() => setPreviewOpen(true)}
              delay={100}
            />
            <QuickActionCard
              icon={Timer}
              title="Skip next shutdown"
              description="Skip the upcoming scheduled shutdown once."
              onClick={snoozeNextShutdown}
              delay={160}
            />
            <QuickActionCard
              icon={CalendarClock}
              title="Sync prayer times"
              description="Refresh today's timings for your location."
              onClick={() => {
                refreshPrayerTimes();
                addToast("Syncing prayer times", { description: "Fetching the latest timings." });
              }}
              delay={220}
            />
          </div>
        </section>
      </div>
      </div>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Shutdown warning preview"
        description="This is what you'll see before your PC powers down."
        footer={
          <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>
            Close
          </Button>
        }
      >
        <WarningPreview
          prayerName={nextShutdown ? nextShutdown.prayer.name : next.prayer.name}
          minutes={settings.warningMinutes}
          onCancel={() => setPreviewOpen(false)}
          onContinue={() => setPreviewOpen(false)}
        />
        <p className="mt-3 text-[11px] text-muted-foreground">
          Current status of {next.prayer.name}: {STATUS_LABELS[prayerStatuses[next.prayer.id]] ?? "Upcoming"}
        </p>
      </Modal>
    </div>
  );
}
