import { createFileRoute } from "@tanstack/react-router";
import Shutdown from "@/pages/Shutdown";

export const Route = createFileRoute("/shutdown")({
  head: () => ({
    meta: [
      { title: "Shutdown Rules — Salah Shutdown" },
      {
        name: "description",
        content: "Configure automatic shutdown rules, warning duration and safety options.",
      },
      { property: "og:title", content: "Shutdown Rules — Salah Shutdown" },
      { property: "og:description", content: "Automation rules, warnings and safety settings." },
    ],
  }),
  component: Shutdown,
});