import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, Calendar } from "lucide-react";

interface MonthlyReport {
  month: string;
  revenus: number;
  depenses: number;
  benefice: number;
}

interface Report {
  id: string;
  periode: string;
  type: "Mensuel" | "Trimestriel" | "Annuel";
  status: "Généré" | "En cours" | "À générer";
  date: string;
}

const MONTHLY_DATA: MonthlyReport[] = [
  { month: "Jan", revenus: 450000, depenses: 380000, benefice: 70000 },
  { month: "Fev", revenus: 520000, depenses: 410000, benefice: 110000 },
  { month: "Mar", revenus: 650000, depenses: 490000, benefice: 160000 },
  { month: "Avr", revenus: 580000, depenses: 520000, benefice: 60000 },
  { month: "Mai", revenus: 720000, depenses: 550000, benefice: 170000 },
  { month: "Jun", revenus: 800000, depenses: 610000, benefice: 190000 },
];

const REPORTS: Report[] = [
  { id: "1", periode: "Juin 2026", type: "Mensuel", status: "Généré", date: "30/06/2026" },
  { id: "2", periode: "Mai 2026", type: "Mensuel", status: "Généré", date: "31/05/2026" },
  { id: "3", periode: "Q2 2026", type: "Trimestriel", status: "Généré", date: "30/06/2026" },
  { id: "4", periode: "Q1 2026", type: "Trimestriel", status: "Généré", date: "31/03/2026" },
  { id: "5", periode: "2025", type: "Annuel", status: "Généré", date: "31/12/2025" },
];

export function RapportsFinance() {
  const totalRevenus = MONTHLY_DATA.reduce((sum, m) => sum + m.revenus, 0);
  const totalDepenses = MONTHLY_DATA.reduce((sum, m) => sum + m.depenses, 0);
  const totalBenefice = totalRevenus - totalDepenses;

  const revenueDistribution = [
    { name: "Sponsors", value: 2100000, color: "#10B981" },
    { name: "Billetterie", value: 1200000, color: "#3B82F6" },
    { name: "Merchandising", value: 800000, color: "#F59E0B" },
    { name: "Droits TV", value: 600000, color: "#8B5CF6" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Rapports Financiers
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Analyse détaillée des périodes comptables
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Total Revenus
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-success)" }}>
                {(totalRevenus / 1000000).toFixed(1)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-state-success)" }}>
                ↑ 18%
              </p>
            </div>
            <TrendingUp size={24} style={{ color: "var(--color-state-success)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Total Dépenses
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-danger)" }}>
                {(totalDepenses / 1000000).toFixed(1)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                6 mois analysés
              </p>
            </div>
            <Calendar size={24} style={{ color: "var(--color-state-danger)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Bénéfice Net
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--accent)" }}>
                {(totalBenefice / 1000000).toFixed(1)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-state-success)" }}>
                ↑ 22%
              </p>
            </div>
            <TrendingUp size={24} style={{ color: "var(--accent)" }} />
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            📈 Revenus vs Dépenses (6 mois)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={MONTHLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
                labelStyle={{ color: "var(--text-primary)" }}
              />
              <Legend />
              <Bar dataKey="revenus" fill="#10B981" name="Revenus (DT)" />
              <Bar dataKey="depenses" fill="#EF4444" name="Dépenses (DT)" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            💰 Sources de Revenus
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {revenueDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
                formatter={(value) => `${(value / 1000000).toFixed(1)}M DT`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {revenueDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                </div>
                    <span style={{ color: "var(--text-primary)" }} className="font-semibold">
                      {((item.value / (totalRevenus || 1)) * 100).toFixed(0)}%
                    </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Bénéfice Mensuel */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          📊 Évolution Bénéfice Mensuel
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={MONTHLY_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip 
              contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
              labelStyle={{ color: "var(--text-primary)" }}
            />
            <Line 
              type="monotone" 
              dataKey="benefice" 
              stroke="var(--accent)" 
              strokeWidth={2}
              dot={{ fill: "var(--accent)", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Rapports Disponibles */}
      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            📋 Rapports Disponibles
          </h2>
          <Button variant="ghost" size="sm">
            Générer nouveau
          </Button>
        </div>
        <div className="space-y-3">
          {REPORTS.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {report.periode}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {report.type} • Généré le {report.date}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={report.status === "Généré" ? "success" : "warning"}>
                  {report.status}
                </Badge>
                <Button variant="ghost" className="flex items-center gap-1">
                  <Download size={16} />
                  Télécharger
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
