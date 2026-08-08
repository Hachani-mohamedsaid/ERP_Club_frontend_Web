import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users, Send, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PrepToolbar } from "../../components/preparateur/PrepToolbar";
import { ProgramCalendarDnD } from "../../components/preparateur/ProgramCalendarDnD";
import { DEFAULT_WEEK_SCHEDULE, SESSION_PALETTE, PROGRAM_STATUS_CONFIG } from "../../data/preparateurData";
import { clubApi } from "../../lib/api/club";

type ProgramStatus = "brouillon" | "envoye" | "valide" | "refuse";
type Intensity = "Basse" | "Moyenne" | "Haute";

interface Program {
  id: string;
  name: string;
  objective: string;
  duration: string;
  intensity: Intensity;
  status: ProgramStatus;
  createdAt: string;
  assignedPlayers: string[];
  playerIds: string[];
}

interface Player { id: string; name: string; }

function PageSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 gap-4 lg:grid-cols-3">
      {[1, 2, 3].map(i => <div key={i} className="h-44 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />)}
    </div>
  );
}

const INTENSITY_STYLE: Record<Intensity, { bg: string; color: string }> = {
  Haute:  { bg: "rgba(239,68,68,0.15)",   color: "#EF4444" },
  Moyenne:{ bg: "rgba(245,158,11,0.15)",  color: "#F59E0B" },
  Basse:  { bg: "rgba(34,197,94,0.15)",   color: "#22C55E" },
};

export function PrepProgrammesPage() {
  const [programs, setPrograms]   = useState<Program[]>([]);
  const [players, setPlayers]     = useState<Player[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [schedule, setSchedule]   = useState(DEFAULT_WEEK_SCHEDULE);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const [form, setForm]           = useState({ name: "", objective: "", duration: "", intensity: "Moyenne" as Intensity, playerIds: [] as string[] });

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      clubApi.getPrograms() as Promise<Program[]>,
      clubApi.getPlayers() as Promise<Player[]>,
    ])
      .then(([progs, pls]) => { setPrograms(progs); setPlayers(pls); })
      .catch(() => showToast("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = programs.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  function togglePlayer(id: string) {
    setForm(f => ({
      ...f,
      playerIds: f.playerIds.includes(id) ? f.playerIds.filter(x => x !== id) : [...f.playerIds, id],
    }));
  }

  async function createProgram() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await (clubApi.createProgram({
        name: form.name, objective: form.objective,
        duration: form.duration || "4 semaines",
        intensity: form.intensity, playerIds: form.playerIds,
      }) as Promise<Program>);
      setPrograms(prev => [created, ...prev]);
      setModalOpen(false);
      setForm({ name: "", objective: "", duration: "", intensity: "Moyenne", playerIds: [] });
      showToast(`Programme créé — ${created.name}`);
    } catch { showToast("Erreur lors de la création"); }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: ProgramStatus) {
    try {
      const updated = await (clubApi.updateProgram(id, { status }) as Promise<Program>);
      setPrograms(prev => prev.map(p => p.id === id ? updated : p));
      showToast(`Programme → ${PROGRAM_STATUS_CONFIG[status].label}`);
    } catch { showToast("Erreur mise à jour statut"); }
  }

  async function deleteProgram(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await clubApi.deleteProgram(id);
      setPrograms(prev => prev.filter(p => p.id !== id));
      showToast("Programme supprimé");
    } catch { showToast("Erreur suppression"); }
  }

  return (
    <PrepPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PrepToolbar search={search} onSearchChange={setSearch} placeholder="Rechercher programme..." />
        <button type="button" onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium"
          style={{ background: "#6366F1", color: "white" }}>
          <Plus size={16} /> Créer Programme
        </button>
      </div>

      {loading ? (
        <PageSkeleton />
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          {programs.length === 0 ? "Aucun programme — cliquez sur « Créer Programme »" : "Aucun résultat"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {filtered.map((prog, i) => {
            const statusCfg = PROGRAM_STATUS_CONFIG[prog.status as ProgramStatus] ?? PROGRAM_STATUS_CONFIG.brouillon;
            const intStyle  = INTENSITY_STYLE[prog.intensity as Intensity] ?? INTENSITY_STYLE.Moyenne;
            return (
              <PrepKpiCard key={prog.id} delay={i * 0.05}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold truncate" style={{ color: "var(--text-primary)" }}>{prog.name}</h3>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{prog.objective}</p>
                  </div>
                  <div className="ml-2 flex flex-col items-end gap-1">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: intStyle.bg, color: intStyle.color }}>
                      {prog.intensity}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: `${statusCfg.color}20`, color: statusCfg.color }}>
                      {statusCfg.label}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>Durée : {prog.duration}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {prog.assignedPlayers.map(name => (
                    <span key={name} className="rounded-lg px-2 py-0.5 text-[10px]"
                      style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1" }}>
                      {name.split(" ")[0]}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3"
                  style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  {prog.status === "brouillon" && (
                    <button type="button" onClick={() => void updateStatus(prog.id, "envoye")}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
                      <Send size={12} /> Envoyer Coach
                    </button>
                  )}
                  {prog.status === "envoye" && (
                    <>
                      <button type="button" onClick={() => void updateStatus(prog.id, "valide")}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}>
                        <CheckCircle size={12} /> Simuler Validé
                      </button>
                      <button type="button" onClick={() => void updateStatus(prog.id, "refuse")}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                        <XCircle size={12} /> Simuler Refusé
                      </button>
                    </>
                  )}
                  {(prog.status === "valide" || prog.status === "refuse") && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Workflow terminé</span>
                  )}
                  <button type="button" onClick={e => void deleteProgram(prog.id, e)}
                    className="ml-auto flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                    title="Supprimer">
                    <Trash2 size={11} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
              </PrepKpiCard>
            );
          })}
        </div>
      )}

      <PrepKpiCard delay={0.15} hover={false}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Calendrier hebdomadaire — Drag &amp; Drop
        </h3>
        <ProgramCalendarDnD schedule={schedule} palette={SESSION_PALETTE} onScheduleChange={setSchedule} />
      </PrepKpiCard>

      {/* Modal création */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div
              className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[20px] border p-6"
              style={{ background: "rgba(15,29,58,0.98)", borderColor: "rgba(255,255,255,0.05)" }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Nouveau programme</h3>
                <button type="button" onClick={() => setModalOpen(false)}>
                  <X size={18} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                {([
                  { key: "name",      label: "Nom",      placeholder: "Pré-saison" },
                  { key: "objective", label: "Objectif", placeholder: "Base aérobie" },
                  { key: "duration",  label: "Durée",    placeholder: "4 semaines" },
                ] as const).map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Intensité</label>
                  <select value={form.intensity}
                    onChange={e => setForm(f => ({ ...f, intensity: e.target.value as Intensity }))}
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.05)", color: "var(--text-primary)" }}>
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
                    {players.map(p => (
                      <button key={p.id} type="button" onClick={() => togglePlayer(p.id)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                        style={{
                          background: form.playerIds.includes(p.id) ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                          color: form.playerIds.includes(p.id) ? "#6366F1" : "var(--text-muted)",
                          border: form.playerIds.includes(p.id) ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                        }}>
                        {p.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <motion.button type="button" onClick={() => void createProgram()} disabled={saving}
                  className="w-full rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                  style={{ background: "#6366F1", color: "white" }}
                  whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }}>
                  {saving ? "Création..." : "Créer le programme"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm"
            style={{ background: "#0F1D3A", borderColor: "rgba(99,102,241,0.3)", color: "#6366F1" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </PrepPageTransition>
  );
}
