import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, CheckCircle2, Clock, Users, Dumbbell,
  UserCheck, UserX, Stethoscope, Plane, Calendar,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PLAYER_DETAILS, SESSION_COLORS } from "../../data/preparateurData";

type Intensity = "Basse" | "Moyenne" | "Haute" | "Max";
type SessionType = "cardio" | "force" | "vitesse" | "mobilite" | "repos" | "match";
type Presence = "Présent" | "Absent" | "Blessé" | "En sélection";

interface Session {
  id: string; title: string; type: SessionType; date: string; time: string;
  duration: string; objective: string; exercises: string; intensity: Intensity;
}

const INIT_SESSIONS: Session[] = [
  { id: "s1", title: "Cardio endurance",      type: "cardio",   date: "2026-06-23", time: "09:00", duration: "60 min", objective: "Développer base aérobie", exercises: "Course 20min · Fartlek 20min · Étirements 20min", intensity: "Moyenne" },
  { id: "s2", title: "Force maximale",        type: "force",    date: "2026-06-24", time: "10:00", duration: "75 min", objective: "Renforcement musculaire", exercises: "Squat 4x6 · Deadlift 3x5 · Bench press 4x8",   intensity: "Haute" },
  { id: "s3", title: "Vitesse & sprint",      type: "vitesse",  date: "2026-06-25", time: "09:30", duration: "50 min", objective: "Améliorer vitesse max",   exercises: "Sprints 30m x10 · Accélérations x8 · Récup",  intensity: "Haute" },
  { id: "s4", title: "Mobilité récupération", type: "mobilite", date: "2026-06-26", time: "09:00", duration: "40 min", objective: "Récupération active",      exercises: "Yoga sportif · Foam roll · Étirements doux",   intensity: "Basse" },
  { id: "s5", title: "Match simulation",      type: "match",    date: "2026-06-28", time: "16:00", duration: "90 min", objective: "Préparation match J29",    exercises: "Échauffement · Match 11v11 · Analyse vidéo",  intensity: "Max" },
];

const PRESENCE_COLOR: Record<Presence, string> = {
  Présent:       "#22C55E",
  Absent:        "#EF4444",
  Blessé:        "#FF7A00",
  "En sélection":"#3B82F6",
};
const PRESENCE_ICON: Record<Presence, typeof UserCheck> = {
  Présent:       UserCheck,
  Absent:        UserX,
  Blessé:        Stethoscope,
  "En sélection":Plane,
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

export function PrepSeancesGestionPage() {
  const [sessions, setSessions] = useState<Session[]>(INIT_SESSIONS);
  const [presence, setPresence] = useState<Record<string, Presence>>(
    Object.fromEntries(PLAYER_DETAILS.map(p => [
      p.id, p.availability === "Blessé" ? "Blessé" : "Présent"
    ]))
  );
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Session | null>(null);
  const [form, setForm] = useState<Omit<Session, "id">>(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState<"sessions" | "presence">("sessions");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const presentCount    = Object.values(presence).filter(v => v === "Présent").length;
  const absentCount     = Object.values(presence).filter(v => v === "Absent").length;
  const blesseCount     = Object.values(presence).filter(v => v === "Blessé").length;
  const selectionCount  = Object.values(presence).filter(v => v === "En sélection").length;

  function openAdd() { setForm(EMPTY_FORM); setEditing(null); setModal("add"); }
  function openEdit(s: Session) { setForm({ title: s.title, type: s.type, date: s.date, time: s.time, duration: s.duration, objective: s.objective, exercises: s.exercises, intensity: s.intensity }); setEditing(s); setModal("edit"); }
  function saveForm() {
    if (!form.title) return;
    if (editing) {
      setSessions(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s));
    } else {
      setSessions(prev => [...prev, { ...form, id: `s${Date.now()}` }]);
    }
    setModal(null);
  }
  function deleteSession(id: string) { setSessions(prev => prev.filter(s => s.id !== id)); if (selectedSession?.id === id) setSelectedSession(null); }
  function cyclePresence(pid: string) {
    const order: Presence[] = ["Présent", "Absent", "Blessé", "En sélection"];
    setPresence(prev => ({ ...prev, [pid]: order[(order.indexOf(prev[pid] ?? "Présent") + 1) % order.length] }));
  }

  return (
    <PrepPageTransition>
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

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
              {/* List */}
              <div className="space-y-3">
                {sessions.map((s, i) => {
                  const color = SESSION_COLORS[s.type];
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
                              <div className="flex items-center gap-1.5">
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                  style={{ background: `${INTENSITY_COLOR[s.intensity]}18`, color: INTENSITY_COLOR[s.intensity] }}>
                                  {s.intensity}
                                </span>
                              </div>
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
                              whileHover={{ background: "rgba(255,122,0,0.15)", color: "var(--accent)" }}>
                              <Pencil size={12} />
                            </motion.button>
                            <motion.button type="button" onClick={e => { e.stopPropagation(); deleteSession(s.id); }}
                              className="flex h-7 w-7 items-center justify-center rounded-lg"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                              whileHover={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                              <Trash2 size={12} />
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
                          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
                          whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}>
                          Fermer
                        </motion.button>
                      </div>
                      <div className="space-y-3">
                        <div className="rounded-xl p-3" style={{ background: `${SESSION_COLORS[selectedSession.type]}10`, border: `1px solid ${SESSION_COLORS[selectedSession.type]}25` }}>
                          <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{selectedSession.title}</p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Type: <strong style={{ color: SESSION_COLORS[selectedSession.type] }}>{selectedSession.type}</strong></p>
                        </div>
                        {[
                          { label: "Date",      value: selectedSession.date },
                          { label: "Heure",     value: selectedSession.time },
                          { label: "Durée",     value: selectedSession.duration },
                          { label: "Intensité", value: selectedSession.intensity, color: INTENSITY_COLOR[selectedSession.intensity] },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="flex justify-between rounded-xl border px-3 py-2.5 text-sm"
                            style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                            <span style={{ color: "var(--text-muted)" }}>{label}</span>
                            <span className="font-semibold" style={{ color: color ?? "var(--text-primary)" }}>{value}</span>
                          </div>
                        ))}
                        <div className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Objectif</p>
                          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedSession.objective}</p>
                        </div>
                        <div className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
                          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Exercices</p>
                          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedSession.exercises}</p>
                        </div>
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
                    style={{ borderColor: "var(--surface-panel-border)", background: "rgba(255,255,255,0.02)" }}>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner une séance</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ── Présence ── */}
        {activeTab === "presence" && (
          <motion.div key="presence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Présents",     value: presentCount,   color: "#22C55E", icon: UserCheck },
                { label: "Absents",      value: absentCount,    color: "#EF4444", icon: UserX },
                { label: "Blessés",      value: blesseCount,    color: "#FF7A00", icon: Stethoscope },
                { label: "En sélection", value: selectionCount, color: "#3B82F6", icon: Plane },
              ].map(({ label, value, color, icon: Icon }) => (
                <PrepKpiCard key={label} hover={false}>
                  <div className="flex items-center gap-2">
                    <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: `${color}18`, color }}
                      animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}40`, `0 0 0px ${color}00`] }}
                      transition={{ duration: 2.2, repeat: Infinity }}>
                      <Icon size={14} />
                    </motion.div>
                    <div>
                      <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                    </div>
                  </div>
                </PrepKpiCard>
              ))}
            </div>

            <PrepKpiCard hover={false}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Liste présence — Cliquer pour changer le statut</p>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Charge calculée: {Math.round((presentCount / PLAYER_DETAILS.length) * 100)}%</span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PLAYER_DETAILS.map((p, i) => {
                  const status = presence[p.id] ?? "Présent";
                  const color = PRESENCE_COLOR[status];
                  const Icon = PRESENCE_ICON[status];
                  return (
                    <motion.button key={p.id} type="button" onClick={() => cyclePresence(p.id)}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 rounded-xl border p-3 text-left"
                      style={{ background: `${color}06`, borderColor: `${color}25` }}
                      whileHover={{ borderColor: `${color}50`, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm text-white"
                        style={{ background: `${color}22`, color }}>
                        {p.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.position} · Charge: {p.charge}%</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1"
                        style={{ background: `${color}18` }}>
                        <Icon size={11} style={{ color }} />
                        <span className="text-[11px] font-semibold" style={{ color }}>{status}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </PrepKpiCard>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modal */}
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
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    {(["Basse","Moyenne","Haute","Max"] as Intensity[]).map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as SessionType }))}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    {(["cardio","force","vitesse","mobilite","repos","match"] as SessionType[]).map(t => <option key={t} value={t}>{t}</option>)}
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
                <motion.button type="button" onClick={saveForm}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,var(--accent),#E66000)", boxShadow: "0 0 16px rgba(255,122,0,0.3)" }}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <CheckCircle2 size={13} /> {modal === "add" ? "Créer" : "Enregistrer"}
                </motion.button>
                <motion.button type="button" onClick={() => setModal(null)}
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
