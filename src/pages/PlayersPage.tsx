import { Search, ChevronDown } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface PlayerRow {
  name: string;
  position: string;
  age: number;
  number: number;
  status: "Disponible" | "Blessé" | "En rééducation" | "Suspendu";
  odinRating: number;
}

const PLAYERS: PlayerRow[] = [
  { name: "Yassine Brahmi", position: "Attaquant", age: 26, number: 9, status: "Disponible", odinRating: 87 },
  { name: "Karim Sassi", position: "Milieu", age: 24, number: 8, status: "Disponible", odinRating: 81 },
  { name: "Mehdi Trabelsi", position: "Défenseur", age: 28, number: 4, status: "En rééducation", odinRating: 74 },
  { name: "Anis Khelifi", position: "Gardien", age: 31, number: 1, status: "Disponible", odinRating: 79 },
  { name: "Walid Hammami", position: "Attaquant", age: 23, number: 11, status: "Blessé", odinRating: 83 },
  { name: "Sami Jendoubi", position: "Milieu", age: 22, number: 6, status: "Disponible", odinRating: 76 },
  { name: "Hichem Bouazizi", position: "Défenseur", age: 27, number: 5, status: "Disponible", odinRating: 72 },
  { name: "Rami Gharbi", position: "Attaquant", age: 20, number: 17, status: "Suspendu", odinRating: 68 },
  { name: "Fares Msakni", position: "Milieu", age: 25, number: 10, status: "Disponible", odinRating: 80 },
  { name: "Oussama Ben Youssef", position: "Défenseur", age: 29, number: 3, status: "Blessé", odinRating: 71 },
];

const STATUS_TONE: Record<PlayerRow["status"], "success" | "danger" | "warning" | "neutral"> = {
  Disponible: "success",
  Blessé: "danger",
  "En rééducation": "warning",
  Suspendu: "neutral",
};

const STATS = [
  { label: "Effectif total", value: "27" },
  { label: "Moyenne d'âge", value: "24,6 ans" },
  { label: "Joueurs disponibles", value: "22" },
  { label: "Blessés / indisponibles", value: "5" },
];

export function PlayersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Joueurs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Effectif complet — Saison 2025/2026
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ label, value }) => (
          <GlassCard key={label} className="p-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
            <p className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              {value}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Liste des joueurs
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Rechercher un joueur..."
                className="glass-input w-48 py-2 pl-8 pr-3 text-sm"
              />
            </div>
            <button
              type="button"
              className="glass-input flex items-center gap-2 px-3 py-2 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Tous les postes
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-2 text-xs font-medium">Nom</th>
                <th className="pb-2 text-xs font-medium">Poste</th>
                <th className="pb-2 text-xs font-medium">Âge</th>
                <th className="pb-2 text-xs font-medium">Numéro</th>
                <th className="pb-2 text-xs font-medium">Statut</th>
                <th className="pb-2 text-right text-xs font-medium">ODIN Rating</th>
              </tr>
            </thead>
            <tbody>
              {PLAYERS.map((player) => (
                <tr
                  key={player.name}
                  style={{ borderTop: "1px solid var(--surface-panel-border)" }}
                >
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {player.name}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {player.position}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {player.age}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {player.number}
                  </td>
                  <td className="py-3">
                    <Badge tone={STATUS_TONE[player.status]}>{player.status}</Badge>
                  </td>
                  <td className="py-3 text-right font-semibold" style={{ color: "var(--accent)" }}>
                    {player.odinRating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
