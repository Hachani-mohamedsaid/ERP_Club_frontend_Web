import { motion } from "framer-motion";
import { MapPin, Calendar, Clock } from "lucide-react";
import { MatchCountdown } from "./MatchCountdown";
import { CountUpStat } from "./CountUpStat";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";
import { useLocale } from "../../contexts/LocaleContext";

interface MatchPreviewCardProps {
  starterLabel: string;
}

const CLUB_COLORS: Record<string, string> = {
  EST: "#E11D48",
  CA: "#E11D48",
  ESS: "#EAB308",
  CSS: "#3B82F6",
  USBG: "#22C55E",
  ST: "#8B5CF6",
  OB: "#F97316",
  ASM: "#06B6D4",
};

function getClubColor(name: string): string {
  const upper = name.toUpperCase();
  for (const [abbr, color] of Object.entries(CLUB_COLORS)) {
    if (upper.includes(abbr)) return color;
  }
  return "#6B7280";
}

function getShort(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.map((w) => w[0]).join("").toUpperCase().slice(0, 3);
}

function TeamBadge({ short, color, name }: { short: string; color: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black text-white shadow-lg"
        style={{ background: `linear-gradient(145deg, ${color}, ${color}99)`, boxShadow: `0 8px 24px ${color}44` }}
        whileHover={{ scale: 1.08 }}
      >
        {short}
      </motion.div>
      <span className="max-w-[72px] truncate text-center text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>
        {name}
      </span>
    </div>
  );
}

const STADIUM_BG_URL = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80";

export function MatchPreviewCard({ starterLabel }: MatchPreviewCardProps) {
  const { calendarEvents, playerStats, orgProfile } = useJoueurBackendData();
  const { t } = useLocale();

  const now = new Date();
  const nextMatch = calendarEvents
    .filter((e) => e.eventType === "MATCH" && new Date(e.eventDate) >= now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0] ?? null;

  const clubName = orgProfile?.clubName ?? "Mon Club";
  const league = orgProfile?.league ?? "—";

  let home = clubName;
  let away = "Adversaire";
  if (nextMatch?.title) {
    const parts = nextMatch.title.split(/\s+vs\s+/i);
    if (parts.length === 2) {
      home = parts[0].trim();
      away = parts[1].trim();
    }
  }

  const homeColor = getClubColor(home) === "#6B7280" ? "#FF6B57" : getClubColor(home);
  const awayColor = getClubColor(away);
  const stadium = nextMatch?.location ?? orgProfile?.stadium ?? "—";
  const matchDate = nextMatch ? new Date(nextMatch.eventDate) : null;
  const dateLabel = matchDate
    ? matchDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";
  const timeLabel = nextMatch?.eventTime ?? "—";
  const targetDate = matchDate ?? new Date(Date.now() + 7 * 86400000);
  const starterProb = playerStats?.dashboardHero?.coachRating
    ? Math.min(Math.round(playerStats.dashboardHero.coachRating * 10), 98)
    : 75;

  if (!nextMatch) {
    return (
      <motion.div
        className="relative overflow-hidden rounded-[22px] border flex items-center justify-center p-8"
        style={{
          borderColor: "rgba(255,107,87,0.25)",
          background: "var(--surface-panel-solid)",
          minHeight: 200,
          boxShadow: "var(--shadow-glass)",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t.planningExtra.noMatch}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-[22px] border"
      style={{
        borderColor: "rgba(255,107,87,0.25)",
        background: "var(--surface-panel-solid)",
        boxShadow: "var(--shadow-glass)",
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="relative h-20 overflow-hidden">
        <img src={STADIUM_BG_URL} alt="Stade" className="h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, var(--surface-panel-solid))" }} />
        <div className="absolute bottom-2 left-4">
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>
            {league}
          </p>
          <p className="text-xs font-semibold text-white/80">{stadium}</p>
        </div>
      </div>

      <div className="p-5 pt-3">
        <div className="flex items-center justify-center gap-4 py-2">
          <TeamBadge short={getShort(home)} color={homeColor} name={home} />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black" style={{ color: "var(--text-muted)" }}>VS</span>
            <div className="mt-1 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <Calendar size={10} /> {dateLabel}
            </div>
            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
              <Clock size={10} /> {timeLabel}
            </div>
          </div>
          <TeamBadge short={getShort(away)} color={awayColor} name={away} />
        </div>

        <div className="my-3 h-px" style={{ background: "var(--surface-input)" }} />

        <MatchCountdown targetDate={targetDate} label="Compte à rebours" />

        <div className="mt-4 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.08)" }}>
          <div>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{starterLabel}</p>
            <p className="text-2xl font-black" style={{ color: "#22C55E" }}>
              <CountUpStat end={starterProb} suffix="%" />
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2"
            style={{ borderColor: "#22C55E", background: "rgba(34,197,94,0.1)" }}>
            <span className="text-xs font-bold" style={{ color: "#22C55E" }}>XI</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
          <MapPin size={10} style={{ color: "#FF6B57" }} />
          {stadium}
        </div>
      </div>
    </motion.div>
  );
}
