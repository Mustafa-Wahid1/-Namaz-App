import { createFileRoute } from "@tanstack/react-router";
import History from "@/pages/History";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Shutdown History — Salah Shutdown" },
      {
        name: "description",
        content: "Review every scheduled shutdown with its prayer, time and outcome.",
      },
      { property: "og:title", content: "Shutdown History — Salah Shutdown" },
      { property: "og:description", content: "Completed, cancelled and skipped shutdowns." },
    ],
  }),
  component: History,
});