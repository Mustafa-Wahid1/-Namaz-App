import { Sunrise, Sun, CloudSun, Sunset, Moon } from "lucide-react";

export const PRAYER_ICONS = {
  Fajr: Sunrise,
  Dhuhr: Sun,
  Asr: CloudSun,
  Maghrib: Sunset,
  Isha: Moon,
};

/**
 * Base prayer metadata. Times here are only fallbacks used before the
 * prayer-times API responds (or when it is unreachable).
 */
export const INITIAL_PRAYERS = [
  { id: "fajr", name: "Fajr", arabic: "الفجر", time: "05:14", label: "Dawn prayer", shutdown: true },
  { id: "dhuhr", name: "Dhuhr", arabic: "الظهر", time: "12:38", label: "Midday prayer", shutdown: true },
  { id: "asr", name: "Asr", arabic: "العصر", time: "16:05", label: "Afternoon prayer", shutdown: false },
  { id: "maghrib", name: "Maghrib", arabic: "المغرب", time: "18:42", label: "Sunset prayer", shutdown: true },
  { id: "isha", name: "Isha", arabic: "العشاء", time: "20:03", label: "Night prayer", shutdown: false },
];

export const HIJRI_DATE = "12 Rabiʿ al-Awwal 1447";

/** Local YYYY-MM-DD key for a date. */
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Converts "HH:MM" into a Date for today (or tomorrow if already passed). */
export function prayerDate(time, base = new Date()) {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export function formatTime(time, format = "12h") {
  const [h, m] = time.split(":").map(Number);
  if (format === "24h") return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Returns { prayer, target } for the next upcoming prayer. */
export function getNextPrayer(prayers, now = new Date()) {
  for (const prayer of prayers) {
    const target = prayerDate(prayer.time, now);
    if (target.getTime() > now.getTime()) return { prayer, target };
  }
  const first = prayers[0];
  const target = prayerDate(first.time, now);
  target.setDate(target.getDate() + 1);
  return { prayer: first, target };
}

export function getNextShutdown(prayers, now = new Date()) {
  const enabled = prayers.filter((p) => p.shutdown);
  if (enabled.length === 0) return null;
  return getNextPrayer(enabled, now);
}

/**
 * Per-prayer status for today: "completed" | "current" | "next" | "upcoming".
 * A prayer counts as "current" for 45 minutes after its time.
 */
export const CURRENT_WINDOW_MS = 45 * 60 * 1000;

export function getPrayerStatuses(prayers, now = new Date()) {
  const statuses = {};
  let nextAssigned = false;
  for (const prayer of prayers) {
    const t = prayerDate(prayer.time, now).getTime();
    const diff = now.getTime() - t;
    if (diff >= 0) {
      statuses[prayer.id] = diff <= CURRENT_WINDOW_MS ? "current" : "completed";
    } else if (!nextAssigned) {
      statuses[prayer.id] = "next";
      nextAssigned = true;
    } else {
      statuses[prayer.id] = "upcoming";
    }
  }
  if (!nextAssigned && prayers.length) statuses[prayers[0].id] = statuses[prayers[0].id] ?? "upcoming";
  return statuses;
}

export const STATUS_LABELS = {
  completed: "Completed",
  current: "Now",
  next: "Next",
  upcoming: "Upcoming",
};

export const STATUS_TONES = {
  completed: "success",
  current: "warning",
  next: "accent",
  upcoming: "muted",
};