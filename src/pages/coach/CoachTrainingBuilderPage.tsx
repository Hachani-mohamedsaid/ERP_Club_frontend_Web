import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Calendar, Clock, Zap, CheckCircle2 } from "lucide-react";
import { CoachPageTransition, CCard, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";
import { TRAINING_SESSIONS, type TrainingSession } from "../../data/coachData";

const TYPE_META: Record<TrainingSession["type"], { color: string; bg: string; emoji: string }> = {
  Physique:  { color: "#EF4444", bg: "rgba(239,68,68,0.14)",  emoji: "💪" },
  Tactique:  { color: "#8B5CF6", bg: "rgba(139,92,246,0.14)", emoji: "🧠" },
  Technique: { color: "#3B82F6", bg: "rgba(59,130,246,0.14)", emoji: "⚽" },
  Vidéo:     { color: "#F59E0B", bg: "rgba(245,158,11,0.14)", emoji: "📹" },
  Match:     { color: "#22C55E", bg: "rgba(34,197,94,0.14)",  emoji: "🏟️" },
};

const INTENSITY_META: Record<TrainingSession["intensity"], { color: string }> = {
  "Faible":   { color: "#22C55E" },
  "Modérée":  { color: "#F59E0B" },
  "Élevée":   { color: COACH_ACCENT },
  "Maximale": { color: "#EF4444" },
};

const EMPTY_FORM = {
  type: "Physique" as TrainingSession["type"],
  date: "", time: "09:00", duration: 90,
  intensity: "Modérée" as TrainingSession["intensity"],
  objective: "",
};

export function CoachTrainingBuilderPage() {
  const [sessions, setSessions] = useState<TrainingSession[]>(TRAINING_SESSIONS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState<TrainingSession | null>(null);

  const addSession = () => {
    if (!form.date || !form.objective) return;
    const newS: TrainingSession = {
      id: `s${Date.now()}`,
      date: form.date, time: form.time, type: form.type,
      duration: form.duration, intensity: form.intensity,
      objective: form.objective, players: [], done: false,
    };
    setSessions(prev => [newS, ...prev]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const upcoming = sessions.filter(s => !s.done).sort((a, b) => a.date.localeCompare(b.date));
  const done     = sessions.filter(s => s.done);

  return (
    <CoachPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Training Builder</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{upcoming.length} séances à venir · {done.length} effectuées</p>
        </div>
        <motion.button type="button" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, boxShadow: `0 0 16px ${COACH_ACCENT}40` }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Créer séance
        </motion.button>
      </div>

      {/* Type filter quick buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_META).map(([type, m]) => (
          <span key={type} className="rounded-full px-3 py-1 text-[11px] font-semibold"
            style={{ background: m.bg, color: m.color }}>
            {m.emoji} {type}
          </span>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "À venir",   value: upcoming.length, color: COACH_ACCENT },
          { label: "Effectuées",value: done.length,      color: "#22C55E" },
          { label: "Ce mois",   value: sessions.length,  color: "#3B82F6" },
          { label: "Moy. présence", value: `${Math.round(done.filter(s => s.attendance).reduce((a, s) => a + (s.attendance ?? 0), 0) / Math.max(done.filter(s => s.attendance).length, 1))}%`, color: "#F59E0B" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <CCard>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </CCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        {/* Session cards */}
        <div className="space-y-3">
          {/* Upcoming */}
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Prochaines séances</p>
          <AnimatePresence mode="popLayout">
            {upcoming.map((s, i) => {
              const m = TYPE_META[s.type];
              const im = INTENSITY_META[s.intensity];
              return (
                <motion.div key={s.id} layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(s === selected ? null : s)}
                  className="flex items-center gap-4 rounded-[20px] border p-4 cursor-pointer"
                  style={{
                    background: selected?.id === s.id ? m.bg : "rgba(14,10,35,0.8)",
                    borderColor: selected?.id === s.id ? `${m.color}40` : "rgba(255,255,255,0.07)",
                  }}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={{ background: m.bg }}>{m.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold" style={{ color: m.color }}>{s.type}</p>
                      <span className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
                        style={{ background: `${im.color}18`, color: im.color }}>{s.intensity}</span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.objective}</p>
                    <div className="flex gap-3 mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1"><Calendar size={9} /> {s.date}</span>
                      <span className="flex items-center gap-1"><Clock size={9} /> {s.time}</span>
                      <span className="flex items-center gap-1"><Zap size={9} /> {s.duration} min</span>
                    </div>
                  </div>
                  <span className="rounded-full px-2 py-1 text-[9px] font-bold"
                    style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
                    À venir
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Done */}
          {done.length > 0 && (
            <>
              <p className="text-xs font-bold uppercase tracking-wide mt-4" style={{ color: "var(--text-muted)" }}>Séances effectuées</p>
              {done.map((s, i) => {
                const m = TYPE_META[s.type];
                return (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 rounded-[20px] border p-4 opacity-75"
                    style={{ background: "rgba(14,10,35,0.6)", borderColor: "var(--surface-panel-border)" }}>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ background: m.bg }}>{m.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: m.color }}>{s.type}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{s.objective}</p>
                      <div className="flex gap-3 mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <span><Calendar size={9} className="inline mr-0.5" />{s.date}</span>
                        <span><Zap size={9} className="inline mr-0.5" />{s.duration} min</span>
                        {s.attendance && <span style={{ color: "#22C55E" }}>✓ {s.attendance}% présence</span>}
                        {s.bestPlayer && <span style={{ color: "#F59E0B" }}>⭐ {s.bestPlayer}</span>}
                      </div>
                    </div>
                    <CheckCircle2 size={18} style={{ color: "#22C55E" }} />
                  </motion.div>
                );
              })}
            </>
          )}
        </div>

        {/* Detail */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <CCard glow>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{TYPE_META[selected.type].emoji}</span>
                    <div>
                      <p className="font-bold" style={{ color: TYPE_META[selected.type].color }}>{selected.type}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{selected.date} · {selected.time}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <X size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
                <div className="space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <p>🎯 <strong style={{ color: "var(--text-primary)" }}>{selected.objective}</strong></p>
                  <p>⏱ Durée: {selected.duration} min</p>
                  <p style={{ color: INTENSITY_META[selected.intensity].color }}>⚡ Intensité: {selected.intensity}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  {["Modifier","Dupliquer","Supprimer"].map((label, i) => (
                    <motion.button key={label} type="button"
                      className="flex-1 rounded-xl py-1.5 text-[10px] font-semibold"
                      style={{
                        background: i === 2 ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)",
                        color: i === 2 ? "#EF4444" : "var(--text-muted)",
                      }}
                      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                      {label}
                    </motion.button>
                  ))}
                </div>
              </CCard>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CCard className="flex flex-col items-center justify-center py-12">
                <span className="text-4xl mb-2">🏋️</span>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionner une séance</p>
              </CCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)" }} onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(14,10,35,0.98)", borderColor: `${COACH_ACCENT}40` }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Nouvelle séance</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                {/* Type */}
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Type de séance</label>
                  <div className="flex flex-wrap gap-2">
                    {(["Physique","Tactique","Technique","Vidéo","Match"] as const).map(t => (
                      <motion.button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold"
                        style={{
                          background: form.type === t ? TYPE_META[t].bg : "rgba(255,255,255,0.06)",
                          color: form.type === t ? TYPE_META[t].color : "var(--text-muted)",
                          border: `1px solid ${form.type === t ? `${TYPE_META[t].color}40` : "transparent"}`,
                        }}
                        whileHover={{ scale: 1.05 }}>
                        {TYPE_META[t].emoji} {t}
                      </motion.button>
                    ))}
                  </div>
                </div>
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Date</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Heure</label>
                    <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                  </div>
                </div>
                {/* Duration & Intensity */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Durée (min)</label>
                    <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: +e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Intensité</label>
                    <select value={form.intensity} onChange={e => setForm(p => ({ ...p, intensity: e.target.value as TrainingSession["intensity"] }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "var(--surface-modal)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                      {["Faible","Modérée","Élevée","Maximale"].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </div>
                {/* Objective */}
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Objectif de séance</label>
                  <input placeholder="Ex: Pressing haut, transitions rapides..." value={form.objective}
                    onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={addSession}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white"
                  style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  Créer
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CoachPageTransition>
  );
}
