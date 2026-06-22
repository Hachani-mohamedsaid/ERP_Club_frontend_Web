import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { PLAYER_DETAILS } from "../../data/preparateurData";

const EXTENDED: Record<string, { distance: number; sprints: number; acceleration: number; rpe: number; wellness: number }> = {
  "1": { distance: 10.8, sprints: 28, acceleration: 42, rpe: 8.2, wellness: 58 },
  "2": { distance: 11.2, sprints: 31, acceleration: 45, rpe: 6.1, wellness: 88 },
  "3": { distance: 9.4,  sprints: 18, acceleration: 28, rpe: 5.5, wellness: 74 },
  "4": { distance: 10.5, sprints: 26, acceleration: 38, rpe: 7.4, wellness: 66 },
  "5": { distance: 10.2, sprints: 24, acceleration: 36, rpe: 7.8, wellness: 55 },
  "6": { distance: 10.9, sprints: 29, acceleration: 41, rpe: 6.8, wellness: 75 },
  "7": { distance: 10.6, sprints: 27, acceleration: 39, rpe: 6.5, wellness: 80 },
  "8": { distance: 8.1,  sprints: 12, acceleration: 18, rpe: 6.0, wellness: 85 },
};

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,122,0,0.2)", color: "white", borderRadius: 12 },
};

function radarData(id: string) {
  const p = PLAYER_DETAILS.find(pl => pl.id === id)!;
  const e = EXTENDED[id]!;
  return [
    { subject: "Charge",    A: p.charge },
    { subject: "Endurance", A: 100 - p.fatigue },
    { subject: "Vitesse",   A: Math.min(100, e.sprints * 3) },
    { subject: "Récup.",    A: p.recovery },
    { subject: "Wellness",  A: e.wellness },
    { subject: "Distance",  A: Math.min(100, e.distance * 8.5) },
  ];
}

function barData(idA: string, idB: string) {
  const a = PLAYER_DETAILS.find(p => p.id === idA)!;
  const b = PLAYER_DETAILS.find(p => p.id === idB)!;
  const ea = EXTENDED[idA]!;
  const eb = EXTENDED[idB]!;
  return [
    { metric: "Charge",  [a.name.split(" ")[0]]: a.charge,    [b.name.split(" ")[0]]: b.charge    },
    { metric: "Fatigue", [a.name.split(" ")[0]]: a.fatigue,   [b.name.split(" ")[0]]: b.fatigue   },
    { metric: "Récup.",  [a.name.split(" ")[0]]: a.recovery,  [b.name.split(" ")[0]]: b.recovery  },
    { metric: "Wellness",[a.name.split(" ")[0]]: ea.wellness,  [b.name.split(" ")[0]]: eb.wellness  },
    { metric: "Sprints", [a.name.split(" ")[0]]: ea.sprints*3, [b.name.split(" ")[0]]: eb.sprints*3 },
  ];
}

function DiffBadge({ a, b, label }: { a: number; b: number; label: string }) {
  const diff = a - b;
  const better = diff > 0;
  const Icon = diff === 0 ? Minus : better ? TrendingUp : TrendingDown;
  const color = diff === 0 ? "#94A3B8" : better ? "#22C55E" : "#EF4444";
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
      <span style={{ color: "var(--text-muted)" }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="font-bold" style={{ color: "var(--accent)" }}>{a}</span>
        <span style={{ color: "var(--text-muted)" }}>vs</span>
        <span className="font-bold" style={{ color: "#3B82F6" }}>{b}</span>
        <div className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
          style={{ background: `${color}15`, color }}>
          <Icon size={9} />
          <span>{Math.abs(diff)}</span>
        </div>
      </div>
    </div>
  );
}

export function PrepComparaisonPage() {
  const [playerA, setPlayerA] = useState("1");
  const [playerB, setPlayerB] = useState("5");

  const pA = PLAYER_DETAILS.find(p => p.id === playerA)!;
  const pB = PLAYER_DETAILS.find(p => p.id === playerB)!;
  const eA = EXTENDED[playerA]!;
  const eB = EXTENDED[playerB]!;

  const rdA = radarData(playerA);
  const rdB = radarData(playerB);
  const merged = rdA.map((d, i) => ({ ...d, B: rdB[i].A }));

  return (
    <PrepPageTransition>
      {/* Selectors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Joueur A", value: playerA, set: setPlayerA, color: "#FF7A00" },
          { label: "Joueur B", value: playerB, set: setPlayerB, color: "#3B82F6" },
        ].map(({ label, value, set, color }) => {
          const player = PLAYER_DETAILS.find(p => p.id === value)!;
          return (
            <PrepKpiCard key={label} hover={false}>
              <div className="flex items-center gap-3 mb-3">
                <motion.div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-white"
                  style={{ background: `${color}22`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 16px ${color}50`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  {player.name.split(" ").map(n => n[0]).join("")}
                </motion.div>
                <div>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{player.position} · {player.age} ans · {player.weight}</p>
                </div>
              </div>
              <select value={value} onChange={e => set(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(30,35,50,0.97)", borderColor: `${color}40`, color: "var(--text-primary)" }}>
                {PLAYER_DETAILS.filter(p => p.id !== (label === "Joueur A" ? playerB : playerA)).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.position}</option>
                ))}
              </select>
            </PrepKpiCard>
          );
        })}
      </div>

      {/* VS indicator */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-px flex-1" style={{ background: "rgba(255,122,0,0.2)" }} />
        <motion.div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
          style={{ background: "linear-gradient(135deg,var(--accent),#E66000)", color: "white" }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
          VS
        </motion.div>
        <div className="h-px flex-1" style={{ background: "rgba(59,130,246,0.2)" }} />
      </div>

      {/* Radar comparison */}
      <PrepKpiCard hover={false}>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          <GitCompare size={14} className="inline mr-1.5" style={{ color: "var(--accent)" }} />
          Comparaison Radar — {pA.name.split(" ")[0]} vs {pB.name.split(" ")[0]}
        </p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={merged}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Radar name={pA.name.split(" ")[0]} dataKey="A" stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.2} strokeWidth={2} />
              <Radar name={pB.name.split(" ")[0]} dataKey="B" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
              <Legend wrapperStyle={{ color: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </PrepKpiCard>

      {/* Bar comparison */}
      <PrepKpiCard hover={false}>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Métriques côte à côte</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData(playerA, playerB)} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="metric" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey={pA.name.split(" ")[0]} radius={[4,4,0,0]} fill="#FF7A00" fillOpacity={0.85} />
              <Bar dataKey={pB.name.split(" ")[0]} radius={[4,4,0,0]} fill="#3B82F6" fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PrepKpiCard>

      {/* Diff table */}
      <PrepKpiCard hover={false}>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Différences détaillées</p>
        <div className="space-y-2">
          <DiffBadge a={pA.charge}    b={pB.charge}    label="Charge %" />
          <DiffBadge a={pA.fatigue}   b={pB.fatigue}   label="Fatigue %" />
          <DiffBadge a={pA.recovery}  b={pB.recovery}  label="Récupération %" />
          <DiffBadge a={eA.sprints}   b={eB.sprints}   label="Sprints" />
          <DiffBadge a={eA.wellness}  b={eB.wellness}  label="Wellness" />
          <DiffBadge a={Math.round(eA.distance*10)} b={Math.round(eB.distance*10)} label="Distance (x10 km)" />
        </div>
      </PrepKpiCard>
    </PrepPageTransition>
  );
}
