import { motion } from "framer-motion";
import { GlassCard } from "../../components/ui/GlassCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { SQUAD_PLAYERS } from "../../data/joueurMockData";
import { getPlayerExtended } from "../../data/joueurExtendedData";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";

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
  const featured = SQUAD_PLAYERS.slice(0, 4);

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Training Center — FC Carthage</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Présence moyenne", value: 92, suffix: "%" },
            { label: "Charge moyenne", value: 68, suffix: "%" },
            { label: "Fatigue moyenne", value: 45, suffix: "%" },
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
          const ext = getPlayerExtended(player.id);
          const chartData = [
            { name: "Physical", value: ext.training.physical },
            { name: "Technical", value: ext.training.technical },
            { name: "Tactical", value: ext.training.tactical },
          ];
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
                  <GaugeBar label="Présence" value={ext.training.presence} color="var(--color-state-success)" />
                  <GaugeBar label="Charge" value={ext.training.charge} color="var(--color-state-warning)" />
                  <GaugeBar label="Fatigue" value={ext.training.fatigue} color="var(--color-state-danger)" />
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
      </div>

      <GlassCard raised className="p-5">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Nutrition & Sleep — Effectif</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={featured.map((p) => {
            const ext = getPlayerExtended(p.id);
            return { name: p.name.split(" ").pop(), sleep: ext.sleep.quality, hydration: ext.nutrition.hydration, recovery: ext.sleep.recovery };
          })}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="sleep" name="Sleep" stroke="#4a90d9" strokeWidth={2} animationDuration={1200} />
            <Line type="monotone" dataKey="hydration" name="Hydratation" stroke="var(--accent)" strokeWidth={2} animationDuration={1200} />
            <Line type="monotone" dataKey="recovery" name="Recovery" stroke="#2e9e5b" strokeWidth={2} animationDuration={1200} />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>
    </motion.div>
  );
}
