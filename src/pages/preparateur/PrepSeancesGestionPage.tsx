import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, CheckCircle2, Dumbbell,
  UserCheck, UserX, Stethoscope, Plane, Calendar,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { SESSION_COLORS } from "../../data/preparateurData";
import { clubApi } from "../../lib/api/club";

type Intensity = "Basse" | "Moyenne" | "Haute" | "Max";
type SessionType = "cardio" | "force" | "vitesse" | "mobilite" | "repos" | "match";
type Presence = "Présent" | "Absent" | "Blessé" | "En sélection";

interface Session {
  id: string; title: string; type: SessionType; date: string; time: string;
  duration: string; objective: string; exercises: string; intensity: Intensity;
}

interface PresenceRow {
  playerId: string; name: string; position: string; charge: number; status: Presence;
}

const PRESENCE_COLOR: Record<Presence, string> = {
  Présent: "#22C55E", Absent: "#EF4444", Blessé: "#FF7A00", "En sélection": "#3B82F6",
};
const PRESENCE_ICON: Record<Presence, typeof UserCheck> = {
  Présent: UserCheck, Absent: UserX, Blessé: Stethoscope, "En sélection": Plane,
};
const INTENSITY_COLOR: Record<Intensity, string> = {
  Basse: "#22C55E", Moyenne: "#3B82F6", Haute: "#FF7A00", Max: "#EF4444",
};
const EMPTY_FORM: Omit<Session, "id"> = {
  title: "", type: "cardio", date: "", time: "", duration: "", objective: "", exercises: "", intensity: "Moyenne",
};

function Field({ label, type = "text", value, onChange, placeholder }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
        style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }} />)}
    </div>
  );
}

export function PrepSeancesGestionPage() {
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [presence, setPresence]   = useState<PresenceRow[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingPresence, setLoadingPresence] = useState(true);
  const [modal, setModal]         = useState<"add" | "edit" | null>(null);
  const [editing, setEditing]     = useState<Session | null>(null);
  const [form, setForm]           = useState<Omit<Session, "id">>(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sessions" | "presence">("sessions");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  const fetchSessions = useCallback(() => {
    setLoadingSessions(true);
    (clubApi.getSessions() as Promise<Session[]>)
      .then(setSessions)
      .catch(() => showToast("Erreur chargement séances"))
      .finally(() => setLoadingSessions(false));
  }, []);

  const fetchPresence = useCallback(() => {
    setLoadingPresence(true);
    (clubApi.getPresence() as Promise<PresenceRow[]>)
      .then(setPresence)
      .catch(() => showToast("Erreur chargement présence"))
      .finally(() => setLoadingPresence(false));
  }, []);

  useEffect(() => { fetchSessions(); fetchPresence(); }, [fetchSessions, fetchPresence]);

  // KPIs présence
  const count = (s: Presence) => presence.filter(p => p.status === s).length;

  // Sessions CRUD
  function openAdd() { setForm(EMPTY_FORM); setEditing(null); setModal("add"); }
  function openEdit(s: Session) {
    setForm({ title: s.title, type: s.type, date: s.date, time: s.time,
      duration: s.duration, objective: s.objective, exercises: s.exercises, intensity: s.intensity });
    setEditing(s); setModal("edit");
  }

  async function saveForm() {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await (clubApi.updateSession(editing.id, form as Record<string, unknown>) as Promise<Session>);
        setSessions(prev => prev.map(s => s.id === editing.id ? updated : s));
        if (selectedSession?.id === editing.id) setSelectedSession(updated);
        showToast(`Séance mise à jour — ${updated.title}`);
      } else {
        const created = await (clubApi.createSession(form as Record<string, unknown>) as Promise<Session>);
        setSessions(prev => [...prev, created]);
        showToast(`Séance créée — ${created.title}`);
      }
      setModal(null);
    } catch {
      showToast("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSession(id: string) {
    try {
      await clubApi.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (selectedSession?.id === id) setSelectedSession(null);
      showToast("Séance supprimée");
    } catch {
      showToast("Erreur lors de la suppression");
    }
  }

  // Présence — cycle au clic
  const CYCLE: Presence[] = ["Présent", "Absent", "Blessé", "En sélection"];
  async function cyclePresence(playerId: string, current: Presence) {
    const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
    setPresence(prev => prev.map(p => p.playerId === playerId ? { ...p, status: next } : p));
    try {
      await clubApi.updatePresence(playerId, next);
    } catch {
      setPresence(prev => prev.map(p => p.playerId === playerId ? { ...p, status: current } : p));
      showToast("Erreur mise à jour présence");
    }
  }

  return (
    <PrepPageTransition>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="fixed right-6 top-20 z-[999] rounded-xl border px-4 py-3 text-sm font-medium shadow-xl"
            style={{ background: "rgba(8,14,30,0.97)", borderColor: "rgba(255,122,0,0.4)", color: "var(--text-primary)" }}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["sessions", "presence"] as const).map(t => (
          <motion.button key={t} type="button" onClick={() => setActiveTab(t)}
            className="rounded-xl px-4 py-2 text-xs font-semibold capitalize"
            style={{
              background: activeTab === t ? "linear-gradient(135deg,var(--accent),#E66000)" : "rgba(255,255,255,0.04)",
              color: activeTab === t ? "white" : "var(--text-muted)",
              boxShadow: activeTab === t ? "0 0 16px rgba(255,122,0,0.3)" : "none",
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {t === "sessions" ? "Gestion Séances" : "Présence Joueurs"}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Séances ── */}
        {activeTab === "sessions" && (
          <motion.div key="sessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Planification séances</h2>
              <motion.button type="button" onClick={openAdd}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,var(--accent),#E66000)", boxShadow: "0 0 16px rgba(255,122,0,0.3)" }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                <Plus size={14} /> Créer séance
              </motion.button>
            </div>

            {loadingSessions ? (
              <ListSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
                {/* List */}
                <div className="space-y-3">
                  {sessions.length === 0 && (
                    <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                      Aucune séance planifiée — cliquez sur "Créer séance"
                    </div>
                  )}
                  {sessions.map((s, i) => {
                    const color = SESSION_COLORS[s.type] ?? "#6366F1";
                    const isSelected = selectedSession?.id === s.id;
                    return (
                      <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <PrepKpiCard hover={false}>
                          <div className="flex items-start gap-3 cursor-pointer" onClick={() => setSelectedSession(isSelected ? null : s)}>
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                              style={{ background: `${color}18` }}>
                              <Dumbbell size={14} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{s.title}</p>
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                  style={{ background: `${INTENSITY_COLOR[s.intensity]}18`, color: INTENSITY_COLOR[s.intensity] }}>
                                  {s.intensity}
                                </span>
                              </div>
                              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                <Calendar size={10} className="inline mr-1" />{s.date} à {s.time} · {s.duration}
                              </p>
                              <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>{s.objective}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <motion.button type="button" onClick={e => { e.stopPropagation(); openEdit(s); }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                                whileHover={{ background: "rgba(255,122,0,0.15)" }}>
                                <Pencil size={12} style={{ color: "var(--text-muted)" }} />
                              </motion.button>
                              <motion.button type="button" onClick={e => { e.stopPropagation(); void deleteSession(s.id); }}
                                className="flex h-7 w-7 items-center justify-center rounded-lg"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                                whileHover={{ background: "rgba(239,68,68,0.15)" }}>
                                <Trash2 size={12} style={{ color: "var(--text-muted)" }} />
                              </motion.button>
                            </div>
                          </div>
                        </PrepKpiCard>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Detail panel */}
                <AnimatePresence mode="wait">
                  {selectedSession ? (
                    <motion.div key={selectedSession.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <PrepKpiCard hover={false}>
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Détail séance</p>
                          <motion.button type="button" onClick={() => setSelectedSession(null)}
                            className="text-xs px-3 py-1.5 rounded-lg border"
                            style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
                            whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}>
                            Fermer
                          </motion.button>
                        </div>
                        <div className="space-y-3">
                          <div className="rounded-xl p-3" style={{
                            background: `${SESSION_COLORS[selectedSession.type] ?? "#6366F1"}10`,
                            border: `1px solid ${SESSION_COLORS[selectedSession.type] ?? "#6366F1"}25`
                          }}>
                            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{selectedSession.title}</p>
                            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                              Type: <strong style={{ color: SESSION_COLORS[selectedSession.type] ?? "#6366F1" }}>{selectedSession.type}</strong>
                            </p>
                          </div>
                          {[
                            { label: "Date",      value: selectedSession.date },
                            { label: "Heure",     value: selectedSession.time },
                            { label: "Durée",     value: selectedSession.duration },
                            { label: "Intensité", value: selectedSession.intensity, color: INTENSITY_COLOR[selectedSession.intensity] },
                          ].map(({ label, value, color }) => (
                            <div key={label} className="flex justify-between rounded-xl border px-3 py-2.5 text-sm"
                              style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                              <span style={{ color: "var(--text-muted)" }}>{label}</span>
                              <span className="font-semibold" style={{ color: color ?? "var(--text-primary)" }}>{value}</span>
                            </div>
                          ))}
                          <div className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                            <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Objectif</p>
                            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedSession.objective}</p>
                          </div>
                          {selectedSession.exercises && (
                            <div className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Exercices</p>
                              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedSession.exercises}</p>
                            </div>
                          )}
                          <motion.button type="button" onClick={() => openEdit(selectedSession)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
                            style={{ background: "linear-gradient(135deg,var(--accent),#E66000)" }}
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                            <Pencil size={13} /> Modifier séance
                          </motion.button>
                        </div>
                      </PrepKpiCard>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex h-64 items-center justify-center rounded-[20px] border"
                      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner une séance</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Présence ── */}
        {activeTab === "presence" && (
          <motion.div key="presence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([
                { label: "Présents",     status: "Présent" as Presence,       color: "#22C55E", icon: UserCheck },
                { label: "Absents",      status: "Absent" as Presence,        color: "#EF4444", icon: UserX },
                { label: "Blessés",      status: "Blessé" as Presence,        color: "#FF7A00", icon: Stethoscope },
                { label: "En sélection", status: "En sélection" as Presence,  color: "#3B82F6", icon: Plane },
              ]).map(({ label, status, color, icon: Icon }) => (
                <PrepKpiCard key={label} hover={false}>
                  <div className="flex items-center gap-2">
                    <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: `${color}18`, color }}
                      animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}40`, `0 0 0px ${color}00`] }}
                      transition={{ duration: 2.2, repeat: Infinity }}>
                      <Icon size={14} />
                    </motion.div>
                    <div>
                      <p className="text-2xl font-extrabold" style={{ color }}>{count(status)}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                    </div>
                  </div>
                </PrepKpiCard>
              ))}
            </div>

            <PrepKpiCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Liste présence — Cliquer pour changer le statut
                </p>
                {presence.length > 0 && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Présents: {Math.round((count("Présent") / presence.length) * 100)}%
                  </span>
                )}
              </div>

              {loadingPresence ? (
                <ListSkeleton />
              ) : presence.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun joueur trouvé</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {presence.map((p, i) => {
                    const color = PRESENCE_COLOR[p.status];
                    const Icon  = PRESENCE_ICON[p.status];
                    return (
                      <motion.button key={p.playerId} type="button" onClick={() => void cyclePresence(p.playerId, p.status)}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 rounded-xl border p-3 text-left"
                        style={{ background: `${color}06`, borderColor: `${color}25` }}
                        whileHover={{ borderColor: `${color}50`, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm"
                          style={{ background: `${color}22`, color }}>
                          {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.position} · Charge: {p.charge}%</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1"
                          style={{ background: `${color}18` }}>
                          <Icon size={11} style={{ color }} />
                          <span className="text-[11px] font-semibold" style={{ color }}>{p.status}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </PrepKpiCard>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modal create/edit */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-lg rounded-[24px] border p-6"
              style={{ background: "var(--surface-modal)", borderColor: "rgba(255,122,0,0.3)" }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}>
              <h3 className="text-base font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                {modal === "add" ? "Créer une séance" : "Modifier la séance"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Field label="Titre" value={form.title} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="Ex: Cardio endurance" />
                </div>
                <Field label="Date" type="date" value={form.date} onChange={v => setForm(p => ({ ...p, date: v }))} />
                <Field label="Heure" type="time" value={form.time} onChange={v => setForm(p => ({ ...p, time: v }))} />
                <Field label="Durée" value={form.duration} onChange={v => setForm(p => ({ ...p, duration: v }))} placeholder="Ex: 60 min" />
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Intensité</label>
                  <select value={form.intensity} onChange={e => setForm(p => ({ ...p, intensity: e.target.value as Intensity }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>
                    {(["Basse", "Moyenne", "Haute", "Max"] as Intensity[]).map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as SessionType }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}>
                    {(["cardio", "force", "vitesse", "mobilite", "repos", "match"] as SessionType[]).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <Field label="Objectif" value={form.objective} onChange={v => setForm(p => ({ ...p, objective: v }))} placeholder="Ex: Développer base aérobie" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Exercices</label>
                  <textarea value={form.exercises} onChange={e => setForm(p => ({ ...p, exercises: e.target.value }))}
                    rows={3} placeholder="Ex: Course 20min · Fartlek 20min · Étirements 20min"
                    className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <motion.button type="button" onClick={() => void saveForm()} disabled={saving}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,var(--accent),#E66000)", boxShadow: "0 0 16px rgba(255,122,0,0.3)" }}
                  whileHover={{ scale: saving ? 1 : 1.03 }} whileTap={{ scale: saving ? 1 : 0.97 }}>
                  <CheckCircle2 size={13} /> {saving ? "Enregistrement..." : modal === "add" ? "Créer" : "Enregistrer"}
                </motion.button>
                <motion.button type="button" onClick={() => setModal(null)} disabled={saving}
                  className="rounded-xl border px-4 py-2.5 text-sm disabled:opacity-60"
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
