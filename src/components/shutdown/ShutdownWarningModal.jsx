import { useState } from "react";
import { useApp } from "@/store/AppStore";
import { useCountdown } from "@/hooks/useCountdown";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import { AlertTriangle } from "lucide-react";

/** Live shutdown warning — shares the WarningPreview visual language. */
export default function ShutdownWarningModal() {
  const { activeWarning, cancelShutdown, skipShutdown, settings, isDesktop, shutdownStatus, confirmRealShutdown } =
    useApp();
  const countdown = useCountdown(activeWarning ? new Date(activeWarning.target) : null);
  const [confirming, setConfirming] = useState(false);

  if (!activeWarning) return null;

  const scheduled = Boolean(shutdownStatus?.scheduled);
  const needsConfirm = isDesktop && settings.requireConfirmation && !scheduled;

  return (
    <Modal
      open
      onClose={() => settings.emergencyCancel && cancelShutdown(activeWarning)}
      title={`${activeWarning.prayerName} is near`}
      description="Automatic shutdown is about to start."
      footer={
        <>
          <Button size="sm" variant="danger" onClick={() => cancelShutdown(activeWarning)}>
            Cancel shutdown
          </Button>
          {needsConfirm ? (
            <Button
              size="sm"
              disabled={confirming}
              onClick={async () => {
                setConfirming(true);
                await confirmRealShutdown(activeWarning);
                setConfirming(false);
              }}
            >
              {confirming ? "Scheduling…" : "Confirm shutdown"}
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={() => skipShutdown(activeWarning)}>
            Continue
          </Button>
        </>
      }
    >
      <div className="rounded-2xl border border-warning/30 bg-warning/8 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Your shutdown will start in{" "}
              <span className="font-mono tabular-nums">{countdown.formatted.replace(/^00:/, "")}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Triggered by {activeWarning.prayerName}. Save your work now, or cancel to stay signed in.
            </p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {isDesktop
                ? scheduled
                  ? "A real Windows shutdown is scheduled. Cancel shutdown aborts it immediately (shutdown.exe /a)."
                  : "Confirm shutdown to schedule the real Windows shutdown. Nothing happens until you confirm."
                : "Simulated in the browser — install the Windows desktop app for a real shutdown."}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
