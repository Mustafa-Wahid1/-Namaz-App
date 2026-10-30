# Salah Shutdown

**Protect your Salah. Step away from your screen.**

A prayer-aware companion for laptop and mobile.

- **Laptop / Desktop:** Prayer → Warning → Scheduled shutdown
- **Mobile:** Prayer → Reminder → Focus Mode → Step away

## Features

- Live prayer times from the public [AlAdhan API](https://aladhan.com/prayer-times-api), based on your saved city/country, calculation method, Asr method and high-latitude rule.
- Next-prayer detection with a countdown that updates every second.
- Per-prayer automatic shutdown toggles, configurable warning duration, and a real warning state with **Cancel** and **Continue (skip)**.
- Prayer reminders, pre-prayer reminders, shutdown warnings, optional chime and vibration — all respecting your notification settings and browser permissions.
- Mobile Salah dashboard plus a distraction-free **Focus Mode** with an "I'm Done" action.
- History of completed / cancelled / skipped shutdowns, reminders and Focus Mode sessions.
- Light / dark / system theme, persistent settings, and full responsive layout (desktop, tablet, Android, iPhone).

### Device limitations

This is a web app. It cannot power off a Windows laptop or a phone by itself.
Actual Windows shutdown is planned for an Electron/Tauri desktop build — the
scheduling engine in `src/store/AppStore.jsx` is already isolated so the
simulated shutdown can be swapped for a native call. On mobile, the app never
pretends to control the device; it reminds and encourages you to step away.

## Local development

Requires Node.js 20+ and npm.

```sh
git clone <this-repository-url>
cd salah-shutdown
npm install
npm run dev
```

The dev server prints a local URL (default `http://localhost:8080`).

```sh
npm run build    # production build
npm run start    # serve the production build
```

No environment variables, accounts or API keys are required — the prayer-times
API is public and all data is stored in the browser's `localStorage`.

## Project structure

```
src/
  components/   common, layout, dashboard, prayer, shutdown, mobile, settings
  constants/    app-wide options and default settings
  data/         prayer metadata, navigation, seed history
  hooks/        useCountdown, useCurrentTime, usePersistentState, useTheme, useToasts
  lib/          prayerApi (AlAdhan), notify (notifications/sound/vibration), syncSchema
  pages/        Dashboard, PrayerTimes, Shutdown, History, Settings
  routes/       TanStack Router file-based routes
  store/        AppStore — global state and the scheduling engine
```

## Future device sync

`src/lib/syncSchema.js` defines a single versioned snapshot (location, prayer
preferences, shutdown preferences, notification preferences, Focus Mode
settings and history) so a backend or auth layer can later sync laptop and
mobile without touching UI code. The web build persists that same data locally.

## Tech stack

TanStack Start (React + Vite), React 19, Tailwind CSS v4, lucide-react.

## Windows desktop app (Electron)

The browser build is unchanged — Electron is an additional, optional layer.

### Files

```
electron/
├── main.cjs             # window, tray, notifications, startup, validated IPC handlers
├── preload.cjs          # contextBridge — the only renderer↔main surface
└── shutdownManager.cjs  # the only module that runs shutdown.exe
src/lib/electron.js      # isElectron() + browser-safe desktop API wrapper
```

`.cjs` extensions are required because the project is an ES module package and a
sandboxed preload must be CommonJS.

### Scripts

```bash
npm run dev            # browser version (unchanged)
npm run electron:dev   # Vite dev server + Electron window
npm run electron:start # Electron against an existing build
npm run electron:build # production build + Salah-Shutdown-Setup.exe (release/)
```

New dev dependencies: `electron`, `electron-builder`, `concurrently`, `wait-on`.

### How React talks to Electron

React never touches Node. `preload.cjs` exposes a fixed list of methods on
`window.electronAPI` (`scheduleShutdown`, `cancelShutdown`, `getShutdownStatus`,
`testShutdown`, notifications, startup, tray). Each maps to one `ipcMain.handle`
channel in `main.cjs`, which validates the sender and every argument before
delegating to `shutdownManager.cjs`. `src/lib/electron.js` wraps all of this so
browser builds get safe no-ops (`isElectron()` returns `false`).

### How Salah times trigger a shutdown

The existing prayer engine in `src/store/AppStore.jsx` (Aladhan API + location
from Settings) arms a warning when an enabled prayer enters the configured
warning window. In Electron the warning modal shows **Confirm shutdown**; only
that explicit click calls `scheduleShutdown(seconds, prayer, prayerTime)`, which
runs `shutdown.exe /s /f /t <seconds>` via `execFile` (no shell, fixed args,
integer-validated delay between 10s and 24h). If the user disabled
"Require confirmation", the schedule is armed automatically when the warning opens.

### How cancellation works

"Cancel shutdown" (modal, tray menu, or turning Auto Shutdown off) runs
`shutdown.exe /a`, clears the persisted schedule state and records the event in
History. Duplicate schedules are impossible: any pending schedule is aborted
before a new one is created, and per-prayer keys prevent re-arming the same prayer.

### Security notes

`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`,
`webSecurity: true`. No `require`, `fs`, `shell`, `process` or `child_process` is
exposed to the renderer, there is no generic "run command" API, navigation is
restricted to local content (dev server origin in development), new windows are
denied and https links open in the system browser. Anything invalid — bad delay,
unknown prayer, untrusted sender, missing Electron — fails closed and no shutdown
is scheduled.
