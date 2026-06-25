import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Trophy, TrendingUp, Users, Clock } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminSection, SuperAdminListRow } from "../components/superadmin";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#FF7A00"];

export function SuperAdminAnalytics() {
  const { data: metrics } = usePlatformResource(() => platformApi.getMetrics(), []);
  const { data: orgs } = usePlatformResource(() => platformApi.getOrganizations(), []);

  const topClubs = [...(orgs ?? [])].sort((a, b) => b.users - a.users).slice(0, 5);
  const roles = metrics?.charts.usersByRole ?? [];
  const revenue = metrics?.charts.revenueMonthly ?? [];

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Analytics Globales"
        subtitle="Indicateurs de performance SaaS et clubs."
        action={<SuperAdminGhostButton>Exporter CSV</SuperAdminGhostButton>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SuperAdminSection title="Top Clubs" subtitle="Classement par utilisateurs." icon={Trophy}>
          <div className="space-y-3">
            {topClubs.map((club) => (
              <SuperAdminListRow key={club.id}>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-primary)" }}>{club.name}</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{club.users}</span>
                </div>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>

        <SuperAdminSection title="User Roles" subtitle="Répartition par rôle." icon={Users}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roles} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {roles.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </SuperAdminSection>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SuperAdminSection title="Revenue by Month" subtitle="Performance mensuelle." icon={TrendingUp} className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Bar dataKey="revenue" fill="#FF7A00" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Heatmap" subtitle="Activité journalière" icon={Clock}>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }, (_, idx) => (
              <div key={idx} className="h-8 rounded" style={{ background: idx % 4 === 0 ? "#10B981" : idx % 3 === 0 ? "#FF7A00" : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
        </SuperAdminSection>
      </div>
    </SuperAdminPageTransition>
  );
}
