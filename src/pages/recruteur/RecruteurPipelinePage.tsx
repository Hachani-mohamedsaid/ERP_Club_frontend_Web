import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronRight, Star, TrendingUp } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { scoutApi, type ScoutProspectDto } from "../../lib/api/scout";
import { WORKFLOW_COLS, PRIORITY_META, type WorkflowStatus, type Priority } from "../../data/scoutData";

const STAGES = WORKFLOW_COLS.map(c => c.id);
const STAGE_META = Object.fromEntries(WORKFLOW_COLS.map(c => [c.id, c])) as Record<WorkflowStatus, typeof WORKFLOW_COLS[number]>;

function PlayerCard({ player, onMove }: {
  player: ScoutProspectDto & { status: WorkflowStatus; priority: Priority };
  onMove: (id: string, dir: "left" | "right") => void;
}) {
  const stageIdx = STAGES.indexOf(player.status);
  const meta = STAGE_META[player.status];
  return (
    <motion.div layout className="rounded-xl border p-3"
      style={{ background: "rgba(14,10,35,0.85)", borderColor: "var(--surface-panel-border)" }}
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      whileHover={{ borderColor: `${meta.color}40`, y: -1 }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{player.flag}</span>
          <div>
            <p className="text-xs font-bold leading-none" style={{ color: "var(--text-primary)" }}>{player.name}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{player.position} · {player.age}a</p>
          </div>
        </div>
      </div>
      <p className="text-[10px] mb-1.5" style={{ color: "var(--text-muted)" }}>{player.club}</p>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold" style={{ color: "#22C55E" }}>{player.marketValue}</span>
        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: "#8B5CF6" }}>
          <Star size={8} /> {player.aiScore}
        </span>
        <span className="text-[9px] rounded-full px-1.5 py-0.5"
          style={{ background: `${PRIORITY_META[player.priority].color}18`, color: PRIORITY_META[player.priority].color }}>
          {player.priority}
        </span>
      </div>
      <div className="flex gap-1">
        <button type="button" disabled={stageIdx === 0} onClick={() => onMove(player.id, "left")}
          className="flex-1 rounded-lg py-1 text-[9px] font-medium disabled:opacity-30"
          style={{ background: "rgba(255,255,255,0.04)", color: "var(--text-muted)" }}>
          ← Retour
        </button>
        <button type="button" disabled={stageIdx === STAGES.length - 1} onClick={() => onMove(player.id, "right")}
          className="flex-1 rounded-lg py-1 text-[9px] font-medium disabled:opacity-30"
          style={{ background: `${meta.color}20`, color: meta.color }}>
          Avancer →
        </button>
      </div>
    </motion.div>
  );
}

export function RecruteurPipelinePage() {
  const [players, setPlayers] = useState<(ScoutProspectDto & { status: WorkflowStatus; priority: Priority })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPos, setNewPos] = useState("BU");
  const [saving, setSaving] = useState(false);

  const fetchPlayers = useCallback(() => {
    setLoading(true);
    setError(null);
    scoutApi.getProspects()
      .then((rows) => setPlayers(rows.map(p => ({
        ...p,
        status: (p.status as WorkflowStatus) || "new",
        priority: (p.priority as Priority) || "B",
      }))))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const move = async (id: string, dir: "left" | "right") => {
    const player = players.find(p => p.id === id);
    if (!player) return;
    const idx = STAGES.indexOf(player.status);
    const next = dir === "right" ? idx + 1 : idx - 1;
    if (next < 0 || next >= STAGES.length) return;
    const nextStatus = STAGES[next];
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    await scoutApi.updateProspect(id, { status: nextStatus }).catch(() => fetchPlayers());
  };

  async function addPlayer() {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const created = await scoutApi.createProspect({ name: newName, position: newPos }) as ScoutProspectDto;
      setPlayers(prev => [{ ...created, status: (created.status as WorkflowStatus) || "new", priority: (created.priority as Priority) || "B" }, ...prev]);
      setNewName(""); setShowModal(false);
    } catch {
      // keep modal open so the user can retry
    } finally {
      setSaving(false);
    }
  }

  const byStage = (stage: WorkflowStatus) => players.filter(p => p.status === stage);

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Talent Pipeline</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {players.length} joueurs · Kanban de suivi du recrutement
          </p>
        </div>
        <motion.button type="button" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Ajouter joueur
        </motion.button>
      </div>

      {error && !loading && (
        <div className="rounded-[20px] border p-5 text-center" style={{ background: "rgba(14,10,35,0.8)", borderColor: "rgba(239,68,68,0.3)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-[20px] border p-8 text-center" style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stage summary chips */}
          <div className="flex flex-wrap gap-2">
            {WORKFLOW_COLS.map(s => {
              const count = byStage(s.id).length;
              return (
                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold"
                  style={{ background: `${s.color}12`, borderColor: `${s.color}30`, color: s.color }}>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                    style={{ background: s.color }}>{count}</span>
                  {s.label}
                </motion.div>
              );
            })}
          </div>

          {/* Kanban Board */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3" style={{ minWidth: `${STAGES.length * 200}px` }}>
              {WORKFLOW_COLS.map(stage => (
                <div key={stage.id} className="flex w-[188px] shrink-0 flex-col gap-2">
                  {/* Column header */}
                  <div className="flex items-center justify-between rounded-xl border px-3 py-2"
                    style={{ background: `${stage.color}10`, borderColor: `${stage.color}30` }}>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: stage.color }} />
                      <span className="text-[11px] font-bold" style={{ color: stage.color }}>{stage.label}</span>
                    </div>
                    <span className="text-[10px] rounded-full px-1.5 py-0.5 font-bold"
                      style={{ background: `${stage.color}20`, color: stage.color }}>
                      {byStage(stage.id).length}
                    </span>
                  </div>
                  {/* Cards */}
                  <AnimatePresence mode="popLayout">
                    {byStage(stage.id).map(p => (
                      <PlayerCard key={p.id} player={p} onMove={move} />
                    ))}
                  </AnimatePresence>
                  {byStage(stage.id).length === 0 && (
                    <div className="rounded-xl border border-dashed py-6 text-center"
                      style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                      <p className="text-[10px]">Vide</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span className="font-semibold">Priorité:</span>
            {(["A","B","C"] as const).map(p => (
              <span key={p} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full inline-block" style={{ background: PRIORITY_META[p].color }} />
                {p}
              </span>
            ))}
            <span className="ml-2 flex items-center gap-1"><TrendingUp size={10} /> Cliquer les boutons pour avancer/reculer un joueur dans le pipeline</span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Validation",       value: byStage("validation").length, color: "#8B5CF6" },
              { label: "Signature",        value: byStage("signature").length,  color: "#FF7A00" },
              { label: "Terminés",         value: byStage("done").length,       color: "#22C55E" },
              { label: "Score IA moyen",   value: players.length ? `${Math.round(players.reduce((a,p) => a + p.aiScore, 0) / players.length)}/100` : "—", color: "#3B82F6" },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <div className="rounded-[16px] border p-4" style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
                  <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-sm rounded-[24px] border p-6"
              style={{ background: "rgba(14,10,35,0.98)", borderColor: "rgba(139,92,246,0.35)" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Ajouter joueur au pipeline</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={12} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Nom joueur</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)}
                    placeholder="Ex: Ahmed Ben Ali"
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Poste</label>
                  <select value={newPos} onChange={e => setNewPos(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--surface-modal)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    {["BU","MOC","MDF","DC","LB","GK","ATT","LAT"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={() => void addPlayer()} disabled={saving || !newName.trim()}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Plus size={12} className="inline mr-1" /> {saving ? "Ajout…" : "Ajouter"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow legend */}
      <div className="flex flex-wrap items-center gap-1 rounded-[16px] border p-4 text-[11px]"
        style={{ background: "rgba(14,10,35,0.6)", borderColor: "var(--surface-panel-border)" }}>
        <span style={{ color: "var(--text-muted)" }}>Flux:</span>
        {WORKFLOW_COLS.map((s, i) => (
          <span key={s.id} className="flex items-center gap-1">
            <span style={{ color: s.color }}>{s.label}</span>
            {i < WORKFLOW_COLS.length - 1 && <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />}
          </span>
        ))}
      </div>
    </RecruteurPageTransition>
  );
}
