import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Snowflake, Waves, BedDouble, Droplets, CheckCircle2,
  TrendingUp, Users, Plus, Clock,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PLAYER_DETAILS } from "../../data/preparateurData";

type RecovMethod = "Cryothérapie" | "Massage" | "Repos" | "Hydratation";
type RecovStatus = "Planifié" | "En cours" | "Terminé";

interface RecovSession {
  id: string; playerId: string; playerName: string; method: RecovMethod;
  date: string; duration: string; status: RecovStatus; notes: string;
}

const METHOD_CONFIG: Record<RecovMethod, { icon: typeof Snowflake; color: string; desc: string }> = {
  Cryothérapie: { icon: Snowflake, color: "#3B82F6", desc: "Bain froid ou cryo-chambre" },
  Massage:      { icon: Waves,    color: "#8B5CF6", desc: "Massage sportif décontracturant" },
  Repos:        { icon: BedDouble,color: "#22C55E", desc: "Repos complet ou actif léger"   },
  Hydratation:  { icon: Droplets, color: "#FF7A00", desc: "Protocole hydratation & nutrition" },
};

const INIT_SESSIONS: RecovSession[] = [
  { id: "r1", playerId: "1", playerName: "Ahmed Ben Salah",  method: "Cryothérapie", date: "2026-06-21", duration: "15 min",  status: "En cours", notes: "Bain froid 10°C — récupération ischio" },
  { id: "r2", playerId: "5", playerName: "Karim Dridi",     method: "Massage",       date: "2026-06-21", duration: "45 min",  status: "Planifié", notes: "Massage cuisse — tension articulaire genou" },
  { id: "r3", playerId: "3", playerName: "Youssef Trabelsi",method: "Repos",         date: "2026-06-21", duration: "Journée", status: "En cours", notes: "Repos total — cheville en rééducation" },
  { id: "r4", playerId: "2", playerName: "Ali Mansouri",    method: "Hydratation",   date: "2026-06-20", duration: "Journée", status: "Terminé",  notes: "Protocole post-match — réhydratation complète" },
  { id: "r5", playerId: "4", playerName: "Mohamed Sassi",   method: "Massage",       date: "2026-06-20", duration: "30 min",  status: "Terminé",  notes: "Massage lombaire — lombalgie légère" },
];

const STATUS_COLOR: Record<RecovStatus, string> = {
  Planifié: "#FF7A00", "En cours": "#3B82F6", Terminé: "#22C55E",
};

export function PrepRecoveryPage() {
  const [sessions, setSessions] = useState<RecovSession[]>(INIT_SESSIONS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ playerId: "1", method: "Repos" as RecovMethod, date: "", duration: "", notes: "" });
  const [filter, setFilter] = useState<RecovMethod | "Tous">("Tous");

  const filteredSessions = filter === "Tous" ? sessions : sessions.filter(s => s.method === filter);
  const inProgress = sessions.filter(s => s.status === "En cours").length;
  const planned    = sessions.filter(s => s.status === "Planifié").length;
  const done       = sessions.filter(s => s.status === "Terminé").length;

  function saveForm() {
    const player = PLAYER_DETAILS.find(p => p.id === form.playerId)!;
    setSessions(prev => [...prev, {
      id: `r${Date.now()}`, playerId: form.playerId, playerName: player.name,
      method: form.method, date: form.date, duration: form.duration,
      status: "Planifié", notes: form.notes,
    }]);
    setModal(false);
  }

  const recs = [
    { player: "Ahmed Ben Salah", rec: "Cryo + repos 48h", urgency: "high" },
    { player: "Karim Dridi",     rec: "Massage + cryothérapie",   urgency: "high" },
    { player: "Youssef Trabelsi",rec: "Repos complet + kiné",     urgency: "medium" },
    { player: "Mohamed Sassi",   rec: "Hydratation renforcée",    urgency: "low" },
  ];

  return (
    <PrepPageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Sessions totales", value: String(sessions.length), color: "#3B82F6", icon: CheckCircle2 },
          { label: "En cours",         value: String(inProgress),       color: "#FF7A00", icon: Clock       },
          { label: "Planifiées",       value: String(planned),          color: "#8B5CF6", icon: Plus        },
          { label: "Terminées",        value: String(done),             color: "#22C55E", icon: TrendingUp  },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <PrepKpiCard hover={false}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}40`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
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

      {/* Method cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(METHOD_CONFIG) as RecovMethod[]).map(m => {
          const cfg = METHOD_CONFIG[m];
          const Icon = cfg.icon;
          const count = sessions.filter(s => s.method === m).length;
          return (
            <motion.div key={m} onClick={() => setFilter(filter === m ? "Tous" : m)}
              className="cursor-pointer">
              <PrepKpiCard hover={false} className={filter === m ? "ring-1 ring-orange-500/50" : ""}>
                <div className="flex items-center gap-2.5">
                  <motion.div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${cfg.color}18`, color: cfg.color }}
                    animate={{ rotate: filter === m ? [0, 10, -10, 0] : 0 }}
                    transition={{ duration: 0.4 }}>
                    <Icon size={16} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{m}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{count} session{count !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>{cfg.desc}</p>
              </PrepKpiCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Sessions list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Sessions récupération ({filteredSessions.length})
            </h3>
            <motion.button type="button" onClick={() => setModal(true)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white"
              style={{ background: "linear-gradient(135deg,var(--accent),#E66000)" }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Plus size={12} /> Planifier
            </motion.button>
          </div>
          <AnimatePresence>
            {filteredSessions.map((s, i) => {
              const cfg = METHOD_CONFIG[s.method];
              const Icon = cfg.icon;
              const statusColor = STATUS_COLOR[s.status];
              return (
                <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.04 }}>
                  <PrepKpiCard hover={false}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${cfg.color}18` }}>
                        <Icon size={14} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{s.playerName}</p>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{ background: `${statusColor}18`, color: statusColor }}>
                            {s.status}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: cfg.color }}>{s.method}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>{s.date} · {s.duration}</p>
                        {s.notes && <p className="text-[11px] mt-1 italic" style={{ color: "var(--text-muted)" }}>{s.notes}</p>}
                      </div>
                    </div>
                  </PrepKpiCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* AI recommendations */}
        <PrepKpiCard hover={false}>
          <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Recommandations récupération IA
          </p>
          <div className="space-y-3">
            {recs.map((r, i) => {
              const color = r.urgency === "high" ? "#EF4444" : r.urgency === "medium" ? "#FF7A00" : "#22C55E";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-xl border p-3"
                  style={{ background: `${color}06`, borderColor: `${color}20` }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{r.player}</p>
                  <p className="text-[11px] mt-1" style={{ color }}>→ {r.rec}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl border p-3" style={{ background: "rgba(255,122,0,0.06)", borderColor: "rgba(255,122,0,0.2)" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "#FF7A00" }}>Protocole équipe recommandé</p>
            <ul className="space-y-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <li>• Hydratation 3L/jour après match</li>
              <li>• Cryothérapie dans 24h post-match</li>
              <li>• Massage préventif — défenseurs 2x/semaine</li>
              <li>• Journée repos actif mercredi</li>
            </ul>
          </div>
        </PrepKpiCard>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(8,14,30,0.98)", borderColor: "rgba(255,122,0,0.3)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}>
              <h3 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>Planifier une récupération</h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Joueur</label>
                  <select value={form.playerId} onChange={e => setForm(p => ({ ...p, playerId: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>
                    {PLAYER_DETAILS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Méthode</label>
                  <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value as RecovMethod }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>
                    {(Object.keys(METHOD_CONFIG) as RecovMethod[]).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {[
                  { label: "Date", field: "date" as const, type: "date" },
                  { label: "Durée", field: "duration" as const, type: "text", placeholder: "Ex: 30 min" },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input type={type} placeholder={placeholder} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button type="button" onClick={saveForm}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,var(--accent),#E66000)" }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <CheckCircle2 size={13} /> Planifier
                </motion.button>
                <motion.button type="button" onClick={() => setModal(false)}
                  className="rounded-xl border px-4 py-2.5 text-sm"
                  style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
                  whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}>
                  Annuler
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PrepPageTransition>
  );
}
