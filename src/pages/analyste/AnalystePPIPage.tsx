import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from "recharts";
import { Star, TrendingUp, TrendingDown, Minus, Zap, Brain } from "lucide-react";

import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalystePPI } from "../../hooks/useAnalysteResource";
import type { PPIPlayer } from "../../data/analysteExtendedData";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

const FORM_CONFIG = {
  rising:  { icon: TrendingUp,   color: "#22C55E", label: "En hausse" },
  falling: { icon: TrendingDown, color: "#EF4444", label: "En baisse" },
  stable:  { icon: Minus,        color: "#F59E0B", label: "Stable"    },
};

function PPIRing({ ppi, size = 72 }: { ppi: number; size?: number }) {
  const color = ppi >= 85 ? "#22C55E" : ppi >= 75 ? "#FF7A00" : "#3B82F6";
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (ppi / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={circ} strokeLinecap="round"
        style={{ transformOrigin: "center", rotate: "-90deg" }}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: "easeOut" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={color} fontSize={size === 72 ? 16 : 12} fontWeight="900">
        {ppi}
      </text>
    </svg>
  );
}

const ACard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{
      background: "rgba(5,8,22,0.7)",
      borderColor: glow ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 30px rgba(139,92,246,0.1)" : "0 8px 24px rgba(0,0,0,0.2)",
    }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

const TREND_LABELS = ["S-5","S-4","S-3","S-2","S-1","Actuel"];

export function AnalystePPIPage() {
  const { data, loading } = useAnalystePPI();
  const [selected, setSelected] = useState<PPIPlayer | null>(null);
  const [sortBy, setSortBy] = useState<"ppi" | "age" | "fatigue">("ppi");

  useEffect(() => {
    if (data?.players[0]) setSelected(data.players[0]);
  }, [data]);

  if (loading && !data) return <AnalystePageLoader />;

  const players = data!.players;
  const active = selected ?? players[0];

  const sorted = [...players].sort((a, b) =>
    sortBy === "ppi" ? b.ppi - a.ppi : sortBy === "age" ? a.age - b.age : b.fatigue - a.fatigue
  );

  const radarData = [
    { subject: "Vitesse",    A: active.speed     },
    { subject: "Pressing",   A: active.pressing  },
    { subject: "xG",         A: active.xg        },
    { subject: "Dribbling",  A: active.dribbling },
    { subject: "Défense",    A: active.defending },
    { subject: "Vision",     A: active.vision    },
    { subject: "Leadership", A: active.leadership},
    { subject: "Stamina",    A: active.stamina   },
  ];

  const trendData = TREND_LABELS.map((l, i) => ({ week: l, PPI: active.trend[i] ?? active.ppi }));

  const FormIcon = FORM_CONFIG[active.form].icon;

  return (
    <AnalystePageTransition>
      {/* Ranking list */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.6fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              <Star size={13} className="inline mr-1.5" style={{ color: "#F59E0B" }} />
              Player Performance Index
            </h3>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border px-3 py-1.5 text-xs outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
              <option value="ppi">Trier par PPI</option>
              <option value="age">Trier par âge</option>
              <option value="fatigue">Trier par fatigue</option>
            </select>
          </div>

          {sorted.map((p, i) => {
            const FormIcon2 = FORM_CONFIG[p.form].icon;
            const isActive = active.id === p.id;
            return (
              <motion.button key={p.id} type="button" onClick={() => setSelected(p)}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="w-full rounded-[16px] border p-3 text-left"
                style={{
                  background: isActive ? "rgba(139,92,246,0.1)" : "rgba(5,8,22,0.7)",
                  borderColor: isActive ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)",
                  boxShadow: isActive ? "0 0 20px rgba(139,92,246,0.12)" : "none",
                }}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold w-5 shrink-0 text-center" style={{ color: "var(--text-muted)" }}>{i + 1}</span>
                  <PPIRing ppi={p.ppi} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.position} · {p.age} ans</p>
                  </div>
                  <FormIcon2 size={14} style={{ color: FORM_CONFIG[p.form].color }} />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Hero */}
            <ACard glow>
              <div className="flex items-center gap-4">
                <PPIRing ppi={active.ppi} size={72} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{active.name}</h2>
                    <div className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: `${FORM_CONFIG[active.form].color}18`, color: FORM_CONFIG[active.form].color }}>
                      <FormIcon size={9} /> {FORM_CONFIG[active.form].label}
                    </div>
                  </div>
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{active.position} · {active.age} ans</p>
                  <div className="flex flex-wrap gap-2">
                    {active.strengths.map(s => (
                      <span key={s} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>+ {s}</span>
                    ))}
                    {active.weaknesses.map(w => (
                      <span key={w} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>- {w}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-3xl font-black" style={{ color: active.ppi >= 85 ? "#22C55E" : "#FF7A00" }}>{active.ppi}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>PPI Score</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                    background: active.ppi >= 85 ? "rgba(34,197,94,0.12)" : "rgba(255,122,0,0.12)",
                    color: active.ppi >= 85 ? "#22C55E" : "#FF7A00"
                  }}>
                    {active.ppi >= 88 ? "Elite" : active.ppi >= 80 ? "Top" : active.ppi >= 70 ? "Bon" : "Moyen"}
                  </span>
                </div>
              </div>
            </ACard>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Radar */}
              <ACard>
                <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profil FIFA</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                      <Radar name="PPI" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.22} strokeWidth={2} />
                      <Tooltip {...TOOLTIP_STYLE} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </ACard>

              {/* Trend */}
              <ACard>
                <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Évolution PPI (6 semaines)</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="week" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Line type="monotone" dataKey="PPI" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4, fill: "#8B5CF6" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </ACard>
            </div>

            {/* Attributes bar chart */}
            <ACard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Attributs détaillés</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={radarData} layout="vertical" barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} width={65} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="A" name="Score" radius={[0,6,6,0]} fill="#8B5CF6" fillOpacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ACard>

            {/* Comparison global */}
            <ACard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Classement équipe PPI</p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sorted.map(p => ({ name: p.name.split(" ")[0], ppi: p.ppi }))} barCategoryGap="35%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [v, "PPI"]} />
                    <Bar dataKey="ppi" radius={[4,4,0,0]} fill="#8B5CF6"
                      label={{ position: "top", fill: "var(--text-muted)", fontSize: 9 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ACard>
          </motion.div>
        </AnimatePresence>
      </div>
    </AnalystePageTransition>
  );
}
