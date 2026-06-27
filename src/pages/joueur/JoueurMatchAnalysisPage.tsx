import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "../../components/ui/GlassCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { PlayerHeatmap } from "../../components/player/PlayerHeatmap";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export function JoueurMatchAnalysisPage() {
  const navigate = useNavigate();
  const { matchStats, squadPlayers } = useJoueurBackendData();

  const [selectedIdx, setSelectedIdx] = useState(0);

  const match = matchStats[selectedIdx] ?? null;

  const metrics = match
    ? [
        { label: "Distance", value: match.distance, unit: " km", color: "var(--accent)" },
        { label: "Sprints", value: match.sprints, unit: "", color: "#4a90d9" },
        { label: "Pass Accuracy", value: match.passAccuracy, unit: "%", color: "#2e9e5b" },
        { label: "Top Speed", value: match.topSpeed, unit: " km/h", color: "#d99a1f", decimals: 1 },
      ]
    : [];

  const sprintData = match
    ? [
        { half: "1ère MT", sprints: Math.round(match.sprints * 0.45), distance: +(match.distance * 0.48).toFixed(1) },
        { half: "2ème MT", sprints: Math.round(match.sprints * 0.55), distance: +(match.distance * 0.52).toFixed(1) },
      ]
    : [];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Match selector */}
      <div className="flex flex-wrap gap-2">
        {matchStats.slice(0, 6).map((m, i) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setSelectedIdx(i)}
            className="rounded-[var(--radius-odin-md)] px-4 py-2 text-xs font-medium transition-colors"
            style={{
              background: selectedIdx === i ? "var(--accent)" : "var(--surface-panel)",
              color: selectedIdx === i ? "white" : "var(--text-muted)",
            }}
          >
            vs {m.opponent.split(" ").pop()} · {new Date(m.matchDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
          </button>
        ))}
      </div>

      {match ? (
        <>
          {/* Match header */}
          <GlassCard raised className="flex items-center justify-between p-4">
            <div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>vs {match.opponent}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {new Date(match.matchDate).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black" style={{ color: "var(--accent)" }}>{match.result}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Note: <span style={{ color: match.rating >= 8 ? "#22C55E" : match.rating >= 7 ? "#F59E0B" : "#EF4444" }}>{match.rating.toFixed(1)}</span>/10
              </p>
            </div>
          </GlassCard>

          {/* KPI grid */}
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

          {/* Goals + passes summary */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Buts", value: match.goals, color: "#22C55E" },
              { label: "Assists", value: match.assists, color: "#3B82F6" },
              { label: "Passes clés", value: match.keyPasses, color: "#F59E0B" },
              { label: "Minutes", value: match.minutes, color: "#8b5cf6" },
            ].map(({ label, value, color }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 + i * 0.08 }}>
                <GlassCard className="p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GlassCard raised className="p-5">
              <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Heatmap — vs {match.opponent}
              </h3>
              <PlayerHeatmap />
              <p className="mt-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>Zones d'activité — Hover pour détails</p>
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
        </>
      ) : (
        <GlassCard raised className="p-10 text-center">
          <p style={{ color: "var(--text-muted)" }}>Aucune donnée de match disponible</p>
        </GlassCard>
      )}

      {/* Squad selector */}
      {squadPlayers.length > 0 && (
        <GlassCard raised className="p-5">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Analyse par joueur</h3>
          <div className="flex flex-wrap gap-2">
            {squadPlayers.slice(0, 8).map((p) => (
              <button
                key={p.id}
                type="button"
                className="rounded-[var(--radius-odin-md)] px-3 py-1.5 text-xs font-medium transition-colors"
                style={{ background: "var(--surface-panel)", color: "var(--text-muted)" }}
              >
                {p.name.split(" ").pop()}
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-4">
        <button type="button" onClick={() => navigate(`/joueurs/profil`)} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
          Voir ma fiche complète →
        </button>
      </GlassCard>
    </motion.div>
  );
}
