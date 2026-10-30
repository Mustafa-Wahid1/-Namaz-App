import { createFileRoute } from "@tanstack/react-router";
import Settings from "@/pages/Settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Salah Shutdown" },
      {
        name: "description",
        content: "Location, prayer calculation, notifications and appearance preferences.",
      },
      { property: "og:title", content: "Settings — Salah Shutdown" },
      { property: "og:description", content: "Tune calculation method, notifications and theme." },
    ],
  }),
  component: Settings,
});