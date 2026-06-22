import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "../components/ui/Button";
import { Trophy, TrendingUp, Users, Clock } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminSection, SuperAdminListRow } from "../components/superadmin";

const TOP_CLUBS = [
  { club: "FC Carthage", users: 1200 },
  { club: "ES Sahel", users: 900 },
  { club: "CS Sfaxien", users: 760 },
  { club: "US Monastir", users: 540 },
];

const REVENUE_BY_MONTH = [
  { month: "Jan", revenue: 12000 },
  { month: "Fév", revenue: 18000 },
  { month: "Mar", revenue: 21000 },
  { month: "Avr", revenue: 24000 },
  { month: "Mai", revenue: 22500 },
  { month: "Juin", revenue: 24500 },
];

const ROLES = [
  { name: "Responsable Club", value: 32 },
  { name: "Scout", value: 24 },
  { name: "Coach", value: 22 },
  { name: "Finance", value: 14 },
  { name: "Médecin", value: 8 },
];

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#FF7A00"];

export function SuperAdminAnalytics() {
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
            {TOP_CLUBS.map((club) => (
              <SuperAdminListRow key={club.club}>
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--text-primary)" }}>{club.club}</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{club.users}</span>
                </div>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>

        <SuperAdminSection title="User Roles" subtitle="Répartition par rôle." icon={Users}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={ROLES} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {ROLES.map((_, index) => (
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
            <BarChart data={REVENUE_BY_MONTH} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
