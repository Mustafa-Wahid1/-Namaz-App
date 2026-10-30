import { LayoutDashboard, Clock, Power, History, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/prayer-times", label: "Prayer Times", icon: Clock },
  { to: "/shutdown", label: "Shutdown", icon: Power },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
];

export const PAGE_META = {
  "/": { title: "Dashboard", subtitle: "Your prayer-aware overview for today" },
  "/prayer-times": { title: "Prayer Times", subtitle: "Today's schedule and shutdown selection" },
  "/shutdown": { title: "Shutdown", subtitle: "Automation rules, warnings and safety" },
  "/history": { title: "History", subtitle: "Every scheduled shutdown and its outcome" },
  "/settings": { title: "Settings", subtitle: "Location, calculation, notifications and appearance" },
};