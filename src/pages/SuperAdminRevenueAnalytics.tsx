import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, CalendarDays, ArrowUpRight, BarChart3, Users, Percent, DollarSign } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminListRow } from "../components/superadmin";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

function fmtDt(n: number) {
  return `${n.toLocaleString("fr-FR")} DT`;
}

export function SuperAdminRevenueAnalytics() {
  const { data, reload } = usePlatformResource(() => platformApi.getMetrics(), []);
  const kpis = data?.kpis;
  const monthly = data?.charts.revenueMonthly ?? [];

  const sideMetrics = kpis
    ? [
        { label: "MRR", value: fmtDt(kpis.mrr), change: `+${kpis.growthPct}%`, icon: ArrowUpRight },
        { label: "ARR", value: fmtDt(kpis.arr), change: `+${kpis.growthPct}%`, icon: CalendarDays },
        { label: "Essais actifs", value: String(kpis.trialSubscriptions), change: `${kpis.trialClubs} clubs`, icon: Percent },
        { label: "Retention", value: `${kpis.retentionPct}%`, change: "plateforme", icon: Users },
        { label: "Revenu mois", value: fmtDt(kpis.revenueMonth), change: "payé", icon: DollarSign },
        { label: "Abonnements", value: String(kpis.activeSubscriptions), change: "actifs", icon: TrendingUp },
      ]
    : [];

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Revenue Analytics"
        subtitle="MRR, ARR, churn, retention et prévisions."
        action={<SuperAdminGhostButton onClick={reload}>Rafraîchir</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Monthly Revenue" value={fmtDt(kpis?.revenueMonth ?? 0)} icon={TrendingUp} color="#FF7A00" />
        <SuperAdminKpiCard label="Annual Revenue" value={fmtDt(kpis?.arr ?? 0)} icon={CalendarDays} color="#3B82F6" />
        <SuperAdminKpiCard label="MRR" value={fmtDt(kpis?.mrr ?? 0)} icon={ArrowUpRight} color="#10B981" />
        <SuperAdminKpiCard label="ARR" value={fmtDt(kpis?.arr ?? 0)} icon={BarChart3} color="#8B5CF6" />
      </SuperAdminKpiGrid>

      <div className="grid gap-4 xl:grid-cols-[7fr_3fr]">
        <SuperAdminSection title="Revenue Trend" subtitle="Évolution mensuelle — focus chart 70%.">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={monthly} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revStripe" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }}
                formatter={(value: number) => [`${value.toLocaleString()} DT`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#FF7A00" strokeWidth={2.5} fill="url(#revStripe)" />
            </AreaChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Key Metrics" subtitle="Side panel — style Stripe">
          <div className="space-y-3">
            {sideMetrics.map((m) => (
              <SuperAdminListRow key={m.label}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <m.icon size={14} style={{ color: "#FF7A00" }} />
                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>{m.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{m.value}</p>
                    <p className="text-xs text-emerald-400">{m.change}</p>
                  </div>
                </div>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>
      </div>
    </SuperAdminPageTransition>
  );
}
