import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useFinanceBackendData } from "../hooks/useFinanceBackendData";

export function TresorerieFinance() {
  const { report, history, loading, alerts } = useFinanceBackendData();

  const revenue = report?.kpis?.revenue ?? 0;
  const expenses = report?.kpis?.expenses ?? 0;
  const profit = report?.kpis?.profit ?? 0;

  // Build monthly cash-flow data from history (entries / sorties per month)
  const cashFlowData = (() => {
    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const map = new Map<string, { month: string; entrees: number; sorties: number; sortKey: string }>();
    for (const h of history) {
      const parts = h.date.split("/");
      if (parts.length !== 3) continue;
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const month = monthLabels[d.getMonth()] ?? "—";
      const prev = map.get(sortKey) ?? { month, entrees: 0, sorties: 0, sortKey };
      if (h.entryType === "REVENUE") prev.entrees += Math.abs(h.amount) / 1_000_000;
      else prev.sorties += Math.abs(h.amount) / 1_000_000;
      map.set(sortKey, prev);
    }
    return [...map.values()]
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
      .map(({ month, entrees, sorties }) => ({
        month,
        entrees: Math.round(entrees * 100) / 100,
        sorties: Math.round(sorties * 100) / 100,
      }));
  })();

  const kpiCards = [
    { label: "Solde Actuel", value: `${(profit / 1_000_000).toFixed(2)} M DT`, change: profit >= 0 ? "+positif" : "déficit", icon: DollarSign, color: profit >= 0 ? "#10B981" : "#EF4444" },
    { label: "Flux Entrant", value: `${(revenue / 1_000_000).toFixed(2)} M DT`, change: "+saison", icon: TrendingUp, color: "#3B82F6" },
    { label: "Flux Sortant", value: `${(expenses / 1_000_000).toFixed(2)} M DT`, change: "-saison", icon: TrendingDown, color: "#EF4444" },
    { label: "Solde Prévisionnel", value: `${((profit * 1.05) / 1_000_000).toFixed(2)} M DT`, change: "+5% estimé", icon: TrendingUp, color: "#8B5CF6" },
  ];

  const financialAlerts = alerts.length > 0
    ? alerts
    : [
        { icon: "📊", message: "Toutes les données financières sont à jour", severity: "info" },
      ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement de la trésorerie…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Trésorerie & Cash Flow</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Suivi de la situation de trésorerie et des flux financiers</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
                  <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: kpi.color }}>{kpi.change}</p>
                </div>
                <Icon size={20} style={{ color: kpi.color, opacity: 0.6 }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Cash Flow Chart */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📊 Flux Financiers Mensuels</h2>
        {cashFlowData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" label={{ value: "M DT", angle: -90, position: "insideLeft" }} />
              <Tooltip
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", color: "var(--text-primary)", borderRadius: "8px" }}
                formatter={(v) => [`${Number(v).toFixed(2)} M DT`]}
              />
              <Legend />
              <Bar dataKey="entrees" fill="#10B981" name="Entrées (M DT)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="sorties" fill="#EF4444" name="Sorties (M DT)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
            Aucune donnée mensuelle disponible
          </div>
        )}
      </GlassCard>

      {/* Alerts */}
      <div>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>🚨 Alertes Financières</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {financialAlerts.map((alert, idx) => (
            <GlassCard key={idx} className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">{alert.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{alert.message}</p>
                  <Badge tone={alert.severity === "error" ? "danger" : alert.severity === "warning" ? "warning" : "info"}>
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
