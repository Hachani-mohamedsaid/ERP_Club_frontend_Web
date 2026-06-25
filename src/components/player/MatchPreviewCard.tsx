import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import { MatchCountdown } from "./MatchCountdown";
import { CountUpStat } from "./CountUpStat";
import { NEXT_MATCH, STADIUM_BG_URL } from "../../data/joueurPersonalData";

interface MatchPreviewCardProps {
  starterLabel: string;
}

function TeamBadge({ short, color, name }: { short: string; color: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg"
        style={{ background: `linear-gradient(145deg, ${color}, ${color}99)`, boxShadow: `0 8px 24px ${color}44` }}
        whileHover={{ scale: 1.08 }}>
        {short}
      </motion.div>
      <span className="max-w-[72px] truncate text-center text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>
        {name}
      </span>
    </div>
  );
}

export function MatchPreviewCard({ starterLabel }: MatchPreviewCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[22px] border"
      style={{ borderColor: "rgba(255,107,87,0.25)", background: "rgba(8,12,28,0.85)" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Stadium strip */}
      <div className="relative h-20 overflow-hidden">
        <img
          src={STADIUM_BG_URL}
          alt="Stade"
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(8,12,28,0.95))" }} />
        <div className="absolute bottom-2 left-4">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>
            {NEXT_MATCH.competition}
          </p>
          <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>{NEXT_MATCH.stadium}</p>
        </div>
      </div>

      <div className="p-5 pt-3">
        {/* Teams VS */}
        <div className="flex items-center justify-center gap-4 py-2">
          <TeamBadge short={NEXT_MATCH.homeShort} color={NEXT_MATCH.homeColor} name={NEXT_MATCH.home} />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black" style={{ color: "rgba(255,255,255,0.25)" }}>VS</span>
            <div className="mt-1 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <Calendar size={10} /> {NEXT_MATCH.date}
            </div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <Clock size={10} /> {NEXT_MATCH.time}
            </div>
          </div>
          <TeamBadge short={NEXT_MATCH.awayShort} color={NEXT_MATCH.awayColor} name={NEXT_MATCH.away} />
        </div>

        <div className="my-3 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

        <MatchCountdown targetDate={NEXT_MATCH.targetDate} label="Compte à rebours" />

        <div className="mt-4 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.08)" }}>
          <div>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{starterLabel}</p>
            <p className="text-2xl font-black" style={{ color: "#22C55E" }}>
              <CountUpStat end={NEXT_MATCH.starterProbability} suffix="%" />
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2"
            style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.1)" }}>
            <span className="text-xs font-bold" style={{ color: "#22C55E" }}>XI</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
          <MapPin size={10} style={{ color: "#FF6B57" }} />
          {NEXT_MATCH.stadium}
        </div>
      </div>
    </motion.div>
  );
}
