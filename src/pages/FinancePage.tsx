import { GlassCard } from "../components/ui/GlassCard";

interface SummaryCard {
  label: string;
  value: string;
}

interface Transaction {
  date: string;
  label: string;
  category: string;
  amount: number;
  type: "revenue" | "expense";
}

const SUMMARY: SummaryCard[] = [
  { label: "Budget annuel", value: "2 400 000 DT" },
  { label: "Dépenses ce mois", value: "186 400 DT" },
  { label: "Revenus ce mois", value: "312 000 DT" },
  { label: "Solde restant", value: "184 200 DT" },
];

const TRANSACTIONS: Transaction[] = [
  { date: "15 juin", label: "Sponsor principal — Trimestre Q2", category: "Sponsoring", amount: 85000, type: "revenue" },
  { date: "14 juin", label: "Salaires staff technique", category: "Salaires", amount: -42000, type: "expense" },
  { date: "12 juin", label: "Vente billets — CS Sfaxien", category: "Billetterie", amount: 18500, type: "revenue" },
  { date: "10 juin", label: "Équipement sportif", category: "Matériel", amount: -12400, type: "expense" },
  { date: "8 juin", label: "Prime victoire Ligue 1", category: "Primes", amount: -8000, type: "expense" },
  { date: "5 juin", label: "Droits TV — Juin", category: "Médias", amount: 120000, type: "revenue" },
];

function formatAmount(amount: number): string {
  const abs = Math.abs(amount).toLocaleString("fr-TN");
  return amount >= 0 ? `+${abs} DT` : `−${abs} DT`;
}

export function FinancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Finance
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Budget et trésorerie — Exercice 2025/2026
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SUMMARY.map(({ label, value }) => (
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
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Transactions récentes
        </h2>
        <div className="space-y-2">
          {TRANSACTIONS.map((tx) => (
            <div
              key={tx.date + tx.label}
              className="flex flex-col gap-1 rounded-[var(--radius-odin-md)] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              style={{ border: "1px solid var(--surface-panel-border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {tx.label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {tx.date} · {tx.category}
                </p>
              </div>
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    tx.type === "revenue"
                      ? "var(--color-state-success)"
                      : "var(--color-state-danger)",
                }}
              >
                {formatAmount(tx.amount)}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
