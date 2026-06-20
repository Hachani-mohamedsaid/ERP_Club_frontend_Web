import { useState } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { FileText, Clock, AlertCircle, TrendingDown } from "lucide-react";

interface Invoice {
  id: string;
  reference: string;
  fournisseur: string;
  type: "Fournisseur" | "Équipement" | "Médical" | "Transport";
  montant: number;
  date: string;
  status: "Payée" | "En attente" | "Retard";
}

interface Expense {
  id: string;
  categorie: "Équipements" | "Transport" | "Hébergement" | "Médical" | "Infrastructure" | "Autre";
  description: string;
  montant: number;
  date: string;
  fournisseur: string;
  status: "Payée" | "En attente" | "En retard";
}

const INVOICES: Invoice[] = [
  { id: "1", reference: "FAC-001", fournisseur: "Équipement Sport Plus", type: "Équipement", montant: 15000, date: "01/06/2026", status: "Payée" },
  { id: "2", reference: "FAC-002", fournisseur: "Maintenance Stade", type: "Transport", montant: 8500, date: "05/06/2026", status: "Payée" },
  { id: "3", reference: "FAC-003", fournisseur: "Transport Club", type: "Transport", montant: 12000, date: "10/06/2026", status: "En attente" },
  { id: "4", reference: "FAC-004", fournisseur: "Assurance Joueurs", type: "Fournisseur", montant: 25000, date: "15/05/2026", status: "Retard" },
  { id: "5", reference: "FAC-005", fournisseur: "Fournitures Médicales", type: "Médical", montant: 6500, date: "12/06/2026", status: "En attente" },
];

const EXPENSES: Expense[] = [
  { id: "1", categorie: "Équipements", description: "Maillots saison 2026/27", montant: 45000, date: "15/06/2026", fournisseur: "Nike", status: "Payée" },
  { id: "2", categorie: "Transport", description: "Transport match contre ES Sahel", montant: 8500, date: "12/06/2026", fournisseur: "Ben Arous Tours", status: "Payée" },
  { id: "3", categorie: "Hébergement", description: "Stage préparation été", montant: 125000, date: "10/06/2026", fournisseur: "Hôtel Korba Beach", status: "En attente" },
  { id: "4", categorie: "Médical", description: "Équipement kinésithérapie", montant: 35000, date: "08/06/2026", fournisseur: "MedSupply TN", status: "En attente" },
  { id: "5", categorie: "Infrastructure", description: "Rénovation vestiaire", montant: 250000, date: "01/06/2026", fournisseur: "Construco", status: "En retard" },
  { id: "6", categorie: "Transport", description: "Carburant déplacements", montant: 6200, date: "18/06/2026", fournisseur: "Essence Plus", status: "Payée" },
  { id: "7", categorie: "Équipements", description: "Ballons d'entraînement", montant: 12000, date: "16/06/2026", fournisseur: "Adidas Store", status: "Payée" },
];

const STATUS_TONE: Record<Invoice["status"] | Expense["status"], "success" | "warning" | "danger"> = {
  Payée: "success",
  "En attente": "warning",
  Retard: "danger",
  "En retard": "danger",
};

const TAB_OPTIONS = ["Factures", "Dépenses"] as const;
type FinanceTab = (typeof TAB_OPTIONS)[number];

const KPI_CARDS = [
  { label: "Factures Totales", value: "5", icon: FileText, color: "#3B82F6" },
  { label: "Dépenses Totales", value: "7", icon: TrendingDown, color: "#EF4444" },
  { label: "En attente", value: "3", icon: Clock, color: "#F59E0B" },
  { label: "Retard", value: "1", icon: AlertCircle, color: "#EF4444" },
];

export function GestionFinanciereFinance() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("Factures");
  const totalFactures = INVOICES.reduce((sum, invoice) => sum + invoice.montant, 0);
  const totalDepenses = EXPENSES.reduce((sum, expense) => sum + expense.montant, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Gestion Financière
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Suivi consolidé des factures et des dépenses du club
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost">Filtrer</Button>
            <Button variant="ghost">Exporter</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                    {kpi.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                    {kpi.label === "Dépenses Totales" ? `${(totalDepenses / 1000).toFixed(0)}K DT` : kpi.value}
                  </p>
                </div>
                <Icon size={22} style={{ color: kpi.color }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Navigation
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Passez facilement entre factures et dépenses.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TAB_OPTIONS.map((tab) => (
              <Button
                key={tab}
                variant={tab === activeTab ? "solid" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === "Factures" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Montant factures
                </p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {(totalFactures / 1000).toFixed(0)} K DT
                </p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Factures en retard
                </p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-danger)" }}>
                  {INVOICES.filter((invoice) => invoice.status === "Retard").length}
                </p>
              </GlassCard>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Référence</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Fournisseur</th>
                    <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Type</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Montant</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Statut</th>
                    <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((invoice) => (
                    <tr key={invoice.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                      <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{invoice.reference}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{invoice.fournisseur}</td>
                      <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{invoice.type}</td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                        {invoice.montant.toLocaleString("fr-TN")} DT
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge tone={STATUS_TONE[invoice.status]}>{invoice.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">Voir</Button>
                          <Button variant="ghost" size="sm">Payer</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Total dépenses
                </p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {(totalDepenses / 1000).toFixed(0)} K DT
                </p>
              </GlassCard>
              <GlassCard className="p-4">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Dépenses en attente
                </p>
                <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-warning)" }}>
                  {EXPENSES.filter((expense) => expense.status === "En attente").length}
                </p>
              </GlassCard>
            </div>

            <div className="space-y-3">
              {EXPENSES.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col gap-3 rounded-[var(--radius-odin-md)] border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderColor: "var(--surface-panel-border)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{expense.description}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {expense.fournisseur} · {expense.date}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                      Catégorie: {expense.categorie}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 sm:items-end">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {(expense.montant / 1000).toFixed(1)} K DT
                    </span>
                    <Badge tone={STATUS_TONE[expense.status]}>{expense.status}</Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Modifier</Button>
                      <Button variant="ghost" size="sm">Supprimer</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
