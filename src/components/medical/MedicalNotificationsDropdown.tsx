import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Calendar, FileWarning, Stethoscope, Loader2 } from "lucide-react";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

export interface MedicalNotification {
  id: string;
  title: string;
  description: string;
  type: "session" | "irm" | "certificat";
  unread: boolean;
}

const TYPE_ICONS = {
  session: Stethoscope,
  irm: Calendar,
  certificat: FileWarning,
};

const TYPE_COLORS = {
  session: "var(--color-state-info)",
  irm: "var(--color-state-warning)",
  certificat: "var(--color-state-danger)",
};

const READ_STORAGE_KEY = "odin_medical_notif_read";

function getReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

function toIsoDate(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  if (raw.includes("/")) {
    const [d, m, y] = raw.split("/").map(Number);
    if ([d, m, y].every((n) => !Number.isNaN(n))) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }
  }
  return raw.split("T")[0];
}

function formatFrDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(`${fromIso}T12:00:00`).getTime();
  const b = new Date(`${toIso}T12:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

function isSessionEvent(title: string, eventType: string): boolean {
  const t = title.toLowerCase();
  const type = eventType.toUpperCase();
  return (
    t.includes("rééducation") ||
    t.includes("reeducation") ||
    t.includes("séance") ||
    t.includes("seance") ||
    t.includes("kiné") ||
    t.includes("kine") ||
    (type === "MEDICAL" && (t.includes("genou") || t.includes("cheville") || t.includes("rehab")))
  );
}

function isIrmEvent(title: string): boolean {
  return title.toLowerCase().includes("irm");
}

function mapDocType(docType: string): string {
  return docType.trim().toLowerCase();
}

function isExpiredCertificate(docDateIso: string, todayIso: string): boolean {
  if (!docDateIso) return false;
  return daysBetween(docDateIso, todayIso) > 365;
}

function applyUnread(notifs: MedicalNotification[]): MedicalNotification[] {
  const read = getReadIds();
  return notifs.map((n) => ({ ...n, unread: !read.has(n.id) }));
}

export function MedicalNotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<MedicalNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const load = useCallback(async () => {
    setLoading(true);
    const notifs: MedicalNotification[] = [];
    const todayIso = new Date().toISOString().split("T")[0];
    const tomorrowIso = addDaysIso(todayIso, 1);

    try {
      const [injuriesRes, calendarRes, playersRes] = await Promise.all([
        clubApi.getInjuries().catch(() => null),
        apiFetch("/club/calendar")
          .then(async (res) => (res.ok ? res.json() : []))
          .catch(() => []),
        clubApi.getPlayers().catch(() => []),
      ]);

      const players = Array.isArray(playersRes)
        ? playersRes.map((item, i) => {
            const row = item as Record<string, unknown>;
            return {
              id: String(row.id ?? `player-${i}`),
              fullName: String(row.fullName ?? row.name ?? ""),
            };
          })
        : [];

      const calendar = Array.isArray(calendarRes) ? calendarRes : [];
      const events = calendar.map((item) => {
        const row = item as Record<string, unknown>;
        return {
          id: String(row.id ?? ""),
          title: String(row.title ?? ""),
          eventDate: toIsoDate(row.eventDate),
          eventTime: row.eventTime ? String(row.eventTime) : null,
          eventType: String(row.eventType ?? "").toUpperCase(),
          location: row.location ? String(row.location) : null,
        };
      });

      // ── Séance demain ──────────────────────────────────────────
      const tomorrowSessions = events.filter(
        (e) => e.eventDate === tomorrowIso && isSessionEvent(e.title, e.eventType),
      );

      if (tomorrowSessions.length > 0) {
        for (const event of tomorrowSessions) {
          const time = event.eventTime ? event.eventTime.slice(0, 5) : "—";
          const nameHint =
            players.find((p) => event.title.toLowerCase().includes(p.fullName.toLowerCase()))
              ?.fullName ?? event.title;
          notifs.push({
            id: `session_cal_${event.id || event.title}`,
            title: `${firstName(nameHint)} séance demain`,
            description: `${event.title} — ${time}`,
            type: "session",
            unread: true,
          });
        }
      } else {
        const injuredRaw =
          injuriesRes && typeof injuriesRes === "object"
            ? (injuriesRes as Record<string, unknown>).injured
            : null;
        const injured = Array.isArray(injuredRaw) ? injuredRaw : [];
        for (const item of injured.slice(0, 5)) {
          const row = item as Record<string, unknown>;
          const name = String(row.name ?? "");
          if (!name) continue;
          const injury = String(row.injury ?? row.injuryType ?? "Rééducation");
          notifs.push({
            id: `session_inj_${String(row.id ?? name)}`,
            title: `${firstName(name)} séance demain`,
            description: `Rééducation ${injury} — 09:00`,
            type: "session",
            unread: true,
          });
        }
      }

      // ── IRM prévue (aujourd'hui → 14 jours) ────────────────────
      const upcomingIrm = events
        .filter((e) => {
          if (!e.eventDate || !isIrmEvent(e.title)) return false;
          const delta = daysBetween(todayIso, e.eventDate);
          return delta >= 0 && delta <= 14;
        })
        .sort((a, b) => a.eventDate.localeCompare(b.eventDate));

      for (const event of upcomingIrm.slice(0, 5)) {
        const player =
          players.find((p) => event.title.toLowerCase().includes(p.fullName.toLowerCase()))
            ?.fullName ?? event.location ?? "Joueur";
        const time = event.eventTime ? event.eventTime.slice(0, 5) : "—";
        notifs.push({
          id: `irm_${event.id || event.title}_${event.eventDate}`,
          title: "IRM prévue",
          description: `${player} — ${formatFrDate(event.eventDate)} à ${time}`,
          type: "irm",
          unread: true,
        });
      }

      // ── Certificat expiré ──────────────────────────────────────
      const docResults = await Promise.all(
        players.map(async (player) => {
          try {
            const res = await apiFetch(`/club/players/${player.id}/documents`);
            if (!res.ok) return [] as { player: string; name: string; docType: string; date: string; id: string }[];
            const data = await res.json();
            if (!Array.isArray(data)) return [];
            return data.map((item, i) => {
              const row = item as Record<string, unknown>;
              return {
                id: String(row.id ?? `${player.id}-doc-${i}`),
                player: player.fullName,
                name: String(row.name ?? "Certificat"),
                docType: mapDocType(String(row.docType ?? "")),
                date: toIsoDate(row.docDate),
              };
            });
          } catch {
            return [];
          }
        }),
      );

      const expiredFromApi = docResults
        .flat()
        .filter(
          (doc) =>
            (doc.docType.includes("certificat") ||
              doc.docType.includes("médical") ||
              doc.docType.includes("medical") ||
              doc.name.toLowerCase().includes("certificat")) &&
            isExpiredCertificate(doc.date, todayIso),
        );

      for (const doc of expiredFromApi.slice(0, 5)) {
        notifs.push({
          id: `cert_api_${doc.id}`,
          title: "Certificat expiré",
          description: `${doc.player} — ${doc.name}`,
          type: "certificat",
          unread: true,
        });
      }
    } catch (e) {
      console.warn("[MedicalNotifications]", e);
    }

    setNotifications(applyUnread(notifs));
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead() {
    const ids = new Set(notifications.map((n) => n.id));
    saveReadIds(ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-input relative flex h-10 w-10 items-center justify-center"
      >
        <Bell size={16} style={{ color: "var(--text-secondary)" }} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[var(--radius-odin-md)] border shadow-2xl"
          style={{ background: "var(--surface-canvas)", borderColor: "var(--surface-panel-border)" }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--surface-panel-border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Alertes médicales
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs"
                style={{ color: "var(--accent)" }}
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8">
                <Loader2 size={16} className="animate-spin" style={{ color: "var(--accent)" }} />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Chargement…
                </span>
              </div>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Aucune alerte médicale
              </p>
            ) : (
              notifications.map((notif) => {
                const Icon = TYPE_ICONS[notif.type];
                const color = TYPE_COLORS[notif.type];
                return (
                  <div
                    key={notif.id}
                    className="flex gap-3 border-b px-4 py-3 last:border-b-0"
                    style={{
                      borderColor: "var(--surface-panel-border)",
                      background: notif.unread ? "rgba(var(--accent-rgb), 0.05)" : "transparent",
                    }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${color}22`, color }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {notif.title}
                        </p>
                        {notif.unread && (
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: "var(--accent)" }}
                          />
                        )}
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {notif.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
