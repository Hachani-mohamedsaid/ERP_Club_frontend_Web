import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, X, AlertTriangle, DollarSign, Clock, Star, TrendingUp, FileCheck } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";

type NType = "offre" | "contrat" | "talent" | "validation" | "budget" | "blessure";
type Priority = "critical" | "high" | "medium" | "low";

interface RNotif {
  id: string;
  type: NType;
  title: string;
  body: string;
  time: string;
  priority: Priority;
  read: boolean;
  player?: string;
}

const TYPE_META: Record<NType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  offre:      { icon: FileCheck,    color: "#22C55E", bg: "rgba(34,197,94,0.14)",   label: "Offre"      },
  contrat:    { icon: AlertTriangle,color: "#FF7A00", bg: "rgba(255,122,0,0.14)",   label: "Contrat"    },
  talent:     { icon: Star,         color: "#8B5CF6", bg: "rgba(139,92,246,0.14)",  label: "Talent"     },
  validation: { icon: CheckCheck,   color: "#F59E0B", bg: "rgba(245,158,11,0.14)",  label: "Validation" },
  budget:     { icon: DollarSign,   color: "#EF4444", bg: "rgba(239,68,68,0.14)",   label: "Budget"     },
  blessure:   { icon: AlertTriangle,color: "#EF4444", bg: "rgba(239,68,68,0.14)",   label: "Blessure"   },
};

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: "#EF4444", high: "#FF7A00", medium: "#F59E0B", low: "#6B7280",
};

const INITIAL_NOTIFS: RNotif[] = [
  { id: "n1", type: "offre",      priority: "critical", title: "Offre acceptée!", body: "Ahmed Ali a accepté l'offre de transfert de FC Carthage. Prochaine étape: signature contrat.", time: "Il y a 5 min",  player: "Ahmed Ali",       read: false },
  { id: "n2", type: "contrat",    priority: "high",     title: "Contrat expirant", body: "Le contrat de Yassine Khemiri expire dans 3 mois. Action requise immédiatement.", time: "Il y a 1h",    player: "Yassine Khemiri", read: false },
  { id: "n3", type: "talent",     priority: "high",     title: "Nouveau talent détecté", body: "Scout Ahmed a identifié un défenseur central (24 ans, Alg) — score IA: 87/100.", time: "Il y a 2h",    player: "Nouveau #DZ-24",  read: false },
  { id: "n4", type: "validation", priority: "high",     title: "Validation en attente", body: "Ibrahim Touré: dossier de recrutement en attente d'approbation du Directeur Sportif.", time: "Il y a 3h",    player: "Ibrahim Touré",   read: false },
  { id: "n5", type: "budget",     priority: "critical", title: "Budget dépassé", body: "Le budget recrutement mensuel a été dépassé de 15%. Limite: 500k€. Actuel: 575k€.", time: "Il y a 4h",    player: undefined,         read: false },
  { id: "n6", type: "blessure",   priority: "medium",   title: "Blessure joueur cible", body: "Khalil Maatoug (cible shortlist) blessé: ischio Grade II. Indisponible 4-6 semaines.", time: "Il y a 6h",    player: "Khalil Maatoug",  read: true  },
  { id: "n7", type: "offre",      priority: "medium",   title: "Contre-offre reçue", body: "L'agent de Ryad Bouassem demande +200k€ sur le transfert. Réponse attendue sous 48h.", time: "Hier 14:30",  player: "Ryad Bouassem",   read: true  },
  { id: "n8", type: "talent",     priority: "low",      title: "Rapport scout disponible", body: "Scout Ali (Maroc) a soumis son rapport mensuel — 8 nouveaux profils analysés.", time: "Hier 10:00",  player: undefined,         read: true  },
  { id: "n9", type: "contrat",    priority: "low",      title: "Renouvellement préventif", body: "Sofiane Bellal: contrat à 18 mois. Recommandation IA: anticiper la prolongation.", time: "20/06 09:00", player: "Sofiane Bellal",  read: true  },
];

const FILTER_TYPES: (NType | "all")[] = ["all", "offre", "contrat", "talent", "validation", "budget", "blessure"];

export function RecruteurNotificationsPage() {
  const [notifs, setNotifs] = useState<RNotif[]>(INITIAL_NOTIFS);
  const [filter, setFilter] = useState<NType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const unread   = notifs.filter(n => !n.read).length;
  const critical = notifs.filter(n => n.priority === "critical").length;
  const total    = notifs.length;

  const markAll  = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss  = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));

  const filtered = notifs.filter(n =>
    (filter === "all" || n.type === filter) &&
    (priorityFilter === "all" || n.priority === priorityFilter)
  );

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Centre Notifications</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{unread} non lues · {total} total</p>
        </div>
        {unread > 0 && (
          <motion.button type="button" onClick={markAll}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold"
            style={{ borderColor: "rgba(139,92,246,0.3)", color: "#8B5CF6", background: "rgba(139,92,246,0.08)" }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <CheckCheck size={13} /> Tout marquer lu
          </motion.button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Non lues",    value: unread,   color: "#8B5CF6", icon: Bell          },
          { label: "Critiques",   value: critical,  color: "#EF4444", icon: AlertTriangle },
          { label: "Ce mois",     value: total,     color: "#3B82F6", icon: TrendingUp    },
          { label: "Offres",      value: notifs.filter(n => n.type === "offre").length, color: "#22C55E", icon: FileCheck },
        ].map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="rounded-[20px] border p-4 flex items-center gap-3"
                style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${k.color}15` }}>
                  <Icon size={18} style={{ color: k.color }} />
                </div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{k.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TYPES.map(f => {
          const meta = f !== "all" ? TYPE_META[f] : null;
          return (
            <motion.button key={f} type="button" onClick={() => setFilter(f)}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: filter === f ? (meta ? meta.bg : "rgba(139,92,246,0.2)") : "rgba(255,255,255,0.04)",
                color: filter === f ? (meta ? meta.color : "#8B5CF6") : "var(--text-muted)",
                border: `1px solid ${filter === f ? (meta ? `${meta.color}40` : "rgba(139,92,246,0.4)") : "transparent"}`,
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              {f === "all" ? "Toutes" : meta!.label}
            </motion.button>
          );
        })}
        <div className="ml-auto flex gap-1">
          {(["all","critical","high","medium","low"] as const).map(p => (
            <motion.button key={p} type="button" onClick={() => setPriorityFilter(p)}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: priorityFilter === p ? (p === "all" ? "rgba(255,255,255,0.1)" : `${PRIORITY_COLORS[p as Priority]}20`) : "rgba(255,255,255,0.03)",
                color: p === "all" ? "var(--text-muted)" : PRIORITY_COLORS[p as Priority],
                border: "1px solid transparent",
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              {p === "all" ? "Priorité: toutes" : p}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((n, i) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            return (
              <motion.div key={n.id} layout
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 rounded-[16px] border p-4"
                style={{
                  background: n.read ? "rgba(14,10,35,0.6)" : meta.bg,
                  borderColor: n.read ? "rgba(255,255,255,0.06)" : `${meta.color}30`,
                  opacity: n.read ? 0.75 : 1,
                }}>
                {/* Icon */}
                <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}
                  animate={n.read ? {} : { boxShadow: [`0 0 0px ${meta.color}00`, `0 0 14px ${meta.color}60`, `0 0 0px ${meta.color}00`] }}
                  transition={{ duration: 2, repeat: n.read ? 0 : Infinity }}>
                  <Icon size={16} style={{ color: meta.color }} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${PRIORITY_COLORS[n.priority]}18`, color: PRIORITY_COLORS[n.priority] }}>
                      {n.priority}
                    </span>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                    )}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{n.body}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1"><Clock size={9} /> {n.time}</span>
                    {n.player && <span className="flex items-center gap-1"><Star size={9} /> {n.player}</span>}
                    <span className="rounded-full px-2 py-0.5" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 gap-1">
                  {!n.read && (
                    <motion.button type="button" onClick={() => markRead(n.id)}
                      className="rounded-lg p-1.5" style={{ background: "rgba(34,197,94,0.12)" }}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Marquer lu">
                      <CheckCheck size={12} style={{ color: "#22C55E" }} />
                    </motion.button>
                  )}
                  <motion.button type="button" onClick={() => dismiss(n.id)}
                    className="rounded-lg p-1.5" style={{ background: "rgba(239,68,68,0.1)" }}
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} title="Supprimer">
                    <X size={12} style={{ color: "#EF4444" }} />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-[20px] border py-16"
            style={{ background: "rgba(14,10,35,0.6)", borderColor: "var(--surface-panel-border)" }}>
            <Bell size={28} className="mb-3 opacity-25" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune notification</p>
          </motion.div>
        )}
      </div>
    </RecruteurPageTransition>
  );
}
