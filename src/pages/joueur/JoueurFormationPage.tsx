import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { SQUAD_PLAYERS, getInitials } from "../../data/joueurMockData";
import { CHEMISTRY_PAIRS } from "../../data/joueurExtendedData";

const FORMATION_433 = [
  { id: "gb", label: "GB", x: 50, y: 88 },
  { id: "dg", label: "DG", x: 15, y: 68 },
  { id: "dc1", label: "DC", x: 35, y: 72 },
  { id: "dc2", label: "DC", x: 65, y: 72 },
  { id: "dd", label: "DD", x: 85, y: 68 },
  { id: "mc1", label: "MC", x: 30, y: 48 },
  { id: "moc", label: "MOC", x: 50, y: 42 },
  { id: "mc2", label: "MC", x: 70, y: 48 },
  { id: "ag", label: "AG", x: 18, y: 22 },
  { id: "bu", label: "BU", x: 50, y: 15 },
  { id: "ad", label: "AD", x: 82, y: 22 },
];

const BEST_XI: Record<string, string> = {
  gb: "5", dg: "4", dc1: "3", dc2: "3", dd: "4",
  mc1: "2", moc: "2", mc2: "6", ag: "7", bu: "1", ad: "6",
};

function getChemistry(player1Id: string, player2Id: string): number {
  const pair = CHEMISTRY_PAIRS.find(
    (p) => (p.player1Id === player1Id && p.player2Id === player2Id) || (p.player1Id === player2Id && p.player2Id === player1Id)
  );
  return pair?.chemistry ?? 65;
}

export function JoueurFormationPage() {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [chemistryScore, setChemistryScore] = useState<number | null>(null);

  function assignPlayer(slotId: string, playerId: string) {
    setAssignments((prev) => {
      const next = { ...prev, [slotId]: playerId };
      updateChemistry(next);
      return next;
    });
    setDragging(null);
  }

  function updateChemistry(current: Record<string, string>) {
    const ids = Object.values(current);
    if (ids.length < 2) { setChemistryScore(null); return; }
    let total = 0;
    let count = 0;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        total += getChemistry(ids[i], ids[j]);
        count++;
      }
    }
    setChemistryScore(Math.round(total / count));
  }

  function generateBestXI() {
    setGenerating(true);
    setTimeout(() => {
      setAssignments(BEST_XI);
      updateChemistry(BEST_XI);
      setGenerating(false);
    }, 1200);
  }

  const assignedIds = new Set(Object.values(assignments));
  const bench = SQUAD_PLAYERS.filter((p) => !assignedIds.has(p.id));

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Formation 4-3-3</h3>
        <div className="flex items-center gap-3">
          {chemistryScore !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-[var(--radius-odin-md)] border px-4 py-2 text-center"
              style={{ borderColor: chemistryScore >= 80 ? "#2e9e5b" : "#d99a1f" }}
            >
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Chemistry</p>
              <p className="text-xl font-bold" style={{ color: chemistryScore >= 80 ? "#2e9e5b" : "#d99a1f" }}>{chemistryScore}%</p>
            </motion.div>
          )}
          <Button onClick={generateBestXI} disabled={generating}>
            <Sparkles size={16} className="mr-2" />
            {generating ? "Génération..." : "Generate Best XI"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <GlassCard className="p-4 lg:col-span-1">
          <p className="mb-3 text-xs font-medium" style={{ color: "var(--text-muted)" }}>Joueurs disponibles</p>
          <div className="max-h-[500px] space-y-2 overflow-y-auto">
            {bench.map((player) => (
              <motion.button
                key={player.id}
                type="button"
                draggable
                onDragStart={() => setDragging(player.id)}
                onDragEnd={() => setDragging(null)}
                className="flex w-full items-center gap-2 rounded-[var(--radius-odin-md)] border px-3 py-2 text-left text-xs"
                style={{ borderColor: dragging === player.id ? "var(--accent)" : "var(--surface-panel-border)", opacity: dragging === player.id ? 0.5 : 1 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  {getInitials(player.name)}
                </span>
                <span style={{ color: "var(--text-primary)" }}>{player.name.split(" ").pop()}</span>
                <span className="ml-auto" style={{ color: "var(--text-muted)" }}>{player.position}</span>
              </motion.button>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="relative lg:col-span-3" style={{ minHeight: 480 }}>
          <div
            className="relative mx-auto my-4 rounded-[var(--radius-odin-md)] border-2"
            style={{ width: "100%", maxWidth: 400, height: 420, borderColor: "var(--color-state-success)", background: "rgba(46,158,91,0.06)" }}
          >
            <div className="absolute inset-x-8 top-1/2 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="absolute left-1/2 top-4 h-20 w-20 -translate-x-1/2 rounded-full border" style={{ borderColor: "rgba(255,255,255,0.1)" }} />

            {FORMATION_433.map((slot) => {
              const playerId = assignments[slot.id];
              const player = playerId ? SQUAD_PLAYERS.find((p) => p.id === playerId) : null;

              return (
                <div
                  key={slot.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dragging && assignPlayer(slot.id, dragging)}
                >
                  <motion.div
                    className="flex h-12 w-12 flex-col items-center justify-center rounded-full border-2 text-[9px] font-bold cursor-pointer"
                    style={{
                      borderColor: player ? "var(--accent)" : "rgba(255,255,255,0.2)",
                      background: player ? "var(--accent)" : "rgba(255,255,255,0.05)",
                      color: "white",
                      boxShadow: player ? "0 0 16px rgba(224,88,74,0.5)" : undefined,
                    }}
                    animate={player ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => playerId && setAssignments((prev) => { const n = { ...prev }; delete n[slot.id]; updateChemistry(n); return n; })}
                  >
                    {player ? getInitials(player.name) : slot.label}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
