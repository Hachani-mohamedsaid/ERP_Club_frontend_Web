import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { scoutApi, type ScoutProspectDto } from "../../lib/api/scout";
import type { WorkflowStatus, Priority } from "../../data/scoutData";

type NegoStage = "prospect" | "contacte" | "discussion" | "offre" | "accepte";

const STATUS_TO_STAGE: Record<WorkflowStatus, NegoStage> = {
  new: "prospect", analysis: "contacte", validation: "discussion", signature: "offre", done: "accepte",
};
const STAGE_TO_STATUS: Record<NegoStage, WorkflowStatus> = {
  prospect: "new", contacte: "analysis", discussion: "validation", offre: "signature", accepte: "done",
};

const NEGO_STAGES: { id: NegoStage; label: string; color: string }[] = [
  { id: "prospect", label: "Prospect", color: "#6366F1" },
  { id: "contacte", label: "Contacté", color: "#3B82F6" },
  { id: "discussion", label: "Discussion", color: "#8B5CF6" },
  { id: "offre", label: "Offre", color: "#F59E0B" },
  { id: "accepte", label: "Accepté", color: "#22C55E" },
];

const PRIORITY: Record<"high" | "medium" | "low", { label: string; color: string }> = {
  high: { label: "Haute", color: "#EF4444" },
  medium: { label: "Moyenne", color: "#F59E0B" },
  low: { label: "Basse", color: "#22C55E" },
};
const PRIORITY_FROM_DTO: Record<Priority, "high" | "medium" | "low"> = { A: "high", B: "medium", C: "low" };

export function RecruteurNegotiationsPage() {
  const [prospects, setProspects] = useState<ScoutProspectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<NegoStage | null>(null);

  const fetchProspects = useCallback(() => {
    setLoading(true);
    setError(null);
    scoutApi.getProspects()
      .then(setProspects)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProspects(); }, [fetchProspects]);

  const move = async (id: string, stage: NegoStage) => {
    const nextStatus = STAGE_TO_STATUS[stage];
    setProspects(prev => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
    await scoutApi.updateProspect(id, { status: nextStatus }).catch(() => fetchProspects());
  };

  return (
    <RecruteurPageTransition>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Pipeline de recrutement — glissez les cartes entre les colonnes pour faire avancer chaque dossier.
      </p>

      {error && !loading && (
        <div className="rounded-2xl border p-5 text-center" style={{ background: "rgba(15,29,58,0.6)", borderColor: "rgba(239,68,68,0.3)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border p-8 text-center" style={{ background: "rgba(15,29,58,0.6)", borderColor: "rgba(255,255,255,0.05)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {NEGO_STAGES.map((stage) => {
            const stageCards = prospects.filter((c) => STATUS_TO_STAGE[(c.status as WorkflowStatus) || "new"] === stage.id);
            return (
              <div
                key={stage.id}
                onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }}
                onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
                onDrop={() => { if (dragId) void move(dragId, stage.id); setDragId(null); setOverStage(null); }}
                className="rounded-2xl border p-3 transition-colors"
                style={{
                  background: overStage === stage.id ? `${stage.color}14` : "rgba(15,29,58,0.6)",
                  borderColor: overStage === stage.id ? `${stage.color}66` : "rgba(255,255,255,0.05)",
                  minHeight: 240,
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: stage.color, boxShadow: `0 0 8px ${stage.color}` }} />
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{stage.label}</span>
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: `${stage.color}1f`, color: stage.color }}>{stageCards.length}</span>
                </div>
                <div className="space-y-2.5">
                  <AnimatePresence>
                    {stageCards.map((card) => {
                      const prio = PRIORITY[PRIORITY_FROM_DTO[(card.priority as Priority) || "B"]];
                      return (
                        <motion.div
                          layout
                          key={card.id}
                          layoutId={card.id}
                          draggable
                          onDragStart={() => setDragId(card.id)}
                          onDragEnd={() => { setDragId(null); setOverStage(null); }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: dragId === card.id ? 0.4 : 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ y: -2 }}
                          className="cursor-grab rounded-xl border p-3 active:cursor-grabbing"
                          style={{ background: "rgba(20,32,64,0.95)", borderColor: "var(--surface-panel-border)", borderLeft: `3px solid ${prio.color}` }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{card.name}</div>
                              <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{card.club}</div>
                            </div>
                            <GripVertical size={14} style={{ color: "var(--text-muted)" }} />
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold" style={{ color: "#22C55E" }}>{card.marketValue}</span>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${prio.color}1f`, color: prio.color }}>{prio.label}</span>
                          </div>
                          <div className="mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>Agent: {card.agent || "—"}</div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  {stageCards.length === 0 && (
                    <p className="py-4 text-center text-[11px]" style={{ color: "var(--text-muted)" }}>Vide</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </RecruteurPageTransition>
  );
}
