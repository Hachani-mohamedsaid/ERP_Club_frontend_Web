import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

interface ContractRow {
  player: string;
  salary: string;
  bonus: string;
  startDate: string;
  endDate: string;
  expiry: string;
}

const CONTRACTS: ContractRow[] = [
  { player: "Yassine Brahmi", salary: "18 000 DT", bonus: "2 500 DT", startDate: "01/07/2024", endDate: "12/05/2027", expiry: "90 jours" },
  { player: "Karim Sassi", salary: "14 000 DT", bonus: "1 800 DT", startDate: "01/07/2023", endDate: "30/06/2028", expiry: "60 jours" },
  { player: "Walid Hammami", salary: "16 500 DT", bonus: "2 000 DT", startDate: "01/07/2024", endDate: "02/03/2027", expiry: "30 jours" },
];

export function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Contracts
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Gestion des contrats, alertes et renouvellements
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Expire dans 90 jours", "1"],
          ["Expire dans 60 jours", "1"],
          ["Expire dans 30 jours", "1"],
        ].map(([label, value]) => (
          <GlassCard key={label} className="p-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Liste des contrats
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-2 text-xs font-medium">Joueur</th>
                <th className="pb-2 text-xs font-medium">Salaire</th>
                <th className="pb-2 text-xs font-medium">Prime</th>
                <th className="pb-2 text-xs font-medium">Début</th>
                <th className="pb-2 text-xs font-medium">Fin</th>
                <th className="pb-2 text-xs font-medium">Alerte</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACTS.map((contract) => (
                <tr key={contract.player} style={{ borderTop: "1px solid var(--surface-panel-border)" }}>
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {contract.player}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{contract.salary}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{contract.bonus}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{contract.startDate}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{contract.endDate}</td>
                  <td className="py-3"><Badge tone="warning">Expire dans {contract.expiry}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Renouvellement
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button">Proposer renouvellement</Button>
          <Button type="button" variant="ghost">
            Refuser
          </Button>
          <Button type="button" variant="glass">
            Négociation
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
