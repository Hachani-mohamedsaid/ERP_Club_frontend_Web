import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical, Clock, Loader2 } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi } from "../../lib/api/club";
import { getInitials } from "../../data/medicalMockData";

type PhaseKey = "phase1" | "phase2" | "retour";

interface InjuredPlayer {
  id: string;
  name: string;
  injury: string;
  riskIA: number;
  returnDate: string;
}

const PHASES = [
  { key: "phase1" as const, color: "#c0392b", icon: "🔴", label: "Phase 1 — Immobilisation" },
  { key: "phase2" as const, color: "#d99a1f", icon: "🟠", label: "Phase 2 — Renforcement" },
  { key: "retour" as const, color: "#2e9e5b", icon: "🟢", label: "Retour terrain" },
];

const PROGRESS_BY_PHASE: Record<PhaseKey, string> = {
  phase1: "25%",
  phase2: "55%",
  retour: "90%",
};

const NEXT_PHASE: Record<PhaseKey, PhaseKey | null> = {
  phase1: "phase2",
  phase2: "retour",
  retour: null,
};

function normalizeInjured(raw: unknown): InjuredPlayer[] {
  if (!raw || typeof raw !== "object") return [];
  const data = raw as Record<string, unknown>;
  const list = Array.isArray(data.injured) ? data.injured : [];
  return list.map((item, i) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id ?? `inj-${i}`),
      name: String(row.name ?? ""),
      injury: String(row.injury ?? row.injuryType ?? ""),
      riskIA: Number(row.riskIA ?? 0),
      returnDate: String(row.returnDate ?? "—"),
    };
  });
}

function PlayerKanbanCard({
  name,
  phase,
  phaseColor,
  canAdvance,
  onAdvance,
}: {
  name: string;
  phase: PhaseKey;
  phaseColor: string;
  canAdvance: boolean;
  onAdvance: () => void;
}) {
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
        {canAdvance ? (
          <button
            type="button"
            onClick={onAdvance}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-odin-md)] text-sm font-semibold transition-colors hover:bg-white/10"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Phase suivante"
          >
            →
          </button>
        ) : null}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: PROGRESS_BY_PHASE[phase],
            background: phaseColor,
          }}
        />
      </div>
    </motion.div>
  );
}

export function MedicalReeducationPage() {
  const [injured, setInjured] = useState<InjuredPlayer[]>([]);
  const [phaseAssignments, setPhaseAssignments] = useState<Record<string, PhaseKey>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInjuries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await clubApi.getInjuries();
      const players = normalizeInjured(res);
      setInjured(players);
      setPhaseAssignments((prev) => {
        const next: Record<string, PhaseKey> = {};
        for (const player of players) {
          next[player.id] = prev[player.id] ?? "phase1";
        }
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInjuries();
  }, [loadInjuries]);

  const playersByPhase = useMemo(() => {
    const grouped: Record<PhaseKey, InjuredPlayer[]> = {
      phase1: [],
      phase2: [],
      retour: [],
    };
    for (const player of injured) {
      const phase = phaseAssignments[player.id] ?? "phase1";
      grouped[phase].push(player);
    }
    return grouped;
  }, [injured, phaseAssignments]);

  const advancePhase = useCallback((playerId: string) => {
    setPhaseAssignments((prev) => {
      const current = prev[playerId] ?? "phase1";
      const next = NEXT_PHASE[current];
      if (!next) return prev;
      return { ...prev, [playerId]: next };
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {PHASES.map(({ key, color, icon, label }) => {
          const players = playersByPhase[key];
          return (
            <GlassCard key={key} raised className="flex flex-col p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="mr-2">{icon}</span>
                  <h3 className="inline text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </h3>
                </div>
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: `${color}33`, color }}
                >
                  {players.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {players.map((player) => {
                  const phase = phaseAssignments[player.id] ?? "phase1";
                  return (
                    <PlayerKanbanCard
                      key={player.id}
                      name={player.name}
                      phase={phase}
                      phaseColor={color}
                      canAdvance={NEXT_PHASE[phase] !== null}
                      onAdvance={() => advancePhase(player.id)}
                    />
                  );
                })}
                {players.length === 0 && (
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
