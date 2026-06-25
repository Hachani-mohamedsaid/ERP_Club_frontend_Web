import { motion } from "framer-motion";
import { GripVertical, Clock } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { REEDUCATION_PHASES, getInitials } from "../../data/medicalMockData";

const PHASES = [
  { key: "phase1" as const, color: "#c0392b", icon: "🔴" },
  { key: "phase2" as const, color: "#d99a1f", icon: "🟠" },
  { key: "retour" as const, color: "#2e9e5b", icon: "🟢" },
];

function PlayerKanbanCard({ name, phaseColor }: { name: string; phaseColor: string }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-grab rounded-[var(--radius-odin-md)] border p-3 active:cursor-grabbing"
      style={{ borderColor: "var(--surface-panel-border)", borderLeft: `3px solid ${phaseColor}` }}
    >
      <div className="flex items-center gap-2">
        <GripVertical size={14} style={{ color: "var(--text-muted)" }} />
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>{name}</p>
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Clock size={10} /> Prochaine séance demain
          </div>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: phaseColor === "#2e9e5b" ? "90%" : phaseColor === "#d99a1f" ? "55%" : "25%",
            background: phaseColor,
          }}
        />
      </div>
    </motion.div>
  );
}

export function MedicalReeducationPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PHASES.map(({ key, color, icon }) => {
          const phase = REEDUCATION_PHASES[key];
          return (
            <GlassCard key={key} raised className="flex flex-col p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="mr-2">{icon}</span>
                  <h3 className="inline text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {phase.label}
                  </h3>
                </div>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: `${color}33`, color }}
                >
                  {phase.players.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {phase.players.map((name) => (
                  <PlayerKanbanCard key={name} name={name} phaseColor={color} />
                ))}
                {phase.players.length === 0 && (
                  <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    Aucun joueur
                  </p>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="p-4">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Légende des phases</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { phase: "Phase 1", desc: "Immobilisation, cryothérapie, protection articulaire", color: "#c0392b" },
            { phase: "Phase 2", desc: "Renforcement musculaire, proprioception, reprise cardio", color: "#d99a1f" },
            { phase: "Retour terrain", desc: "Reprise progressive, tests physiques, validation médicale", color: "#2e9e5b" },
          ].map(({ phase, desc, color }) => (
            <div key={phase} className="rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)", borderLeft: `3px solid ${color}` }}>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{phase}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
