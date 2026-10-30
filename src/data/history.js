export const HISTORY_DATA = [
  { id: 1, date: "2026-08-08", prayer: "Fajr", time: "05:14", action: "Shutdown", status: "completed" },
  { id: 2, date: "2026-08-07", prayer: "Maghrib", time: "18:44", action: "Shutdown", status: "completed" },
  { id: 3, date: "2026-08-07", prayer: "Dhuhr", time: "12:38", action: "Shutdown", status: "cancelled" },
  { id: 4, date: "2026-08-06", prayer: "Isha", time: "20:05", action: "Shutdown", status: "skipped" },
  { id: 5, date: "2026-08-06", prayer: "Asr", time: "16:06", action: "Sleep", status: "completed" },
  { id: 6, date: "2026-08-05", prayer: "Fajr", time: "05:12", action: "Shutdown", status: "cancelled" },
  { id: 7, date: "2026-08-05", prayer: "Maghrib", time: "18:47", action: "Shutdown", status: "completed" },
  { id: 8, date: "2026-08-04", prayer: "Dhuhr", time: "12:39", action: "Shutdown", status: "skipped" },
];

export const STATUS_TONE = {
  completed: "success",
  cancelled: "danger",
  skipped: "muted",
};

STATUS_TONE.reminder = "accent";
STATUS_TONE.started = "warning";
STATUS_TONE.scheduled = "warning";
STATUS_TONE.executed = "danger";