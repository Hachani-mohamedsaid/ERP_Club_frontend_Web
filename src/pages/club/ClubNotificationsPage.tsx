import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import {
  Bell, CheckCheck, Trash2, AlertTriangle, TrendingDown,
  Stethoscope, ScrollText, Settings, Info, DollarSign,
  CheckCircle2, X,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
type NotifType = "Contrats" | "Finance" | "Médical" | "Système" | "Info";
type NotifLevel = "critical" | "warning" | "info" | "success";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotifType;
  level: NotifLevel;
  date: string;
  read: boolean;
}

/* ── Mock data ──────────────────────────────────────────────────── */
const INITIAL_NOTIFS: Notification[] = [
  { id: "n1",  title: "Contrat expirant",      description: "Le contrat d'Ahmed Ben Salah expire dans 30 jours (31/07/2026).",      type: "Contrats", level: "warning",  date: "19/06 10:00", read: false },
  { id: "n2",  title: "Budget dépassé",         description: "Le budget marketing du club a dépassé 85% de l'allocation mensuelle.", type: "Finance",  level: "critical", date: "19/06 09:15", read: false },
  { id: "n3",  title: "Joueur blessé",          description: "Youssef Maatoug blessé à l'entraînement – suspendu 2 semaines.",       type: "Médical",  level: "warning",  date: "18/06 16:30", read: false },
  { id: "n4",  title: "Paiement reçu",          description: "Facture F-2026-05 payée – 20 400 DT par virement.",                    type: "Finance",  level: "success",  date: "18/06 14:00", read: false },
  { id: "n5",  title: "Mise à jour système",    description: "ODIN ERP v2.4.1 déployée avec succès – nouvelles fonctionnalités.",    type: "Système",  level: "info",     date: "17/06 08:00", read: true  },
  { id: "n6",  title: "Contrat renouvelé",      description: "Contrat de Sonia Khelil renouvelé jusqu'au 31/12/2027.",               type: "Contrats", level: "success",  date: "16/06 11:45", read: true  },
  { id: "n7",  title: "Joueur à risque",        description: "Karim Gharbi présente une fatigue musculaire élevée (score: 8.2/10).", type: "Médical",  level: "critical", date: "16/06 09:20", read: true  },
  { id: "n8",  title: "Facture en retard",      description: "Facture F-2026-03 non payée depuis 45 jours. Relance automatique.",    type: "Finance",  level: "critical", date: "15/06 17:00", read: false },
  { id: "n9",  title: "Nouveau prospect",       description: "Mehdi Kacem (SC Sfaxien) ajouté à la shortlist de recrutement.",       type: "Info",     level: "info",     date: "15/06 13:30", read: true  },
  { id: "n10", title: "Rapport mensuel prêt",   description: "Rapport performance Mai 2026 généré et disponible au téléchargement.", type: "Info",     level: "info",     date: "14/06 10:00", read: true  },
];

const TYPE_TABS = ["Toutes", "Contrats", "Finance", "Médical", "Système", "Info"] as const;
type TypeTab = (typeof TYPE_TABS)[number];

const LEVEL_COLOR: Record<NotifLevel, string> = {
  critical: "#EF4444",
  warning:  "#FF6B57",
  info:     "#3B82F6",
  success:  "#22C55E",
};

const LEVEL_LABEL: Record<NotifLevel, string> = {
  critical: "Critique",
  warning:  "Attention",
  info:     "Info",
  success:  "Succès",
};

const TYPE_ICON: Record<NotifType, typeof Bell> = {
  Contrats: ScrollText,
  Finance:  DollarSign,
  Médical:  Stethoscope,
  Système:  Settings,
  Info:     Info,
};

const TYPE_COLOR: Record<NotifType, string> = {
  Contrats: "#F59E0B",
  Finance:  "#10B981",
  Médical:  "#EF4444",
  Système:  "#3B82F6",
  Info:     "#8B5CF6",
};

/* ── Main page ──────────────────────────────────────────────────── */
export function ClubNotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS);
  const [activeTab, setActiveTab] = useState<TypeTab>("Toutes");

  const filtered = useMemo(
    () => notifs.filter((n) => activeTab === "Toutes" || n.type === activeTab),
    [notifs, activeTab],
  );

  const unreadCount = notifs.filter((n) => !n.read).length;
  const criticalCount = notifs.filter((n) => n.level === "critical" && !n.read).length;

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  function dismiss(id: string) {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }

  function clearRead() {
    setNotifs((prev) => prev.filter((n) => !n.read));
  }

  return (
    <ClubPageTransition>
      {/* Header */}
      <ClubKpiCard hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "rgba(255,107,87,0.15)" }}
                animate={{ boxShadow: unreadCount > 0 ? ["0 0 0px rgba(255,107,87,0)", "0 0 20px rgba(255,107,87,0.5)", "0 0 0px rgba(255,107,87,0)"] : [] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bell size={20} style={{ color: "#FF6B57" }} />
              </motion.div>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: "#EF4444" }}
                >
                  {unreadCount}
                </motion.span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
              <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Centre de notifications</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button type="button" onClick={markAllRead}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
              whileHover={{ borderColor: "#22C55E", color: "#22C55E" }}>
              <CheckCheck size={13} /> Tout marquer lu
            </motion.button>
            <motion.button type="button" onClick={clearRead}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
              style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
              whileHover={{ borderColor: "#EF4444", color: "#EF4444" }}>
              <Trash2 size={13} /> Supprimer lues
            </motion.button>
          </div>
        </div>
      </ClubKpiCard>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Non lues", value: unreadCount, color: "#FF6B57", icon: Bell },
          { label: "Critiques", value: criticalCount, color: "#EF4444", icon: AlertTriangle },
          { label: "Finance", value: notifs.filter((n) => n.type === "Finance").length, color: "#10B981", icon: DollarSign },
          { label: "Médical", value: notifs.filter((n) => n.type === "Médical").length, color: "#3B82F6", icon: Stethoscope },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <ClubKpiCard key={label} delay={i * 0.07}>
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}1f` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
          </ClubKpiCard>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TYPE_TABS.map((tab) => {
          const count = tab === "Toutes" ? notifs.filter((n) => !n.read).length : notifs.filter((n) => n.type === tab && !n.read).length;
          const color = TYPE_COLOR[tab as NotifType] ?? "#FF6B57";
          const active = activeTab === tab;
          return (
            <motion.button
              key={tab} type="button" onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
              style={{
                background: active ? `${color}20` : "rgba(255,255,255,0.04)",
                color: active ? color : "var(--text-muted)",
                border: `1px solid ${active ? color + "50" : "rgba(255,255,255,0.08)"}`,
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              {tab}
              {count > 0 && (
                <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: active ? color : "#EF4444" }}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Notifications list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((notif, i) => {
            const Icon = TYPE_ICON[notif.type];
            const levelColor = LEVEL_COLOR[notif.level];
            const typeColor = TYPE_COLOR[notif.type];
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={{ delay: i * 0.04, exit: { duration: 0.2 } }}
                className="flex gap-4 rounded-2xl border p-4 transition-all"
                style={{
                  background: notif.read ? "rgba(255,255,255,0.02)" : "rgba(255,107,87,0.04)",
                  borderColor: notif.read ? "rgba(255,255,255,0.05)" : "rgba(255,107,87,0.15)",
                  borderLeft: `3px solid ${levelColor}`,
                }}
              >
                {/* Icon */}
                <motion.div
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${typeColor}18` }}
                  animate={!notif.read && notif.level === "critical"
                    ? { boxShadow: [`0 0 0px ${levelColor}00`, `0 0 14px ${levelColor}60`, `0 0 0px ${levelColor}00`] }
                    : {}}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  <Icon size={16} style={{ color: typeColor }} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!notif.read && (
                        <motion.div
                          className="h-2 w-2 rounded-full"
                          style={{ background: "#FF6B57" }}
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                      <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{notif.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: `${levelColor}18`, color: levelColor }}>
                        {LEVEL_LABEL[notif.level]}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{notif.date}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{notif.description}</p>
                  <div className="mt-2 flex gap-2">
                    {!notif.read && (
                      <motion.button type="button" onClick={() => markRead(notif.id)}
                        className="flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: "#22C55E" }}
                        whileHover={{ scale: 1.05 }}>
                        <CheckCircle2 size={11} /> Marquer lu
                      </motion.button>
                    )}
                    <motion.button type="button" onClick={() => dismiss(notif.id)}
                      className="flex items-center gap-1 text-[11px] font-medium"
                      style={{ color: "var(--text-muted)" }}
                      whileHover={{ color: "#EF4444", scale: 1.05 }}>
                      <X size={11} /> Ignorer
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
            <CheckCheck size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucune notification dans cette catégorie</p>
          </div>
        )}
      </div>
    </ClubPageTransition>
  );
}
