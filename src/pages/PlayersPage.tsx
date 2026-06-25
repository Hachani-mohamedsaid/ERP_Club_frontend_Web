import { Search, ChevronDown } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface PlayerRow {
  name: string;
  marketValue: string;
  salary: string;
  contractEnd: string;
  odinScore: number;
  transferStatus: "À vendre" | "Intransferable" | "Surveillance";
}

const PLAYERS: PlayerRow[] = [
  { name: "Yassine Brahmi", marketValue: "120 000 DT", salary: "18 000 DT", contractEnd: "12/05/2027", odinScore: 87, transferStatus: "Intransferable" },
  { name: "Karim Sassi", marketValue: "98 000 DT", salary: "14 000 DT", contractEnd: "30/06/2028", odinScore: 81, transferStatus: "Intransferable" },
  { name: "Mehdi Trabelsi", marketValue: "75 000 DT", salary: "11 000 DT", contractEnd: "15/01/2026", odinScore: 74, transferStatus: "Surveillance" },
  { name: "Anis Khelifi", marketValue: "65 000 DT", salary: "9 500 DT", contractEnd: "20/08/2026", odinScore: 79, transferStatus: "Intransferable" },
  { name: "Walid Hammami", marketValue: "110 000 DT", salary: "16 500 DT", contractEnd: "02/03/2027", odinScore: 83, transferStatus: "Surveillance" },
  { name: "Sami Jendoubi", marketValue: "82 000 DT", salary: "10 200 DT", contractEnd: "25/09/2027", odinScore: 76, transferStatus: "À vendre" },
  { name: "Hichem Bouazizi", marketValue: "61 000 DT", salary: "8 800 DT", contractEnd: "11/11/2026", odinScore: 72, transferStatus: "Surveillance" },
  { name: "Rami Gharbi", marketValue: "54 000 DT", salary: "7 600 DT", contractEnd: "18/07/2026", odinScore: 68, transferStatus: "À vendre" },
  { name: "Fares Msakni", marketValue: "104 000 DT", salary: "12 000 DT", contractEnd: "13/04/2027", odinScore: 80, transferStatus: "Intransferable" },
  { name: "Oussama Ben Youssef", marketValue: "59 000 DT", salary: "8 200 DT", contractEnd: "30/06/2026", odinScore: 71, transferStatus: "Surveillance" },
];

const TRANSFER_TONE: Record<PlayerRow["transferStatus"], "success" | "warning" | "info"> = {
  "Intransferable": "success",
  "À vendre": "info",
  Surveillance: "warning",
};

const STATS = [
  { label: "Valeur marchande", value: "120 000 DT" },
  { label: "Salaire", value: "18 000 DT" },
  { label: "Fin contrat", value: "12/05/2027" },
  { label: "ODIN Score", value: "87/100" },
];

const PLAYER_TABS = ["Vue Responsable Club", "Contrat", "Performance", "Historique"];

export function PlayersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Joueurs
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Vue synthétique de l'effectif — Focus décisionnel
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

      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-2">
          {PLAYER_TABS.map((tab, index) => (
            <Badge key={tab} tone={index === 0 ? "info" : "neutral"}>{tab}</Badge>
          ))}
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Valeur marchande</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>120 000 DT</p>
          </div>
          <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Contrat</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Expire : 12/05/2027</p>
          </div>
          <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Équipe</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="success">Senior</Badge>
              <Badge tone="neutral">U21</Badge>
              <Badge tone="neutral">U18</Badge>
            </div>
          </div>
        </div>
      </GlassCard>

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
                <th className="pb-2 text-xs font-medium">Valeur marchande</th>
                <th className="pb-2 text-xs font-medium">Salaire</th>
                <th className="pb-2 text-xs font-medium">Contrat</th>
                <th className="pb-2 text-xs font-medium">ODIN Score</th>
                <th className="pb-2 text-xs font-medium">Statut transfert</th>
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
                    {player.marketValue}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {player.salary}
                  </td>
                  <td className="py-3">
                    {player.contractEnd}
                  </td>
                  <td className="py-3 text-right font-semibold" style={{ color: "var(--accent)" }}>
                    {player.odinScore}
                  </td>
                  <td className="py-3">
                    <Badge tone={TRANSFER_TONE[player.transferStatus]}>{player.transferStatus}</Badge>
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
