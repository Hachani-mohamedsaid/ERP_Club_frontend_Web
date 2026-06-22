import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, TrendingUp } from "lucide-react";
import { ScoutPage, SCard, SBadge, SGauge } from "../../components/scout/ScoutUI";
import { PROSPECTS, WORKFLOW_COLS, S, PRIORITY_META, type WorkflowStatus } from "../../data/scoutData";

export function ScoutRecruitmentPage() {
  const [statuses, setStatuses] = useState<Record<string, WorkflowStatus>>(
    Object.fromEntries(PROSPECTS.map(p => [p.id, p.status]))
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<WorkflowStatus | null>(null);
  const dragId = useRef<string | null>(null);

  const handleDragStart = (id: string) => {
    dragId.current = id;
    setDragging(id);
  };

  const handleDrop = (colId: WorkflowStatus) => {
    if (dragId.current && dragId.current !== colId) {
      setStatuses(prev => ({ ...prev, [dragId.current!]: colId }));
    }
    setDragging(null);
    setDragOver(null);
    dragId.current = null;
  };

  const totalValue = PROSPECTS.reduce((a, p) => a + p.valueMK, 0);
  const doneCount = Object.values(statuses).filter(s => s === "done").length;
  const sigCount = Object.values(statuses).filter(s => s === "signature").length;

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Workflow Recrutement</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Glisser-déposer les cartes entre colonnes</p>
        </div>
        <div className="flex gap-3">
          {[
            { label: "Terminés", value: doneCount, color: S.success },
            { label: "Signatures", value: sigCount, color: S.primary },
            { label: "Budget total", value: `${(totalValue / 1000).toFixed(1)}M €`, color: S.warning },
          ].map(k => (
            <div key={k.label} className="rounded-xl border px-3 py-2 text-center"
              style={{ background: "rgba(12,9,30,0.85)", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-sm font-extrabold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-3 min-w-max">
          {WORKFLOW_COLS.map(col => {
            const colProspects = PROSPECTS.filter(p => statuses[p.id] === col.id);
            const isDragTarget = dragOver === col.id;

            return (
              <div key={col.id} className="w-64 flex-shrink-0"
                onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(col.id)}>
                {/* Column header */}
                <div className="mb-3 flex items-center gap-2 rounded-xl border px-3 py-2.5"
                  style={{ background: col.bg, borderColor: `${col.color}30` }}>
                  <div className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                  <p className="flex-1 text-xs font-extrabold" style={{ color: col.color }}>{col.label}</p>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ background: col.color, color: "white" }}>
                    {colProspects.length}
                  </span>
                </div>

                {/* Drop zone */}
                <motion.div className="min-h-[60px] rounded-2xl border-2 border-dashed transition-colors"
                  style={{
                    borderColor: isDragTarget ? `${col.color}60` : "transparent",
                    background: isDragTarget ? `${col.color}06` : "transparent",
                  }}
                  animate={isDragTarget ? { scale: 1.01 } : { scale: 1 }}>

                  <div className="space-y-2 p-1">
                    <AnimatePresence mode="popLayout">
                      {colProspects.map((p, i) => {
                        const priority = PRIORITY_META[p.priority];
                        const isDraggingThis = dragging === p.id;
                        return (
                          <motion.div key={p.id} layout
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: isDraggingThis ? 0.5 : 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            draggable onDragStart={() => handleDragStart(p.id)} onDragEnd={() => { setDragging(null); setDragOver(null); }}
                            className="rounded-[16px] border p-3 cursor-grab active:cursor-grabbing select-none"
                            style={{
                              background: "rgba(12,9,30,0.92)",
                              borderColor: `${col.color}25`,
                              boxShadow: isDraggingThis ? `0 8px 24px rgba(0,0,0,0.4)` : "0 2px 8px rgba(0,0,0,0.2)",
                            }}
                            whileHover={{ y: -2, boxShadow: `0 8px 24px rgba(0,0,0,0.35)` }}>
                            {/* Drag handle + priority */}
                            <div className="flex items-center gap-2 mb-2">
                              <GripVertical size={12} style={{ color: "rgba(255,255,255,0.25)" }} />
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-extrabold text-white flex-1 max-w-[28px]"
                                style={{ background: `linear-gradient(135deg,${S.primary},S.primary)` }}>
                                {p.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <p className="flex-1 text-[11px] font-bold truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                              <span className="rounded-full px-1.5 py-0.5 text-[8px] font-black shrink-0"
                                style={{ background: priority.color, color: "white" }}>P.{p.priority}</span>
                            </div>

                            <p className="text-[9px] mb-2" style={{ color: "var(--text-muted)" }}>
                              {p.position} · {p.age} ans · {p.flag}
                            </p>

                            {/* Potential bar */}
                            <div className="mb-2">
                              <div className="flex justify-between text-[9px] mb-0.5">
                                <span style={{ color: "var(--text-muted)" }}>Potentiel</span>
                                <span className="font-bold" style={{ color: col.color }}>{p.potential}</span>
                              </div>
                              <SGauge value={p.potential} color={col.color} />
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-[9px] font-bold" style={{ color: "var(--text-muted)" }}>{p.marketValue}</p>
                              <span className="text-[9px] rounded-full px-1.5 py-0.5"
                                style={{ background: `${S.primary}15`, color: S.primary }}>
                                IA {p.aiScore}%
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {colProspects.length === 0 && !isDragTarget && (
                      <div className="py-6 text-center text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>
                        Déposer ici
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats row */}
      <SCard>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          <TrendingUp size={13} className="inline mr-1.5" style={{ color: S.primary }} />
          Vue d'ensemble pipeline
        </p>
        <div className="grid grid-cols-5 gap-2">
          {WORKFLOW_COLS.map(col => {
            const count = PROSPECTS.filter(p => statuses[p.id] === col.id).length;
            const pct = Math.round((count / PROSPECTS.length) * 100);
            return (
              <div key={col.id} className="text-center">
                <p className="text-lg font-extrabold" style={{ color: col.color }}>{count}</p>
                <div className="my-1">
                  <SGauge value={pct} color={col.color} />
                </div>
                <p className="text-[9px] font-semibold" style={{ color: col.color }}>{col.label}</p>
                <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </SCard>
    </ScoutPage>
  );
}
