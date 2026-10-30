/**
 * preload.cjs — the only bridge between the React renderer and Electron.
 * Runs sandboxed: it may use ipcRenderer/contextBridge only, no Node APIs are
 * forwarded to the page. Every exposed method maps to one fixed IPC channel.
 */
const { contextBridge, ipcRenderer } = require("electron");

const invoke = (channel, payload) => ipcRenderer.invoke(channel, payload);

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,

  /** Schedule a real Windows shutdown. seconds must be an integer. */
  scheduleShutdown: (seconds, prayer, prayerTime) =>
    invoke("shutdown:schedule", {
      seconds: Number(seconds),
      prayer: String(prayer ?? ""),
      prayerTime: String(prayerTime ?? ""),
    }),

  /** Abort a pending Windows shutdown. */
  cancelShutdown: () => invoke("shutdown:cancel"),

  /** Read the current schedule state. */
  getShutdownStatus: () => invoke("shutdown:status"),

  /** Dry-run: validates the request and reports what would happen. Never shuts down. */
  testShutdown: (seconds) => invoke("shutdown:test", { seconds: Number(seconds) }),

  /** Native Windows toast. Title/body are plain strings. */
  notify: (title, body) => invoke("app:notify", { title: String(title ?? ""), body: String(body ?? "") }),

  /** Launch on Windows startup. */
  setStartWithWindows: (enabled) => invoke("app:set-startup", { enabled: Boolean(enabled) }),
  getStartWithWindows: () => invoke("app:get-startup"),

  /** Minimise-to-tray preference. */
  setMinimizeToTray: (enabled) => invoke("app:set-minimize-to-tray", { enabled: Boolean(enabled) }),

  /** Subscribe to main-process shutdown state changes. Returns an unsubscribe fn. */
  onShutdownStatus: (callback) => {
    if (typeof callback !== "function") return () => {};
    const handler = (_event, status) => callback(status);
    ipcRenderer.on("shutdown:status-changed", handler);
    return () => ipcRenderer.removeListener("shutdown:status-changed", handler);
  },

  /** Tray "Cancel shutdown" clicks. */
  onTrayCancel: (callback) => {
    if (typeof callback !== "function") return () => {};
    const handler = () => callback();
    ipcRenderer.on("tray:cancel-shutdown", handler);
    return () => ipcRenderer.removeListener("tray:cancel-shutdown", handler);
  },
});
