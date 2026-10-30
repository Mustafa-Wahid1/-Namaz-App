import { useState } from "react";
import { Power, ShieldCheck, BellRing, Ban, Timer, CalendarClock } from "lucide-react";
import { useApp } from "@/store/AppStore";
import { WARNING_OPTIONS } from "@/constants/appConstants";
import { formatTime } from "@/data/prayers";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useCountdown } from "@/hooks/useCountdown";
import Toggle from "@/components/common/Toggle";
import Select from "@/components/common/Select";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import StatusBadge from "@/components/common/StatusBadge";
import EmptyState from "@/components/common/EmptyState";
import ShutdownSchedule from "@/components/shutdown/ShutdownSchedule";
import SafetyRow from "@/components/shutdown/SafetyRow";
import WarningPreview from "@/components/shutdown/WarningPreview";

export default function Shutdown() {
  const {
    prayers,
    settings,
    updateSetting,
    autoShutdown,
    toggleAutoShutdown,
    togglePrayerShutdown,
    addToast,
    nextShutdown,
    activeWarning,
    cancelShutdown,
    skipShutdown,
  } = useApp();
  useCurrentTime(1000);
  const shutdownCountdown = useCountdown(nextShutdown ? nextShutdown.target : null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="space-y-6">
      <section className="card-surface animate-fade-up p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
              <Power className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Master automatic shutdown</h2>
              <p className="text-xs text-muted-foreground">
                Controls every prayer rule below. Nothing runs while this is off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge tone={autoShutdown ? "success" : "muted"}>{autoShutdown ? "Active" : "Paused"}</StatusBadge>
            <Toggle checked={autoShutdown} onChange={toggleAutoShutdown} label="Master automatic shutdown" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Prayer rules</h2>
          <ShutdownSchedule
            prayers={prayers}
            timeFormat={settings.timeFormat}
            onToggle={togglePrayerShutdown}
            disabled={!autoShutdown}
          />

          <div className="card-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Timer className="size-4 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-foreground">Warning duration</p>
                  <p className="text-xs text-muted-foreground">How long before shutdown you're notified.</p>
                </div>
              </div>
              <Select
                className="w-full sm:w-64"
                label="Warning duration"
                value={settings.warningMinutes}
                options={WARNING_OPTIONS}
                onChange={(value) => {
                  updateSetting("warningMinutes", Number(value));
                  addToast("Shutdown schedule updated", { description: `Warning set to ${value} minutes.` });
                }}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Warning preview</h2>
          {autoShutdown && nextShutdown ? (
            <>
              <WarningPreview
                prayerName={nextShutdown.prayer.name}
                minutes={settings.warningMinutes}
                onCancel={() =>
                  activeWarning
                    ? cancelShutdown(activeWarning)
                    : addToast("Nothing running", { tone: "info", description: "No shutdown is counting down yet." })
                }
                onContinue={() => (activeWarning ? skipShutdown(activeWarning) : setConfirmOpen(true))}
              />
              <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3">
                <span className="text-xs text-muted-foreground">
                  {activeWarning ? `Shutdown for ${activeWarning.prayerName} starts in` : "Time until next shutdown"}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums text-primary">
                  {shutdownCountdown.formatted}
                </span>
              </div>
              <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" aria-hidden="true" />
                Next scheduled: {nextShutdown.prayer.name} at{" "}
                {formatTime(nextShutdown.prayer.time, settings.timeFormat)}
              </p>
            </>
          ) : (
            <EmptyState
              icon={CalendarClock}
              title="No scheduled shutdown"
              description="Enable the master toggle and pick at least one prayer to schedule an automatic shutdown."
              actionLabel={autoShutdown ? undefined : "Enable automation"}
              onAction={() => toggleAutoShutdown(true)}
            />
          )}

          <h2 className="pt-2 text-sm font-semibold text-foreground">Safety</h2>
          <div className="space-y-2">
            <SafetyRow
              icon={ShieldCheck}
              title="Require confirmation"
              description="Ask before the shutdown countdown begins."
              checked={settings.requireConfirmation}
              onChange={(v) => {
                updateSetting("requireConfirmation", v);
                addToast("Preference updated", { description: "Confirmation setting saved." });
              }}
            />
            <SafetyRow
              icon={Ban}
              title="Emergency cancellation"
              description="Always allow cancelling with a single click or Esc."
              checked={settings.emergencyCancel}
              onChange={(v) => {
                updateSetting("emergencyCancel", v);
                addToast("Preference updated", { description: "Emergency cancellation saved." });
              }}
            />
            <SafetyRow
              icon={BellRing}
              title="Desktop notification"
              description="Show a Windows notification alongside the warning."
              checked={settings.desktopNotifications}
              onChange={(v) => {
                updateSetting("desktopNotifications", v);
                addToast("Preference updated", { description: "Notification setting saved." });
              }}
            />
          </div>
        </section>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm shutdown behaviour"
        description="No real shutdown happens in this preview build."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setConfirmOpen(false);
                addToast("Shutdown schedule updated", { description: "Your rules were confirmed." });
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">
          When Electron and the Windows integration land, this action will schedule a real shutdown
          {" "}{settings.warningMinutes} minutes before the selected prayer.
        </p>
      </Modal>
    </div>
  );
}