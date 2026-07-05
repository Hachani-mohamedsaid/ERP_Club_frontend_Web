import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";

export function WhoopAICoach({ player }: { player: WhoopPlayerMetrics }) {
  return (
    <motion.div
      className="rounded-2xl border border-violet-500/25 p-5 backdrop-blur-xl"
      style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(17,24,39,0.6) 100%)" }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-violet-400" />
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Odin AI Coach · Viiv</p>
        <span className="ml-auto rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-bold text-violet-300">
          {player.aiConfidence}% confiance
        </span>
      </div>
      <motion.p
        className="mt-3 text-sm leading-relaxed text-slate-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {player.name} — {player.sleepHours < player.sleepNeed ? `seulement ${player.sleepHours}h de sommeil.` : "profil recovery solide."}
      </motion.p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Recommandations</p>
      <ul className="mt-2 space-y-1.5">
        {player.aiRecommendations.map((r, i) => (
          <motion.li
            key={r}
            className="flex items-center gap-2 text-sm text-slate-300"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <span className="text-emerald-400">•</span> {r}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
