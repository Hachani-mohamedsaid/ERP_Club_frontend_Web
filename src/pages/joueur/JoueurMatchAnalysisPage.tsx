import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../../components/ui/GlassCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { PlayerHeatmap } from "../../components/player/PlayerHeatmap";
import { SQUAD_PLAYERS } from "../../data/joueurMockData";
import { getPlayerExtended } from "../../data/joueurExtendedData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function JoueurMatchAnalysisPage() {
  const [selectedId, setSelectedId] = useState("1");
  const navigate = useNavigate();
  const player = SQUAD_PLAYERS.find((p) => p.id === selectedId)!;
  const ext = getPlayerExtended(selectedId);

  const metrics = [
    { label: "Distance", value: ext.matchAnalysis.distance, unit: " km", color: "var(--accent)" },
    { label: "Sprints", value: ext.matchAnalysis.sprints, unit: "", color: "#4a90d9" },
    { label: "Pass Accuracy", value: ext.matchAnalysis.passAccuracy, unit: "%", color: "#2e9e5b" },
    { label: "Top Speed", value: ext.matchAnalysis.topSpeed, unit: " km/h", color: "#d99a1f", decimals: 1 },
  ];

  const sprintData = [
    { half: "1ère MT", sprints: Math.round(ext.matchAnalysis.sprints * 0.45), distance: +(ext.matchAnalysis.distance * 0.48).toFixed(1) },
    { half: "2ème MT", sprints: Math.round(ext.matchAnalysis.sprints * 0.55), distance: +(ext.matchAnalysis.distance * 0.52).toFixed(1) },
  ];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-wrap gap-2">
        {SQUAD_PLAYERS.slice(0, 6).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className="rounded-[var(--radius-odin-md)] px-4 py-2 text-xs font-medium transition-colors"
            style={{ background: selectedId === p.id ? "var(--accent)" : "var(--surface-panel)", color: selectedId === p.id ? "white" : "var(--text-muted)" }}
          >
            {p.name.split(" ").pop()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map(({ label, value, unit, color, decimals }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-4 text-center">
              <p className="text-2xl font-bold" style={{ color }}>
                <CountUpStat end={value} suffix={unit} decimals={decimals ?? 0} />
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Heatmap — {player.name}</h3>
          <PlayerHeatmap />
          <p className="mt-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>Style Hudl / Catapult — Hover pour détails</p>
        </GlassCard>

        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sprints & Distance par mi-temps</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sprintData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="half" tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
              <Bar dataKey="sprints" name="Sprints" fill="var(--accent)" radius={[4, 4, 0, 0]} animationDuration={1200} />
              <Bar dataKey="distance" name="Distance (km)" fill="#4a90d9" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-4">
        <button type="button" onClick={() => navigate(`/joueurs/${selectedId}`)} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
          Voir fiche complète de {player.name} →
        </button>
      </GlassCard>
    </motion.div>
  );
}
