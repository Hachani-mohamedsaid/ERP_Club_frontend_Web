import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Line,
} from "recharts";
import { ArrowLeft, Battery, Wifi, WifiOff, Shield } from "lucide-react";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";
import { readinessColor, strainColor } from "../../../data/whoopData";
import { recoveryColor } from "./whoopTheme";
import { WhoopGlassMetric } from "./WhoopGlassMetric";
import { WhoopAICoach } from "./WhoopAICoach";
import { WhoopTimeline } from "./WhoopTimeline";

const TABS = ["Overview", "Recovery", "Sleep", "Strain", "Heart", "AI Coach"] as const;
type Tab = (typeof TABS)[number];

const TOOLTIP = {
  contentStyle: { background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 },
};

function InjuryGauge({ risk }: { risk: WhoopPlayerMetrics["injuryRisk"] }) {
  const colors = { Low: "#34d399", Medium: "#fbbf24", High: "#ef4444" };
  const pct = risk === "Low" ? 25 : risk === "Medium" ? 60 : 90;
  const c = colors[risk];
  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={56} viewBox="0 0 100 56">
        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
        <motion.path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke={c}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={126}
          initial={{ strokeDashoffset: 126 }}
          animate={{ strokeDashoffset: 126 - (126 * pct) / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <p className="text-sm font-bold" style={{ color: c }}>{risk === "Low" ? "🟢" : risk === "Medium" ? "🟡" : "🔴"} {risk}</p>
    </div>
  );
}

interface Props {
  player: WhoopPlayerMetrics;
  onBack: () => void;
}

export function WhoopPlayerProfile({ player, onBack }: Props) {
  const [tab, setTab] = useState<Tab>("Overview");
  const rc = recoveryColor(player.recovery);

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
    >
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} /> Retour au hub
      </button>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <motion.div
          className="p-5 backdrop-blur-xl"
          style={{
            borderRadius: 22,
            background: "linear-gradient(145deg, rgba(28,28,46,0.72), rgba(22,22,42,0.92))",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={player.photo} alt="" className="mx-auto h-28 w-28 rounded-2xl border-2 object-cover" style={{ borderColor: rc }} />
          <h2 className="mt-4 text-center text-xl font-bold text-white">{player.name}</h2>
          <p className="text-center text-xs text-slate-400">{player.position} · #{player.number} · {player.club}</p>
          <div className="mt-4 space-y-2 text-xs text-slate-300">
            {[
              ["Âge", `${player.age} ans`],
              ["Taille", player.height],
              ["Poids", player.weight],
              ["Groupe sanguin", player.bloodGroup],
              ["Pied dominant", player.dominantFoot],
              ["Blessures", player.injuryHistory],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-white/6 bg-black/30 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Viiv Smartwatch</p>
            <p className="mt-1 text-xs text-white">{player.deviceId}</p>
            <p className="mt-0.5 text-[9px] text-cyan-400/70">Modèle Viiv Pro · ECG · SpO₂ · GPS</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><Battery size={10} /> {player.battery}%</span>
              <span>FW {player.firmware}</span>
              {player.connected ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-red-400" />}
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <InjuryGauge risk={player.injuryRisk} />
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 rounded-xl border border-white/8 bg-black/30 p-1">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  tab === t ? "bg-cyan-500/20 text-cyan-300" : "text-slate-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "Overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <WhoopGlassMetric label="Recovery" value={player.recovery} suffix="%" delta={`${player.recoveryDelta >= 0 ? "+" : ""}${player.recoveryDelta}%`} progress={player.recovery} delay={0} />
                    <WhoopGlassMetric label="Strain" value={player.strain} color={strainColor(player.strain)} delay={0.05} />
                    <WhoopGlassMetric label="Sleep" value={player.sleepHours} suffix="h" progress={player.sleepPerformance} color="#818cf8" delay={0.1} />
                    <WhoopGlassMetric label="HRV" value={player.hrv} suffix=" ms" delay={0.15} />
                    <WhoopGlassMetric label="RHR" value={player.restingHr} suffix=" bpm" color="#ef4444" delay={0.2} />
                    <WhoopGlassMetric label="SpO₂" value={player.spo2} suffix="%" delay={0.25} />
                    <WhoopGlassMetric label="Stress" value={player.stress} delay={0.3} />
                    <WhoopGlassMetric label="Calories" value={player.calories} delay={0.35} />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-2xl border border-white/8 bg-[rgba(28,28,46,0.55)] p-4">
                      <h3 className="text-xs font-semibold text-white">Strain & Recovery · 7j</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <ComposedChart data={player.weeklyStrain}>
                          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip {...TOOLTIP} />
                          <Bar dataKey="strain" fill="#f97316" radius={[3, 3, 0, 0]} barSize={18} />
                          <Line type="monotone" dataKey="recovery" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="rounded-2xl border border-white/8 bg-[rgba(28,28,46,0.55)] p-4">
                      <h3 className="text-xs font-semibold text-white">Timeline</h3>
                      <div className="mt-3">
                        <WhoopTimeline events={player.timeline} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "Recovery" && (
                <div className="rounded-2xl border border-white/8 bg-[rgba(28,28,46,0.55)] p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={player.weeklyStrain}>
                      <defs>
                        <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP} />
                      <Area type="monotone" dataKey="recovery" stroke="#34d399" fill="url(#recGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {tab === "Sleep" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { l: "Éveil", h: player.sleepStages.awake, c: "#64748B" },
                      { l: "Léger", h: player.sleepStages.light, c: "#6366F1" },
                      { l: "Profond", h: player.sleepStages.sws, c: "#3B82F6" },
                      { l: "REM", h: player.sleepStages.rem, c: "#8B5CF6" },
                    ].map((s) => (
                      <div key={s.l} className="rounded-xl border border-white/6 p-3 text-center">
                        <p className="text-[10px] text-slate-500">{s.l}</p>
                        <p className="text-lg font-bold tabular-nums" style={{ color: s.c }}>{s.h}h</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300">Performance sommeil : {player.sleepPerformance}% · Besoin {player.sleepNeed}h</p>
                </div>
              )}

              {tab === "Strain" && (
                <div className="rounded-2xl border border-white/8 bg-[rgba(28,28,46,0.55)] p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={player.weeklyStrain}>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP} />
                      <Bar dataKey="strain" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <p className="mt-2 text-xs text-slate-400">Objectif strain : {player.strainTarget}</p>
                </div>
              )}

              {tab === "Heart" && (
                <div className="rounded-2xl border border-white/8 bg-[rgba(28,28,46,0.55)] p-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={player.hourlyHr}>
                      <defs>
                        <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="hour" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP} />
                      <Area type="monotone" dataKey="bpm" stroke="#ef4444" fill="url(#hrGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              {tab === "AI Coach" && <WhoopAICoach player={player} />}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-4 py-3">
            <Shield size={16} className="text-emerald-400" />
            <div>
              <p className="text-xs font-semibold text-white">Fit to Play</p>
              <p className="text-[10px] text-slate-400">{player.fitToPlay ? "Disponible" : "Restriction recommandée"} · Fitness {player.fitnessScore}/100</p>
            </div>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: `${readinessColor(player.readiness)}20`, color: readinessColor(player.readiness) }}
            >
              {player.readiness}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
