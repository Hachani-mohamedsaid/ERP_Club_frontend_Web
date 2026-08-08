import { motion } from "framer-motion";
import { CountUpStat } from "../../player/CountUpStat";
import { Wifi, Battery, Circle, Activity, Footprints, Flame } from "lucide-react";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";
import { recoveryColor, energyColor } from "./whoopTheme";
import { ViivR3FWatch } from "./ViivR3FWatch";

interface WhoopHeroProps {
  player: WhoopPlayerMetrics;
}

export function WhoopHero({ player }: WhoopHeroProps) {
  const rc = recoveryColor(player.recovery);
  const ec = energyColor(player.viivEnergy);

  return (
    <motion.section
      className="relative overflow-hidden p-4 lg:p-6"
      style={{
        borderRadius: 22,
        border: "1px solid rgba(34,211,238,0.18)",
        background: "linear-gradient(145deg, rgba(28,28,46,0.85) 0%, rgba(11,11,20,0.95) 100%)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(34,211,238,0.08)",
        backdropFilter: "blur(18px)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
        {/* Left — athlete + recovery */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img src={player.photo} alt="" className="h-14 w-14 rounded-2xl border-2 object-cover" style={{ borderColor: rc }} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{player.name}</h2>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                  <Circle size={6} className="fill-emerald-400 text-emerald-400" /> LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">{player.club} · {player.position} · #{player.number}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-black/30 p-4 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recovery Viiv</p>
            <p className="text-5xl font-light tabular-nums" style={{ color: rc }}>
              <CountUpStat end={player.recovery} suffix="%" />
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ background: rc, boxShadow: `0 0 12px ${rc}` }}
                initial={{ width: 0 }}
                animate={{ width: `${player.recovery}%` }}
                transition={{ duration: 1.3, ease: "easeOut" }}
              />
            </div>
            {player.recoveryDelta !== undefined && (
              <p className={`mt-2 text-xs font-medium ${player.recoveryDelta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {player.recoveryDelta >= 0 ? "+" : ""}{player.recoveryDelta}% vs hier
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400/80">Énergie Viiv</p>
              <Activity size={12} className="text-orange-400/60" />
            </div>
            <p className="text-3xl font-black tabular-nums" style={{ color: ec }}>
              <CountUpStat end={player.viivEnergy} suffix="%" />
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
                initial={{ width: 0 }}
                animate={{ width: `${player.viivEnergy}%` }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Strain", v: player.strain.toFixed(1), c: "#f97316" },
              { l: "HRV", v: `${player.hrv} ms`, c: "#34d399" },
              { l: "VO₂", v: `${player.vo2Max}`, c: "#22d3ee" },
            ].map(({ l, v, c }) => (
              <div key={l} className="rounded-xl border border-white/6 bg-white/4 py-2">
                <p className="text-[9px] uppercase text-slate-500">{l}</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: c }}>{v}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            {player.connected ? (
              <span className="flex items-center gap-1 text-emerald-400"><Wifi size={11} /> Viiv connectée</span>
            ) : (
              <span className="text-red-400">Déconnectée</span>
            )}
            <span className="flex items-center gap-1"><Battery size={11} /> {player.battery}%</span>
            <span>Sync {player.lastSyncAt}</span>
          </div>
        </div>

        {/* Center — 3D Viiv Smartwatch */}
        <div className="relative">
          <ViivR3FWatch recovery={player.recovery} energy={player.viivEnergy} />
        </div>

        {/* Right — biometrics strip */}
        <div className="space-y-2">
          {[
            { label: "RHR", value: `${player.restingHr} bpm`, icon: null },
            { label: "Respiration", value: `${player.respiratoryRate}/min`, icon: null },
            { label: "Temp. peau", value: `${player.skinTemp}°C`, icon: null },
            { label: "SpO₂", value: `${player.spo2}%`, icon: null },
            { label: "Stress", value: String(player.stress), icon: null },
            { label: "Sommeil", value: `${player.sleepHours}h · ${player.sleepPerformance}%`, icon: null },
            { label: "Pas", value: player.steps.toLocaleString("fr-FR"), icon: Footprints },
            { label: "Calories", value: `${player.calories} kcal`, icon: Flame },
            { label: "Readiness", value: player.readiness, icon: null },
            { label: "GPS activité", value: player.gpsActivity, icon: null },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-white/6 bg-white/4 px-3 py-2 backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + i * 0.04 }}
            >
              <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                {item.icon && <item.icon size={10} className="text-cyan-400/60" />}
                {item.label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-white">{item.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
