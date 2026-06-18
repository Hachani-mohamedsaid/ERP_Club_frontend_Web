import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { AICard } from "../components/coach/AICard";
import { NotificationPanel } from "../components/coach/NotificationPanel";

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

interface MatchStat {
  label: string;
  value: string;
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

const LINEUP = ["Titulaire", "Remplaçants"];

const MATCH_STATS: MatchStat[] = [
  { label: "Possession", value: "58%" },
  { label: "Tirs", value: "14" },
  { label: "Passes", value: "486" },
  { label: "ODIN MVP", value: "Ahmed Ben Salah" },
];

const MATCH_RECOMMENDATIONS = [
  "Points forts: transitions rapides",
  "Points faibles: pression haute subie",
  "Ajustement: compactage axial",
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Composition
          </h2>
          <div className="flex flex-wrap gap-2">
            {LINEUP.map((item, index) => (
              <Badge key={item} tone={index === 0 ? "success" : "neutral"}>
                {item}
              </Badge>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {MATCH_STATS.map((stat) => (
              <div key={stat.label} className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
                <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button">Générer composition</Button>
            <Button type="button" variant="ghost">Exporter feuille</Button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <AICard
            title="Recommandation IA"
            message="Yassine Brahmi est en forme optimale pour le prochain match."
            accent="success"
          />
          <GlassCard className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Conseils tactiques
            </h2>
            <div className="space-y-3 text-sm" style={{ color: "var(--text-secondary)" }}>
              {MATCH_RECOMMENDATIONS.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </div>
          </GlassCard>
          <AICard
            title="Risque Blessure"
            message="Ahmed Ben Salah : risque élevé 72% dans les 48 prochaines heures."
            accent="warning"
          />
          <NotificationPanel
            notifications={[
              { title: "Joueur absent aujourd'hui", subtitle: "Walid Hammami - statuts manquants" },
              { title: "Contrat expire dans 30 jours", subtitle: "Karim Sassi" },
              { title: "Retour blessure prévu demain", subtitle: "Ali Ben Youssef" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
