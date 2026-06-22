import { Button } from "../components/ui/Button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, CalendarDays, ArrowUpRight, BarChart3, Users, Percent, DollarSign } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminListRow } from "../components/superadmin";

const MONTHLY = [
  { month: "Jan", revenue: 12000 },
  { month: "Fév", revenue: 18000 },
  { month: "Mar", revenue: 23000 },
  { month: "Avr", revenue: 19500 },
  { month: "Mai", revenue: 22000 },
  { month: "Juin", revenue: 24500 },
];

const SIDE_METRICS = [
  { label: "MRR", value: "24 500 DT", change: "+12%", icon: ArrowUpRight },
  { label: "ARR", value: "285 000 DT", change: "+18%", icon: CalendarDays },
  { label: "Churn Rate", value: "3.2%", change: "-0.4%", icon: Percent, negative: true },
  { label: "Retention", value: "96.8%", change: "+0.6%", icon: Users },
  { label: "LTV", value: "4 200 DT", change: "+8%", icon: DollarSign },
  { label: "Growth", value: "+14%", change: "vs Q1", icon: TrendingUp },
];

export function SuperAdminRevenueAnalytics() {
  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Revenue Analytics"
        subtitle="MRR, ARR, churn, retention et prévisions."
        action={<SuperAdminGhostButton>Rafraîchir</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Monthly Revenue" value="24 500 DT" icon={TrendingUp} color="#FF7A00" />
        <SuperAdminKpiCard label="Annual Revenue" value="285 000 DT" icon={CalendarDays} color="#3B82F6" />
        <SuperAdminKpiCard label="MRR" value="24 500 DT" icon={ArrowUpRight} color="#10B981" />
        <SuperAdminKpiCard label="ARR" value="285 000 DT" icon={BarChart3} color="#8B5CF6" />
      </SuperAdminKpiGrid>

      <div className="grid gap-4 xl:grid-cols-[7fr_3fr]">
        <SuperAdminSection title="Revenue Trend" subtitle="Évolution mensuelle — focus chart 70%.">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart data={MONTHLY} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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

        <SuperAdminSection title="Key Metrics" subtitle="Side panel — style Stripe.">
          <div className="space-y-3">
            {SIDE_METRICS.map((m) => {
              const Icon = m.icon;
              const positive = !m.negative;
              return (
                <SuperAdminListRow key={m.label}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: "var(--text-muted)" }} />
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: positive ? "#22C55E" : "#EF4444" }}>{m.change}</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold" style={{ color: "var(--text-primary)" }}>{m.value}</p>
                </SuperAdminListRow>
              );
            })}
          </div>
        </SuperAdminSection>
      </div>
    </SuperAdminPageTransition>
  );
}
