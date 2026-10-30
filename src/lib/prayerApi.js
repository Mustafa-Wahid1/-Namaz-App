/**
 * Thin client for the public AlAdhan prayer times API.
 * Kept framework-agnostic so a future Electron/Tauri build can reuse it as-is.
 */

const BASE_URL = "https://api.aladhan.com/v1/timingsByCity";

export const METHOD_IDS = {
  mwl: 3,
  isna: 2,
  egypt: 5,
  karachi: 1,
  makkah: 4,
};

export const SCHOOL_IDS = {
  standard: 0,
  hanafi: 1,
};

export const HIGH_LATITUDE_IDS = {
  midnight: 1,
  seventh: 2,
  angle: 3,
};

export const PRAYER_KEYS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

/** Formats a Date as DD-MM-YYYY, as required by the API. */
export function toApiDate(date = new Date()) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}-${m}-${date.getFullYear()}`;
}

/** Normalises "05:14 (PKT)" -> "05:14". */
function cleanTime(raw) {
  return String(raw ?? "").trim().slice(0, 5);
}

export async function fetchPrayerTimes(
  { city, country, date = new Date(), calculationMethod, asrMethod, highLatitude } = {},
  { signal } = {},
) {
  if (!city || !country) throw new Error("A city and country are required.");

  const params = new URLSearchParams({
    city,
    country,
    method: String(METHOD_IDS[calculationMethod] ?? METHOD_IDS.mwl),
    school: String(SCHOOL_IDS[asrMethod] ?? SCHOOL_IDS.standard),
  });
  if (HIGH_LATITUDE_IDS[highLatitude]) {
    params.set("latitudeAdjustmentMethod", String(HIGH_LATITUDE_IDS[highLatitude]));
  }

  const res = await fetch(`${BASE_URL}/${toApiDate(date)}?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Prayer service responded with ${res.status}`);

  const json = await res.json();
  const timings = json?.data?.timings;
  if (!timings) throw new Error("Prayer times were not available for this location.");

  const times = {};
  for (const key of PRAYER_KEYS) {
    if (!timings[key]) throw new Error("Prayer times were incomplete for this location.");
    times[key] = cleanTime(timings[key]);
  }

  const hijriData = json?.data?.date?.hijri;
  const hijri = hijriData
    ? `${hijriData.day} ${hijriData.month?.en ?? ""} ${hijriData.year}`.trim()
    : null;

  return { times, hijri, timezone: json?.data?.meta?.timezone ?? null };
}
