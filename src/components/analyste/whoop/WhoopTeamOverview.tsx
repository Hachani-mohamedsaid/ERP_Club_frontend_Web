import { motion } from "framer-motion";
import { CountUpStat } from "../../player/CountUpStat";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";
import { recoveryColor } from "./whoopTheme";

interface Props {
  squad: WhoopPlayerMetrics[];
  compareIds?: string[];
}

function Ring({ pct, color, label, sub }: { pct: number; color: string; label: string; sub: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <motion.circle
          cx={44}
          cy={44}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (circ * pct) / 100 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </svg>
      <p className="mt-1 text-lg font-bold tabular-nums text-white">
        <CountUpStat end={pct} suffix={sub.includes("h") ? "h" : sub} decimals={sub.includes("h") ? 1 : 0} />
      </p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function StatBlock({ value, label, color }: { value: string | number; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-xl font-bold tabular-nums text-white" style={{ color }}>{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

export function WhoopTeamOverview({ squad, compareIds }: Props) {
  const avgRecovery = Math.round(squad.reduce((s, p) => s + p.recovery, 0) / squad.length);
  const avgSleep = +(squad.reduce((s, p) => s + p.sleepHours, 0) / squad.length).toFixed(1);
  const highRisk = squad.filter((p) => p.injuryRisk === "High" || p.recovery < 50).length;
  const needRecovery = squad.filter((p) => p.recovery < 67).length;
  const ready = squad.filter((p) => p.fitToPlay).length;

  const compare = compareIds
    ? squad.filter((p) => compareIds.includes(p.id))
    : squad.slice(0, 3);

  return (
    <motion.section
      className="rounded-2xl border border-white/8 p-5 backdrop-blur-xl"
      style={{ background: "rgba(17,24,39,0.55)" }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Team Overview</p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Ring pct={avgRecovery} color="#34d399" label="Recovery moy." sub="%" />
        <div className="flex flex-col items-center">
          <p className="text-xl font-bold tabular-nums text-indigo-300">{avgSleep}h</p>
          <p className="text-[10px] text-slate-500">Sommeil moy.</p>
        </div>
        <StatBlock value={highRisk} label="High Risk" color="#ef4444" />
        <StatBlock value={needRecovery} label="Need Recovery" color="#fbbf24" />
        <StatBlock value={ready} label="Ready to Play" color="#34d399" />
      </div>

      <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Comparer joueurs</p>
      <div className="mt-3 space-y-3">
        {compare.map((p, i) => (
          <motion.div
            key={p.id}
            className="rounded-xl border border-white/6 bg-black/20 p-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <img src={p.photo} alt="" className="h-7 w-7 rounded-lg object-cover" />
              <span className="text-sm font-semibold text-white">{p.name}</span>
            </div>
            {[
              { l: "Recovery", v: p.recovery, max: 100, c: recoveryColor(p.recovery) },
              { l: "Sleep", v: p.sleepHours * 10, max: 100, c: "#818cf8" },
              { l: "HRV", v: p.hrv, max: 80, c: "#34d399" },
              { l: "Calories", v: p.calories / 30, max: 100, c: "#f97316" },
            ].map((m) => (
              <div key={m.l} className="mb-1.5 flex items-center gap-2">
                <span className="w-16 text-[9px] text-slate-500">{m.l}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/6">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: m.c }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (m.v / m.max) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
