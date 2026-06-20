import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CASH_FLOW_DATA = [
  { month: "Jan", entrees: 1.5, sorties: 1.2 },
  { month: "Fev", entrees: 1.6, sorties: 1.35 },
  { month: "Mar", entrees: 1.8, sorties: 1.5 },
  { month: "Avr", entrees: 1.7, sorties: 1.4 },
  { month: "Mai", entrees: 1.9, sorties: 1.6 },
  { month: "Jun", entrees: 2.0, sorties: 1.7 },
];

const ALERTS = [
  { icon: "⚠️", message: "Budget transfert dépassé", severity: "error", color: "#EF4444" },
  { icon: "📄", message: "Facture retard", severity: "warning", color: "#F59E0B" },
  { icon: "📋", message: "Contrat expire dans 15 jours", severity: "warning", color: "#F59E0B" },
  { icon: "🤝", message: "Sponsor à renouveler", severity: "info", color: "#3B82F6" },
];

const KPI_CARDS = [
  { label: "Solde Actuel", value: "2.8 M DT", change: "+5%", icon: DollarSign, color: "#10B981" },
  { label: "Flux Entrant", value: "1.9 M DT", change: "+8%", icon: TrendingUp, color: "#3B82F6" },
  { label: "Flux Sortant", value: "1.6 M DT", change: "-3%", icon: TrendingDown, color: "#EF4444" },
  { label: "Solde Prévisionnel", value: "1.2 M DT", change: "+12%", icon: TrendingUp, color: "#8B5CF6" },
];

export function TresorerieFinance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Trésorerie & Cash Flow
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Suivi de la situation de trésorerie et des flux financiers
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

      {/* Cash Flow Chart */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          📊 Flux Financiers Mensuels
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={CASH_FLOW_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" label={{ value: "M DT", angle: -90, position: "insideLeft" }} />
            <Tooltip
              contentStyle={{
                background: "var(--surface-panel)",
                border: "1px solid var(--surface-panel-border)",
                color: "var(--text-primary)",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar dataKey="entrees" fill="#10B981" name="Entrées (M DT)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="sorties" fill="#EF4444" name="Sorties (M DT)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Alerts */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          🚨 Alertes Financières
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
