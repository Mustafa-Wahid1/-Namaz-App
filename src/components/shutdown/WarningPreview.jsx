import { AlertTriangle } from "lucide-react";
import Button from "@/components/common/Button";

export default function WarningPreview({ prayerName = "Maghrib", minutes = 5, onCancel, onContinue }) {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/8 p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Prayer time reached — {prayerName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your laptop will shut down in {minutes} {minutes === 1 ? "minute" : "minutes"}. Save your work now.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="danger" onClick={onCancel}>
              Cancel shutdown
            </Button>
            <Button size="sm" variant="outline" onClick={onContinue}>
              Continue
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Preview only — no real shutdown is performed at this stage.
          </p>
        </div>
      </div>
    </div>
  );
}