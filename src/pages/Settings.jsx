import windowsApp from "@/assets/salah-shutdown-windows.zip.asset.json?url";
import { Sliders, Compass, Bell, Palette, Info, Download, Monitor, MoonStar } from "lucide-react";
import { useApp } from "@/store/AppStore";
import {
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  CALCULATION_METHODS,
  ASR_METHODS,
  HIGH_LATITUDE_OPTIONS,
  TIME_FORMATS,
  THEME_OPTIONS,
  PRE_REMINDER_OPTIONS,
  WARNING_OPTIONS,
} from "@/constants/appConstants";
import { desktop } from "@/lib/electron";
import SettingsSection from "@/components/settings/SettingsSection";
import SettingRow from "@/components/settings/SettingRow";
import Select from "@/components/common/Select";
import Toggle from "@/components/common/Toggle";
import ThemeToggle from "@/components/common/ThemeToggle";
import Button from "@/components/common/Button";

export default function Settings() {
  const { settings, prayers, history, updateSetting, addToast, theme, isDesktop, shutdownStatus } = useApp();

  const set = (key, value, message = "Preference updated") => {
    updateSetting(key, value);
    addToast(message);
  };

  const handleExport = () => {
    const payload = {
      app: APP_NAME,
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      settings,
      prayers,
      history,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${APP_NAME.toLowerCase().replace(/\s+/g, "-")}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast("Project data downloaded", {
      description: "Your settings, prayer list and history were exported as JSON.",
      tone: "success",
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <SettingsSection
        icon={Sliders}
        title="General"
        description="Location, formatting and startup"
      >
        <SettingRow label="City" description="Used to calculate today's prayer times">
          <input
            aria-label="City"
            value={settings.city}
            onChange={(e) => updateSetting("city", e.target.value)}
            onBlur={() => addToast("Preference updated", { description: "Location saved." })}
            className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </SettingRow>
        <SettingRow label="Country">
          <input
            aria-label="Country"
            value={settings.country}
            onChange={(e) => updateSetting("country", e.target.value)}
            onBlur={() => addToast("Preference updated", { description: "Location saved." })}
            className="w-full rounded-xl border border-input bg-card px-3 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          />
        </SettingRow>
        <SettingRow label="Time format">
          <Select
            label="Time format"
            value={settings.timeFormat}
            options={TIME_FORMATS}
            onChange={(v) => set("timeFormat", v)}
          />
        </SettingRow>
        <SettingRow
          label="Start with Windows"
          description="Launch silently on login (coming with the desktop build)"
        >
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.startWithWindows}
              onChange={(v) => set("startWithWindows", v)}
              label="Start with Windows"
            />
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        icon={Compass}
        title="Prayer calculation"
        description="Method and jurisprudence options"
      >
        <SettingRow label="Calculation method">
          <Select
            label="Calculation method"
            value={settings.calculationMethod}
            options={CALCULATION_METHODS}
            onChange={(v) => set("calculationMethod", v)}
          />
        </SettingRow>
        <SettingRow label="Asr method">
          <Select
            label="Asr method"
            value={settings.asrMethod}
            options={ASR_METHODS}
            onChange={(v) => set("asrMethod", v)}
          />
        </SettingRow>
        <SettingRow label="High latitude adjustment">
          <Select
            label="High latitude adjustment"
            value={settings.highLatitude}
            options={HIGH_LATITUDE_OPTIONS}
            onChange={(v) => set("highLatitude", v)}
          />
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={Bell} title="Notifications" description="How the app reaches you">
        {[
          {
            key: "prayerNotification",
            label: "Prayer notification",
            description: "Alert at each prayer time",
          },
          {
            key: "shutdownWarning",
            label: "Shutdown warning",
            description: "Warn before powering down",
          },
          {
            key: "desktopNotifications",
            label: "Desktop notifications",
            description: "Use native Windows toasts",
          },
          { key: "sound", label: "Sound", description: "Play a soft chime with alerts" },
        ].map((item) => (
          <SettingRow key={item.key} label={item.label} description={item.description}>
            <div className="flex sm:justify-end">
              <Toggle
                checked={settings[item.key]}
                onChange={(v) => set(item.key, v)}
                label={item.label}
              />
            </div>
          </SettingRow>
        ))}
        <SettingRow
          label="Pre-prayer reminder"
          description="Get a heads-up before each prayer (mobile friendly)"
        >
          <Select
            label="Pre-prayer reminder"
            value={settings.preReminderMinutes}
            options={PRE_REMINDER_OPTIONS}
            onChange={(v) => set("preReminderMinutes", Number(v))}
          />
        </SettingRow>
        <SettingRow
          label="Vibration"
          description="Vibrate with alerts where the device and browser allow it"
        >
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.vibration}
              onChange={(v) => set("vibration", v)}
              label="Vibration"
            />
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        icon={MoonStar}
        title="Focus Mode"
        description="A distraction-free Salah screen for your phone"
      >
        <SettingRow
          label="Enable Focus Mode"
          description="Show the Start Focus Mode action on mobile"
        >
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.focusModeEnabled}
              onChange={(v) => set("focusModeEnabled", v)}
              label="Enable Focus Mode"
            />
          </div>
        </SettingRow>
        <SettingRow
          label="Prompt before prayer"
          description="Show a gentle reminder to step away as the prayer approaches"
        >
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.focusAutoPrompt}
              onChange={(v) => set("focusAutoPrompt", v)}
              label="Prompt before prayer"
            />
          </div>
        </SettingRow>
        <SettingRow label="How it works">
          <p className="text-sm text-muted-foreground sm:text-right">
            Focus Mode encourages you to put the phone aside. A web app cannot lock or power off a
            phone, so nothing is disabled for you.
          </p>
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        icon={Monitor}
        title="Windows desktop"
        description={
          isDesktop
            ? "Real Windows shutdown is available in this build"
            : "Available when you run the Salah Shutdown Windows app"
        }
      >
        <SettingRow
          label="Shutdown warning time"
          description="How long before the prayer the warning appears"
        >
          <Select
            label="Shutdown warning time"
            value={settings.warningMinutes}
            options={WARNING_OPTIONS}
            onChange={(v) => set("warningMinutes", Number(v))}
          />
        </SettingRow>
        <SettingRow label="Start with Windows" description="Launch Salah Shutdown when Windows starts">
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.startWithWindows}
              onChange={(v) => set("startWithWindows", v)}
              label="Start with Windows"
            />
          </div>
        </SettingRow>
        <SettingRow label="Minimize to tray" description="Keep running in the system tray when the window closes">
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.minimizeToTray}
              onChange={(v) => {
                set("minimizeToTray", v);
                desktop.setMinimizeToTray(v);
              }}
              label="Minimize to tray"
            />
          </div>
        </SettingRow>
        <SettingRow label="Windows shutdown status">
          <p className="text-sm text-muted-foreground sm:text-right">
            {!isDesktop
              ? "Running in a browser — Windows shutdown is unavailable."
              : shutdownStatus?.scheduled
                ? `Scheduled for ${shutdownStatus.prayer} at ${shutdownStatus.prayerTime}.`
                : shutdownStatus?.cancelled
                  ? "Cancelled."
                  : "Not scheduled."}
          </p>
        </SettingRow>
      </SettingsSection>

      <SettingsSection icon={Palette} title="Appearance" description="Theme, density and motion">
        <SettingRow
          label="Theme"
          description={`Currently using: ${THEME_OPTIONS.find((t) => t.value === theme)?.label}`}
        >
          <div className="flex sm:justify-end">
            <ThemeToggle />
          </div>
        </SettingRow>
        <SettingRow label="Compact mode" description="Tighter spacing for smaller laptops">
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.compactMode}
              onChange={(v) => set("compactMode", v)}
              label="Compact mode"
            />
          </div>
        </SettingRow>
        <SettingRow label="Animations" description="Disable for a completely static interface">
          <div className="flex sm:justify-end">
            <Toggle
              checked={settings.animations}
              onChange={(v) => set("animations", v)}
              label="Animations"
            />
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        icon={Download}
        title="Download & export"
        description="Back up your data or get the desktop build"
        defaultOpen={false}
      >
        <SettingRow
          label="Export project data"
          description="Download settings, prayer list and history as JSON"
        >
          <div className="flex sm:justify-end">
            <Button size="sm" icon={Download} onClick={handleExport}>
              Download JSON
            </Button>
          </div>
        </SettingRow>
        <SettingRow
          label="Desktop app"
          description="Full Salah Shutdown Windows app (React UI + Electron, real shutdown, tray)"
        >
          <div className="flex sm:justify-end">
            <Button
  as="a"
  href={'https://github.com/Mustafa-Wahid/Namaz-App/releases/download/v1.00.0/Salah-Shutdown-Setup.exe'}
  download="Salah-Shutdown-Setup.exe"
  size="sm"
  variant="outline"
  icon={Monitor}
>
  Get Windows app
</Button>
          </div>
        </SettingRow>
      </SettingsSection>

      <SettingsSection
        icon={Info}
        title="About"
        description="Version and project details"
        defaultOpen={false}
      >
        <SettingRow label="Application">
          <p className="text-sm text-muted-foreground sm:text-right">{APP_NAME}</p>
        </SettingRow>
        <SettingRow label="Version">
          <p className="text-sm text-muted-foreground sm:text-right">v{APP_VERSION}</p>
        </SettingRow>
        <SettingRow label="Description">
          <p className="text-sm text-muted-foreground sm:text-right">{APP_DESCRIPTION}</p>
        </SettingRow>
      </SettingsSection>
    </div>
  );
}
