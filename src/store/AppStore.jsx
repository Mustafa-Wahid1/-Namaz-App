import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { INITIAL_PRAYERS, HIJRI_DATE, dayKey, prayerDate, getNextPrayer, getPrayerStatuses, formatTime } from "@/data/prayers";
import { HISTORY_DATA } from "@/data/history";
import { DEFAULT_SETTINGS } from "@/constants/appConstants";
import { useToasts } from "@/hooks/useToasts";
import { useTheme } from "@/hooks/useTheme";
import { usePersistentState } from "@/hooks/usePersistentState";
import { fetchPrayerTimes } from "@/lib/prayerApi";
import { playChime, requestNotificationPermission, showSystemNotification, vibrate } from "@/lib/notify";
import { desktop, isElectron, SHUTDOWN_ERROR_MESSAGES } from "@/lib/electron";

const AppContext = createContext(null);

const DEFAULT_TOGGLES = Object.fromEntries(INITIAL_PRAYERS.map((p) => [p.id, p.shutdown]));
const MAX_NOTIFICATIONS = 30;
const MAX_HISTORY = 200;

const scheduleKey = (prayerId, date = new Date()) => `${dayKey(date)}:${prayerId}`;

export function AppStoreProvider({ children }) {
  const [settings, setSettings, settingsHydrated] = usePersistentState("settings", DEFAULT_SETTINGS);
  const [shutdownToggles, setShutdownToggles] = usePersistentState("prayer-shutdown", DEFAULT_TOGGLES);
  const [autoShutdown, setAutoShutdownState] = usePersistentState("auto-shutdown", true);
  const [history, setHistory] = usePersistentState("history", HISTORY_DATA);
  const [notifications, setNotifications] = usePersistentState("notifications", []);
  const [skippedKeys, setSkippedKeys] = usePersistentState("skipped-shutdowns", []);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [times, setTimes] = useState(null);
  const [hijri, setHijri] = useState(HIJRI_DATE);
  const [prayerError, setPrayerError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);
  const [today, setToday] = useState(() => dayKey(new Date()));
  const [activeWarning, setActiveWarning] = useState(null);
  const [focusSession, setFocusSession] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [shutdownStatus, setShutdownStatus] = useState(null);

  const { toasts, addToast, dismissToast } = useToasts();
  const { theme, resolvedTheme, setTheme } = useTheme();

  /* ---------------------------------------------------------------- prayers */

  const prayers = useMemo(
    () =>
      INITIAL_PRAYERS.map((p) => ({
        ...p,
        time: times?.[p.name] ?? p.time,
        shutdown: shutdownToggles[p.id] ?? p.shutdown,
      })),
    [times, shutdownToggles],
  );

  useEffect(() => {
    if (!settingsHydrated) return;
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setPrayerError(null);

    fetchPrayerTimes(
      {
        city: settings.city,
        country: settings.country,
        date: new Date(),
        calculationMethod: settings.calculationMethod,
        asrMethod: settings.asrMethod,
        highLatitude: settings.highLatitude,
      },
      { signal: controller.signal },
    )
      .then((result) => {
        if (cancelled) return;
        setTimes(result.times);
        if (result.hijri) setHijri(result.hijri);
      })
      .catch((error) => {
        if (cancelled || error.name === "AbortError") return;
        setPrayerError(error.message || "Could not load prayer times.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    settingsHydrated,
    settings.city,
    settings.country,
    settings.calculationMethod,
    settings.asrMethod,
    settings.highLatitude,
    today,
    refreshToken,
  ]);

  const refreshPrayerTimes = useCallback(() => setRefreshToken((t) => t + 1), []);

  useEffect(() => {
    document.documentElement.classList.toggle("no-anim", !settings.animations);
  }, [settings.animations]);

  /* ------------------------------------------------------------ mutations */

  const togglePrayerShutdown = useCallback((id) => {
    setShutdownToggles((prev) => ({ ...prev, [id]: !(prev[id] ?? false) }));
  }, [setShutdownToggles]);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, [setSettings]);

  const changeTheme = useCallback(
    (next) => {
      setTheme(next);
      addToast("Theme changed", { description: `Appearance set to ${next}.`, tone: "info" });
    },
    [setTheme, addToast],
  );

  const addHistoryEntry = useCallback(
    (entry) => {
      setHistory((prev) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            date: dayKey(new Date()),
            action: "Shutdown",
            ...entry,
          },
          ...prev,
        ].slice(0, MAX_HISTORY),
      );
    },
    [setHistory],
  );

  const clearHistory = useCallback(() => setHistory([]), [setHistory]);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const pushNotification = useCallback(
    (title, body, tone = "info") => {
      setNotifications((prev) =>
        [{ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, title, body, tone, at: new Date().toISOString(), read: false }, ...prev].slice(
          0,
          MAX_NOTIFICATIONS,
        ),
      );
      addToast(title, { description: body, tone: tone === "info" ? "info" : tone });
      const s = settingsRef.current;
      if (s.desktopNotifications) showSystemNotification(title, body);
      if (s.sound) playChime();
      if (s.vibration) vibrate();
    },
    [addToast, setNotifications],
  );

  const markNotificationsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    [setNotifications],
  );
  const clearNotifications = useCallback(() => setNotifications([]), [setNotifications]);

  const toggleAutoShutdown = useCallback(
    (next) => {
      setAutoShutdownState(next);
      if (!next) setActiveWarning(null);
      // Turning automation off must also abort any pending Windows shutdown.
      if (!next) desktop.cancelShutdown();
      addToast(next ? "Automatic shutdown enabled" : "Automatic shutdown disabled", {
        tone: next ? "success" : "warning",
        description: next
          ? "Your PC will power down around the selected prayers."
          : "No shutdowns will be scheduled until you turn it back on.",
      });
    },
    [addToast, setAutoShutdownState],
  );

  useEffect(() => {
    if (settings.desktopNotifications) requestNotificationPermission();
  }, [settings.desktopNotifications]);

  /* ------------------------------------------------------------- schedule */

  const upcomingShutdowns = useMemo(() => {
    const now = new Date();
    return prayers
      .filter((p) => p.shutdown && !skippedKeys.includes(scheduleKey(p.id, now)))
      .map((p) => ({ prayer: p, target: prayerDate(p.time, now) }))
      .filter((item) => item.target.getTime() > now.getTime() - 1000)
      .sort((a, b) => a.target - b.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayers, skippedKeys, today]);

  const nextShutdown = useMemo(() => {
    if (!autoShutdown) return null;
    if (upcomingShutdowns.length) return upcomingShutdowns[0];
    const enabled = prayers.filter((p) => p.shutdown);
    return enabled.length ? getNextPrayer(enabled) : null;
  }, [autoShutdown, upcomingShutdowns, prayers]);

  const handledRef = useRef(new Set());
  const notifiedRef = useRef(new Set());
  const stateRef = useRef({});
  stateRef.current = { prayers, autoShutdown, skippedKeys, settings, activeWarning };

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const key = dayKey(now);
      setToday((prev) => (prev === key ? prev : key));

      const { prayers: list, autoShutdown: auto, skippedKeys: skipped, settings: s, activeWarning: warning } = stateRef.current;
      if (!list?.length) return;

      // Pre-prayer reminders (mobile-friendly "prayer is approaching" alerts)
      const preMs = (Number(s.preReminderMinutes) || 0) * 60_000;
      if (s.prayerNotification && preMs > 0) {
        for (const prayer of list) {
          const target = prayerDate(prayer.time, now).getTime();
          const remaining = target - now.getTime();
          const rKey = `pre:${scheduleKey(prayer.id, now)}`;
          if (remaining > 0 && remaining <= preMs && !notifiedRef.current.has(rKey)) {
            notifiedRef.current.add(rKey);
            addHistoryEntry({
              prayer: prayer.name,
              time: prayer.time,
              action: "Reminder",
              status: "reminder",
            });
            pushNotification(
              `🕌 ${prayer.name} is approaching`,
              `Prepare for Salah — ${Math.max(1, Math.ceil(remaining / 60_000))} minute(s) left.`,
              "info",
            );
          }
        }
      }

      // Prayer-time notifications
      if (s.prayerNotification) {
        for (const prayer of list) {
          const target = prayerDate(prayer.time, now).getTime();
          const diff = now.getTime() - target;
          const nKey = `notify:${scheduleKey(prayer.id, now)}`;
          if (diff >= 0 && diff < 60_000 && !notifiedRef.current.has(nKey)) {
            notifiedRef.current.add(nKey);
            pushNotification(
              `${prayer.name} time`,
              `It's time for ${prayer.name} (${formatTime(prayer.time, s.timeFormat)}).`,
              "info",
            );
          }
        }
      }

      if (!auto) {
        if (warning) setActiveWarning(null);
        return;
      }

      const warnMs = (Number(s.warningMinutes) || 5) * 60_000;

      // Fire the scheduled shutdown once the prayer time is reached.
      if (warning) {
        const remaining = warning.target - now.getTime();
        if (remaining <= 0) {
          const sKey = warning.key;
          if (!handledRef.current.has(sKey)) {
            handledRef.current.add(sKey);
            addHistoryEntry({ prayer: warning.prayerName, time: warning.time, status: "completed" });
            pushNotification(
              "Shutdown completed",
              `${warning.prayerName} shutdown ran as scheduled (simulated in the web app).`,
              "success",
            );
          }
          setActiveWarning(null);
          return;
        }
        return;
      }

      // Arm a warning when the next enabled prayer enters the warning window.
      for (const prayer of list) {
        if (!prayer.shutdown) continue;
        const sKey = scheduleKey(prayer.id, now);
        if (skipped.includes(sKey) || handledRef.current.has(sKey)) continue;
        const target = prayerDate(prayer.time, now).getTime();
        const remaining = target - now.getTime();
        if (remaining > 0 && remaining <= warnMs) {
          setActiveWarning({
            key: sKey,
            prayerId: prayer.id,
            prayerName: prayer.name,
            time: prayer.time,
            target,
          });
          if (s.shutdownWarning) {
            pushNotification(
              `${prayer.name} is near`,
              `Your shutdown starts in ${Math.max(1, Math.ceil(remaining / 60_000))} minute(s).`,
              "warning",
            );
          }
          break;
        }
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [addHistoryEntry, pushNotification]);

  const cancelShutdown = useCallback(
    (warning = stateRef.current.activeWarning) => {
      if (!warning) return;
      handledRef.current.add(warning.key);
      setSkippedKeys((prev) => [...new Set([...prev, warning.key])].slice(-60));
      addHistoryEntry({ prayer: warning.prayerName, time: warning.time, status: "cancelled" });
      pushNotification("Shutdown cancelled", `${warning.prayerName} shutdown was cancelled.`, "warning");
      setActiveWarning(null);
      // Abort the real Windows schedule too (no-op in the browser).
      desktop.cancelShutdown().then((result) => {
        if (result && result.ok === false && result.error === "CANCEL_FAILED") {
          addToast("Cancellation failed", { tone: "warning", description: SHUTDOWN_ERROR_MESSAGES.CANCEL_FAILED });
        }
      });
    },
    [addHistoryEntry, pushNotification, setSkippedKeys, addToast],
  );

  const skipShutdown = useCallback(
    (warning = stateRef.current.activeWarning) => {
      if (!warning) return;
      handledRef.current.add(warning.key);
      setSkippedKeys((prev) => [...new Set([...prev, warning.key])].slice(-60));
      addHistoryEntry({ prayer: warning.prayerName, time: warning.time, status: "skipped" });
      pushNotification("Shutdown skipped", `${warning.prayerName} shutdown was skipped this time.`, "info");
      setActiveWarning(null);
      desktop.cancelShutdown();
    },
    [addHistoryEntry, pushNotification, setSkippedKeys],
  );

  /* ------------------------------------------------------- desktop (Electron) */

  useEffect(() => {
    if (!isElectron()) return undefined;
    setIsDesktop(true);
    let alive = true;
    desktop.getShutdownStatus().then((status) => {
      if (alive && status) setShutdownStatus(status);
    });
    const offStatus = desktop.onShutdownStatus((status) => setShutdownStatus(status));
    const offTray = desktop.onTrayCancel(() => {
      const warning = stateRef.current.activeWarning;
      if (warning) cancelShutdown(warning);
      else addToast("Shutdown cancelled", { tone: "warning", description: "Cancelled from the system tray." });
    });
    return () => {
      alive = false;
      offStatus?.();
      offTray?.();
    };
  }, [cancelShutdown, addToast]);

  // Keep the "Start with Windows" preference in sync with the OS setting.
  useEffect(() => {
    if (!settingsHydrated || !isElectron()) return;
    desktop.setStartWithWindows(Boolean(settings.startWithWindows));
  }, [settingsHydrated, settings.startWithWindows]);

  /**
   * Schedules the REAL Windows shutdown. Only ever called from an explicit
   * user confirmation (or when the user disabled the confirmation step).
   */
  const confirmRealShutdown = useCallback(
    async (warning = stateRef.current.activeWarning) => {
      if (!warning) return { ok: false, error: "NO_SCHEDULE" };
      if (!stateRef.current.autoShutdown) return { ok: false, error: "AUTOMATION_OFF" };
      if (!isElectron()) {
        addToast("Desktop app required", {
          tone: "info",
          description: SHUTDOWN_ERROR_MESSAGES.ELECTRON_UNAVAILABLE,
        });
        return { ok: false, error: "ELECTRON_UNAVAILABLE" };
      }
      const seconds = Math.max(10, Math.round((warning.target - Date.now()) / 1000));
      const result = await desktop.scheduleShutdown(seconds, warning.prayerName, warning.time);
      if (result?.ok) {
        setShutdownStatus(result.status ?? null);
        addHistoryEntry({ prayer: warning.prayerName, time: warning.time, status: "scheduled", action: "Shutdown scheduled" });
        pushNotification(
          "Shutdown scheduled",
          `Windows will shut down for ${warning.prayerName} in ${Math.ceil(seconds / 60)} minute(s).`,
          "warning",
        );
      } else {
        addToast("Shutdown not scheduled", {
          tone: "warning",
          description: SHUTDOWN_ERROR_MESSAGES[result?.error] ?? SHUTDOWN_ERROR_MESSAGES.SCHEDULE_FAILED,
        });
      }
      return result;
    },
    [addHistoryEntry, addToast, pushNotification],
  );

  // When the user has opted out of the confirmation step, arm the real
  // Windows shutdown as soon as the warning window opens.
  const armedRef = useRef(null);
  useEffect(() => {
    if (!isDesktop || !activeWarning || !autoShutdown) return;
    if (settings.requireConfirmation) return;
    if (armedRef.current === activeWarning.key) return;
    armedRef.current = activeWarning.key;
    confirmRealShutdown(activeWarning);
  }, [isDesktop, activeWarning, autoShutdown, settings.requireConfirmation, confirmRealShutdown]);

  // Safety net: a real Windows schedule must never outlive the settings that
  // created it. Turning automation off, or switching that prayer's toggle off,
  // aborts the pending `shutdown.exe` immediately.
  useEffect(() => {
    if (!isDesktop || !shutdownStatus?.scheduled) return;
    const scheduledPrayer = prayers.find((p) => p.name === shutdownStatus.prayer);
    const stillWanted = autoShutdown && (scheduledPrayer ? scheduledPrayer.shutdown : true);
    if (stillWanted) return;
    armedRef.current = null;
    desktop.cancelShutdown().then((result) => {
      if (result?.ok) {
        setShutdownStatus(result.status ?? null);
        setActiveWarning(null);
        pushNotification(
          "Shutdown cancelled",
          `${shutdownStatus.prayer ?? "Scheduled"} shutdown was aborted because automation was turned off.`,
          "warning",
        );
      } else if (result?.error) {
        addToast("Cancellation failed", {
          tone: "warning",
          description: SHUTDOWN_ERROR_MESSAGES[result.error] ?? SHUTDOWN_ERROR_MESSAGES.CANCEL_FAILED,
        });
      }
    });
  }, [isDesktop, shutdownStatus, autoShutdown, prayers, addToast, pushNotification]);

  const snoozeNextShutdown = useCallback(() => {
    const item = upcomingShutdowns[0];
    if (!item) {
      addToast("Nothing scheduled", { tone: "info", description: "No upcoming shutdown to skip." });
      return;
    }
    skipShutdown({
      key: scheduleKey(item.prayer.id),
      prayerId: item.prayer.id,
      prayerName: item.prayer.name,
      time: item.prayer.time,
      target: item.target.getTime(),
    });
  }, [upcomingShutdowns, skipShutdown, addToast]);

  const statuses = useMemo(() => getPrayerStatuses(prayers, new Date()), [prayers, activeWarning, today]);

  /* ----------------------------------------------------------- focus mode */

  const startFocus = useCallback(
    (prayer, target) => {
      if (!prayer) return;
      setFocusSession({
        prayerId: prayer.id,
        prayerName: prayer.name,
        time: prayer.time,
        target: target ? new Date(target).getTime() : prayerDate(prayer.time).getTime(),
        startedAt: Date.now(),
      });
      addHistoryEntry({
        prayer: prayer.name,
        time: prayer.time,
        action: "Focus Mode",
        status: "started",
      });
    },
    [addHistoryEntry],
  );

  const completeFocus = useCallback(() => {
    setFocusSession((current) => {
      if (current) {
        addHistoryEntry({
          prayer: current.prayerName,
          time: current.time,
          action: "Focus Mode",
          status: "completed",
        });
        addToast("Salah completed", { tone: "success", description: "May Allah accept it." });
      }
      return null;
    });
  }, [addHistoryEntry, addToast]);

  const exitFocus = useCallback(() => setFocusSession(null), []);

  const value = useMemo(
    () => ({
      prayers,
      prayerStatuses: statuses,
      togglePrayerShutdown,
      hijri,
      prayerError,
      refreshPrayerTimes,
      history,
      addHistoryEntry,
      clearHistory,
      settings,
      updateSetting,
      autoShutdown,
      toggleAutoShutdown,
      nextShutdown,
      activeWarning,
      cancelShutdown,
      skipShutdown,
      confirmRealShutdown,
      isDesktop,
      shutdownStatus,
      snoozeNextShutdown,
      focusSession,
      startFocus,
      completeFocus,
      exitFocus,
      notifications,
      pushNotification,
      markNotificationsRead,
      clearNotifications,
      sidebarCollapsed,
      setSidebarCollapsed,
      loading,
      toasts,
      addToast,
      dismissToast,
      theme,
      resolvedTheme,
      setTheme: changeTheme,
    }),
    [
      prayers,
      statuses,
      togglePrayerShutdown,
      hijri,
      prayerError,
      refreshPrayerTimes,
      history,
      addHistoryEntry,
      clearHistory,
      settings,
      updateSetting,
      autoShutdown,
      toggleAutoShutdown,
      nextShutdown,
      activeWarning,
      cancelShutdown,
      skipShutdown,
      confirmRealShutdown,
      isDesktop,
      shutdownStatus,
      snoozeNextShutdown,
      focusSession,
      startFocus,
      completeFocus,
      exitFocus,
      notifications,
      pushNotification,
      markNotificationsRead,
      clearNotifications,
      sidebarCollapsed,
      loading,
      toasts,
      addToast,
      dismissToast,
      theme,
      resolvedTheme,
      changeTheme,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppStoreProvider");
  return ctx;
}
