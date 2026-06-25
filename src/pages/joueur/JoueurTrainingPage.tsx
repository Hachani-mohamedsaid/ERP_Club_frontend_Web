import { motion } from "framer-motion";
import { GlassCard } from "../../components/ui/GlassCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";
import { Loader2 } from "lucide-react";

function GaugeBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span style={{ color: "var(--text-muted)" }}>{label}</span>
        <span className="font-bold" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-panel-border)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: 1 }} />
      </div>
    </div>
  );
}

export function JoueurTrainingPage() {
  const { squadPlayers, playerStats, loading } = useJoueurBackendData();
  const featured = squadPlayers.slice(0, 4);

  const avgPresence = playerStats?.trainingSessions?.completed
    ? Math.round((playerStats.trainingSessions.completed / (playerStats.trainingSessions.total || 5)) * 100)
    : 92;
  const avgLoad = playerStats?.trainingLoad ?? 68;
  const avgFatigue = playerStats?.trainingSessions?.fatiguePredicted ?? 45;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3" style={{ color: "var(--text-muted)" }}>
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Chargement des données d'entraînement...</span>
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Training Center — FC Carthage</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Présence moyenne", value: avgPresence, suffix: "%" },
            { label: "Charge moyenne", value: avgLoad, suffix: "%" },
            { label: "Fatigue moyenne", value: avgFatigue, suffix: "%" },
          ].map(({ label, value, suffix }) => (
            <div key={label}>
              <p className="text-3xl font-bold" style={{ color: "var(--accent)" }}><CountUpStat end={value} suffix={suffix} /></p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {featured.map((player, i) => {
          const radar = player.radar ?? {};
          const chartData = [
            { name: "Physical", value: radar["physical"] ?? player.stats?.physique ?? 70 },
            { name: "Technical", value: radar["passing"] ?? player.stats?.technique ?? 68 },
            { name: "Tactical", value: radar["vision"] ?? player.stats?.mental ?? 65 },
          ];
          const presence = player.stats?.trainingSessions
            ? Math.round((player.stats.trainingSessions.completed / (player.stats.trainingSessions.total || 5)) * 100)
            : 88;
          const charge = player.stats?.trainingLoad ?? 65;
          const fatigue = player.stats?.trainingSessions?.fatiguePredicted ?? 42;

          return (
            <motion.div key={player.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard raised className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{player.position}</p>
                  </div>
                  <span className="text-xl font-bold" style={{ color: "var(--accent)" }}>{player.ovr}</span>
                </div>
                <div className="mb-4 space-y-2">
                  <GaugeBar label="Présence" value={presence} color="var(--color-state-success)" />
                  <GaugeBar label="Charge" value={charge} color="var(--color-state-warning)" />
                  <GaugeBar label="Fatigue" value={fatigue} color="var(--color-state-danger)" />
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
                    <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </motion.div>
          );
        })}
        {featured.length === 0 && (
          <p className="col-span-2 text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>
            Aucun joueur disponible
          </p>
        )}
      </div>

      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Forme & Physique — Effectif</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={featured.map((p) => ({
            name: p.name.split(" ").pop(),
            forme: p.stats?.form ?? p.ovr ?? 70,
            technique: p.radar?.["passing"] ?? p.stats?.technique ?? 65,
            physique: p.radar?.["physical"] ?? p.stats?.physique ?? 68,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="forme" name="Forme" stroke="#4a90d9" strokeWidth={2} animationDuration={1200} />
            <Line type="monotone" dataKey="technique" name="Technique" stroke="var(--accent)" strokeWidth={2} animationDuration={1200} />
            <Line type="monotone" dataKey="physique" name="Physique" stroke="#2e9e5b" strokeWidth={2} animationDuration={1200} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </motion.div>
  );
}
