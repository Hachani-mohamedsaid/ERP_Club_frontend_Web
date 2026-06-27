import { motion } from "framer-motion";
import { CountUpStat } from "../../player/CountUpStat";
import { Wifi, Battery, Circle } from "lucide-react";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";
import { recoveryColor } from "./whoopTheme";
import { WhoopR3FBand } from "./WhoopR3FBand";

interface WhoopHeroProps {
  player: WhoopPlayerMetrics;
}

export function WhoopHero({ player }: WhoopHeroProps) {
  const rc = recoveryColor(player.recovery);

  return (
    <motion.section
      className="relative overflow-hidden rounded-3xl border border-white/8 p-4 lg:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(17,24,39,0.75) 0%, rgba(7,11,20,0.9) 100%)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
        {/* Left — athlete focus */}
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recovery</p>
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

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Strain", v: player.strain.toFixed(1), c: "#f97316" },
              { l: "HRV", v: `${player.hrv} ms`, c: "#34d399" },
              { l: "Sleep", v: `${player.sleepHours}h`, c: "#818cf8" },
            ].map(({ l, v, c }) => (
              <div key={l} className="rounded-xl border border-white/6 bg-white/4 py-2">
                <p className="text-[9px] uppercase text-slate-500">{l}</p>
                <p className="text-sm font-bold tabular-nums" style={{ color: c }}>{v}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            {player.connected ? (
              <span className="flex items-center gap-1 text-emerald-400"><Wifi size={11} /> Connected</span>
            ) : (
              <span className="text-red-400">Disconnected</span>
            )}
            <span className="flex items-center gap-1"><Battery size={11} /> {player.battery}%</span>
            <span>Sync {player.lastSyncAt}</span>
          </div>
        </div>

        {/* Center — 3D WHOOP */}
        <div className="relative">
          <WhoopR3FBand recovery={player.recovery} strain={player.strain} />
        </div>

        {/* Right — telemetry strip */}
        <div className="space-y-3">
          {[
            { label: "RHR", value: `${player.restingHr} bpm` },
            { label: "Respiration", value: `${player.respiratoryRate}/min` },
            { label: "Temp. peau", value: `${player.skinTemp}°C` },
            { label: "SpO₂", value: `${player.spo2}%` },
            { label: "Stress", value: String(player.stress) },
            { label: "Readiness", value: player.readiness },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-white/6 bg-white/4 px-3 py-2 backdrop-blur-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{item.label}</span>
              <span className="text-sm font-semibold tabular-nums text-white">{item.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
