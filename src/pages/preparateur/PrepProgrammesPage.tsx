import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, Send, CheckCircle, XCircle } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar } from "../../components/preparateur/PrepToolbar";
import { ProgramCalendarDnD } from "../../components/preparateur/ProgramCalendarDnD";
import {
  TRAINING_PROGRAMS, DEFAULT_WEEK_SCHEDULE, SESSION_PALETTE,
  PLAYER_LOAD, PROGRAM_STATUS_CONFIG, type TrainingProgram, type ProgramStatus,
} from "../../data/preparateurData";

const ALL_PLAYERS = PLAYER_LOAD.map((p) => p.name);

export function PrepProgrammesPage() {
  const [search, setSearch] = useState("");
  const [programs, setPrograms] = useState(TRAINING_PROGRAMS);
  const [schedule, setSchedule] = useState(DEFAULT_WEEK_SCHEDULE);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", objective: "", duration: "", intensity: "Moyenne" as TrainingProgram["intensity"], players: [] as string[] });

  const filtered = programs.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  function togglePlayer(name: string) {
    setForm((f) => ({
      ...f,
      players: f.players.includes(name) ? f.players.filter((x) => x !== name) : [...f.players, name],
    }));
  }

  function createProgram() {
    if (!form.name.trim()) return;
    const newProg: TrainingProgram = {
      id: `p-${Date.now()}`,
      name: form.name,
      objective: form.objective,
      duration: form.duration || "2 semaines",
      intensity: form.intensity,
      assignedPlayers: form.players,
      createdAt: new Date().toLocaleDateString("fr-FR"),
      status: "brouillon",
    };
    setPrograms((prev) => [newProg, ...prev]);
    setModalOpen(false);
    setForm({ name: "", objective: "", duration: "", intensity: "Moyenne", players: [] });
  }

  function updateStatus(id: string, status: ProgramStatus) {
    setPrograms((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const label = PROGRAM_STATUS_CONFIG[status].label;
    setToast(`Programme → ${label}`);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <PrepPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PrepToolbar search={search} onSearchChange={setSearch} placeholder="Rechercher programme..." />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          style={{ background: "#6366F1", color: "white" }}
        >
          <Plus size={16} /> Créer Programme
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {filtered.map((prog, i) => {
          const statusCfg = PROGRAM_STATUS_CONFIG[prog.status];
          return (
          <PrepKpiCard key={prog.id} delay={i * 0.05}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{prog.name}</h3>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{prog.objective}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                  background: prog.intensity === "Haute" ? "rgba(239,68,68,0.15)" : prog.intensity === "Moyenne" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)",
                  color: prog.intensity === "Haute" ? "#EF4444" : prog.intensity === "Moyenne" ? "#F59E0B" : "#22C55E",
                }}>
                  {prog.intensity}
                </span>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${statusCfg.color}20`, color: statusCfg.color }}>
                  {statusCfg.label}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Durée : {prog.duration}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {prog.assignedPlayers.map((name) => (
                <span key={name} className="rounded-lg px-2 py-0.5 text-[10px]" style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1" }}>{name.split(" ")[0]}</span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {prog.status === "brouillon" && (
                <button type="button" onClick={() => updateStatus(prog.id, "envoye")} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                  <Send size={12} /> Envoyer Coach
                </button>
              )}
              {prog.status === "envoye" && (
                <>
                  <button type="button" onClick={() => updateStatus(prog.id, "valide")} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                    <CheckCircle size={12} /> Simuler Validé
                  </button>
                  <button type="button" onClick={() => updateStatus(prog.id, "refuse")} className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                    <XCircle size={12} /> Simuler Refusé
                  </button>
                </>
              )}
              {(prog.status === "valide" || prog.status === "refuse") && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Workflow terminé</span>
              )}
            </div>
          </PrepKpiCard>
        );})}
      </div>

      <PrepKpiCard delay={0.15} hover={false}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Calendrier hebdomadaire — Drag & Drop</h3>
        <ProgramCalendarDnD schedule={schedule} palette={SESSION_PALETTE} onScheduleChange={setSchedule} />
      </PrepKpiCard>

      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[20px] border p-6"
              style={{ background: "rgba(15,29,58,0.98)", borderColor: "rgba(255,255,255,0.05)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Nouveau programme</h3>
                <button type="button" onClick={() => setModalOpen(false)}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="space-y-3">
                {[
                  { key: "name", label: "Nom", placeholder: "Pré-saison" },
                  { key: "objective", label: "Objectif", placeholder: "Base aérobie" },
                  { key: "duration", label: "Durée", placeholder: "4 semaines" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input
                      value={form[key as keyof typeof form] as string}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Intensité</label>
                  <select
                    value={form.intensity}
                    onChange={(e) => setForm({ ...form, intensity: e.target.value as TrainingProgram["intensity"] })}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
                  >
                    <option value="Basse">Basse</option>
                    <option value="Moyenne">Moyenne</option>
                    <option value="Haute">Haute</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-1 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    <Users size={12} /> Affectation joueurs
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PLAYERS.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => togglePlayer(name)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                        style={{
                          background: form.players.includes(name) ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                          color: form.players.includes(name) ? "#6366F1" : "var(--text-muted)",
                          border: form.players.includes(name) ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                        }}
                      >
                        {name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={createProgram} className="w-full rounded-xl py-2.5 text-sm font-medium" style={{ background: "#6366F1", color: "white" }}>
                  Créer le programme
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && (
        <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm" style={{ background: "#0F1D3A", borderColor: "rgba(99,102,241,0.3)", color: "#6366F1" }}>
          {toast}
        </motion.div>
      )}
    </PrepPageTransition>
  );
}
