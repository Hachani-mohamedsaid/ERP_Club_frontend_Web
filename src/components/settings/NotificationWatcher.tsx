import { useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { apiFetch } from "../../lib/api/authHeaders";
import { parseEventDateTime } from "../../lib/preferences/formatDateTime";
import { dispatchNotification, playNotificationSound } from "../../lib/preferences/notificationHelpers";

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string | null;
  eventType: string;
}

const NOTIFIED_KEY = "odin_notified_events";
const REMINDER_MS = 60 * 60 * 1000;
const POLL_MS = 60_000;

function loadNotified(): Set<string> {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveNotified(set: Set<string>) {
  sessionStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set].slice(-200)));
}

function eventKind(type: string): "rdv" | "match" | null {
  const t = type.toUpperCase();
  if (t.includes("MEDICAL") || t.includes("RDV") || t.includes("CONSULT")) return "rdv";
  if (t.includes("MATCH")) return "match";
  return null;
}

async function fetchCalendar(role: string): Promise<CalendarEvent[]> {
  const path =
    role === "joueur"
      ? "/joueur/me/calendar"
      : role === "preparateur"
        ? "/club/preparateur/calendar"
        : "/club/calendar";
  try {
    const res = await apiFetch(path);
    if (!res.ok) return [];
    const data = (await res.json()) as unknown;
    if (Array.isArray(data)) return data as CalendarEvent[];
    if (data && typeof data === "object" && Array.isArray((data as { events?: unknown }).events)) {
      return (data as { events: CalendarEvent[] }).events;
    }
    return [];
  } catch {
    return [];
  }
}

export function NotificationWatcher() {
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const { t } = useLocale();
  const notifiedRef = useRef(loadNotified());

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      const events = await fetchCalendar(user.role);
      const now = Date.now();
      const notified = notifiedRef.current;

      for (const ev of events) {
        const kind = eventKind(ev.eventType);
        if (!kind) continue;

        const start = parseEventDateTime(ev.eventDate, ev.eventTime, preferences.timezone).getTime();
        const diff = start - now;
        if (diff <= 0 || diff > REMINDER_MS) continue;

        const key = `${ev.id}-${kind}`;
        if (notified.has(key)) continue;
        notified.add(key);
        saveNotified(notified);

        const title =
          kind === "rdv"
            ? t.settings.notifRdvTitle
            : t.settings.notifMatchTitle;
        const body =
          kind === "rdv"
            ? `${ev.title} — ${t.settings.notifInOneHour}`
            : `${ev.title} — ${t.settings.notifInOneHour}`;

        await dispatchNotification(kind, preferences.notifications, {
          title,
          body,
          tag: key,
        });

        if (preferences.soundAlerts) playNotificationSound();
      }
    };

    void check();
    const id = window.setInterval(() => void check(), POLL_MS);
    return () => window.clearInterval(id);
  }, [user, preferences, t]);

  return null;
}
