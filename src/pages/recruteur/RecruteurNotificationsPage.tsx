import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, X, AlertTriangle, DollarSign, Star, TrendingUp, FileCheck } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { recruteurApi } from "../../lib/api/recruteur";

type NType = "offre" | "contrat" | "talent" | "validation" | "budget" | "blessure" | "shortlist";
type Priority = "critical" | "high" | "medium" | "low";

interface RNotif {
  id: string;
  type: NType;
  title: string;
  body: string;
  time: string;
  priority: Priority;
  read: boolean;
  player?: string | null;
}

const TYPE_META: Record<NType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  offre: { icon: FileCheck, color: "#22C55E", bg: "rgba(34,197,94,0.14)", label: "Offre" },
  contrat: { icon: AlertTriangle, color: "#FF7A00", bg: "rgba(255,122,0,0.14)", label: "Contrat" },
  talent: { icon: Star, color: "#8B5CF6", bg: "rgba(139,92,246,0.14)", label: "Talent" },
  validation: { icon: CheckCheck, color: "#F59E0B", bg: "rgba(245,158,11,0.14)", label: "Validation" },
  shortlist: { icon: Star, color: "#A855F7", bg: "rgba(168,85,247,0.14)", label: "Shortlist" },
  budget: { icon: DollarSign, color: "#EF4444", bg: "rgba(239,68,68,0.14)", label: "Budget" },
  blessure: { icon: AlertTriangle, color: "#EF4444", bg: "rgba(239,68,68,0.14)", label: "Blessure" },
};

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "#EF4444",
  high: "#FF7A00",
  medium: "#F59E0B",
  low: "#6B7280",
};

const FILTER_TYPES: (NType | "all")[] = ["all", "shortlist", "validation", "talent", "offre", "contrat", "budget", "blessure"];

function mapType(raw: string): NType {
  const t = raw.toLowerCase();
  if (t in TYPE_META) return t as NType;
  return "validation";
}

function mapPriority(raw: string): Priority {
  const p = raw.toLowerCase();
  if (p === "critical" || p === "high" || p === "medium" || p === "low") return p;
  return "medium";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export function RecruteurNotificationsPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<RNotif[]>([]);
  const [filter, setFilter] = useState<NType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await recruteurApi.getNotifications();
      setNotifs(
        (rows ?? []).map((n) => ({
          id: n.id,
          type: mapType(n.type),
          title: n.title,
          body: n.body,
          time: formatTime(n.time),
          priority: mapPriority(n.priority),
          read: n.read,
          player: n.player,
        })),
      );
    } catch {
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unread = notifs.filter((n) => !n.read).length;
  const critical = notifs.filter((n) => n.priority === "critical").length;
  const total = notifs.length;

  async function markAll() {
    await recruteurApi.markAllNotificationsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await recruteurApi.markNotificationRead(id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function dismiss(id: string) {
    await recruteurApi.deleteNotification(id);
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  const filtered = notifs.filter(
    (n) => (filter === "all" || n.type === filter) && (priorityFilter === "all" || n.priority === priorityFilter),
  );

  return (
    <RecruteurPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Centre Notifications
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {unread} non lues · {total} total · shortlist scout & décisions comité
          </p>
        </div>
        {unread > 0 && (
          <motion.button
            type="button"
            onClick={() => void markAll()}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold"
            style={{ borderColor: "rgba(139,92,246,0.3)", color: "#8B5CF6", background: "rgba(139,92,246,0.08)" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <CheckCheck size={13} /> Tout marquer lu
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Non lues", value: unread, color: "#8B5CF6", icon: Bell },
          { label: "Critiques", value: critical, color: "#EF4444", icon: AlertTriangle },
          { label: "Total", value: total, color: "#3B82F6", icon: TrendingUp },
          {
            label: "Shortlist",
            value: notifs.filter((n) => n.type === "shortlist").length,
            color: "#A855F7",
            icon: Star,
          },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div
                className="rounded-[20px] border p-4 flex items-center gap-3"
                style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${k.color}15` }}>
                  <Icon size={18} style={{ color: k.color }} />
                </div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                    {k.value}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {k.label}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilter(t)}
            className="rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{
              background: filter === t ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)",
              color: filter === t ? "#A855F7" : "var(--text-muted)",
            }}
          >
            {t === "all" ? "Toutes" : TYPE_META[t].label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${filter}-${priorityFilter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {loading && (
            <p className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Chargement…
            </p>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
              <Bell size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune notification</p>
            </div>
          )}
          {!loading &&
            filtered.map((n, i) => {
              const meta = TYPE_META[n.type];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 rounded-2xl border p-4"
                  style={{
                    background: n.read ? "rgba(255,255,255,0.02)" : "rgba(139,92,246,0.08)",
                    borderColor: "var(--surface-panel-border)",
                  }}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: meta.bg, color: meta.color }}>
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {n.title}
                      </p>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${PRIORITY_COLORS[n.priority]}22`, color: PRIORITY_COLORS[n.priority] }}>
                        {n.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {n.time}
                      {n.player ? ` · ${n.player}` : ""}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {!n.read && (
                        <button type="button" onClick={() => void markRead(n.id)} className="text-[11px] font-semibold" style={{ color: "#8B5CF6" }}>
                          Marquer lu
                        </button>
                      )}
                      {(n.type === "shortlist" || n.type === "validation") && (
                        <button type="button" onClick={() => navigate("/recruteur/requests")} className="text-[11px] font-semibold" style={{ color: "#22C55E" }}>
                          Voir demandes
                        </button>
                      )}
                      <button type="button" onClick={() => void dismiss(n.id)} className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <X size={11} className="inline" /> Ignorer
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </motion.div>
      </AnimatePresence>
    </RecruteurPageTransition>
  );
}
