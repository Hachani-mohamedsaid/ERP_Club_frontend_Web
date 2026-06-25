import { TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface Transfer {
  id: string;
  joueur: string;
  type: "Achat" | "Vente" | "Pret";
  montant: number;
  date: string;
}

const TRANSFERS: Transfer[] = [
  { id: "1", joueur: "Hassan Maaloul", type: "Achat", montant: -850000, date: "15/01/2026" },
  { id: "2", joueur: "Youssef Ben Ali", type: "Vente", montant: 1200000, date: "20/02/2026" },
  { id: "3", joueur: "Mohamed Diallo", type: "Pret", montant: 0, date: "10/03/2026" },
  { id: "4", joueur: "Nader Trabelsi", type: "Achat", montant: -650000, date: "05/04/2026" },
  { id: "5", joueur: "Rami Makhlouf", type: "Pret", montant: 0, date: "12/05/2026" },
];

const KPI_CARDS = [
  { label: "Achats", value: "1.5 M DT", change: "+8%", icon: TrendingDown, color: "#EF4444" },
  { label: "Ventes", value: "1.2 M DT", change: "+12%", icon: TrendingUp, color: "#10B981" },
  { label: "Bénéfice", value: "0.3 M DT", change: "+15%", icon: ArrowRightLeft, color: "#3B82F6" },
  { label: "Commissions", value: "150 K DT", change: "-3%", icon: TrendingDown, color: "#F59E0B" },
];

const TYPE_CONFIG = {
  Achat: { color: "#EF4444", icon: "📥", tone: "danger" },
  Vente: { color: "#10B981", icon: "📤", tone: "success" },
  Pret: { color: "#3B82F6", icon: "🔄", tone: "info" },
};

export function TransfertsFinance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Gestion des Transferts
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Suivi des achats, ventes et prêts de joueurs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs font-medium" style={{ color: kpi.color }}>
                    {kpi.change}
                  </p>
                </div>
                <Icon size={20} style={{ color: kpi.color, opacity: 0.6 }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Transfers List */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Historique des Transferts
        </h2>
        <div className="space-y-3">
          {TRANSFERS.map((transfer) => {
            const config = TYPE_CONFIG[transfer.type];
            return (
              <div
                key={transfer.id}
                className="flex items-center justify-between rounded-lg p-4 transition-transform hover:scale-[1.02]"
                style={{ border: "1px solid var(--surface-panel-border)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {transfer.joueur}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {transfer.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {transfer.montant !== 0 && (
                    <p
                      className="font-semibold"
                      style={{
                        color: transfer.montant > 0 ? "#10B981" : "#EF4444",
                      }}
                    >
                      {transfer.montant > 0 ? "+" : ""}{transfer.montant.toLocaleString("fr-TN")} DT
                    </p>
                  )}
                  <Badge tone={config.tone as any}>{transfer.type}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
