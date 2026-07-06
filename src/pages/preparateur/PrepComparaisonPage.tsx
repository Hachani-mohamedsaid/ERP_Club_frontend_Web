import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { clubApi } from "../../lib/api/club";

interface CompPlayer {
  id: string;
  name: string;
  position: string;
  age: number;
  weight: string;
  charge: number;
  fatigue: number;
  recovery: number;
  wellness: number;
  distance: number;
  sprints: number;
}

const TOOLTIP_STYLE = {
  contentStyle: { background: "var(--surface-modal)", border: "1px solid rgba(255,122,0,0.2)", color: "white", borderRadius: 12 },
};

function radarData(p: CompPlayer) {
  return [
    { subject: "Charge",    A: p.charge },
    { subject: "Endurance", A: Math.max(0, 100 - p.fatigue) },
    { subject: "Vitesse",   A: Math.min(100, p.sprints * 3) },
    { subject: "Récup.",    A: p.recovery },
    { subject: "Wellness",  A: p.wellness },
    { subject: "Distance",  A: Math.min(100, p.distance * 8.5) },
  ];
}

function barData(a: CompPlayer, b: CompPlayer) {
  const na = a.name.split(" ")[0];
  const nb = b.name.split(" ")[0];
  return [
    { metric: "Charge",   [na]: a.charge,              [nb]: b.charge              },
    { metric: "Fatigue",  [na]: a.fatigue,             [nb]: b.fatigue             },
    { metric: "Récup.",   [na]: a.recovery,            [nb]: b.recovery            },
    { metric: "Wellness", [na]: a.wellness,            [nb]: b.wellness            },
    { metric: "Sprints",  [na]: a.sprints * 3,         [nb]: b.sprints * 3         },
  ];
}

function DiffBadge({ a, b, label }: { a: number; b: number; label: string }) {
  const diff = a - b;
  const Icon = diff === 0 ? Minus : diff > 0 ? TrendingUp : TrendingDown;
  const color = diff === 0 ? "#94A3B8" : diff > 0 ? "#22C55E" : "#EF4444";
  return (
    <div className="flex items-center justify-between rounded-xl border px-3 py-2 text-xs"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
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

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2].map(i => <div key={i} className="h-28 animate-pulse rounded-[20px]" style={{ background: "rgba(255,255,255,0.04)" }} />)}
      </div>
      <div className="h-80 animate-pulse rounded-[20px]" style={{ background: "rgba(255,255,255,0.04)" }} />
    </div>
  );
}

export function PrepComparaisonPage() {
  const [players, setPlayers] = useState<CompPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [idA, setIdA]         = useState("");
  const [idB, setIdB]         = useState("");

  const fetchPlayers = useCallback(() => {
    setLoading(true);
    (clubApi.getComparisonPlayers() as Promise<CompPlayer[]>)
      .then(data => {
        setPlayers(data);
        if (data.length >= 1) setIdA(data[0].id);
        if (data.length >= 2) setIdB(data[1].id);
      })
      .catch(() => setError("Erreur de chargement des joueurs"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPlayers(); }, [fetchPlayers]);

  const pA = players.find(p => p.id === idA);
  const pB = players.find(p => p.id === idB);

  const merged = pA && pB
    ? radarData(pA).map((d, i) => ({ ...d, B: radarData(pB)[i].A }))
    : [];

  if (loading) return <PrepPageTransition><PageSkeleton /></PrepPageTransition>;

  if (error || players.length < 2) {
    return (
      <PrepPageTransition>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <GitCompare size={32} style={{ color: "var(--text-muted)" }} className="mb-3" />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {error ?? "Il faut au moins 2 joueurs en base pour comparer."}
          </p>
        </div>
      </PrepPageTransition>
    );
  }

  return (
    <PrepPageTransition>
      {/* Selectors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {([
          { label: "Joueur A", id: idA, setId: setIdA, exclude: idB, color: "#FF7A00" },
          { label: "Joueur B", id: idB, setId: setIdB, exclude: idA, color: "#3B82F6" },
        ] as const).map(({ label, id, setId, exclude, color }) => {
          const player = players.find(p => p.id === id);
          if (!player) return null;
          return (
            <PrepKpiCard key={label} hover={false}>
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-black text-white"
                  style={{ background: `${color}22`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 16px ${color}50`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  {player.name.split(" ").map((n: string) => n[0]).join("")}
                </motion.div>
                <div>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {player.position} · {player.age} ans · {player.weight}
                  </p>
                </div>
              </div>
              <select value={id} onChange={e => setId(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(30,35,50,0.97)", borderColor: `${color}40`, color: "var(--text-primary)" }}>
                {players.filter(p => p.id !== exclude).map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.position}</option>
                ))}
              </select>
            </PrepKpiCard>
          );
        })}
      </div>

      {/* VS */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-px flex-1" style={{ background: "rgba(255,122,0,0.2)" }} />
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black"
          style={{ background: "linear-gradient(135deg,var(--accent),#E66000)", color: "white" }}
          animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>
          VS
        </motion.div>
        <div className="h-px flex-1" style={{ background: "rgba(59,130,246,0.2)" }} />
      </div>

      {pA && pB && (
        <>
          {/* Radar */}
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

          {/* Bar chart */}
          <PrepKpiCard hover={false}>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Métriques côte à côte</p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData(pA, pB)} barCategoryGap="35%">
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
              <DiffBadge a={pA.charge}   b={pB.charge}   label="Charge %" />
              <DiffBadge a={pA.fatigue}  b={pB.fatigue}  label="Fatigue %" />
              <DiffBadge a={pA.recovery} b={pB.recovery} label="Récupération %" />
              <DiffBadge a={pA.sprints}  b={pB.sprints}  label="Sprints" />
              <DiffBadge a={pA.wellness} b={pB.wellness} label="Wellness" />
              <DiffBadge a={pA.distance} b={pB.distance} label="Distance (km)" />
            </div>
          </PrepKpiCard>
        </>
      )}
    </PrepPageTransition>
  );
}
