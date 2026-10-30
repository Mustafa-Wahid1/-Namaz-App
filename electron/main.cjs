/**
 * main.cjs — Electron main process for Salah Shutdown.
 *
 * Runs the TanStack Start/Nitro production server inside Electron,
 * then loads that local server in BrowserWindow.
 */

const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
  ipcMain,
  shell,
  nativeImage,
  dialog,
} = require("electron");

const path = require("path");
const fs = require("fs");
const http = require("http");

const shutdownManager = require("./shutdownManager.cjs");

const isDev = !app.isPackaged;
const DEV_URL =
  process.env.ELECTRON_START_URL || "http://localhost:8080";

let mainWindow = null;
let tray = null;
let quitting = false;
let minimizeToTray = true;

let productionServer = null;
let productionServerPort = null;

/* ---------------------------------------------------------- production server */

async function startProductionServer() {
  if (isDev) return null;

  if (productionServer) {
    return productionServerPort;
  }

  const serverEntry = path.join(
    process.resourcesPath,
    ".output",
    "server",
    "index.mjs",
  );

  if (!fs.existsSync(serverEntry)) {
    throw new Error(`Production server not found:\n${serverEntry}`);
  }

  /*
   * Nitro generates an ES module. Electron's main process is CommonJS,
   * so dynamically import the generated server.
   */
  const previousNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  const nitroModule = await import(
    `file://${serverEntry.replace(/\\/g, "/")}`
  );

  /*
   * Nitro's generated entry can expose either a default handler
   * or a listener depending on the preset/version.
   */
  const handler =
    nitroModule.default ||
    nitroModule.handler ||
    nitroModule.fetch;

  if (typeof handler !== "function") {
    throw new Error(
      "Could not find a valid Nitro production server handler.",
    );
  }

  const server = http.createServer(async (req, res) => {
    try {
      /*
       * Nitro's Node-style handler.
       */
      if (handler.length >= 2) {
        handler(req, res);
        return;
      }

      /*
       * Fallback for a Fetch-style handler.
       */
      const protocol = req.socket.encrypted ? "https" : "http";
      const host = req.headers.host || "127.0.0.1";

      const url = `${protocol}://${host}${req.url}`;

      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
      });

      const response = await handler(request);

      res.statusCode = response.status;

      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      const body = Buffer.from(await response.arrayBuffer());
      res.end(body);
    } catch (error) {
      console.error(
        "[salah-shutdown] production server error:",
        error,
      );

      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
      }

      res.end("Salah Shutdown server error.");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);

    server.listen(0, "127.0.0.1", () => {
      resolve();
    });
  });

  productionServer = server;
  productionServerPort = server.address().port;

  if (previousNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = previousNodeEnv;
  }

  console.log(
    `[salah-shutdown] Production server running at http://127.0.0.1:${productionServerPort}`,
  );

  return productionServerPort;
}

async function stopProductionServer() {
  if (!productionServer) return;

  await new Promise((resolve) => {
    productionServer.close(() => resolve());
  });

  productionServer = null;
  productionServerPort = null;
}

/* ---------------------------------------------------------- window */

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 380,
    minHeight: 600,
    show: false,
    backgroundColor: "#0b1512",
    title: "Salah Shutdown",
    icon: appIcon(),

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL(DEV_URL);
  } else {
    const url = `http://127.0.0.1:${productionServerPort}`;
    mainWindow.loadURL(url);
  }

  /*
   * Only allow our own application URL.
   */
  mainWindow.webContents.on("will-navigate", (event, url) => {
    let allowed = false;

    try {
      const parsed = new URL(url);

      if (isDev) {
        allowed = parsed.origin === new URL(DEV_URL).origin;
      } else {
        allowed =
          parsed.origin ===
          `http://127.0.0.1:${productionServerPort}`;
      }
    } catch {
      allowed = url.startsWith("file://");
    }

    if (!allowed) {
      event.preventDefault();
    }
  });

  /*
   * External HTTPS links open in the normal browser.
   */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });

  mainWindow.webContents.session.setPermissionRequestHandler(
    (_wc, permission, callback) => {
      callback(permission === "notifications");
    },
  );

  mainWindow.on("close", (event) => {
    if (!quitting && minimizeToTray) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* ---------------------------------------------------------- icon */

function appIcon() {
  const candidates = [
    path.join(__dirname, "..", "public", "favicon.ico"),
    path.join(
      process.resourcesPath || "",
      "public",
      "favicon.ico",
    ),
  ];

  const iconPath = candidates.find(
    (file) => file && fs.existsSync(file),
  );

  return iconPath
    ? nativeImage.createFromPath(iconPath)
    : nativeImage.createEmpty();
}

/* ---------------------------------------------------------- tray */

function buildTrayMenu() {
  const status = shutdownManager.getStatus();

  const statusLabel = status.scheduled
    ? `Scheduled: ${status.prayer} at ${status.prayerTime}`
    : status.cancelled
      ? "Shutdown status: Cancelled"
      : "Shutdown status: Not scheduled";

  return Menu.buildFromTemplate([
    {
      label: "Open Salah Shutdown",
      click: showWindow,
    },

    {
      label: "Cancel shutdown",
      enabled: status.scheduled,

      click: async () => {
        await shutdownManager.cancelShutdown();

        mainWindow?.webContents.send(
          "tray:cancel-shutdown",
        );

        notify(
          "Salah Shutdown",
          "Shutdown cancelled.",
        );
      },
    },

    {
      label: statusLabel,
      enabled: false,
    },

    {
      type: "separator",
    },

    {
      label: "Exit",
      click: () => {
        quitting = true;
        app.quit();
      },
    },
  ]);
}

function refreshTray() {
  if (!tray) return;

  const status = shutdownManager.getStatus();

  tray.setToolTip(
    status.scheduled
      ? `Salah Shutdown — ${status.prayer} shutdown scheduled`
      : "Salah Shutdown",
  );

  tray.setContextMenu(buildTrayMenu());
}

function createTray() {
  try {
    tray = new Tray(appIcon());

    tray.on("double-click", showWindow);

    refreshTray();
  } catch (error) {
    console.error(
      "[salah-shutdown] tray unavailable:",
      error.message,
    );
  }
}

function showWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
}

/* ---------------------------------------------------------- notifications */

function notify(title, body) {
  if (!Notification.isSupported()) {
    return false;
  }

  try {
    new Notification({
      title: String(title).slice(0, 120),
      body: String(body).slice(0, 300),
      icon: appIcon(),
    }).show();

    return true;
  } catch (error) {
    console.error(
      "[salah-shutdown] notification failed:",
      error.message,
    );

    return false;
  }
}

/* ---------------------------------------------------------- IPC */

function registerIpc() {
  ipcMain.handle(
    "shutdown:schedule",
    async (event, payload) => {
      if (!isTrustedSender(event)) {
        return {
          ok: false,
          error: "UNTRUSTED_SENDER",
        };
      }

      const result =
        await shutdownManager.scheduleShutdown(
          payload || {},
        );

      if (result.ok) {
        notify(
          "Salah Shutdown",
          `${payload.prayer} — shutdown scheduled.`,
        );
      }

      refreshTray();

      return result;
    },
  );

  ipcMain.handle(
    "shutdown:cancel",
    async (event) => {
      if (!isTrustedSender(event)) {
        return {
          ok: false,
          error: "UNTRUSTED_SENDER",
        };
      }

      const result =
        await shutdownManager.cancelShutdown();

      if (result.ok && result.wasScheduled) {
        notify(
          "Salah Shutdown",
          "Shutdown cancelled.",
        );
      }

      refreshTray();

      return result;
    },
  );

  ipcMain.handle(
    "shutdown:status",
    (event) =>
      isTrustedSender(event)
        ? shutdownManager.getStatus()
        : {
            scheduled: false,
            supported: false,
          },
  );

  ipcMain.handle(
    "shutdown:test",
    (event, payload) => {
      if (!isTrustedSender(event)) {
        return {
          ok: false,
          error: "UNTRUSTED_SENDER",
        };
      }

      const seconds = Number(payload?.seconds);

      const valid =
        Number.isInteger(seconds) &&
        seconds >=
          shutdownManager.MIN_DELAY_SECONDS &&
        seconds <=
          shutdownManager.MAX_DELAY_SECONDS;

      return {
        ok: valid,
        dryRun: true,
        seconds,
        platform: process.platform,
        error: valid ? null : "INVALID_DELAY",
      };
    },
  );

  ipcMain.handle(
    "app:notify",
    (event, payload) => {
      if (!isTrustedSender(event)) {
        return false;
      }

      return notify(
        payload?.title ?? "Salah Shutdown",
        payload?.body ?? "",
      );
    },
  );

  ipcMain.handle(
    "app:set-startup",
    (event, payload) => {
      if (!isTrustedSender(event)) {
        return false;
      }

      const enabled = Boolean(payload?.enabled);

      if (
        process.platform === "win32" ||
        process.platform === "darwin"
      ) {
        app.setLoginItemSettings({
          openAtLogin: enabled,
          args: ["--hidden"],
        });
      }

      return app
        .getLoginItemSettings()
        .openAtLogin;
    },
  );

  ipcMain.handle(
    "app:get-startup",
    (event) =>
      isTrustedSender(event)
        ? app.getLoginItemSettings()
            .openAtLogin
        : false,
  );

  ipcMain.handle(
    "app:set-minimize-to-tray",
    (event, payload) => {
      if (!isTrustedSender(event)) {
        return minimizeToTray;
      }

      minimizeToTray = Boolean(
        payload?.enabled,
      );

      return minimizeToTray;
    },
  );
}

/* ---------------------------------------------------------- security */

function isTrustedSender(event) {
  return (
    Boolean(mainWindow) &&
    event.sender === mainWindow.webContents
  );
}

/* ---------------------------------------------------------- app startup */

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", showWindow);

  app.whenReady().then(async () => {
    try {
      shutdownManager.setStatePath(
        app.getPath("userData"),
      );

      shutdownManager.onChange(() => {
        refreshTray();

        mainWindow?.webContents.send(
          "shutdown:status-changed",
          shutdownManager.getStatus(),
        );
      });

      registerIpc();

      /*
       * Development:
       *   load http://localhost:8080
       *
       * Production:
       *   start .output/server/index.mjs
       *   load local Electron server
       */
      if (!isDev) {
        await startProductionServer();
      }

      createWindow();
      createTray();

      app.on("activate", () => {
        if (
          BrowserWindow.getAllWindows().length === 0
        ) {
          createWindow();
        }
      });
    } catch (error) {
      console.error(
        "[salah-shutdown] startup failed:",
        error,
      );

      dialog.showErrorBox(
        "Salah Shutdown",
        `Application failed to start.\n\n${error.message}`,
      );

      app.quit();
    }
  });

  app.on("window-all-closed", () => {
    if (
      process.platform !== "darwin" &&
      !minimizeToTray
    ) {
      app.quit();
    }
  });

  app.on("before-quit", async () => {
    quitting = true;

    try {
      await stopProductionServer();
    } catch (error) {
      console.error(
        "[salah-shutdown] server shutdown error:",
        error.message,
      );
    }
  });

  process.on("uncaughtException", (error) => {
    console.error(
      "[salah-shutdown] uncaught exception:",
      error.message,
    );

    if (mainWindow) {
      dialog.showErrorBox(
        "Salah Shutdown",
        "An unexpected error occurred. No shutdown was scheduled.",
      );
    }
  });
}
