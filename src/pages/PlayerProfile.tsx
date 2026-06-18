import { useParams, Link } from "react-router-dom";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

export function PlayerProfile() {
  const { name } = useParams<{ name: string }>();

  // In a real app you'd fetch player data by id/name. Here we use placeholders.
  const player = {
    name: name ?? "—",
    age: 28,
    position: "Avant-centre",
    nationality: "Tunisienne",
    matches: 18,
    goals: 9,
    assists: 4,
    minutes: 1450,
    evaluations: { technique: 8, tactique: 7, mental: 8, discipline: 9 },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{player.name}</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Profil joueur</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassCard className="p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Informations</p>
          <div className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div><strong>Nom:</strong> {player.name}</div>
            <div><strong>Age:</strong> {player.age}</div>
            <div><strong>Position:</strong> {player.position}</div>
            <div><strong>Nationalité:</strong> {player.nationality}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Performance</p>
          <div className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div>Matchs: {player.matches}</div>
            <div>Buts: {player.goals}</div>
            <div>Passes: {player.assists}</div>
            <div>Minutes: {player.minutes}</div>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Évaluation Coach</p>
          <div className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            <div>Technique: <Badge tone="info">{player.evaluations.technique}/10</Badge></div>
            <div>Tactique: <Badge tone="neutral">{player.evaluations.tactique}/10</Badge></div>
            <div>Mental: <Badge tone="success">{player.evaluations.mental}/10</Badge></div>
            <div>Discipline: <Badge tone="warning">{player.evaluations.discipline}/10</Badge></div>
          </div>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique</h2>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Actions récentes</p>
        <ul className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>
          <li>Évalué par Coach — 12/06/2026</li>
          <li>Blessure mineure — 01/05/2026</li>
          <li>Performance: 2 buts vs ST — 20/04/2026</li>
        </ul>

        <div className="mt-4">
          <Link to="/players" className="glass-input px-3 py-2">Retour à la liste</Link>
        </div>
        <div className="mt-3">
          <Link to="#" className="glass-input px-3 py-2" onClick={(e) => { e.preventDefault(); const ev = (window as any).__openEval; if (ev) ev(player.name); }}>Evaluer</Link>
        </div>
      </GlassCard>
    </div>
  );
}
