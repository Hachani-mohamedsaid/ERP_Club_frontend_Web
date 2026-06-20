import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { GlassCard } from "../../components/ui/GlassCard";
import { SQUAD_PLAYERS, getInitials } from "../../data/joueurMockData";

export function JoueurComparePage() {
  const [playerA, setPlayerA] = useState(SQUAD_PLAYERS[0].id);
  const [playerB, setPlayerB] = useState(SQUAD_PLAYERS[1].id);

  const a = SQUAD_PLAYERS.find((p) => p.id === playerA)!;
  const b = SQUAD_PLAYERS.find((p) => p.id === playerB)!;

  const radarCompare = Object.keys(a.radar).map((key) => ({
    stat: key.charAt(0).toUpperCase() + key.slice(1),
    [a.name.split(" ")[0]]: a.radar[key as keyof typeof a.radar],
    [b.name.split(" ")[0]]: b.radar[key as keyof typeof b.radar],
  }));

  const barCompare = [
    { stat: "Speed", a: a.radar.speed, b: b.radar.speed },
    { stat: "Passing", a: a.radar.passing, b: b.radar.passing },
    { stat: "Goals", a: a.stats.goals * 5, b: b.stats.goals * 5 },
    { stat: "Assists", a: a.stats.assists * 5, b: b.stats.assists * 5 },
  ];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
        <GlassCard className="p-4">
          <select value={playerA} onChange={(e) => setPlayerA(e.target.value)} className="glass-input mb-3 w-full py-2 text-sm">
            {SQUAD_PLAYERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {getInitials(a.name)}
            </div>
            <div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>{a.name}</p>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{a.ovr} OVR</p>
            </div>
          </div>
        </GlassCard>

        <div className="text-center">
          <motion.span className="text-4xl font-black" style={{ color: "var(--accent)" }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            VS
          </motion.span>
        </div>

        <GlassCard className="p-4">
          <select value={playerB} onChange={(e) => setPlayerB(e.target.value)} className="glass-input mb-3 w-full py-2 text-sm">
            {SQUAD_PLAYERS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {getInitials(b.name)}
            </div>
            <div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>{b.name}</p>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{b.ovr} OVR</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarCompare}>
              <PolarGrid stroke="var(--surface-panel-border)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Radar name={a.name.split(" ")[0]} dataKey={a.name.split(" ")[0]} stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} animationDuration={1200} />
              <Radar name={b.name.split(" ")[0]} dataKey={b.name.split(" ")[0]} stroke="#3a7bd5" fill="#3a7bd5" fillOpacity={0.2} animationDuration={1200} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-5">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Stats Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barCompare} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis type="category" dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: 8 }} />
              <Bar dataKey="a" fill="var(--accent)" name={a.name.split(" ")[0]} radius={[0, 4, 4, 0]} animationDuration={1200} />
              <Bar dataKey="b" fill="#3a7bd5" name={b.name.split(" ")[0]} radius={[0, 4, 4, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </motion.div>
  );
}
