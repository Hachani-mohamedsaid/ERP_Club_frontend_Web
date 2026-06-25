import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, AlertCircle, Zap } from "lucide-react";

interface Forecast {
  month: string;
  revenus: number;
  depenses: number;
  beneficeEstime: number;
}

const FORECAST_DATA: Forecast[] = [
  { month: "Jul", revenus: 850000, depenses: 650000, beneficeEstime: 200000 },
  { month: "Aou", revenus: 920000, depenses: 700000, beneficeEstime: 220000 },
  { month: "Sep", revenus: 880000, depenses: 720000, beneficeEstime: 160000 },
  { month: "Oct", revenus: 950000, depenses: 750000, beneficeEstime: 200000 },
  { month: "Nov", revenus: 1050000, depenses: 800000, beneficeEstime: 250000 },
  { month: "Dec", revenus: 1200000, depenses: 900000, beneficeEstime: 300000 },
];

const BUDGET_SCENARIOS = [
  {
    nom: "Scénario Optimiste",
    description: "Recruitement de 2 joueurs + nouveau sponsor",
    impact: "+450K DT",
    couleur: "#10B981",
  },
  {
    nom: "Scénario Réaliste",
    description: "Evolution actuelle avec ajustements mineurs",
    impact: "+180K DT",
    couleur: "#3B82F6",
  },
  {
    nom: "Scénario Prudent",
    description: "Réduction dépenses, renouvellement minimal",
    impact: "-120K DT",
    couleur: "#F59E0B",
  },
];

const RECRUITMENT_BUDGET = [
  { name: "Joueurs Seniors", available: 2500000, reserved: 1500000 },
  { name: "Jeunes Talents", available: 800000, reserved: 350000 },
  { name: "Staff Technique", available: 500000, reserved: 200000 },
];

export function PrévisionsFinance() {
  const totalForecast = FORECAST_DATA.reduce((sum, f) => sum + f.beneficeEstime, 0);
  const avgMonthlyBenefit = totalForecast / FORECAST_DATA.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Prévisions Budgétaires
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Projection financière et planification budgétaire 6 mois
        </p>
      </div>

      {/* KPI Forecast */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Bénéfice Estimé (6 mois)
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-success)" }}>
                {(totalForecast / 1000000).toFixed(2)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-state-success)" }}>
                ↑ 15% vs 6 mois précédents
              </p>
            </div>
            <TrendingUp size={24} style={{ color: "var(--color-state-success)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Bénéfice Mensuel Moyen
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--accent)" }}>
                {(avgMonthlyBenefit / 1000).toFixed(0)} K DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Moyenne prévue
              </p>
            </div>
            <Zap size={24} style={{ color: "var(--accent)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Budget Recrutement
              </p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-warning)" }}>
                2.05 M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                Disponible pour recrutement
              </p>
            </div>
            <AlertCircle size={24} style={{ color: "var(--color-state-warning)" }} />
          </div>
        </GlassCard>
      </div>

      {/* Forecast Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            📈 Projection Revenus vs Dépenses
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={FORECAST_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
                labelStyle={{ color: "var(--text-primary)" }}
              />
              <Legend />
              <Bar dataKey="revenus" fill="#10B981" name="Revenus Prévus (DT)" />
              <Bar dataKey="depenses" fill="#EF4444" name="Dépenses Prévues (DT)" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            💰 Évolution Bénéfice Estimé
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={FORECAST_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip 
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
                labelStyle={{ color: "var(--text-primary)" }}
              />
              <Area 
                type="monotone" 
                dataKey="beneficeEstime" 
                fill="var(--accent)" 
                stroke="var(--accent)"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* Budget Recrutement */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          🎯 Budget Recrutement Disponible
        </h2>
        <div className="space-y-4">
          {RECRUITMENT_BUDGET.map((item) => (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {item.name}
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  {((item.available - item.reserved) / 1000).toFixed(0)}K disponible
                </span>
              </div>
              <div className="relative h-3 rounded-full" style={{ background: "var(--surface-panel)" }}>
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
                  style={{
                    background: "var(--accent)",
                    width: `${((item.available - item.reserved) / item.available) * 100}%`,
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

      {/* Scénarios */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          📊 Scénarios Budgétaires
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {BUDGET_SCENARIOS.map((scenario) => (
            <GlassCard key={scenario.nom} raised className="p-6">
              <div className="mb-2 h-1 w-12 rounded-full" style={{ background: scenario.couleur }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {scenario.nom}
              </h3>
              <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                {scenario.description}
              </p>
              <p className="mt-4 text-lg font-bold" style={{ color: scenario.couleur }}>
                {scenario.impact}
              </p>
              <Button variant="ghost" className="mt-4 w-full">
                Voir détails
              </Button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Notes & Actions */}
      <GlassCard raised className="p-6" style={{ borderLeft: "3px solid var(--accent)" }}>
        <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          📌 Notes Importantes
        </h2>
        <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <li>• Les prévisions sont basées sur les performances des 6 derniers mois</li>
          <li>• Hypothèse de stabilité des contrats sponsors existants</li>
          <li>• Impact du recrutement inclus dans le scénario optimiste</li>
          <li>• À réviser mensuellement basé sur les résultats réels</li>
        </ul>
      </GlassCard>
    </div>
  );
}
