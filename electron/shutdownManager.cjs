/**
 * shutdownManager.cjs — the ONLY place that talks to the Windows shutdown binary.
 *
 * Security rules enforced here:
 *  - No shell is ever used (execFile, not exec) => no shell/command injection.
 *  - The executable and every argument are fixed literals; the only dynamic value
 *    is an integer number of seconds that is validated before use.
 *  - Renderer input never reaches a command string.
 */
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const MAX_DELAY_SECONDS = 24 * 60 * 60; // 24h — Windows allows up to 315360000, we stay conservative
const MIN_DELAY_SECONDS = 10; // never allow an "instant" surprise shutdown

const SHUTDOWN_BIN =
  process.platform === "win32"
    ? path.join(process.env.SystemRoot || "C:\\Windows", "System32", "shutdown.exe")
    : null;

/** In-memory + on-disk schedule state. */
let state = {
  scheduled: false,
  prayer: null,
  prayerTime: null,
  shutdownAt: null, // ISO string
  cancelled: false,
  simulated: false,
  updatedAt: new Date().toISOString(),
};

let stateFile = null;
const listeners = new Set();

function setStatePath(userDataPath) {
  stateFile = path.join(userDataPath, "shutdown-state.json");
  try {
    if (fs.existsSync(stateFile)) {
      const parsed = JSON.parse(fs.readFileSync(stateFile, "utf8"));
      if (parsed && typeof parsed === "object") state = { ...state, ...parsed };
    }
  } catch (error) {
    log("Could not read persisted shutdown state:", error.message);
  }
  // A schedule cannot survive a reboot/app restart reliably — treat stale ones as gone.
  if (state.scheduled && (!state.shutdownAt || new Date(state.shutdownAt).getTime() < Date.now())) {
    state = { ...state, scheduled: false, prayer: null, prayerTime: null, shutdownAt: null };
    persist();
  }
}

function persist() {
  if (!stateFile) return;
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), "utf8");
  } catch (error) {
    log("Could not persist shutdown state:", error.message);
  }
}

function log(...args) {
  // Main-process only. Never contains user secrets — just scheduling facts.
  console.log("[salah-shutdown]", ...args);
}

function emit() {
  const snapshot = getStatus();
  for (const listener of listeners) {
    try {
      listener(snapshot);
    } catch {
      /* listener errors must never break scheduling */
    }
  }
}

function onChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getStatus() {
  return { ...state, platform: process.platform, supported: process.platform === "win32" };
}

function isSafeLabel(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 40 && /^[\w :().-]+$/.test(value);
}

function runShutdownBinary(args) {
  return new Promise((resolve, reject) => {
    if (process.platform !== "win32") {
      // Non-Windows dev machines: never execute anything, report clearly instead.
      resolve({ simulated: true });
      return;
    }
    execFile(SHUTDOWN_BIN, args, { windowsHide: true, timeout: 15_000 }, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(stderr?.trim() || error.message));
        return;
      }
      resolve({ simulated: false });
    });
  });
}

/**
 * Schedule a real Windows shutdown.
 * @param {{seconds:number, prayer?:string, prayerTime?:string}} payload
 */
async function scheduleShutdown(payload) {
  const seconds = Number(payload?.seconds);
  if (!Number.isInteger(seconds) || seconds < MIN_DELAY_SECONDS || seconds > MAX_DELAY_SECONDS) {
    return { ok: false, error: "INVALID_DELAY", status: getStatus() };
  }
  const prayer = isSafeLabel(payload?.prayer) ? payload.prayer : null;
  const prayerTime = isSafeLabel(payload?.prayerTime) ? payload.prayerTime : null;
  if (!prayer || !prayerTime) {
    return { ok: false, error: "INVALID_PRAYER", status: getStatus() };
  }

  // Never stack timers: always abort any pending schedule first.
  if (state.scheduled) {
    try {
      await runShutdownBinary(["/a"]);
    } catch {
      /* nothing pending — /a fails harmlessly */
    }
  }

  try {
    const result = await runShutdownBinary(["/s", "/f", "/t", String(seconds)]);
    state = {
      scheduled: true,
      prayer,
      prayerTime,
      shutdownAt: new Date(Date.now() + seconds * 1000).toISOString(),
      cancelled: false,
      simulated: Boolean(result.simulated),
      updatedAt: new Date().toISOString(),
    };
    persist();
    emit();
    log("scheduled shutdown", { prayer, seconds, simulated: state.simulated });
    return { ok: true, status: getStatus() };
  } catch (error) {
    log("failed to schedule shutdown:", error.message);
    return { ok: false, error: "SCHEDULE_FAILED", status: getStatus() };
  }
}

/** Abort any pending Windows shutdown (`shutdown.exe /a`). */
async function cancelShutdown() {
  const wasScheduled = state.scheduled;
  try {
    await runShutdownBinary(["/a"]);
  } catch (error) {
    // /a errors when nothing is pending — only a real failure matters.
    if (wasScheduled) {
      log("failed to abort shutdown:", error.message);
      return { ok: false, error: "CANCEL_FAILED", status: getStatus() };
    }
  }
  state = {
    ...state,
    scheduled: false,
    cancelled: wasScheduled,
    shutdownAt: null,
    updatedAt: new Date().toISOString(),
  };
  persist();
  emit();
  log("cancelled shutdown", { wasScheduled });
  return { ok: true, wasScheduled, status: getStatus() };
}

module.exports = {
  MIN_DELAY_SECONDS,
  MAX_DELAY_SECONDS,
  setStatePath,
  scheduleShutdown,
  cancelShutdown,
  getStatus,
  onChange,
};
