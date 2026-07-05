export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type TimeFormat = "24h" | "12h";
export type SessionTimeout = 0 | 15 | 30 | 60 | 120;

export interface NotificationPrefs {
  emailMessages: boolean;
  pushMessages: boolean;
  emailRdv: boolean;
  pushRdv: boolean;
  emailMatch: boolean;
  pushMatch: boolean;
}

export interface UserPreferences {
  notifications: NotificationPrefs;
  landingPages: Record<string, string>;
  timezone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  compactSidebar: boolean;
  soundAlerts: boolean;
  sessionTimeoutMinutes: SessionTimeout;
  reducedMotion: boolean;
  largeText: boolean;
}

export type NotificationKind = "message" | "rdv" | "match";
