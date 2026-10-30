/**
 * Safe access to the Electron bridge (`window.electronAPI`).
 *
 * In a normal browser nothing is exposed, so every helper degrades to a no-op
 * that reports `unavailable` — the UI never crashes and never pretends a real
 * Windows shutdown happened.
 */

export function isElectron() {
  return typeof window !== "undefined" && Boolean(window.electronAPI?.isElectron);
}

export function getElectronAPI() {
  return isElectron() ? window.electronAPI : null;
}

const unavailable = { ok: false, error: "ELECTRON_UNAVAILABLE" };

export const desktop = {
  isElectron,
  async scheduleShutdown(seconds, prayer, prayerTime) {
    const api = getElectronAPI();
    if (!api) return unavailable;
    const safeSeconds = Math.floor(Number(seconds));
    if (!Number.isFinite(safeSeconds) || safeSeconds <= 0) return { ok: false, error: "INVALID_DELAY" };
    try {
      return await api.scheduleShutdown(safeSeconds, prayer, prayerTime);
    } catch {
      return { ok: false, error: "IPC_FAILED" };
    }
  },
  async cancelShutdown() {
    const api = getElectronAPI();
    if (!api) return unavailable;
    try {
      return await api.cancelShutdown();
    } catch {
      return { ok: false, error: "IPC_FAILED" };
    }
  },
  async getShutdownStatus() {
    const api = getElectronAPI();
    if (!api) return null;
    try {
      return await api.getShutdownStatus();
    } catch {
      return null;
    }
  },
  async testShutdown(seconds) {
    const api = getElectronAPI();
    if (!api) return unavailable;
    try {
      return await api.testShutdown(Math.floor(Number(seconds)));
    } catch {
      return { ok: false, error: "IPC_FAILED" };
    }
  },
  async setStartWithWindows(enabled) {
    const api = getElectronAPI();
    if (!api) return false;
    try {
      return await api.setStartWithWindows(enabled);
    } catch {
      return false;
    }
  },
  async setMinimizeToTray(enabled) {
    const api = getElectronAPI();
    if (!api) return false;
    try {
      return await api.setMinimizeToTray(enabled);
    } catch {
      return false;
    }
  },
  onShutdownStatus(callback) {
    const api = getElectronAPI();
    if (!api?.onShutdownStatus) return () => {};
    return api.onShutdownStatus(callback);
  },
  onTrayCancel(callback) {
    const api = getElectronAPI();
    if (!api?.onTrayCancel) return () => {};
    return api.onTrayCancel(callback);
  },
};

export const SHUTDOWN_ERROR_MESSAGES = {
  ELECTRON_UNAVAILABLE: "Desktop features are only available in the Salah Shutdown Windows app.",
  INVALID_DELAY: "That shutdown delay is not valid, so nothing was scheduled.",
  INVALID_PRAYER: "The prayer details were invalid, so nothing was scheduled.",
  SCHEDULE_FAILED: "Unable to schedule Windows shutdown. Please check the application permissions.",
  CANCEL_FAILED: "Unable to cancel the Windows shutdown. Please try again.",
  IPC_FAILED: "The desktop service did not respond. Nothing was scheduled.",
  UNTRUSTED_SENDER: "That request was rejected for security reasons.",
};
