import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Transaction {
  date: string;
  label: string;
  category: string;
  amount: number;
  type: "revenue" | "expense";
}

const REVENUE_EXPENSE_DATA = [
  { month: "Jan", revenus: 1.2, depenses: 0.95 },
  { month: "Fev", revenus: 1.35, depenses: 1.1 },
  { month: "Mar", revenus: 1.5, depenses: 1.2 },
  { month: "Avr", revenus: 1.4, depenses: 1.05 },
  { month: "Mai", revenus: 1.6, depenses: 1.3 },
  { month: "Jun", revenus: 1.65, depenses: 1.35 },
];

const BUDGET_DISTRIBUTION = [
  { name: "Salaires", value: 60, color: "#8B5CF6" },
  { name: "Transferts", value: 20, color: "#EF4444" },
  { name: "Infrastructure", value: 10, color: "#3B82F6" },
  { name: "Staff", value: 5, color: "#F59E0B" },
  { name: "Divers", value: 5, color: "#6B7280" },
];

const ALERTS = [
  { type: "budget", message: "Budget transfert dépassé", severity: "error", icon: "⚠️" },
  { type: "invoice", message: "Facture retard depuis 15 jours", severity: "warning", icon: "📄" },
  { type: "contract", message: "Contrat expire dans 15 jours", severity: "warning", icon: "📋" },
  { type: "sponsor", message: "Sponsor à renouveler", severity: "info", icon: "🤝" },
];

const TRANSACTIONS: Transaction[] = [
  { date: "15 juin", label: "Sponsor principal — Trimestre Q2", category: "Sponsoring", amount: 85000, type: "revenue" },
  { date: "14 juin", label: "Salaires staff technique", category: "Salaires", amount: -42000, type: "expense" },
  { date: "12 juin", label: "Vente billets — CS Sfaxien", category: "Billetterie", amount: 18500, type: "revenue" },
  { date: "10 juin", label: "Équipement sportif", category: "Matériel", amount: -12400, type: "expense" },
  { date: "8 juin", label: "Prime victoire Ligue 1", category: "Primes", amount: -8000, type: "expense" },
  { date: "5 juin", label: "Droits TV — Juin", category: "Médias", amount: 120000, type: "revenue" },
];

const KPI_DATA = [
  {
    label: "Budget Total",
    value: "12.5 M DT",
    change: "+2.5%",
    icon: Wallet,
    color: "#3B82F6",
  },
  {
    label: "Budget Restant",
    value: "4.2 M DT",
    change: "+8%",
    icon: TrendingUp,
    color: "#10B981",
  },
  {
    label: "Revenus Saison",
    value: "8.3 M DT",
    change: "+15%",
    icon: TrendingUp,
    color: "#22C55E",
  },
  {
    label: "Dépenses Saison",
    value: "4.1 M DT",
    change: "-5%",
    icon: TrendingDown,
    color: "#EF4444",
  },
  {
    label: "Cash Flow",
    value: "+125 600 DT",
    change: "+3.2%",
    icon: Wallet,
    color: "#3B82F6",
  },
];

export function FinanceComptabilite() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Comptabilité & Finance
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Tableau de bord financier du club
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_DATA.map((kpi) => {
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
                  <p className="mt-1 text-xs font-medium" style={{ color: "#10B981" }}>
                    {kpi.change}
                  </p>
                </div>
                <Icon size={20} style={{ color: kpi.color, opacity: 0.6 }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue vs Expenses */}
        <GlassCard raised className="col-span-1 p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            📈 Revenus vs Dépenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={REVENUE_EXPENSE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-panel)",
                  border: "1px solid var(--surface-panel-border)",
                  color: "var(--text-primary)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="revenus" fill="#10B981" name="Revenus (M DT)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="depenses" fill="#EF4444" name="Dépenses (M DT)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        {/* Budget Distribution */}
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🥧 Répartition Budget
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={BUDGET_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {BUDGET_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "var(--surface-panel)",
                  border: "1px solid var(--surface-panel-border)",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-xs">
            {BUDGET_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Prévision IA
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Prévision consolidée par l'assistant IA — budget fin de saison estimé
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/finance/ia" className="text-sm font-medium" style={{ color: "var(--accent)" }}>Ouvrir IA Finance</a>
            <button className="text-sm px-3 py-1 rounded border" style={{ borderColor: "var(--surface-panel-border)" }}>Exporter</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard className="p-4" style={{ borderColor: "#3B82F6" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Budget fin saison (IA)
            </p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              12.8 M DT
            </p>
            <p className="mt-1 text-xs" style={{ color: "#3B82F6" }}>
              +3.2% vs prévision
            </p>
          </GlassCard>

          <GlassCard className="p-4" style={{ borderColor: "#10B981" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Prévision revenus (IA)
            </p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              9.5 M DT
            </p>
            <p className="mt-1 text-xs" style={{ color: "#10B981" }}>
              +2.8% vs année précédente
            </p>
          </GlassCard>

          <GlassCard className="p-4" style={{ borderColor: "#EF4444" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Prévision dépenses (IA)
            </p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              4.9 M DT
            </p>
            <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>
              -1.5% vs budget
            </p>
          </GlassCard>
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Dernières transactions
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Mise à jour il y a 15 min
          </span>
        </div>
        <div className="space-y-3">
          {TRANSACTIONS.map((tx) => (
            <div
              key={tx.date + tx.label}
              className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
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
                  color: tx.type === "revenue" ? "var(--color-state-success)" : "var(--color-state-danger)",
                }}
              >
                {tx.amount > 0 ? "+" : "−"}{Math.abs(tx.amount).toLocaleString("fr-TN")} DT
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Alerts */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          ⚠️ Alertes Financières
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ALERTS.map((alert, idx) => (
            <GlassCard key={idx} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">{alert.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {alert.message}
                  </p>
                  <Badge
                    tone={
                      alert.severity === "error"
                        ? "danger"
                        : alert.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  >
                    {alert.severity === "error" ? "Urgent" : alert.severity === "warning" ? "À surveiller" : "Info"}
                  </Badge>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
