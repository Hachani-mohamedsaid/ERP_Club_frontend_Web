import { TrendingUp, BarChart3, Sparkles, Compass } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminListRow } from "../components/superadmin";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

export function SuperAdminBI() {
  const { data, loading, error, reload } = usePlatformResource(() => platformApi.getBi(), []);

  if (loading && !data) {
    return (
      <SuperAdminPageTransition>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement BI…</p>
      </SuperAdminPageTransition>
    );
  }

  if (error || !data) {
    return (
      <SuperAdminPageTransition>
        <p className="text-sm text-red-400">{error ?? "Erreur BI"}</p>
        <SuperAdminGhostButton onClick={reload}>Réessayer</SuperAdminGhostButton>
      </SuperAdminPageTransition>
    );
  }

  const { kpis, forecast, riskClubs, churn, recommendations } = data as {
    kpis: { revenuePrediction: string; topGrowthClubs: number; clubsAtRisk: number; forecast6m: string };
    forecast: { month: string; actual: number | null; forecast: number }[];
    riskClubs: { club: string; risk: number }[];
    churn: { month: string; churn: number; retention: number }[];
    recommendations: string[];
  };

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Business Intelligence"
        subtitle="Prévisions IA, recommandations et risk-scoring pour ODIN ERP."
        action={<SuperAdminGhostButton onClick={reload}>Rafraîchir</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Prediction revenus" value={kpis.revenuePrediction} icon={TrendingUp} color="#FF7A00" />
        <SuperAdminKpiCard label="Top clubs croissance" value={String(kpis.topGrowthClubs)} icon={BarChart3} color="#3B82F6" />
        <SuperAdminKpiCard label="Clubs à risque" value={String(kpis.clubsAtRisk)} icon={Sparkles} color="#EF4444" />
        <SuperAdminKpiCard label="Forecast 6 mois" value={kpis.forecast6m} icon={Compass} color="#10B981" />
      </SuperAdminKpiGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <SuperAdminSection title="Forecast Line Chart" subtitle="Revenus actuels vs projection IA (k DT).">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Line type="monotone" dataKey="actual" stroke="#FF7A00" strokeWidth={2.5} name="Actuel" connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Prévision" />
            </LineChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Risk Clubs Chart" subtitle="Score de risque churn par club.">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={riskClubs} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} domain={[0, 100]} />
              <YAxis dataKey="club" type="category" stroke="var(--text-muted)" fontSize={10} width={90} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Bar dataKey="risk" fill="#EF4444" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Revenue Projection" subtitle="Projection revenus 6 mois.">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={forecast}>
              <defs>
                <linearGradient id="biRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Area type="monotone" dataKey="forecast" stroke="#FF7A00" fill="url(#biRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Churn Prediction" subtitle="Taux de churn vs retention.">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={churn}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Line type="monotone" dataKey="churn" stroke="#EF4444" strokeWidth={2} name="Churn %" />
              <Line type="monotone" dataKey="retention" stroke="#22C55E" strokeWidth={2} name="Retention %" />
            </LineChart>
          </ResponsiveContainer>
        </SuperAdminSection>
      </div>

      <SuperAdminSection title="Recommandations IA" subtitle="Actions suggérées par le moteur BI.">
        <div className="grid gap-3 sm:grid-cols-3">
          {recommendations.map((item) => (
            <SuperAdminListRow key={item}>
              <Sparkles size={16} style={{ color: "#FF7A00" }} />
              <p className="mt-2 text-sm" style={{ color: "var(--text-primary)" }}>{item}</p>
            </SuperAdminListRow>
          ))}
        </div>
      </SuperAdminSection>
    </SuperAdminPageTransition>
  );
}
