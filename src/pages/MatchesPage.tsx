import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface PastMatch {
  opponent: string;
  score: string;
  result: "V" | "N" | "D";
  date: string;
  competition: string;
  home: boolean;
}

interface UpcomingMatch {
  opponent: string;
  date: string;
  time: string;
  competition: string;
  home: boolean;
}

const PAST_MATCHES: PastMatch[] = [
  { opponent: "ES Sahel", score: "2 – 1", result: "V", date: "8 juin 2026", competition: "Ligue 1", home: true },
  { opponent: "Club Africain", score: "0 – 0", result: "N", date: "1 juin 2026", competition: "Ligue 1", home: false },
];

const UPCOMING_MATCHES: UpcomingMatch[] = [
  { opponent: "CS Sfaxien", date: "22 juin 2026", time: "18:00", competition: "Ligue 1", home: false },
  { opponent: "US Monastir", date: "29 juin 2026", time: "17:00", competition: "Ligue 1", home: true },
  { opponent: "Stade Tunisien", date: "6 juil. 2026", time: "20:00", competition: "Coupe de Tunisie", home: true },
];

const RESULT_TONE: Record<PastMatch["result"], "success" | "warning" | "danger"> = {
  V: "success",
  N: "warning",
  D: "danger",
};

const RESULT_LABEL: Record<PastMatch["result"], string> = {
  V: "Victoire",
  N: "Nul",
  D: "Défaite",
};

export function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Matchs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Résultats et calendrier — Saison 2025/2026
        </p>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Résultats récents
        </h2>
        <div className="space-y-3">
          {PAST_MATCHES.map((match) => (
            <div
              key={match.date + match.opponent}
              className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ border: "1px solid var(--surface-panel-border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  FC Carthage {match.home ? "(D)" : "(E)"} vs {match.opponent}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {match.date} · {match.competition}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {match.score}
                </span>
                <Badge tone={RESULT_TONE[match.result]}>{RESULT_LABEL[match.result]}</Badge>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Matchs à venir
        </h2>
        <div className="space-y-3">
          {UPCOMING_MATCHES.map((match) => (
            <div
              key={match.date + match.opponent}
              className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ border: "1px solid var(--surface-panel-border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  FC Carthage {match.home ? "(D)" : "(E)"} vs {match.opponent}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {match.competition}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {match.date}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {match.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
