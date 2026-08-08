import { joueurApi } from "./index";

export type JoueurNotifType = "training" | "match" | "medical" | "contract" | "injury";

export interface JoueurNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: JoueurNotifType;
  path: string;
  eventAt: number;
}

type CalendarRaw = {
  id?: string;
  title?: string;
  date?: string;
  eventDate?: string;
  time?: string | null;
  eventTime?: string | null;
  type?: string;
  eventType?: string;
  location?: string | null;
};

type InjuryRaw = {
  id?: string;
  type?: string;
  bodyPart?: string;
  returnDate?: string;
  riskScore?: number;
  createdAt?: string;
};

type MeRaw = {
  contract?: { salary?: string; expiration?: string };
};

const READ_KEY = "odin_joueur_notif_read";

function loadReadIds(userKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${READ_KEY}:${userKey}`);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(userKey: string, ids: Set<string>) {
  localStorage.setItem(`${READ_KEY}:${userKey}`, JSON.stringify([...ids].slice(-200)));
}

function formatRelative(ms: number): string {
  const mins = Math.floor((Date.now() - ms) / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days}j`;
  return new Date(ms).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function parseDate(raw: string | undefined | null): Date | null {
  if (!raw || raw === "—") return null;
  if (raw.includes("T")) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (raw.includes("/")) {
    const [dd, mm, yyyy] = raw.split("/").map(Number);
    if (!yyyy || !mm || !dd) return null;
    return new Date(yyyy, mm - 1, dd);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function classifyEvent(type: string): JoueurNotifType | null {
  const t = type.toUpperCase();
  if (t.includes("MATCH") || t.includes("MATCHS")) return "match";
  if (t.includes("TRAIN") || t.includes("ENTRAIN") || t.includes("SÉANCE") || t.includes("SEANCE")) return "training";
  if (t.includes("MEDICAL") || t.includes("RDV") || t.includes("CONSULT") || t.includes("MÉDICAL")) return "medical";
  return null;
}

function daysUntil(date: Date): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - start.getTime()) / 86400000);
}

function buildFromCalendar(events: CalendarRaw[], read: Set<string>): JoueurNotificationItem[] {
  const now = Date.now();
  const horizon = now + 14 * 86400000;
  const items: JoueurNotificationItem[] = [];

  for (const ev of events) {
    const typeRaw = String(ev.type ?? ev.eventType ?? "");
    const kind = classifyEvent(typeRaw);
    if (!kind) continue;

    const dateStr = String(ev.date ?? ev.eventDate ?? "");
    const date = parseDate(dateStr);
    if (!date) continue;

    const timeStr = ev.time ?? ev.eventTime;
    if (typeof timeStr === "string" && /^\d{1,2}:\d{2}/.test(timeStr)) {
      const [h, m] = timeStr.split(":").map(Number);
      date.setHours(h, m, 0, 0);
    }

    const eventAt = date.getTime();
    if (eventAt < now - 86400000 || eventAt > horizon) continue;

    const days = daysUntil(date);
    const id = `cal:${ev.id ?? dateStr}`;
    const timeLabel =
      typeof timeStr === "string" && timeStr.trim()
        ? timeStr
        : date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const loc = ev.location ? ` — ${ev.location}` : "";
    const title =
      kind === "match"
        ? days <= 0
          ? "Match aujourd'hui"
          : days === 1
            ? "Match demain"
            : `Match dans ${days} jours`
        : kind === "training"
          ? days <= 0
            ? "Entraînement aujourd'hui"
            : days === 1
              ? "Entraînement demain"
              : `Entraînement dans ${days} jours`
          : days <= 0
            ? "RDV médical aujourd'hui"
            : days === 1
              ? "RDV médical demain"
              : `RDV médical dans ${days} jours`;

    items.push({
      id,
      title,
      message: `${ev.title ?? "Événement"} · ${timeLabel}${loc}`,
      time: formatRelative(Math.min(eventAt, now)),
      unread: !read.has(id),
      type: kind,
      path: "/joueurs/planning",
      eventAt,
    });
  }

  return items;
}

function buildFromInjuries(injuries: InjuryRaw[], read: Set<string>): JoueurNotificationItem[] {
  const items: JoueurNotificationItem[] = [];
  const now = Date.now();

  for (const inj of injuries.slice(0, 5)) {
    const id = `inj:${inj.id ?? inj.type}`;
    const created = parseDate(inj.createdAt)?.getTime() ?? now;
    const returnDate = parseDate(inj.returnDate);
    const days = returnDate ? daysUntil(returnDate) : null;
    const risk = Number(inj.riskScore ?? 0);

    if (days != null && days >= 0 && days <= 7) {
      items.push({
        id: `${id}:return`,
        title: days === 0 ? "Retour prévu aujourd'hui" : `Retour prévu dans ${days} jour${days > 1 ? "s" : ""}`,
        message: `${inj.type ?? "Blessure"}${inj.bodyPart ? ` — ${inj.bodyPart}` : ""}`,
        time: formatRelative(created),
        unread: !read.has(`${id}:return`),
        type: "medical",
        path: "/joueurs/medical",
        eventAt: returnDate?.getTime() ?? created,
      });
    }

    if (risk >= 7) {
      items.push({
        id: `${id}:risk`,
        title: "Risque médical élevé",
        message: `${inj.type ?? "Blessure"}${inj.bodyPart ? ` — ${inj.bodyPart}` : ""} · score ${risk}/10`,
        time: formatRelative(created),
        unread: !read.has(`${id}:risk`),
        type: "injury",
        path: "/joueurs/medical",
        eventAt: created,
      });
    } else if (days == null || days > 7) {
      // Still surface active injuries so the dropdown is never only mock-looking
      items.push({
        id,
        title: "Suivi blessure actif",
        message: `${inj.type ?? "Blessure"}${inj.bodyPart ? ` — ${inj.bodyPart}` : ""}${
          inj.returnDate && inj.returnDate !== "—" ? ` · retour ${inj.returnDate}` : ""
        }`,
        time: formatRelative(created),
        unread: !read.has(id),
        type: "injury",
        path: "/joueurs/medical",
        eventAt: created,
      });
    }
  }

  return items;
}

function buildFromContract(me: MeRaw, read: Set<string>): JoueurNotificationItem[] {
  const expiration = me.contract?.expiration;
  const end = parseDate(expiration);
  if (!end) return [];

  const days = daysUntil(end);
  if (days < 0 || days > 90) return [];

  const id = `contract:${expiration}`;
  return [
    {
      id,
      title:
        days === 0
          ? "Contrat expire aujourd'hui"
          : `Contrat expire dans ${days} jour${days > 1 ? "s" : ""}`,
      message: me.contract?.salary
        ? `${me.contract.salary} · Renouvellement à discuter`
        : "Renouvellement à discuter avec la direction",
      time: formatRelative(Date.now() - (90 - days) * 3600000),
      unread: !read.has(id),
      type: "contract",
      path: "/joueurs/profil",
      eventAt: end.getTime(),
    },
  ];
}

export async function fetchJoueurNotifications(userKey: string): Promise<JoueurNotificationItem[]> {
  const read = loadReadIds(userKey);

  const [calRes, injRes, meRes] = await Promise.allSettled([
    joueurApi.getCalendar(),
    joueurApi.getInjuries(),
    joueurApi.getMe(),
  ]);

  const calendar =
    calRes.status === "fulfilled"
      ? Array.isArray(calRes.value)
        ? (calRes.value as CalendarRaw[])
        : []
      : [];
  const injuries =
    injRes.status === "fulfilled"
      ? Array.isArray(injRes.value)
        ? (injRes.value as InjuryRaw[])
        : []
      : [];
  const me = meRes.status === "fulfilled" ? (meRes.value as MeRaw) : {};

  if (
    calRes.status === "rejected" &&
    injRes.status === "rejected" &&
    meRes.status === "rejected"
  ) {
    throw calRes.reason instanceof Error
      ? calRes.reason
      : new Error("Impossible de charger les notifications.");
  }

  const items = [
    ...buildFromCalendar(calendar, read),
    ...buildFromInjuries(injuries, read),
    ...buildFromContract(me, read),
  ].sort((a, b) => {
    if (a.unread !== b.unread) return a.unread ? -1 : 1;
    return a.eventAt - b.eventAt;
  });

  return items;
}

export function markJoueurNotificationRead(userKey: string, id: string) {
  const read = loadReadIds(userKey);
  read.add(id);
  saveReadIds(userKey, read);
}

export function markAllJoueurNotificationsRead(userKey: string, ids: string[]) {
  const read = loadReadIds(userKey);
  for (const id of ids) read.add(id);
  saveReadIds(userKey, read);
}
