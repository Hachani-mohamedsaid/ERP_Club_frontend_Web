import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

interface Expense {
  id: string;
  categorie: "Équipements" | "Transport" | "Hébergement" | "Médical" | "Infrastructure" | "Autre";
  description: string;
  montant: number;
  date: string;
  fournisseur: string;
  status: "Payée" | "En attente" | "En retard";
}

const EXPENSES: Expense[] = [
  { id: "1", categorie: "Équipements", description: "Maillots saison 2026/27", montant: 45000, date: "15/06/2026", fournisseur: "Nike", status: "Payée" },
  { id: "2", categorie: "Transport", description: "Transport match contre ES Sahel", montant: 8500, date: "12/06/2026", fournisseur: "Ben Arous Tours", status: "Payée" },
  { id: "3", categorie: "Hébergement", description: "Stage préparation été", montant: 125000, date: "10/06/2026", fournisseur: "Hôtel Korba Beach", status: "En attente" },
  { id: "4", categorie: "Médical", description: "Équipement kinésithérapie", montant: 35000, date: "08/06/2026", fournisseur: "MedSupply TN", status: "En attente" },
  { id: "5", categorie: "Infrastructure", description: "Rénovation vestiaire", montant: 250000, date: "01/06/2026", fournisseur: "Construco", status: "En retard" },
  { id: "6", categorie: "Transport", description: "Carburant déplacements", montant: 6200, date: "18/06/2026", fournisseur: "Essence Plus", status: "Payée" },
  { id: "7", categorie: "Équipements", description: "Ballons d'entraînement", montant: 12000, date: "16/06/2026", fournisseur: "Adidas Store", status: "Payée" },
];

const CATEGORY_COLORS: Record<Expense["categorie"], string> = {
  "Équipements": "#3B82F6",
  "Transport": "#10B981",
  "Hébergement": "#F59E0B",
  "Médical": "#EF4444",
  "Infrastructure": "#8B5CF6",
  "Autre": "#6B7280",
};

const CATEGORY_ICONS: Record<Expense["categorie"], string> = {
  "Équipements": "⚽",
  "Transport": "🚗",
  "Hébergement": "🏨",
  "Médical": "🏥",
  "Infrastructure": "🏗️",
  "Autre": "📦",
};

const STATUS_TONE: Record<Expense["status"], "success" | "warning" | "danger"> = {
  "Payée": "success",
  "En attente": "warning",
  "En retard": "danger",
};

export function DépensesFinance() {
  const totalDépenses = EXPENSES.reduce((sum, exp) => sum + exp.montant, 0);
  const payées = EXPENSES.filter(e => e.status === "Payée").reduce((sum, e) => sum + e.montant, 0);
  const enAttente = EXPENSES.filter(e => e.status === "En attente").reduce((sum, e) => sum + e.montant, 0);
  const enRetard = EXPENSES.filter(e => e.status === "En retard").reduce((sum, e) => sum + e.montant, 0);

  const expensesByCategory = Object.keys(CATEGORY_COLORS).map(cat => {
    const total = EXPENSES.filter(e => e.categorie === cat as Expense["categorie"]).reduce((sum, e) => sum + e.montant, 0);
    return { categorie: cat as Expense["categorie"], montant: total };
  }).filter(e => e.montant > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Gestion des Dépenses
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Suivi détaillé des dépenses par catégorie
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Total Dépenses
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                {(totalDépenses / 1000).toFixed(0)} K DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-state-danger)" }}>
                ↑ 12%
              </p>
            </div>
            <DollarSign size={24} style={{ color: "var(--accent)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Dépenses Payées
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-success)" }}>
                {(payées / 1000).toFixed(0)} K DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {EXPENSES.filter(e => e.status === "Payée").length} factures
              </p>
            </div>
            <TrendingDown size={24} style={{ color: "var(--color-state-success)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                En Attente
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-warning)" }}>
                {(enAttente / 1000).toFixed(0)} K DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {EXPENSES.filter(e => e.status === "En attente").length} factures
              </p>
            </div>
            <AlertCircle size={24} style={{ color: "var(--color-state-warning)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                En Retard
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-danger)" }}>
                {(enRetard / 1000).toFixed(0)} K DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {EXPENSES.filter(e => e.status === "En retard").length} factures
              </p>
            </div>
            <TrendingUp size={24} style={{ color: "var(--color-state-danger)" }} />
          </div>
        </GlassCard>
      </div>

      {/* Répartition par Catégorie */}
      <GlassCard raised className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            📊 Répartition par Catégorie
          </h2>
                <Button variant="ghost">
            Ajouter dépense
          </Button>
        </div>
        <div className="space-y-4">
          {expensesByCategory.map((item) => (
            <div key={item.categorie} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CATEGORY_ICONS[item.categorie]}</span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {item.categorie}
                  </span>
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {(item.montant / 1000).toFixed(0)} K DT
                </span>
              </div>
              <div
                className="h-2 rounded-full"
                style={{
                  background: CATEGORY_COLORS[item.categorie],
                  width: `${(item.montant / totalDépenses) * 100}%`,
                }}
              />
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Liste des Dépenses */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Détail des Dépenses
        </h2>
        <div className="space-y-3">
          {EXPENSES.map((expense) => (
            <div
              key={expense.id}
              className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{CATEGORY_ICONS[expense.categorie]}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {expense.description}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {expense.fournisseur} • {expense.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {(expense.montant / 1000).toFixed(1)} K DT
                </span>
                <Badge tone={STATUS_TONE[expense.status]}>
                  {expense.status}
                </Badge>
                <Button variant="ghost" size="sm">Modifier</Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
