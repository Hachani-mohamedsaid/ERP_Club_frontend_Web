import { Users } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";

interface TeamCard {
  category: string;
  name: string;
  playerCount: number;
  coach: string;
}

const TEAMS: TeamCard[] = [
  { category: "Seniors", name: "FC Carthage — Équipe A", playerCount: 27, coach: "Nabil Maaloul" },
  { category: "U21", name: "FC Carthage U21", playerCount: 22, coach: "Slim Riahi" },
  { category: "U18", name: "FC Carthage U18", playerCount: 20, coach: "Amine Gharbi" },
  { category: "U15", name: "FC Carthage U15", playerCount: 18, coach: "Lotfi Ben Ammar" },
];

export function TeamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Équipes
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Catégories et encadrement technique
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {TEAMS.map((team) => (
          <GlassCard key={team.category} raised className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                  {team.category}
                </p>
                <h2 className="mt-1 text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                  {team.name}
                </h2>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-odin-md)]"
                style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
              >
                <Users size={18} strokeWidth={2} />
              </div>
            </div>

            <div className="mb-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Effectif</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {team.playerCount} joueurs
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Entraîneur</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {team.coach}
                </span>
              </div>
            </div>

            <Button type="button" variant="ghost">
              Voir l'effectif
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
