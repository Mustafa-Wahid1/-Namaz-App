/**
 * Device-sync contract.
 *
 * The web build persists everything locally, but every syncable value is
 * collected here so a future backend/auth layer (or the Electron/Tauri desktop
 * build) can push and pull the exact same shape without touching UI code.
 */

export const SYNC_VERSION = 1;

export function buildSyncSnapshot({ settings, shutdownToggles, history, notifications }) {
  return {
    version: SYNC_VERSION,
    updatedAt: new Date().toISOString(),
    location: { city: settings?.city ?? null, country: settings?.country ?? null },
    prayerPreferences: {
      calculationMethod: settings?.calculationMethod,
      asrMethod: settings?.asrMethod,
      highLatitude: settings?.highLatitude,
      timeFormat: settings?.timeFormat,
    },
    shutdownPreferences: {
      perPrayer: shutdownToggles ?? {},
      warningMinutes: settings?.warningMinutes,
      requireConfirmation: settings?.requireConfirmation,
      emergencyCancel: settings?.emergencyCancel,
    },
    notificationPreferences: {
      prayerNotification: settings?.prayerNotification,
      shutdownWarning: settings?.shutdownWarning,
      desktopNotifications: settings?.desktopNotifications,
      preReminderMinutes: settings?.preReminderMinutes,
      sound: settings?.sound,
      vibration: settings?.vibration,
    },
    focusMode: {
      enabled: settings?.focusModeEnabled,
      autoPrompt: settings?.focusAutoPrompt,
    },
    history: history ?? [],
    notifications: notifications ?? [],
  };
}

/** Flattens a snapshot back into the app's local state shape. */
export function applySyncSnapshot(snapshot, currentSettings = {}) {
  if (!snapshot || snapshot.version !== SYNC_VERSION) return null;
  return {
    settings: {
      ...currentSettings,
      ...snapshot.location,
      ...snapshot.prayerPreferences,
      ...snapshot.notificationPreferences,
      warningMinutes: snapshot.shutdownPreferences?.warningMinutes,
      requireConfirmation: snapshot.shutdownPreferences?.requireConfirmation,
      emergencyCancel: snapshot.shutdownPreferences?.emergencyCancel,
      focusModeEnabled: snapshot.focusMode?.enabled,
      focusAutoPrompt: snapshot.focusMode?.autoPrompt,
    },
    shutdownToggles: snapshot.shutdownPreferences?.perPrayer ?? {},
    history: snapshot.history ?? [],
    notifications: snapshot.notifications ?? [],
  };
}
