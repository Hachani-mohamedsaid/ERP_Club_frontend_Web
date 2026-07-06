import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { NEGO_STAGES, NEGO_CARDS, type NegoCard, type NegoStage } from "../../data/recruteurData";

const PRIORITY: Record<NegoCard["priority"], { label: string; color: string }> = {
  high: { label: "Haute", color: "#EF4444" },
  medium: { label: "Moyenne", color: "#F59E0B" },
  low: { label: "Basse", color: "#22C55E" },
};

export function RecruteurNegotiationsPage() {
  const [cards, setCards] = useState<NegoCard[]>(NEGO_CARDS);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<NegoStage | null>(null);

  const move = (id: string, stage: NegoStage) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, stage } : c)));
  };

  return (
    <RecruteurPageTransition>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Pipeline de recrutement — glissez les cartes entre les colonnes pour faire avancer chaque dossier.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {NEGO_STAGES.map((stage) => {
          const stageCards = cards.filter((c) => c.stage === stage.id);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }}
              onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
              onDrop={() => { if (dragId) move(dragId, stage.id); setDragId(null); setOverStage(null); }}
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
                    const prio = PRIORITY[card.priority];
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
                            <div className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{card.player}</div>
                            <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{card.club}</div>
                          </div>
                          <GripVertical size={14} style={{ color: "var(--text-muted)" }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-bold" style={{ color: "#22C55E" }}>{card.value}</span>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${prio.color}1f`, color: prio.color }}>{prio.label}</span>
                        </div>
                        <div className="mt-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>Agent: {card.agent}</div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </RecruteurPageTransition>
  );
}
