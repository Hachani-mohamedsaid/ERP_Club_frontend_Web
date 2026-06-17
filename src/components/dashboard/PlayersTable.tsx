import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";

interface PlayerRow {
  name: string;
  position: string;
  number: number;
  status: "Disponible" | "Blessé" | "En rééducation" | "Suspendu";
  odinRating: number;
}

const PLAYERS: PlayerRow[] = [
  { name: "Yassine Brahmi", position: "Attaquant", number: 9, status: "Disponible", odinRating: 87 },
  { name: "Karim Sassi", position: "Milieu", number: 8, status: "Disponible", odinRating: 81 },
  { name: "Mehdi Trabelsi", position: "Défenseur", number: 4, status: "En rééducation", odinRating: 74 },
  { name: "Anis Khelifi", position: "Gardien", number: 1, status: "Disponible", odinRating: 79 },
  { name: "Walid Hammami", position: "Attaquant", number: 11, status: "Blessé", odinRating: 83 },
];

const STATUS_TONE: Record<PlayerRow["status"], "success" | "danger" | "warning" | "neutral"> = {
  Disponible: "success",
  Blessé: "danger",
  "En rééducation": "warning",
  Suspendu: "neutral",
};

export function PlayersTable() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Effectif — Top joueurs
        </h2>
        <button className="text-xs font-medium" style={{ color: "var(--accent)" }}>
          Voir tout
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ color: "var(--text-muted)" }}>
              <th className="pb-2 text-xs font-medium">Joueur</th>
              <th className="pb-2 text-xs font-medium">Poste</th>
              <th className="pb-2 text-xs font-medium">N°</th>
              <th className="pb-2 text-xs font-medium">Statut</th>
              <th className="pb-2 text-right text-xs font-medium">ODIN Rating</th>
            </tr>
          </thead>
          <tbody>
            {PLAYERS.map((p) => (
              <tr
                key={p.name}
                style={{ borderTop: "1px solid var(--surface-panel-border)" }}
              >
                <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                  {p.name}
                </td>
                <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                  {p.position}
                </td>
                <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                  {p.number}
                </td>
                <td className="py-3">
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                </td>
                <td className="py-3 text-right font-semibold" style={{ color: "var(--accent)" }}>
                  {p.odinRating}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
