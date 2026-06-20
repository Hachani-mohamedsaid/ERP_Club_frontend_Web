import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../../components/ui/GlassCard";
import { CHEMISTRY_PAIRS, ALL_PLAYER_NAMES } from "../../data/joueurExtendedData";
import { SQUAD_PLAYERS } from "../../data/joueurMockData";

function ChemistryGauge({ value }: { value: number }) {
  const color = value >= 85 ? "#2e9e5b" : value >= 70 ? "#d99a1f" : "#e0584a";
  return (
    <div className="relative mx-auto" style={{ width: 80, height: 80 }}>
      <svg width={80} height={80} className="-rotate-90">
        <circle cx={40} cy={40} r={34} fill="none" stroke="var(--surface-panel-border)" strokeWidth={6} />
        <motion.circle
          cx={40} cy={40} r={34} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round" strokeDasharray={2 * Math.PI * 34}
          initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>{value}%</span>
      </div>
    </div>
  );
}

export function JoueurChemistryPage() {
  const navigate = useNavigate();
  const playerNodes = SQUAD_PLAYERS.slice(0, 6);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <GlassCard raised className="p-5">
        <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Team Chemistry — Network</h3>
        <p className="mb-6 text-xs" style={{ color: "var(--text-muted)" }}>Style FIFA — compatibilité entre joueurs</p>

        <div className="relative mx-auto" style={{ width: 360, height: 360 }}>
          <svg width={360} height={360} className="absolute inset-0">
            {CHEMISTRY_PAIRS.filter((p) => playerNodes.some((n) => n.id === p.player1Id) && playerNodes.some((n) => n.id === p.player2Id)).map((pair, i) => {
              const p1Idx = playerNodes.findIndex((n) => n.id === pair.player1Id);
              const p2Idx = playerNodes.findIndex((n) => n.id === pair.player2Id);
              if (p1Idx < 0 || p2Idx < 0) return null;
              const a1 = (p1Idx / playerNodes.length) * 2 * Math.PI - Math.PI / 2;
              const a2 = (p2Idx / playerNodes.length) * 2 * Math.PI - Math.PI / 2;
              const x1 = 180 + Math.cos(a1) * 140;
              const y1 = 180 + Math.sin(a1) * 140;
              const x2 = 180 + Math.cos(a2) * 140;
              const y2 = 180 + Math.sin(a2) * 140;
              const color = pair.chemistry >= 85 ? "#2e9e5b" : pair.chemistry >= 70 ? "#d99a1f" : "#e0584a";
              return (
                <motion.line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={pair.chemistry / 25}
                  strokeOpacity={0.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.5 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                />
              );
            })}
          </svg>
          {playerNodes.map((player, i) => {
            const angle = (i / playerNodes.length) * 2 * Math.PI - Math.PI / 2;
            const x = 180 + Math.cos(angle) * 140;
            const y = 180 + Math.sin(angle) * 140;
            return (
              <motion.button
                key={player.id}
                type="button"
                onClick={() => navigate(`/joueurs/${player.id}`)}
                className="absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 text-[9px] font-bold"
                style={{ left: x, top: y, borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--accent)" }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                whileHover={{ scale: 1.15 }}
              >
                {player.name.split(" ").pop()?.slice(0, 6)}
                <span className="text-[8px] opacity-70">{player.position}</span>
              </motion.button>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHEMISTRY_PAIRS.map((pair, i) => (
          <motion.div key={`${pair.player1Id}-${pair.player2Id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="flex items-center gap-4 p-4">
              <div className="flex-1 text-center">
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{pair.player1.split(" ").pop()}</p>
              </div>
              <ChemistryGauge value={pair.chemistry} />
              <div className="flex-1 text-center">
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{pair.player2.split(" ").pop()}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-4">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {ALL_PLAYER_NAMES.length} joueurs dans l'effectif — {CHEMISTRY_PAIRS.length} paires analysées
        </p>
      </GlassCard>
    </motion.div>
  );
}
