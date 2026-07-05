import type { UserPreferences } from "./types";

const STORAGE_KEY = "odin_user_preferences";

function defaultTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris";
  } catch {
    return "Europe/Paris";
  }
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: {
    emailMessages: true,
    pushMessages: true,
    emailRdv: true,
    pushRdv: true,
    emailMatch: true,
    pushMatch: true,
  },
  landingPages: {},
  timezone: defaultTimezone(),
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  compactSidebar: false,
  soundAlerts: true,
  sessionTimeoutMinutes: 60,
  reducedMotion: false,
  largeText: false,
};

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PREFERENCES, timezone: defaultTimezone() };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      notifications: { ...DEFAULT_PREFERENCES.notifications, ...parsed.notifications },
      landingPages: { ...parsed.landingPages },
      timezone: parsed.timezone || defaultTimezone(),
    };
  } catch {
    return { ...DEFAULT_PREFERENCES, timezone: defaultTimezone() };
  }
}

export function savePreferences(prefs: UserPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function applyAccessibilityPrefs(prefs: UserPreferences) {
  const root = document.documentElement;
  root.dataset.reducedMotion = prefs.reducedMotion ? "true" : "false";
  root.dataset.largeText = prefs.largeText ? "true" : "false";
  root.dataset.compactSidebar = prefs.compactSidebar ? "true" : "false";
}
