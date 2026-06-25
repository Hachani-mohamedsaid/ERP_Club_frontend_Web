import { Download, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const FINANCIAL_KPI = [
  { label: "Revenu Total", value: "2.4M €", trend: 12, color: "success" as const },
  { label: "Dépenses", value: "1.8M €", trend: -8, color: "warning" as const },
  { label: "Bénéfice Net", value: "600K €", trend: 25, color: "success" as const },
  { label: "Marge", value: "25%", trend: 5, color: "info" as const },
];

const REVENUE_BY_CATEGORY = [
  { name: "Ventes", value: 850000 },
  { name: "Sponsorings", value: 720000 },
  { name: "Billetterie", value: 540000 },
  { name: "Merchandise", value: 290000 },
];

const EXPENSE_BREAKDOWN = [
  { name: "Salaires", value: 720000 },
  { name: "Infrastructure", value: 340000 },
  { name: "Équipement", value: 280000 },
  { name: "Transport", value: 210000 },
  { name: "Autre", value: 250000 },
];

const MONTHLY_TREND = [
  { month: "Jan", revenus: 180000, depenses: 140000 },
  { month: "Fév", revenus: 195000, depenses: 145000 },
  { month: "Mar", revenus: 210000, depenses: 155000 },
  { month: "Avr", revenus: 205000, depenses: 150000 },
  { month: "Mai", revenus: 225000, depenses: 160000 },
  { month: "Jun", revenus: 240000, depenses: 165000 },
];

const COLORS_REVENUE = ["#FF6B57", "#22C55E", "#38BDF8", "#F59E0B"];
const COLORS_EXPENSE = ["#EC4899", "#8B5CF6", "#06B6D4", "#FBBF24", "#6EE7B7"];

const BUDGET_ITEMS = [
  { category: "Salaires", allocated: 750000, spent: 720000, percentage: 96 },
  { category: "Équipement", allocated: 300000, spent: 280000, percentage: 93 },
  { category: "Infrastructure", allocated: 350000, spent: 340000, percentage: 97 },
  { category: "Transport", allocated: 250000, spent: 210000, percentage: 84 },
  { category: "Marketing", allocated: 200000, spent: 165000, percentage: 82 },
];

const TRANSACTIONS = [
  { id: "TR001", date: "2026-06-15", description: "Paiement salaires juin", amount: -120000, status: "Complété" },
  { id: "TR002", date: "2026-06-14", description: "Revenu sponsoring Nike", amount: 85000, status: "Complété" },
  { id: "TR003", date: "2026-06-13", description: "Achat équipement", amount: -42000, status: "En cours" },
  { id: "TR004", date: "2026-06-12", description: "Ventes billetterie match", amount: 28500, status: "Complété" },
  { id: "TR005", date: "2026-06-11", description: "Paiement fournisseur", amount: -15800, status: "Complété" },
];

export function ComptabilitePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Comptabilité & Finance
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Gestion budgétaire, revenus et dépenses
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FINANCIAL_KPI.map((item) => (
          <GlassCard key={item.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {item.label}
                </p>
                <p className="mt-3 text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {item.value}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {item.trend > 0 ? (
                  <TrendingUp size={20} style={{ color: "#22C55E" }} />
                ) : (
                  <TrendingDown size={20} style={{ color: "#FF6B57" }} />
                )}
                <span style={{ color: item.trend > 0 ? "#22C55E" : "#FF6B57" }} className="text-sm font-semibold">
                  {item.trend > 0 ? "+" : ""}{item.trend}%
                </span>
              </div>
            </div>
            <Badge tone={item.color}>
              {item.color === "success" ? "En hausse" : item.color === "warning" ? "À surveiller" : "Stable"}
            </Badge>
          </GlassCard>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Breakdown */}
        <GlassCard raised className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Répartition des Revenus
            </h2>
            <DollarSign size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_BY_CATEGORY}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {REVENUE_BY_CATEGORY.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_REVENUE[index % COLORS_REVENUE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-panel)",
                    border: "1px solid var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value: any) => `${(value / 1000).toFixed(0)}K €`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Expense Breakdown */}
        <GlassCard raised className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Répartition des Dépenses
            </h2>
            <PieChartIcon size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={EXPENSE_BREAKDOWN}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {EXPENSE_BREAKDOWN.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--surface-panel)",
                    border: "1px solid var(--surface-panel-border)",
                    color: "var(--text-primary)",
                  }}
                  formatter={(value: any) => `${(value / 1000).toFixed(0)}K €`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Trend */}
      <GlassCard raised className="p-6">
        <h2 className="mb-6 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Tendance Mensuelle (Revenus vs Dépenses)
        </h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip
                contentStyle={{
                  background: "var(--surface-panel)",
                  border: "1px solid var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
                formatter={(value: any) => `${(value / 1000).toFixed(0)}K €`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenus"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ fill: "#22C55E", r: 4 }}
                name="Revenus"
              />
              <Line
                type="monotone"
                dataKey="depenses"
                stroke="#FF6B57"
                strokeWidth={2}
                dot={{ fill: "#FF6B57", r: 4 }}
                name="Dépenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Budget Tracking */}
      <GlassCard raised className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Suivi du Budget par Catégorie
          </h2>
          <Download size={16} style={{ color: "var(--accent)", cursor: "pointer" }} />
        </div>
        <div className="space-y-4">
          {BUDGET_ITEMS.map((item) => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  {item.category}
                </span>
                <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                  {item.percentage}%
                </span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "var(--surface-panel)" }}>
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    background: item.percentage > 95 ? "#FF6B57" : item.percentage > 85 ? "#F59E0B" : "#22C55E",
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                <span>{(item.spent / 1000).toFixed(0)}K € / {(item.allocated / 1000).toFixed(0)}K €</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Recent Transactions */}
      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Transactions Récentes
          </h2>
          <button
            className="text-xs font-semibold rounded px-3 py-1"
            style={{
              color: "var(--accent)",
              background: "var(--accent)",
              opacity: 0.1,
            }}
          >
            Voir tout
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  ID
                </th>
                <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Date
                </th>
                <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Description
                </th>
                <th className="py-3 text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Montant
                </th>
                <th className="py-3 text-center text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                    {tx.id}
                  </td>
                  <td className="py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                    {tx.date}
                  </td>
                  <td className="py-3 text-sm" style={{ color: "var(--text-primary)" }}>
                    {tx.description}
                  </td>
                  <td
                    className="py-3 text-right text-sm font-semibold"
                    style={{ color: tx.amount > 0 ? "#22C55E" : "#FF6B57" }}
                  >
                    {tx.amount > 0 ? "+" : ""}{(tx.amount / 1000).toFixed(1)}K €
                  </td>
                  <td className="py-3 text-center">
                    <Badge tone={tx.status === "Complété" ? "success" : "warning"}>
                      {tx.status}
                    </Badge>
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
