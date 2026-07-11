import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Swords } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { useRecruteurStore, setCompare } from "../../data/recruteurStore";
import { useRecruteurTalents } from "../../hooks/useRecruteurTalents";
import type { ScoutPlayer } from "../../data/recruteurData";

const METRICS: { key: "speed" | "technique" | "physical" | "vision" | "mental" | "finishing"; label: string }[] = [
  { key: "speed", label: "Vitesse" },
  { key: "technique", label: "Technique" },
  { key: "physical", label: "Physique" },
  { key: "vision", label: "Vision" },
  { key: "mental", label: "Mental" },
  { key: "finishing", label: "Finition" },
];

export function RecruteurComparePage() {
  const store = useRecruteurStore();
  const { talents, loading, error, getById } = useRecruteurTalents();

  if (loading) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  if (error) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  if (talents.length < 2) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <Swords size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pas assez de talents pour comparer</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  const a: ScoutPlayer = getById(store.compare[0]) ?? talents[0];
  const b: ScoutPlayer = getById(store.compare[1]) ?? talents[1];

  const radarData = METRICS.map((m) => ({ axis: m.label, A: a[m.key], B: b[m.key] }));

  const compareRows = [
    { label: "Score IA", a: `${a.aiScore}%`, b: `${b.aiScore}%`, av: a.aiScore, bv: b.aiScore },
    { label: "Vitesse", a: a.speed, b: b.speed, av: a.speed, bv: b.speed },
    { label: "Passes (vision)", a: a.vision, b: b.vision, av: a.vision, bv: b.vision },
    { label: "Buts", a: a.goals, b: b.goals, av: a.goals, bv: b.goals },
    { label: "Tirs (finition)", a: a.finishing, b: b.finishing, av: a.finishing, bv: b.finishing },
    { label: "Valeur", a: a.value, b: b.value, av: a.valueNum, bv: b.valueNum },
  ];

  const Picker = ({ side }: { side: 0 | 1 }) => (
    <select
      value={store.compare[side] ?? ""}
      onChange={(e) => {
        const next = [...store.compare];
        next[side] = e.target.value;
        setCompare(next);
      }}
      className="rounded-lg border px-3 py-1.5 text-sm"
      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
    >
      {talents.map((p) => <option key={p.id} value={p.id} style={{ background: "#0F1D3A" }}>{p.name}</option>)}
    </select>
  );

  const PlayerHeader = ({ p, color, side }: { p: ScoutPlayer; color: string; side: 0 | 1 }) => (
    <motion.div
      className="relative overflow-hidden rounded-2xl border p-5 text-center"
      style={{ background: `linear-gradient(160deg, ${color}22, rgba(15,29,58,0.9))`, borderColor: `${color}40` }}
      initial={{ opacity: 0, x: side === 0 ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <PlayerAvatar name={p.name} size={84} ring={false} className="mx-auto !rounded-2xl" />
      <h3 className="mt-3 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.countryFlag} {p.club} • {p.age} ans</p>
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-extrabold" style={{ background: `${color}25`, color }}>{p.aiScore}% IA</div>
      <div className="mt-3"><Picker side={side} /></div>
    </motion.div>
  );

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <PlayerHeader p={a} color="#8B5CF6" side={0} />
        <div className="flex items-center justify-center">
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg,#EF4444,#F59E0B)", boxShadow: "0 0 24px rgba(239,68,68,0.5)" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <Swords size={22} />
          </motion.div>
        </div>
        <PlayerHeader p={b} color="#3B82F6" side={1} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RecruteurKpiCard hover={false}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Radar comparatif</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={radarData} outerRadius="72%">
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "#94A3B8", fontSize: 12 }} />
              <Radar name={a.name} dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.4} />
              <Radar name={b.name} dataKey="B" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </RecruteurKpiCard>

        <RecruteurKpiCard hover={false}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Face à face</h3>
          <div className="space-y-3">
            {compareRows.map((r, i) => {
              const aWins = r.av >= r.bv;
              return (
                <motion.div key={r.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="w-16 text-left font-bold" style={{ color: aWins ? "#8B5CF6" : "var(--text-muted)" }}>{r.a}</span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.label}</span>
                    <span className="w-16 text-right font-bold" style={{ color: !aWins ? "#3B82F6" : "var(--text-muted)" }}>{r.b}</span>
                  </div>
                  <div className="flex h-2 gap-1">
                    <div className="flex flex-1 justify-end overflow-hidden rounded-l-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full" style={{ background: "#8B5CF6" }} initial={{ width: 0 }} animate={{ width: `${(r.av / (r.av + r.bv || 1)) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.06 }} />
                    </div>
                    <div className="flex flex-1 overflow-hidden rounded-r-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full" style={{ background: "#3B82F6" }} initial={{ width: 0 }} animate={{ width: `${(r.bv / (r.av + r.bv || 1)) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.06 }} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
