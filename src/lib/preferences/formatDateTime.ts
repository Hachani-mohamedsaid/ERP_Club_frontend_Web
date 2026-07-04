import type { DateFormat, TimeFormat } from "./types";

export const TIMEZONE_OPTIONS = [
  "Europe/Paris",
  "Europe/London",
  "Africa/Tunis",
  "Africa/Casablanca",
  "Africa/Algiers",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Riyadh",
  "UTC",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function partsInTimezone(date: Date, timezone: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

export function formatDate(
  date: Date | string,
  dateFormat: DateFormat,
  timezone: string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const { year, month, day } = partsInTimezone(d, timezone);
  const dd = pad(day);
  const mm = pad(month);
  const yyyy = String(year);
  if (dateFormat === "MM/DD/YYYY") return `${mm}/${dd}/${yyyy}`;
  if (dateFormat === "YYYY-MM-DD") return `${yyyy}-${mm}-${dd}`;
  return `${dd}/${mm}/${yyyy}`;
}

export function formatTime(
  date: Date | string,
  timeFormat: TimeFormat,
  timezone: string,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const { hour, minute } = partsInTimezone(d, timezone);
  if (timeFormat === "12h") {
    const h12 = hour % 12 || 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${h12}:${pad(minute)} ${ampm}`;
  }
  return `${pad(hour)}:${pad(minute)}`;
}

export function formatDateTime(
  date: Date | string,
  dateFormat: DateFormat,
  timeFormat: TimeFormat,
  timezone: string,
): string {
  return `${formatDate(date, dateFormat, timezone)} ${formatTime(date, timeFormat, timezone)}`;
}

export function parseEventDateTime(eventDate: string, eventTime: string | null, timezone: string): Date {
  const time = eventTime?.trim() || "09:00";
  const iso = eventDate.includes("T") ? eventDate : `${eventDate}T${time}:00`;
  const local = new Date(iso);
  if (!Number.isNaN(local.getTime())) return local;
  return new Date(`${eventDate}T12:00:00Z`);
}
