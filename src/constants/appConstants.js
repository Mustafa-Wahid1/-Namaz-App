export const APP_NAME = "Salah Shutdown";
export const APP_VERSION = "1.0.0";
export const APP_DESCRIPTION =
  "A calm, prayer-aware productivity companion that helps you step away from your Windows PC at the right time.";

export const WARNING_OPTIONS = [
  { value: 1, label: "1 minute before" },
  { value: 3, label: "3 minutes before" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
];

export const CALCULATION_METHODS = [
  { value: "mwl", label: "Muslim World League" },
  { value: "isna", label: "ISNA (North America)" },
  { value: "egypt", label: "Egyptian General Authority" },
  { value: "karachi", label: "University of Islamic Sciences, Karachi" },
  { value: "makkah", label: "Umm al-Qura, Makkah" },
];

export const ASR_METHODS = [
  { value: "standard", label: "Standard (Shafi, Maliki, Hanbali)" },
  { value: "hanafi", label: "Hanafi" },
];

export const HIGH_LATITUDE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "midnight", label: "Middle of the night" },
  { value: "seventh", label: "One-seventh of the night" },
  { value: "angle", label: "Angle based" },
];

export const TIME_FORMATS = [
  { value: "12h", label: "12-hour (05:14 AM)" },
  { value: "24h", label: "24-hour (05:14)" },
];

export const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

export const HISTORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "skipped", label: "Skipped" },
  { value: "reminder", label: "Reminders" },
  { value: "focus", label: "Focus Mode" },
];

export const PRE_REMINDER_OPTIONS = [
  { value: 0, label: "Off" },
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 20, label: "20 minutes before" },
];

export const DEFAULT_SETTINGS = {
  city: "Karachi",
  country: "Pakistan",
  timeFormat: "12h",
  startWithWindows: true,
  calculationMethod: "karachi",
  asrMethod: "hanafi",
  highLatitude: "none",
  prayerNotification: true,
  shutdownWarning: true,
  desktopNotifications: true,
  sound: false,
  compactMode: false,
  animations: true,
  requireConfirmation: true,
  emergencyCancel: true,
  warningMinutes: 5,
};

/** Mobile / Focus Mode defaults are merged into DEFAULT_SETTINGS above at runtime. */
Object.assign(DEFAULT_SETTINGS, {
  focusModeEnabled: true,
  focusAutoPrompt: true,
  preReminderMinutes: 10,
  vibration: true,
});

/** Desktop (Electron) defaults. */
Object.assign(DEFAULT_SETTINGS, {
  minimizeToTray: true,
});