import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";
import { VIIV_THEME } from "./whoopTheme";

export function WhoopAICoach({ player }: { player: WhoopPlayerMetrics }) {
  return (
    <motion.div
      className="p-5 backdrop-blur-xl"
      style={{
        borderRadius: VIIV_THEME.radiusCard,
        border: `1px solid rgba(255,122,0,0.28)`,
        background: `linear-gradient(135deg, rgba(255,122,0,0.12) 0%, rgba(28,28,46,0.75) 55%, rgba(34,211,238,0.06) 100%)`,
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2">
        <Sparkles size={18} style={{ color: VIIV_THEME.orange }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: VIIV_THEME.cyan }}>
          Odin AI Coach · Viiv
        </p>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: "rgba(255,122,0,0.18)", color: VIIV_THEME.orange }}
        >
          {player.aiConfidence}% confiance
        </span>
      </div>
      <motion.p
        className="mt-3 text-sm leading-relaxed"
        style={{ color: VIIV_THEME.textSecondary }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {player.name} —{" "}
        {player.sleepHours < player.sleepNeed
          ? `seulement ${player.sleepHours}h de sommeil.`
          : "profil recovery solide."}
      </motion.p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: VIIV_THEME.muted }}>
        Recommandations
      </p>
      <ul className="mt-2 space-y-1.5">
        {player.aiRecommendations.map((r, i) => (
          <motion.li
            key={r}
            className="flex items-center gap-2 text-sm"
            style={{ color: VIIV_THEME.textSecondary }}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <span style={{ color: VIIV_THEME.green }}>•</span> {r}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}
