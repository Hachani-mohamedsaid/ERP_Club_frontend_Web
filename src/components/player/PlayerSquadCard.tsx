import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AnimatedBadge } from "../ui/AnimatedBadge";
import type { SquadPlayer } from "../../data/joueurMockData";
import { getInitials, getAvailabilityTone } from "../../data/joueurMockData";

interface PlayerSquadCardProps {
  player: SquadPlayer;
  onSelect?: (player: SquadPlayer) => void;
}

export function PlayerSquadCard({ player, onSelect }: PlayerSquadCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      type="button"
      onClick={() => onSelect ? onSelect(player) : navigate(`/joueurs/${player.id}`)}
      className="glass-panel w-full rounded-[var(--radius-odin-md)] p-5 text-left transition-shadow"
      whileHover={{ scale: 1.05, boxShadow: "0 8px 32px rgba(224,88,74,0.25)" }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ borderTop: "3px solid var(--accent)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
          style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        >
          {getInitials(player.name)}
        </div>
        <AnimatedBadge tone={getAvailabilityTone(player.availability)}>{player.availability}</AnimatedBadge>
      </div>
      <h3 className="mt-3 text-base font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</h3>
      <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>{player.position}</p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{player.flag} {player.nationality}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span style={{ color: "var(--text-muted)" }}>Age</span>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{player.age} ans</p>
        </div>
        <div>
          <span style={{ color: "var(--text-muted)" }}>Valeur</span>
          <p className="font-semibold" style={{ color: "var(--color-state-success)" }}>{player.marketValue}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--surface-panel-border)" }}>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>OVR</span>
        <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>{player.ovr}</span>
      </div>
    </motion.button>
  );
}
