import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, AlertTriangle, Zap, CheckCircle2, ClipboardX,
  Clock, BellOff, Trash2, RefreshCw,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { clubApi } from "../../lib/api/club";

type NotifType = "blessure" | "fatigue" | "validation_coach" | "programme_refuse" | "wellness" | "recuperation";
type NotifPriority = "haute" | "moyenne" | "basse";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  priority: NotifPriority;
  isRead: boolean;
  playerName: string | null;
  createdAt: string;
}

const TYPE_CONFIG: Record<NotifType, { icon: typeof Bell; color: string; label: string }> = {
  blessure:         { icon: AlertTriangle, color: "#EF4444", label: "Blessure"        },
  fatigue:          { icon: Zap,           color: "#FF7A00", label: "Fatigue"          },
  validation_coach: { icon: CheckCircle2,  color: "#22C55E", label: "Coach"            },
  programme_refuse: { icon: ClipboardX,    color: "#8B5CF6", label: "Programme refusé" },
  wellness:         { icon: Bell,          color: "#3B82F6", label: "Wellness"         },
  recuperation:     { icon: Clock,         color: "#F59E0B", label: "Récupération"     },
};

const PRIORITY_COLOR: Record<NotifPriority, string> = {
  haute: "#EF4444", moyenne: "#FF7A00", basse: "#22C55E",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

type FilterTab = "Toutes" | NotifType;

export function PrepNotificationsPage() {
  const [notifs, setNotifs]   = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<FilterTab>("Toutes");

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    (clubApi.getPrepNotifications() as Promise<Notif[]>)
      .then(setNotifs)
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const unread  = notifs.filter(n => !n.isRead).length;
  const haute   = notifs.filter(n => n.priority === "haute").length;
  const medium  = notifs.filter(n => n.priority === "moyenne").length;

  const filtered = filter === "Toutes" ? notifs : notifs.filter(n => n.type === filter);

  async function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await (clubApi.markPrepNotificationRead(id) as Promise<unknown>).catch(() => {});
  }

  async function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    await (clubApi.markAllPrepNotificationsRead() as Promise<unknown>).catch(() => {});
  }

  async function remove(id: string) {
    setNotifs(prev => prev.filter(n => n.id !== id));
    await (clubApi.deletePrepNotification(id) as Promise<unknown>).catch(() => {});
  }

  return (
    <PrepPageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Non lues",      value: loading ? "…" : String(unread),         color: "#FF7A00", icon: Bell          },
          { label: "Haute priorité",value: loading ? "…" : String(haute),           color: "#EF4444", icon: AlertTriangle },
          { label: "Priorité moy.", value: loading ? "…" : String(medium),          color: "#8B5CF6", icon: Zap           },
          { label: "Total",         value: loading ? "…" : String(notifs.length),   color: "#3B82F6", icon: CheckCircle2  },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <PrepKpiCard hover={false}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={{ boxShadow: unread > 0 && color === "#FF7A00" ? [`0 0 0px ${color}00`, `0 0 14px ${color}55`, `0 0 0px ${color}00`] : "none" }}
                  transition={{ duration: 1.5, repeat: Infinity }}>
                  <Icon size={14} />
                </motion.div>
                <div>
                  <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </PrepKpiCard>
          </motion.div>
        ))}
      </div>

      {/* Filters + actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(["Toutes", ...Object.keys(TYPE_CONFIG)] as FilterTab[]).map(f => {
            const cfg = f !== "Toutes" ? TYPE_CONFIG[f as NotifType] : null;
            return (
              <motion.button key={f} type="button" onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
                style={{
                  background: filter === f ? (cfg ? `${cfg.color}22` : "linear-gradient(135deg,var(--accent),#E66000)") : "rgba(255,255,255,0.04)",
                  color:      filter === f ? (cfg?.color ?? "white") : "var(--text-muted)",
                  border:     filter === f ? `1px solid ${cfg?.color ?? "transparent"}40` : "1px solid rgba(255,255,255,0.06)",
                }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                {cfg && <cfg.icon size={10} />}
                {f === "Toutes" ? "Toutes" : cfg!.label}
              </motion.button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <motion.button type="button" onClick={fetchNotifs}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
            whileHover={{ borderColor: "rgba(255,122,0,0.3)", color: "var(--accent)" }}
            whileTap={{ scale: 0.96 }}>
            <RefreshCw size={10} /> Actualiser
          </motion.button>
          {unread > 0 && (
            <motion.button type="button" onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
              whileHover={{ borderColor: "rgba(255,122,0,0.3)", color: "var(--accent)" }}>
              <BellOff size={11} /> Tout marquer lu
            </motion.button>
          )}
        </div>
      </div>

      {/* Notif list */}
      <div className="space-y-2.5">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-20 animate-pulse rounded-[20px]"
              style={{ background: "rgba(255,255,255,0.04)" }} />
          ))
        ) : (
          <AnimatePresence>
            {filtered.map((n, i) => {
              const cfg    = TYPE_CONFIG[n.type] ?? TYPE_CONFIG["blessure"];
              const Icon   = cfg.icon;
              const pColor = PRIORITY_COLOR[n.priority] ?? "#94A3B8";
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0 }}
                  transition={{ delay: i * 0.03 }}>
                  <PrepKpiCard hover={false} className={!n.isRead ? "ring-1 ring-orange-500/20" : ""}>
                    <div className="flex items-start gap-3">
                      <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${cfg.color}18`, color: cfg.color }}
                        animate={!n.isRead ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: !n.isRead ? Infinity : 0 }}>
                        <Icon size={14} />
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold truncate"
                                style={{ color: n.isRead ? "var(--text-secondary)" : "var(--text-primary)" }}>
                                {n.title}
                              </p>
                              {!n.isRead && (
                                <motion.div className="h-2 w-2 shrink-0 rounded-full" style={{ background: "#FF7A00" }}
                                  animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                              {n.body}
                            </p>
                            {n.playerName && (
                              <p className="mt-1 text-[10px] font-semibold" style={{ color: cfg.color }}>
                                → {n.playerName}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                              style={{ background: `${pColor}18`, color: pColor }}>
                              {n.priority}
                            </span>
                            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          {!n.isRead && (
                            <motion.button type="button" onClick={() => markRead(n.id)}
                              className="rounded-lg border px-2.5 py-1 text-[10px]"
                              style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                              whileHover={{ borderColor: "rgba(255,122,0,0.3)", color: "var(--accent)" }}>
                              Marquer lu
                            </motion.button>
                          )}
                          <motion.button type="button" onClick={() => remove(n.id)}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px]"
                            style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                            whileHover={{ borderColor: "rgba(239,68,68,0.3)", color: "#EF4444" }}>
                            <Trash2 size={9} /> Supprimer
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </PrepKpiCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <BellOff size={32} className="mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune notification</p>
          </div>
        )}
      </div>
    </PrepPageTransition>
  );
}
