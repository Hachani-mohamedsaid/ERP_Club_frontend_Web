import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Trash2, ScrollText, AlertTriangle, Activity, Calendar, Info, Check } from "lucide-react";
import { RPage, RCard, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, pageVariants, cardVariants } from "../../components/responsable";

type NotifLevel = "Critique" | "Alerte" | "Info" | "Succès";
type NotifType  = "Contrat" | "Validation" | "Médical" | "Match" | "Système";

interface Notification {
  id: string; type: NotifType; level: NotifLevel;
  title: string; body: string; time: string; read: boolean;
}

const LEVEL_COLOR: Record<NotifLevel, string> = {
  Critique: "#EF4444",
  Alerte:   "#FF7A00",
  Info:     "#3B82F6",
  Succès:   "#22C55E",
};
const TYPE_ICON: Record<NotifType, typeof Bell> = {
  Contrat:    ScrollText,
  Validation: CheckCheck,
  Médical:    Activity,
  Match:      Calendar,
  Système:    Info,
};

const INIT: Notification[] = [
  { id: "n1", type: "Contrat",    level: "Critique", title: "Contrat expirant",          body: "Contrat de Karim Gharbi expire dans 15 jours. Action requise.",         time: "10:30", read: false },
  { id: "n2", type: "Validation", level: "Alerte",   title: "Demande en attente",        body: "Recrutement Youssef Ben Ali en attente de validation depuis 2 jours.",  time: "09:45", read: false },
  { id: "n3", type: "Médical",    level: "Alerte",   title: "Blessure signalée",         body: "Ahmed Ben Salah — douleur genou droit — repos préventif 3 jours.",      time: "09:15", read: false },
  { id: "n4", type: "Match",      level: "Info",     title: "Match ce soir",             body: "FC Carthage vs ES Sahel — 21/06 20h00 — Stade El Menzah.",              time: "08:30", read: false },
  { id: "n5", type: "Contrat",    level: "Alerte",   title: "Renouvellement urgent",     body: "3 contrats expirent dans moins de 30 jours.",                           time: "Hier",  read: false },
  { id: "n6", type: "Validation", level: "Succès",   title: "Validation confirmée",      body: "Convocation match du 21/06 approuvée par le responsable.",              time: "Hier",  read: true },
  { id: "n7", type: "Médical",    level: "Info",     title: "Visite médicale planifiée", body: "Visite médicale de mi-saison — tous les joueurs — 25/06.",               time: "Hier",  read: true },
  { id: "n8", type: "Système",    level: "Info",     title: "Mise à jour système",       body: "Maintenance planifiée le 22/06 à 02h00 — durée estimée 30 min.",         time: "18/06", read: true },
  { id: "n9", type: "Contrat",    level: "Succès",   title: "Contrat signé",             body: "Renouvellement Ahmed Ben Salah — 2 ans — signé avec succès.",           time: "17/06", read: true },
];

const FILTER_OPTIONS = ["Toutes", "Contrat", "Validation", "Médical", "Match", "Système"];

export function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(INIT);
  const [filter, setFilter] = useState("Toutes");

  const filtered = useMemo(
    () => (filter === "Toutes" ? notifs : notifs.filter(n => n.type === filter)),
    [notifs, filter]
  );

  const unreadCount = notifs.filter(n => !n.read).length;

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }
  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }
  function dismiss(id: string) {
    setNotifs(prev => prev.filter(n => n.id !== id));
  }
  function clearRead() {
    setNotifs(prev => prev.filter(n => !n.read));
  }

  return (
    <RPage>
      <RHeader
        title="Centre de Notifications"
        subtitle="Contrats, validations, blessures et alertes système."
        badge="NOTIFICATION_MANAGE"
        action={
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <RBtn onClick={markAllRead} variant="ghost"><CheckCheck size={13} /> Tout lire</RBtn>
            )}
            <RBtn onClick={clearRead} variant="danger"><Trash2 size={13} /> Effacer lues</RBtn>
          </div>
        }
      />

      {/* Animated bell + KPIs */}
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
                animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
              >
                {unreadCount}
              </motion.div>
            )}
          </div>
        </div>
        <RKpiCard label="Non lues"    value={String(unreadCount)}                                                    icon={Bell}         color="#FF7A00" />
        <RKpiCard label="Critiques"   value={String(notifs.filter(n => n.level === "Critique" && !n.read).length)}   icon={AlertTriangle} color="#EF4444" />
        <RKpiCard label="Contrats"    value={String(notifs.filter(n => n.type === "Contrat" && !n.read).length)}     icon={ScrollText}   color="#F59E0B" />
        <RKpiCard label="Médicales"   value={String(notifs.filter(n => n.type === "Médical" && !n.read).length)}     icon={Activity}     color="#22C55E" />
      </div>

      <RPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      <RSection title="Notifications" subtitle={`${filtered.length} au total · ${unreadCount} non lues`}>
        <AnimatePresence mode="wait">
          <motion.div key={filter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {filtered.map((n, i) => {
              const Icon = TYPE_ICON[n.type];
              const color = LEVEL_COLOR[n.level];
              return (
                <motion.div key={n.id}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }}>
                  <RRow>
                    <div className="flex items-start gap-3">
                      {/* Unread dot */}
                      {!n.read && (
                        <motion.div className="mt-2 h-2 w-2 shrink-0 rounded-full"
                          style={{ background: color }}
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }} />
                      )}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${color}15` }}>
                        <Icon size={14} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${n.read ? "opacity-60" : ""}`} style={{ color: "var(--text-primary)" }}>
                              {n.title}
                            </p>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              style={{ background: `${color}15`, color }}>
                              {n.level}
                            </span>
                            <span className="rounded-full px-2 py-0.5 text-[10px]"
                              style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                              {n.type}
                            </span>
                          </div>
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{n.time}</span>
                        </div>
                        <p className={`mt-1 text-sm ${n.read ? "opacity-50" : ""}`} style={{ color: "var(--text-secondary)" }}>{n.body}</p>
                        <div className="mt-2 flex gap-1.5">
                          {!n.read && (
                            <RBtn onClick={() => markRead(n.id)} variant="ghost"><Check size={11} /> Marquer lu</RBtn>
                          )}
                          <RBtn onClick={() => dismiss(n.id)} variant="danger"><Trash2 size={11} /> Ignorer</RBtn>
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
        </AnimatePresence>
      </RSection>
    </RPage>
  );
}
