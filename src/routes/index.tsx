import { createFileRoute } from "@tanstack/react-router";
import Dashboard from "@/pages/Dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Salah Shutdown" },
      {
        name: "description",
        content:
          "See your next prayer, live countdown and automatic shutdown status in one calm dashboard.",
      },
      { property: "og:title", content: "Dashboard — Salah Shutdown" },
      {
        property: "og:description",
        content: "See your next prayer, live countdown and automatic shutdown status in one calm dashboard.",
      },
    ],
  }),
  component: Dashboard,
});
