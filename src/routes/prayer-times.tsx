import { createFileRoute } from "@tanstack/react-router";
import PrayerTimes from "@/pages/PrayerTimes";

export const Route = createFileRoute("/prayer-times")({
  head: () => ({
    meta: [
      { title: "Prayer Times — Salah Shutdown" },
      {
        name: "description",
        content: "Today's five prayer times with per-prayer automatic shutdown controls.",
      },
      { property: "og:title", content: "Prayer Times — Salah Shutdown" },
      { property: "og:description", content: "Today's five prayers and shutdown selection." },
    ],
  }),
  component: PrayerTimes,
});