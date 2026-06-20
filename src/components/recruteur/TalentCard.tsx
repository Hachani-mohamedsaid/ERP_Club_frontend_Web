import { motion } from "framer-motion";
import { Eye, GitCompare, Star } from "lucide-react";
import { PlayerAvatar } from "../player/PlayerAvatar";
import type { ScoutPlayer } from "../../data/recruteurData";

function scoreColor(score: number) {
  if (score >= 90) return "#A855F7";
  if (score >= 85) return "#F59E0B";
  if (score >= 80) return "#22C55E";
  return "#3B82F6";
}

export function TalentCard({
  player,
  delay = 0,
  onView,
  onCompare,
  onShortlist,
}: {
  player: ScoutPlayer;
  delay?: number;
  onView: (p: ScoutPlayer) => void;
  onCompare: (p: ScoutPlayer) => void;
  onShortlist: (p: ScoutPlayer) => void;
}) {
  const col = scoreColor(player.aiScore);

  return (
    <motion.div
      className="group relative overflow-hidden rounded-[20px] border p-4 backdrop-blur-[10px]"
      style={{
        background: "linear-gradient(160deg, rgba(15,29,58,0.95), rgba(20,15,45,0.9))",
        borderColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ y: -6, rotateX: 4, boxShadow: `0 18px 48px ${col}33` }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ background: col }}
      />

      <div className="flex items-start gap-3">
        <div className="relative">
          <PlayerAvatar name={player.name} size={64} ring={false} className="!rounded-2xl" />
          <div
            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white shadow-lg"
            style={{ background: col, boxShadow: `0 0 14px ${col}99` }}
          >
            {player.aiScore}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold" style={{ color: "var(--text-primary)" }}>
            {player.name}
          </h3>
          <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
            {player.countryFlag} {player.club}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(139,92,246,0.15)", color: "#A855F7" }}>
              {player.position}
            </span>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
              {player.age} ans
            </span>
            <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}>
              {player.value}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Vitesse", v: player.speed },
          { l: "Technique", v: player.technique },
          { l: "Mental", v: player.mental },
        ].map((s) => (
          <div key={s.l} className="rounded-lg py-1.5" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{s.v}</div>
            <div className="text-[9px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onView(player)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}
        >
          <Eye size={13} /> Profil
        </button>
        <button
          type="button"
          onClick={() => onCompare(player)}
          className="flex items-center justify-center rounded-lg px-3 py-2 text-xs transition-colors hover:bg-white/10"
          style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
          title="Comparer"
        >
          <GitCompare size={14} />
        </button>
        <button
          type="button"
          onClick={() => onShortlist(player)}
          className="flex items-center justify-center rounded-lg px-3 py-2 text-xs transition-colors"
          style={{
            background: player.shortlisted ? "rgba(245,158,11,0.18)" : "rgba(255,255,255,0.05)",
            color: player.shortlisted ? "#F59E0B" : "var(--text-muted)",
          }}
          title="Shortlist"
        >
          <Star size={14} fill={player.shortlisted ? "#F59E0B" : "none"} />
        </button>
      </div>
    </motion.div>
  );
}
