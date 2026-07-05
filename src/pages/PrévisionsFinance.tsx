import { GlassCard } from "../components/ui/GlassCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, AlertCircle, Zap, RefreshCw } from "lucide-react";
import { useFinanceBackendData } from "../hooks/useFinanceBackendData";

const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function buildHistoricalMonthly(history: { date: string; amount: number; entryType: string }[]) {
  const map = new Map<string, { revenus: number; depenses: number; sortKey: string }>();
  for (const h of history) {
    const parts = h.date.split("/");
    if (parts.length !== 3) continue;
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const prev = map.get(sortKey) ?? { revenus: 0, depenses: 0, sortKey };
    if (h.entryType === "REVENUE") prev.revenus += Math.abs(h.amount);
    else prev.depenses += Math.abs(h.amount);
    map.set(sortKey, prev);
  }
  return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(-6);
}

function projectForecast(history: { date: string; amount: number; entryType: string }[]) {
  const historical = buildHistoricalMonthly(history);
  if (historical.length === 0) return [];

  const avgRevenue = historical.reduce((s, m) => s + m.revenus, 0) / historical.length;
  const avgExpenses = historical.reduce((s, m) => s + m.depenses, 0) / historical.length;
  const now = new Date();

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    const month = monthLabels[d.getMonth()] ?? "—";
    const revenus = Math.round(avgRevenue);
    const depenses = Math.round(avgExpenses);
    return { month, revenus, depenses, beneficeEstime: revenus - depenses };
  });
}

export function PrévisionsFinance() {
  const { history, kpis, contracts, transfers, loading } = useFinanceBackendData();

  const forecastData = projectForecast(history);
  const totalForecast = forecastData.reduce((sum, f) => sum + f.beneficeEstime, 0);
  const avgMonthlyBenefit = forecastData.length ? totalForecast / forecastData.length : 0;

  const transferBudget = transfers.reduce((s, t) => s + (t.fee ?? 0), 0);
  const salaryBudget = (contracts?.totalMonthlySalary ?? 0) * 12;
  const availableBudget = Math.max(0, (kpis?.budget ?? 0) - (kpis?.expenses ?? 0));

  const recruitmentLines = [
    { name: "Contrats joueurs", available: salaryBudget || availableBudget, reserved: salaryBudget * 0.6 },
    { name: "Transferts", available: Math.max(transferBudget, availableBudget * 0.3), reserved: transferBudget },
    { name: "Budget libre", available: availableBudget, reserved: Math.min(availableBudget, (kpis?.expenses ?? 0) * 0.1) },
  ].filter((l) => l.available > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement des prévisions…</span>
      </div>
    );
  }

  const hasData = history.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Prévisions Budgétaires
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Projection basée sur l&apos;historique réel du club (6 derniers mois)
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bénéfice Estimé (6 mois)</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-success)" }}>
                {hasData ? `${(totalForecast / 1_000_000).toFixed(2)} M DT` : "—"}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {hasData ? "Moyenne historique projetée" : "Ajoutez des transactions"}
              </p>
            </div>
            <TrendingUp size={24} style={{ color: "var(--color-state-success)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bénéfice Mensuel Moyen</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--accent)" }}>
                {hasData ? `${(avgMonthlyBenefit / 1000).toFixed(0)} K DT` : "—"}
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Basé sur l&apos;historique</p>
            </div>
            <Zap size={24} style={{ color: "var(--accent)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Budget Disponible</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-warning)" }}>
                {(availableBudget / 1_000_000).toFixed(2)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Budget − dépenses</p>
            </div>
            <AlertCircle size={24} style={{ color: "var(--color-state-warning)" }} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            📈 Projection Revenus vs Dépenses
          </h2>
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }} />
                <Legend />
                <Bar dataKey="revenus" fill="#10B981" name="Revenus projetés (DT)" />
                <Bar dataKey="depenses" fill="#EF4444" name="Dépenses projetées (DT)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
              Pas assez de données historiques pour projeter
            </div>
          )}
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            💰 Évolution Bénéfice Estimé
          </h2>
          {forecastData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }} />
                <Area type="monotone" dataKey="beneficeEstime" fill="var(--accent)" stroke="var(--accent)" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
              Pas assez de données historiques pour projeter
            </div>
          )}
        </GlassCard>
      </div>

      {recruitmentLines.length > 0 && (
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🎯 Répartition Budgétaire
          </h2>
          <div className="space-y-4">
            {recruitmentLines.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</span>
                  <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                    {((item.available - item.reserved) / 1000).toFixed(0)}K disponible
                  </span>
                </div>
                <div className="relative h-3 rounded-full" style={{ background: "var(--surface-panel)" }}>
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                    style={{
                      background: "var(--accent)",
                      width: `${Math.min(100, ((item.available - item.reserved) / item.available) * 100)}%`,
                    }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>Réservé: {(item.reserved / 1000).toFixed(0)}K</span>
                  <span>Total: {(item.available / 1000).toFixed(0)}K</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard raised className="p-6" style={{ borderLeft: "3px solid var(--accent)" }}>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📌 Méthodologie</h2>
        <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <li>• Les prévisions sont calculées à partir de la moyenne des 6 derniers mois de transactions réelles</li>
          <li>• Les contrats, sponsors et factures alimentent le budget disponible affiché</li>
          <li>• Pour des scénarios avancés, utilisez l&apos;assistant IA Finance</li>
        </ul>
      </GlassCard>
    </div>
  );
}
