import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { GlassCard } from "../../components/ui/GlassCard";
import { Loader2 } from "lucide-react";
import { getInitials } from "../../data/joueurMockData";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";

export function JoueurComparePage() {
  const { squadPlayers, loading } = useJoueurBackendData();

  const [playerAId, setPlayerAId] = useState<string>("");
  const [playerBId, setPlayerBId] = useState<string>("");

  const players = squadPlayers;
  const aId = playerAId || players[0]?.id || "";
  const bId = playerBId || players[1]?.id || players[0]?.id || "";

  const a = players.find((p) => p.id === aId) ?? players[0];
  const b = players.find((p) => p.id === bId) ?? players[1] ?? players[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3" style={{ color: "var(--text-muted)" }}>
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Chargement des joueurs...</span>
      </div>
    );
  }

  if (!a || !b) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pas assez de joueurs pour comparer</p>
      </div>
    );
  }

  const defaultRadar = { speed: 70, passing: 65, shooting: 60, physical: 72, vision: 68, defending: 55 };
  const radarA = { ...defaultRadar, ...(a.radar ?? {}) };
  const radarB = { ...defaultRadar, ...(b.radar ?? {}) };

  const radarKeys = Object.keys(radarA);
  const radarCompare = radarKeys.map((key) => ({
    stat: key.charAt(0).toUpperCase() + key.slice(1),
    [a.name.split(" ")[0]]: radarA[key as keyof typeof radarA] ?? 65,
    [b.name.split(" ")[0]]: radarB[key as keyof typeof radarB] ?? 65,
  }));

  const barCompare = [
    { stat: "Speed", a: radarA.speed, b: radarB.speed },
    { stat: "Passing", a: radarA.passing, b: radarB.passing },
    { stat: "Goals", a: Math.min((a.goals ?? 0) * 5, 100), b: Math.min((b.goals ?? 0) * 5, 100) },
    { stat: "OVR", a: a.ovr ?? 70, b: b.ovr ?? 70 },
  ];

  const aFirstName = a.name.split(" ")[0];
  const bFirstName = b.name.split(" ")[0];

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-center">
        <GlassCard className="p-4">
          <select
            value={aId}
            onChange={(e) => setPlayerAId(e.target.value)}
            className="glass-input mb-3 w-full py-2 text-sm"
          >
            {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold overflow-hidden" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {a.photoUrl
                ? <img src={a.photoUrl} alt={a.name} className="h-full w-full object-cover" />
                : getInitials(a.name)}
            </div>
            <div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>{a.name}</p>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{a.ovr ?? 70} OVR</p>
            </div>
          </div>
        </GlassCard>

        <div className="text-center">
          <motion.span className="text-4xl font-black" style={{ color: "var(--accent)" }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            VS
          </motion.span>
        </div>

        <GlassCard className="p-4">
          <select
            value={bId}
            onChange={(e) => setPlayerBId(e.target.value)}
            className="glass-input mb-3 w-full py-2 text-sm"
          >
            {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold overflow-hidden" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              {b.photoUrl
                ? <img src={b.photoUrl} alt={b.name} className="h-full w-full object-cover" />
                : getInitials(b.name)}
            </div>
            <div>
              <p className="font-bold" style={{ color: "var(--text-primary)" }}>{b.name}</p>
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>{b.ovr ?? 70} OVR</p>
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
              <Radar name={aFirstName} dataKey={aFirstName} stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} animationDuration={1200} />
              <Radar name={bFirstName} dataKey={bFirstName} stroke="#3a7bd5" fill="#3a7bd5" fillOpacity={0.2} animationDuration={1200} />
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
              <Bar dataKey="a" fill="var(--accent)" name={aFirstName} radius={[0, 4, 4, 0]} animationDuration={1200} />
              <Bar dataKey="b" fill="#3a7bd5" name={bFirstName} radius={[0, 4, 4, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Buts", aVal: a.goals ?? 0, bVal: b.goals ?? 0, color: "#22C55E" },
          { label: "OVR", aVal: a.ovr ?? 70, bVal: b.ovr ?? 70, color: "#FF6B57" },
          { label: "Valeur marché", aVal: a.marketValue || "—", bVal: b.marketValue || "—", color: "#F59E0B", isText: true },
          { label: "Position", aVal: a.position || "—", bVal: b.position || "—", color: "#3B82F6", isText: true },
        ].map(({ label, aVal, bVal, color, isText }) => (
          <GlassCard key={label} className="p-4">
            <p className="mb-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{label}</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold" style={{ color }}>{isText ? aVal : aVal}</p>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>vs</span>
              <p className="text-xl font-bold" style={{ color: "#3a7bd5" }}>{bVal}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
}
