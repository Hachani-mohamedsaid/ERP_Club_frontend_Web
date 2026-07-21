import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCheck, Trash2, ScrollText, AlertTriangle, Activity, Calendar, Info, Check, Wallet,
} from "lucide-react";
import { RPage, RHeader, RSection, RRow, RPills, RBtn, RKpiCard } from "../../components/responsable";
import { clubApi } from "../../lib/api/club";

type NotifLevel = "Critique" | "Alerte" | "Info" | "Succès";
type NotifType = "Contrat" | "Finance" | "Médical" | "Système" | "Info" | "Validation";

interface Notification {
  id: string;
  type: NotifType;
  level: NotifLevel;
  title: string;
  body: string;
  time: string;
  read: boolean;
  path?: string | null;
}

const LEVEL_COLOR: Record<NotifLevel, string> = {
  Critique: "#EF4444",
  Alerte: "#FF7A00",
  Info: "#3B82F6",
  Succès: "#22C55E",
};

const TYPE_ICON: Record<NotifType, typeof Bell> = {
  Contrat: ScrollText,
  Finance: Wallet,
  Médical: Activity,
  Système: Calendar,
  Info: Info,
  Validation: CheckCheck,
};

const FILTER_OPTIONS = ["Toutes", "Contrat", "Finance", "Médical", "Système", "Info", "Validation"];

function mapLevel(raw: string): NotifLevel {
  const v = raw.toLowerCase();
  if (v === "critical" || v === "critique") return "Critique";
  if (v === "warning" || v === "alerte") return "Alerte";
  if (v === "success" || v === "succès") return "Succès";
  return "Info";
}

function mapType(raw: string, title: string, body: string): NotifType {
  const t = raw.toLowerCase();
  if (t.includes("contrat")) return "Contrat";
  if (t.includes("finance")) return "Finance";
  if (t.includes("médical") || t.includes("medical")) return "Médical";
  if (t.includes("système") || t.includes("systeme")) return "Système";
  if (
    title.toLowerCase().includes("comité") ||
    title.toLowerCase().includes("shortlist") ||
    title.toLowerCase().includes("recrut") ||
    body.toLowerCase().includes("validation")
  ) {
    return "Validation";
  }
  if (t.includes("info")) return "Info";
  return "Info";
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("Toutes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const rows = (await clubApi.getNotifications()) as {
        id: string;
        title: string;
        description?: string;
        body?: string;
        type: string;
        level: string;
        date: string;
        read: boolean;
        path?: string | null;
      }[];
      setNotifs(
        (rows ?? []).map((n) => {
          const body = n.description ?? n.body ?? "";
          return {
            id: n.id,
            title: n.title,
            body,
            time: n.date,
            read: n.read,
            level: mapLevel(n.level),
            type: mapType(n.type, n.title, body),
            path: n.path,
          };
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger les notifications");
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () => (filter === "Toutes" ? notifs : notifs.filter((n) => n.type === filter)),
    [notifs, filter],
  );

  const unreadCount = notifs.filter((n) => !n.read).length;

  async function markAllRead() {
    try {
      await clubApi.markNotificationsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  }

  async function markRead(id: string) {
    try {
      await clubApi.markNotificationsRead([id]);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      /* ignore */
    }
  }

  async function clearRead() {
    try {
      await clubApi.deleteReadNotifications();
      setNotifs((prev) => prev.filter((n) => !n.read));
    } catch {
      /* ignore */
    }
  }

  function openNotif(n: Notification) {
    void markRead(n.id);
    if (n.path) navigate(n.path);
    else if (n.type === "Validation") navigate("/responsable/validation");
  }

  return (
    <RPage>
      <RHeader
        title="Centre de Notifications"
        subtitle="Contrats, validations scout/comité, finance et alertes club."
        badge="NOTIFICATION_MANAGE"
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <RBtn onClick={() => void markAllRead()} variant="ghost">
                <CheckCheck size={13} /> Tout lire
              </RBtn>
            )}
            <RBtn onClick={() => void clearRead()} variant="danger">
              <Trash2 size={13} /> Effacer lues
            </RBtn>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
          <div className="relative">
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-[20px]"
              style={{ background: "rgba(255,122,0,0.12)", border: "1px solid rgba(255,122,0,0.3)" }}
              animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell size={28} style={{ color: "var(--accent)" }} />
            </motion.div>
            {unreadCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white"
                style={{ background: "#EF4444" }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {unreadCount}
              </motion.div>
            )}
          </div>
        </div>
        <RKpiCard label="Non lues" value={String(unreadCount)} icon={Bell} color="#FF7A00" />
        <RKpiCard
          label="Critiques"
          value={String(notifs.filter((n) => n.level === "Critique" && !n.read).length)}
          icon={AlertTriangle}
          color="#EF4444"
        />
        <RKpiCard
          label="Validations"
          value={String(notifs.filter((n) => n.type === "Validation" && !n.read).length)}
          icon={CheckCheck}
          color="#8B5CF6"
        />
        <RKpiCard
          label="Contrats"
          value={String(notifs.filter((n) => n.type === "Contrat" && !n.read).length)}
          icon={ScrollText}
          color="#F59E0B"
        />
      </div>

      <RPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      <RSection title="Notifications" subtitle={`${filtered.length} au total · ${unreadCount} non lues`}>
        {loading && (
          <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Chargement…
          </p>
        )}
        {error && !loading && (
          <p className="py-8 text-center text-sm" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}
        <AnimatePresence mode="wait">
          {!loading && !error && (
            <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {filtered.map((n, i) => {
                const Icon = TYPE_ICON[n.type];
                const color = LEVEL_COLOR[n.level];
                return (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <RRow>
                      <div className="flex items-start gap-3">
                        {!n.read && (
                          <motion.div
                            className="mt-2 h-2 w-2 shrink-0 rounded-full"
                            style={{ background: color }}
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `${color}15` }}
                        >
                          <Icon size={14} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-sm font-semibold ${n.read ? "opacity-60" : ""}`}
                                style={{ color: "var(--text-primary)" }}
                              >
                                {n.title}
                              </p>
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: `${color}15`, color }}
                              >
                                {n.level}
                              </span>
                              <span
                                className="rounded-full px-2 py-0.5 text-[10px]"
                                style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}
                              >
                                {n.type}
                              </span>
                            </div>
                            <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                              {n.time}
                            </span>
                          </div>
                          <p
                            className={`mt-1 text-sm ${n.read ? "opacity-50" : ""}`}
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {n.body}
                          </p>
                          <div className="mt-2 flex gap-1.5">
                            {!n.read && (
                              <RBtn onClick={() => void markRead(n.id)} variant="ghost">
                                <Check size={11} /> Marquer lu
                              </RBtn>
                            )}
                            <RBtn onClick={() => openNotif(n)} variant="ghost">
                              Ouvrir
                            </RBtn>
                          </div>
                        </div>
                      </div>
                    </RRow>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Aucune notification dans cette catégorie</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </RSection>
    </RPage>
  );
}
