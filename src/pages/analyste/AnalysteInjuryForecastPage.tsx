import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Activity, Clock, TrendingDown, CheckCircle2, AlertTriangle, Brain } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalysteInjuryForecast } from "../../hooks/useAnalysteResource";
import type { InjuryForecastEntry } from "../../data/analysteExtendedData";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

function ProgressRing({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={4} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeLinecap="round"
        style={{ transformOrigin: "center", rotate: "-90deg" }}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.1, ease: "easeOut" }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={color} fontSize={11} fontWeight="900">
        {pct}%
      </text>
    </svg>
  );
}

const ACard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{ background: "rgba(5,8,22,0.7)", borderColor: "rgba(255,255,255,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function AnalysteInjuryForecastPage() {
  const { data, loading } = useAnalysteInjuryForecast();
  const [selected, setSelected] = useState<InjuryForecastEntry | null>(null);

  useEffect(() => {
    if (data?.forecasts[0]) setSelected(data.forecasts[0]);
  }, [data]);

  if (loading && !data) return <AnalystePageLoader />;

  const { forecasts: FORECASTS, summary } = data!;
  const active = selected ?? FORECASTS[0];

  const progDone = active.recoverySteps.filter(s => s.done).length;
  const progTotal = active.recoverySteps.length;
  const progPct = Math.round((progDone / progTotal) * 100);

  return (
    <AnalystePageTransition>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Joueurs blessés",         value: String(summary.injuredCount),      color: "#EF4444", icon: Activity     },
          { label: "Retour le plus rapide",   value: `${summary.fastestReturnDays} jours`, color: "#22C55E", icon: Clock },
          { label: "Confiance moyenne",       value: `${summary.avgConfidence}%`, color: "#8B5CF6", icon: Brain },
          { label: "Risque rechute moyen",    value: `${summary.avgRelapseRisk}%`, color: "#FF7A00", icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="rounded-[16px] border p-4" style={{ background: "rgba(5,8,22,0.7)", borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <motion.div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${color}18`, color }}
                  animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 12px ${color}40`, `0 0 0px ${color}00`] }}
                  transition={{ duration: 2.2, repeat: Infinity }}>
                  <Icon size={14} />
                </motion.div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.6fr]">
        {/* Player list */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Joueurs en rééducation</h3>
          {FORECASTS.map((f, i) => {
            const isActive = active.id === f.id;
            const doneSteps = f.recoverySteps.filter(s => s.done).length;
            const prog = Math.round((doneSteps / f.recoverySteps.length) * 100);
            return (
              <motion.button key={f.id} type="button" onClick={() => setSelected(f)}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="w-full rounded-[18px] border p-4 text-left"
                style={{
                  background: isActive ? "rgba(239,68,68,0.06)" : "rgba(5,8,22,0.7)",
                  borderColor: isActive ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)",
                }}>
                <div className="flex items-center gap-3">
                  <ProgressRing pct={prog} color={prog >= 70 ? "#22C55E" : "#FF7A00"} size={52} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{f.name}</p>
                    <p className="text-[11px] mb-1" style={{ color: "var(--text-muted)" }}>{f.position} · {f.injury}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span style={{ color: "#22C55E" }}>
                        <Clock size={9} className="inline mr-0.5" />Retour J+{f.returnDays}
                      </span>
                      <span style={{ color: "#8B5CF6" }}>Confiance {f.confidence}%</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Detail */}
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Hero */}
            <ACard>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white"
                  style={{ background: "rgba(239,68,68,0.18)", color: "#EF4444" }}>
                  {active.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>{active.name}</h3>
                  <p className="text-xs" style={{ color: "#EF4444" }}>{active.injury}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>Blessure depuis: {active.startDate}</p>
                </div>
                <div className="shrink-0 text-center">
                  <motion.p className="text-3xl font-black" style={{ color: "#22C55E" }}
                    animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    {active.returnDays}j
                  </motion.p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Retour estimé</p>
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: "#8B5CF6" }}>Confiance {active.confidence}%</p>
                </div>
              </div>

              {/* Recovery timeline chart */}
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Courbe de récupération (fitness %)</p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={active.recoveryTimeline}>
                    <defs>
                      <linearGradient id="recovGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Fitness"]} />
                    <Area type="monotone" dataKey="fitness" stroke="#22C55E" strokeWidth={2.5} fill="url(#recovGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ACard>

            {/* Recovery steps */}
            <ACard>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Protocole de rééducation</p>
                <span className="text-xs font-bold" style={{ color: "#8B5CF6" }}>{progPct}% complété</span>
              </div>
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#22C55E,#3B82F6)" }}
                  initial={{ width: 0 }} animate={{ width: `${progPct}%` }} transition={{ duration: 1 }} />
              </div>
              <div className="space-y-2">
                {active.recoverySteps.map((step, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-3 rounded-xl border p-2.5"
                    style={{
                      background: step.done ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.02)",
                      borderColor: step.done ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)",
                    }}>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: step.done ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.06)" }}>
                      {step.done
                        ? <CheckCircle2 size={13} style={{ color: "#22C55E" }} />
                        : <Clock size={13} style={{ color: "var(--text-muted)" }} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs" style={{ color: step.done ? "var(--text-secondary)" : "var(--text-primary)" }}>{step.label}</p>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>J+{step.day}</span>
                  </motion.div>
                ))}
              </div>
            </ACard>

            {/* Post-return risk */}
            <ACard>
              <p className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                <AlertTriangle size={12} className="inline mr-1.5" style={{ color: "#FF7A00" }} />
                Risque rechute post-retour
              </p>
              <div className="flex items-center gap-4">
                <motion.div className="flex h-14 w-14 items-center justify-center rounded-full border-4 text-lg font-black shrink-0"
                  style={{
                    borderColor: active.riskAfterReturn >= 40 ? "#FF7A00" : "#22C55E",
                    color: "var(--text-primary)",
                  }}>
                  {active.riskAfterReturn}%
                </motion.div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  <p className="mb-1">Charge actuelle: <strong style={{ color: "#FF7A00" }}>{active.load}%</strong></p>
                  <p>Fatigue: <strong style={{ color: "#EF4444" }}>{active.fatigue}%</strong></p>
                  <p className="mt-1" style={{ color: active.riskAfterReturn >= 40 ? "#FF7A00" : "#22C55E" }}>
                    {active.riskAfterReturn >= 40
                      ? "⚠ Réduction charge recommandée au retour"
                      : "✓ Retour sans restriction envisageable"}
                  </p>
                </div>
              </div>
            </ACard>
          </motion.div>
        </AnimatePresence>
      </div>
    </AnalystePageTransition>
  );
}
