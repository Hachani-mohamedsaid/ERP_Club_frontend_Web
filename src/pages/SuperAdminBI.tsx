import { Button } from "../components/ui/Button";
import { TrendingUp, BarChart3, Sparkles, Compass } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminListRow } from "../components/superadmin";

const FORECAST = [
  { month: "Jul", actual: 245, forecast: 260 },
  { month: "Aoû", actual: null, forecast: 278 },
  { month: "Sep", actual: null, forecast: 295 },
  { month: "Oct", actual: null, forecast: 312 },
  { month: "Nov", actual: null, forecast: 330 },
  { month: "Déc", actual: null, forecast: 348 },
];

const RISK_CLUBS = [
  { club: "CS Sfaxien", risk: 82 },
  { club: "US Monastir", risk: 65 },
  { club: "ES Sahel", risk: 48 },
  { club: "FC Carthage", risk: 22 },
];

const CHURN = [
  { month: "Jan", churn: 5.2, retention: 94.8 },
  { month: "Fév", churn: 4.8, retention: 95.2 },
  { month: "Mar", churn: 4.1, retention: 95.9 },
  { month: "Avr", churn: 3.9, retention: 96.1 },
  { month: "Mai", churn: 3.5, retention: 96.5 },
  { month: "Juin", churn: 3.2, retention: 96.8 },
];

export function SuperAdminBI() {
  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Business Intelligence"
        subtitle="Prévisions IA, recommandations et risk-scoring pour ODIN ERP."
        action={<SuperAdminGhostButton>Tendance 6 mois</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Prediction revenus" value="+18%" icon={TrendingUp} color="#FF7A00" />
        <SuperAdminKpiCard label="Top clubs croissance" value="8" icon={BarChart3} color="#3B82F6" />
        <SuperAdminKpiCard label="Clubs à risque" value="3" icon={Sparkles} color="#EF4444" />
        <SuperAdminKpiCard label="Forecast 6 mois" value="+24%" icon={Compass} color="#10B981" />
      </SuperAdminKpiGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <SuperAdminSection title="Forecast Line Chart" subtitle="Revenus actuels vs projection IA (k DT).">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={FORECAST}>
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
            <BarChart data={RISK_CLUBS} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
              <YAxis dataKey="club" type="category" stroke="var(--text-muted)" fontSize={10} width={90} />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Bar dataKey="risk" fill="#EF4444" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Revenue Projection" subtitle="Projection revenus 6 mois.">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={FORECAST}>
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
            <LineChart data={CHURN}>
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
          {["Renforcer plan Enterprise", "Relancer clubs inactifs", "Créer une offre Premium locale"].map((item) => (
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
