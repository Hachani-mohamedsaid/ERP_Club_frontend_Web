import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Role } from "./AuthContext";
import {
  applyAccessibilityPrefs,
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
} from "../lib/preferences/defaults";
import type {
  DateFormat,
  NotificationPrefs,
  SessionTimeout,
  TimeFormat,
  UserPreferences,
} from "../lib/preferences/types";
import { formatDate, formatDateTime, formatTime } from "../lib/preferences/formatDateTime";
import { getLandingPage } from "../lib/preferences/landingRoutes";

/* eslint-disable react-refresh/only-export-components */

interface UserPreferencesContextValue {
  preferences: UserPreferences;
  updatePreferences: (patch: Partial<UserPreferences>) => void;
  updateNotifications: (patch: Partial<NotificationPrefs>) => void;
  setLandingPage: (role: Role, path: string) => void;
  getRoleLandingPage: (role: Role) => string;
  formatAppDate: (date: Date | string) => string;
  formatAppTime: (date: Date | string) => string;
  formatAppDateTime: (date: Date | string) => string;
}

const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences());

  useEffect(() => {
    applyAccessibilityPrefs(preferences);
    savePreferences(preferences);
  }, [preferences]);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateNotifications = useCallback((patch: Partial<NotificationPrefs>) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, ...patch },
    }));
  }, []);

  const setLandingPage = useCallback((role: Role, path: string) => {
    setPreferences((prev) => ({
      ...prev,
      landingPages: { ...prev.landingPages, [role]: path },
    }));
  }, []);

  const getRoleLandingPage = useCallback(
    (role: Role) => getLandingPage(role, preferences.landingPages),
    [preferences.landingPages],
  );

  const formatAppDate = useCallback(
    (date: Date | string) => formatDate(date, preferences.dateFormat, preferences.timezone),
    [preferences.dateFormat, preferences.timezone],
  );

  const formatAppTime = useCallback(
    (date: Date | string) => formatTime(date, preferences.timeFormat, preferences.timezone),
    [preferences.timeFormat, preferences.timezone],
  );

  const formatAppDateTime = useCallback(
    (date: Date | string) =>
      formatDateTime(date, preferences.dateFormat, preferences.timeFormat, preferences.timezone),
    [preferences.dateFormat, preferences.timeFormat, preferences.timezone],
  );

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      updateNotifications,
      setLandingPage,
      getRoleLandingPage,
      formatAppDate,
      formatAppTime,
      formatAppDateTime,
    }),
    [
      preferences,
      updatePreferences,
      updateNotifications,
      setLandingPage,
      getRoleLandingPage,
      formatAppDate,
      formatAppTime,
      formatAppDateTime,
    ],
  );

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error("useUserPreferences must be used within UserPreferencesProvider");
  return ctx;
}

export type { DateFormat, TimeFormat, SessionTimeout, UserPreferences };

export { DEFAULT_PREFERENCES };
