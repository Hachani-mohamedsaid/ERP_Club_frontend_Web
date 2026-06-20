import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Trophy, TrendingUp, Users, Clock } from "lucide-react";

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

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B"];

export function SuperAdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Analytics Globales
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Indicateurs de performance SaaS et clubs.
          </p>
        </div>
        <Button variant="ghost">Exporter CSV</Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Top Clubs</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Classement par utilisateurs.</p>
            </div>
            <Trophy size={20} />
          </div>
          <div className="space-y-3">
            {TOP_CLUBS.map((club) => (
              <div key={club.club} className="flex items-center justify-between rounded-[var(--radius-odin-md)] border p-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <span style={{ color: "var(--text-primary)" }}>{club.club}</span>
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{club.users}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>User Roles</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Répartition par rôle.</p>
            </div>
            <Users size={20} />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={ROLES} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {ROLES.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revenue by Month</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Performance mensuelle.</p>
            </div>
            <TrendingUp size={20} />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={REVENUE_BY_MONTH} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Heatmap</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Activité journalière</p>
            </div>
            <Clock size={20} />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 28 }, (_, idx) => (
              <div key={idx} className="h-8 rounded" style={{ background: idx % 4 === 0 ? "#10B981" : idx % 3 === 0 ? "#F59E0B" : "#E5E7EB" }} />
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
