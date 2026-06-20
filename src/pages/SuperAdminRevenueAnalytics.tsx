import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, CalendarDays, ArrowUpRight, BarChart3 } from "lucide-react";

const MONTHLY = [
  { month: "Jan", revenue: 12000, churn: 5 },
  { month: "Fév", revenue: 18000, churn: 4 },
  { month: "Mar", revenue: 23000, churn: 3.8 },
  { month: "Avr", revenue: 19500, churn: 4.2 },
  { month: "Mai", revenue: 22000, churn: 3.5 },
  { month: "Juin", revenue: 24500, churn: 3.2 },
];

export function SuperAdminRevenueAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Revenue Analytics
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            MRR, ARR, churn, retention et prévisions.
          </p>
        </div>
        <Button variant="ghost">Rafraîchir</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Monthly Revenue", value: "24 500 DT", icon: TrendingUp },
          { label: "Annual Revenue", value: "285 000 DT", icon: CalendarDays },
          { label: "MRR", value: "24 500 DT", icon: ArrowUpRight },
          { label: "ARR", value: "285 000 DT", icon: BarChart3 },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <GlassCard raised key={metric.label} className="p-5">
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{metric.value}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Trend Area Chart</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Revenue mensuel et forecasts.</p>
            </div>
            <TrendingUp size={20} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={MONTHLY} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Stacked Chart</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Revenue vs churn par mois.</p>
            </div>
            <BarChart3 size={20} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MONTHLY} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Forecast Chart</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Prévision revenue et churn.</p>
          </div>
          <CalendarDays size={20} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <GlassCard className="p-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Churn Rate</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>3.2%</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Retention Rate</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>96.8%</p>
          </GlassCard>
        </div>
      </GlassCard>
    </div>
  );
}
