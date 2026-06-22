import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, AlertTriangle, Zap, CheckCircle2, ClipboardX,
  Clock, BellOff, Trash2,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";

type NotifType = "blessure" | "fatigue" | "validation_coach" | "programme_refuse" | "wellness" | "recuperation";
type NotifPriority = "haute" | "moyenne" | "basse";

interface Notif {
  id: string; type: NotifType; title: string; message: string;
  time: string; priority: NotifPriority; read: boolean; player?: string;
}

const TYPE_CONFIG: Record<NotifType, { icon: typeof Bell; color: string; label: string }> = {
  blessure:         { icon: AlertTriangle, color: "#EF4444", label: "Blessure"       },
  fatigue:          { icon: Zap,           color: "#FF7A00", label: "Fatigue"         },
  validation_coach: { icon: CheckCircle2,  color: "#22C55E", label: "Coach"           },
  programme_refuse: { icon: ClipboardX,    color: "#8B5CF6", label: "Programme refusé"},
  wellness:         { icon: Bell,          color: "#3B82F6", label: "Wellness"        },
  recuperation:     { icon: Clock,         color: "#F59E0B", label: "Récupération"    },
};

const INIT_NOTIFS: Notif[] = [
  { id: "n1", type: "blessure",         title: "Blessure musculaire détectée",      message: "Ahmed Ben Salah — douleur ischio-jambier droite. Consultation médicale requise urgente.", time: "Il y a 8 min",  priority: "haute",  read: false, player: "Ahmed Ben Salah" },
  { id: "n2", type: "fatigue",          title: "Seuil fatigue dépassé",             message: "Karim Dridi dépasse 85% fatigue. Recommandation : réduire charge 20% demain.",            time: "Il y a 22 min", priority: "haute",  read: false, player: "Karim Dridi"     },
  { id: "n3", type: "programme_refuse", title: "Programme refusé par Coach Nabil",  message: "Programme Force Semaine 26 — motif : séance trop intensive avant match J29.",             time: "Il y a 45 min", priority: "moyenne",read: false  },
  { id: "n4", type: "validation_coach", title: "Programme validé",                  message: "Programme Retour Blessure (Youssef Trabelsi) validé par Coach Nabil. Démarrage demain.", time: "Il y a 1h",    priority: "basse",  read: false  },
  { id: "n5", type: "wellness",         title: "Questionnaire non rempli",          message: "3 joueurs n'ont pas rempli le questionnaire wellness pré-entraînement.",                  time: "Il y a 2h",    priority: "moyenne",read: true   },
  { id: "n6", type: "recuperation",     title: "Session récupération terminée",     message: "Ali Mansouri — protocole hydratation post-match terminé. Statut: disponible.",          time: "Il y a 3h",    priority: "basse",  read: true   },
  { id: "n7", type: "fatigue",          title: "Mohamed Sassi — fatigue modérée",   message: "Fatigue 62% — surveillance conseillée. Pas de restriction pour la séance de demain.",  time: "Il y a 4h",    priority: "basse",  read: true, player: "Mohamed Sassi"  },
  { id: "n8", type: "blessure",         title: "Youssef Trabelsi — blessure cheville","message": "Cheville en rééducation — semaine 2 sur 4. Progression normale.",               time: "Il y a 5h",    priority: "moyenne",read: true, player: "Youssef Trabelsi"},
];

const PRIORITY_COLOR: Record<NotifPriority, string> = {
  haute: "#EF4444", moyenne: "#FF7A00", basse: "#22C55E",
};

type FilterTab = "Toutes" | NotifType;

export function PrepNotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INIT_NOTIFS);
  const [filter, setFilter] = useState<FilterTab>("Toutes");

  const unread = notifs.filter(n => !n.read).length;
  const haute  = notifs.filter(n => n.priority === "haute").length;
  const medium = notifs.filter(n => n.priority === "moyenne").length;

  const filtered = filter === "Toutes" ? notifs : notifs.filter(n => n.type === filter);

  function markRead(id: string) { setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); }
  function markAllRead() { setNotifs(prev => prev.map(n => ({ ...n, read: true }))); }
  function remove(id: string) { setNotifs(prev => prev.filter(n => n.id !== id)); }

  return (
    <PrepPageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Non lues",     value: String(unread),  color: "#FF7A00", icon: Bell          },
          { label: "Haute priorité",value: String(haute),  color: "#EF4444", icon: AlertTriangle },
          { label: "Priorité moy.", value: String(medium), color: "#8B5CF6", icon: Zap           },
          { label: "Total",        value: String(notifs.length), color: "#3B82F6", icon: CheckCircle2 },
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

      {/* Filters + mark all */}
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
        {unread > 0 && (
          <motion.button type="button" onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
            whileHover={{ borderColor: "rgba(255,122,0,0.3)", color: "var(--accent)" }}>
            <BellOff size={11} /> Tout marquer lu
          </motion.button>
        )}
      </div>

      {/* Notif list */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {filtered.map((n, i) => {
            const cfg = TYPE_CONFIG[n.type];
            const Icon = cfg.icon;
            const pColor = PRIORITY_COLOR[n.priority];
            return (
              <motion.div key={n.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ delay: i * 0.03 }}>
                <PrepKpiCard hover={false} className={!n.read ? "ring-1 ring-orange-500/20" : ""}>
                  <div className="flex items-start gap-3">
                    <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${cfg.color}18`, color: cfg.color }}
                      animate={!n.read ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: !n.read ? Infinity : 0 }}>
                      <Icon size={14} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold" style={{ color: n.read ? "var(--text-secondary)" : "var(--text-primary)" }}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <motion.div className="h-2 w-2 rounded-full" style={{ background: "#FF7A00" }}
                                animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{n.message}</p>
                          {n.player && (
                            <p className="text-[10px] mt-1 font-semibold" style={{ color: cfg.color }}>→ {n.player}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                            style={{ background: `${pColor}18`, color: pColor }}>{n.priority}</span>
                          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {!n.read && (
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
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <BellOff size={32} className="mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune notification</p>
          </div>
        )}
      </div>
    </PrepPageTransition>
  );
}
