import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle, Cloud, Target, Calendar } from "lucide-react";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";

function AlertIcon({ type }: { type: "ok" | "warn" | "error" }) {
  if (type === "ok") return <CheckCircle2 size={12} className="text-emerald-400" />;
  if (type === "warn") return <AlertTriangle size={12} className="text-amber-400" />;
  return <XCircle size={12} className="text-red-400" />;
}

export function WhoopRightRail({ player }: { player: WhoopPlayerMetrics }) {
  return (
    <div className="space-y-4">
      <motion.div
        className="rounded-2xl border border-white/8 bg-slate-900/50 p-4 backdrop-blur-xl"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Alertes récentes</p>
        <div className="mt-3 space-y-2">
          {player.alerts.map((a, i) => (
            <motion.div
              key={a.id}
              className="flex items-start gap-2 rounded-lg bg-white/4 px-2 py-1.5"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <AlertIcon type={a.type} />
              <div>
                <p className="text-[11px] text-slate-200">{a.message}</p>
                <p className="text-[9px] text-slate-500">{a.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="rounded-2xl border border-white/8 bg-slate-900/50 p-4 backdrop-blur-xl" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
          <Target size={12} /> Objectifs du jour
        </p>
        <ul className="mt-2 space-y-1">
          {player.todayGoals.map((g) => (
            <li key={g} className="text-xs text-slate-300">✓ {g}</li>
          ))}
        </ul>
      </motion.div>

      <motion.div className="rounded-2xl border border-white/8 bg-slate-900/50 p-4 backdrop-blur-xl" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <Calendar size={12} /> Prochain match
        </p>
        <p className="mt-2 text-sm font-semibold text-white">{player.upcomingMatch}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Cloud size={11} /> {player.weather}</p>
      </motion.div>

      <motion.div className="rounded-2xl border border-white/8 bg-slate-900/50 p-4 backdrop-blur-xl" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Notes coach</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">{player.coachNotes}</p>
      </motion.div>
    </div>
  );
}
