import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Snowflake, Waves, BedDouble, Droplets, CheckCircle2,
  TrendingUp, Plus, Clock, Trash2,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { clubApi } from "../../lib/api/club";

type RecovMethod = "Cryothérapie" | "Massage" | "Repos" | "Hydratation";
type RecovStatus = "Planifié" | "En cours" | "Terminé";

interface RecovSession {
  id: string;
  playerId: string;
  playerName: string;
  method: RecovMethod;
  date: string;
  duration: string;
  status: RecovStatus;
  notes: string;
}

interface Recommendation {
  playerId: string;
  player: string;
  rec: string;
  urgency: "high" | "medium" | "low";
}

interface ApiPlayer { id: string; name: string; }

const METHOD_CONFIG: Record<RecovMethod, { icon: typeof Snowflake; color: string; desc: string }> = {
  Cryothérapie: { icon: Snowflake, color: "#3B82F6", desc: "Bain froid ou cryo-chambre"          },
  Massage:      { icon: Waves,     color: "#8B5CF6", desc: "Massage sportif décontracturant"      },
  Repos:        { icon: BedDouble, color: "#22C55E", desc: "Repos complet ou actif léger"         },
  Hydratation:  { icon: Droplets,  color: "#FF7A00", desc: "Protocole hydratation & nutrition"    },
};

const STATUS_COLOR: Record<RecovStatus, string> = {
  Planifié: "#FF7A00", "En cours": "#3B82F6", Terminé: "#22C55E",
};

const STATUSES: RecovStatus[] = ["Planifié", "En cours", "Terminé"];

function PageSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 animate-pulse rounded-[20px]" style={{ background: "rgba(255,255,255,0.04)" }} />
      ))}
    </div>
  );
}

export function PrepRecoveryPage() {
  const [sessions, setSessions]     = useState<RecovSession[]>([]);
  const [recs, setRecs]             = useState<Recommendation[]>([]);
  const [players, setPlayers]       = useState<ApiPlayer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [saving, setSaving]         = useState(false);
  const [filter, setFilter]         = useState<RecovMethod | "Tous">("Tous");
  const [form, setForm]             = useState({
    playerId: "", method: "Repos" as RecovMethod, date: "", duration: "", notes: "",
  });

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      clubApi.getRecoverySessions() as Promise<{ sessions: RecovSession[]; recommendations: Recommendation[] }>,
      clubApi.getPlayers() as Promise<ApiPlayer[]>,
    ])
      .then(([data, pls]) => {
        setSessions(data.sessions);
        setRecs(data.recommendations);
        setPlayers(pls);
        if (pls.length > 0) setForm(f => ({ ...f, playerId: pls[0].id }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredSessions = filter === "Tous" ? sessions : sessions.filter(s => s.method === filter);
  const inProgress = sessions.filter(s => s.status === "En cours").length;
  const planned    = sessions.filter(s => s.status === "Planifié").length;
  const done       = sessions.filter(s => s.status === "Terminé").length;

  async function saveForm() {
    if (!form.playerId || !form.date || !form.duration) return;
    setSaving(true);
    try {
      const created = await (clubApi.createRecoverySession({
        playerId: form.playerId,
        method:   form.method,
        date:     form.date,
        duration: form.duration,
        notes:    form.notes,
      }) as Promise<RecovSession>);
      setSessions(prev => [created, ...prev]);
      setModal(false);
      setForm(f => ({ ...f, date: "", duration: "", notes: "" }));
    } catch {
      // keep modal open on error
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: RecovStatus) {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    try {
      await (clubApi.updateRecoverySession(id, { status }) as Promise<unknown>);
    } catch {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, status: s.status } : s));
    }
  }

  async function deleteSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id));
    try {
      await (clubApi.deleteRecoverySession(id) as Promise<unknown>);
    } catch {
      fetchData();
    }
  }

  return (
    <PrepPageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Sessions totales", value: loading ? "…" : String(sessions.length), color: "#3B82F6", icon: CheckCircle2 },
          { label: "En cours",         value: loading ? "…" : String(inProgress),       color: "#FF7A00", icon: Clock        },
          { label: "Planifiées",       value: loading ? "…" : String(planned),          color: "#8B5CF6", icon: Plus         },
          { label: "Terminées",        value: loading ? "…" : String(done),             color: "#22C55E", icon: TrendingUp   },
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

      {/* Method filter cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(Object.keys(METHOD_CONFIG) as RecovMethod[]).map(m => {
          const cfg  = METHOD_CONFIG[m];
          const Icon = cfg.icon;
          const count = sessions.filter(s => s.method === m).length;
          return (
            <motion.div key={m} onClick={() => setFilter(filter === m ? "Tous" : m)} className="cursor-pointer">
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

          {loading ? (
            <PageSkeleton />
          ) : filteredSessions.length === 0 ? (
            <p className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Aucune session — cliquez sur « Planifier »
            </p>
          ) : (
            <AnimatePresence>
              {filteredSessions.map((s, i) => {
                const cfg         = METHOD_CONFIG[s.method] ?? METHOD_CONFIG["Repos"];
                const Icon        = cfg.icon;
                const statusColor = STATUS_COLOR[s.status] ?? "#94A3B8";
                return (
                  <motion.div key={s.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ delay: i * 0.04 }}>
                    <PrepKpiCard hover={false}>
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `${cfg.color}18` }}>
                          <Icon size={14} style={{ color: cfg.color }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{s.playerName}</p>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={s.status}
                                onChange={e => updateStatus(s.id, e.target.value as RecovStatus)}
                                className="rounded-full border-0 px-2 py-0.5 text-[10px] font-bold outline-none cursor-pointer"
                                style={{ background: `${statusColor}18`, color: statusColor }}>
                                {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                              </select>
                              <motion.button type="button" onClick={() => deleteSession(s.id)}
                                className="rounded-lg p-1 opacity-40 hover:opacity-100"
                                style={{ color: "#EF4444" }}
                                whileTap={{ scale: 0.9 }}>
                                <Trash2 size={11} />
                              </motion.button>
                            </div>
                          </div>
                          <p className="mt-0.5 text-xs" style={{ color: cfg.color }}>{s.method}</p>
                          <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                            {new Date(s.date).toLocaleDateString("fr-FR")} · {s.duration}
                          </p>
                          {s.notes && (
                            <p className="mt-1 text-[11px] italic" style={{ color: "var(--text-muted)" }}>{s.notes}</p>
                          )}
                        </div>
                      </div>
                    </PrepKpiCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* AI Recommendations */}
        <PrepKpiCard hover={false}>
          <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Recommandations récupération IA
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 animate-pulse rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />
              ))}
            </div>
          ) : recs.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Aucun joueur avec fatigue ou risque élevé détecté.
            </p>
          ) : (
            <div className="space-y-3">
              {recs.map((r, i) => {
                const color = r.urgency === "high" ? "#EF4444" : r.urgency === "medium" ? "#FF7A00" : "#22C55E";
                return (
                  <motion.div key={r.playerId ?? i}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-xl border p-3"
                    style={{ background: `${color}06`, borderColor: `${color}20` }}>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{r.player}</p>
                    <p className="mt-1 text-[11px]" style={{ color }}>→ {r.rec}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
          <div className="mt-5 rounded-xl border p-3"
            style={{ background: "rgba(255,122,0,0.06)", borderColor: "rgba(255,122,0,0.2)" }}>
            <p className="mb-1 text-xs font-bold" style={{ color: "#FF7A00" }}>Protocole équipe recommandé</p>
            <ul className="space-y-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <li>• Hydratation 3L/jour après match</li>
              <li>• Cryothérapie dans 24h post-match</li>
              <li>• Massage préventif — défenseurs 2x/semaine</li>
              <li>• Journée repos actif mercredi</li>
            </ul>
          </div>
        </PrepKpiCard>
      </div>

      {/* Modal — Planifier une session */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "var(--surface-modal)", borderColor: "rgba(255,122,0,0.3)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}>
              <h3 className="mb-4 text-base font-bold" style={{ color: "var(--text-primary)" }}>
                Planifier une récupération
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Joueur</label>
                  <select value={form.playerId} onChange={e => setForm(p => ({ ...p, playerId: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Méthode</label>
                  <select value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value as RecovMethod }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    {(Object.keys(METHOD_CONFIG) as RecovMethod[]).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Durée</label>
                  <input type="text" placeholder="Ex: 30 min" value={form.duration}
                    onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button type="button" onClick={saveForm} disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,var(--accent),#E66000)" }}
                  whileHover={{ scale: saving ? 1 : 1.03 }} whileTap={{ scale: saving ? 1 : 0.97 }}>
                  <CheckCircle2 size={13} /> {saving ? "Enregistrement…" : "Planifier"}
                </motion.button>
                <motion.button type="button" onClick={() => setModal(false)} disabled={saving}
                  className="rounded-xl border px-4 py-2.5 text-sm"
                  style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
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
