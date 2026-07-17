import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
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

        <SuperAdminSection title="Activité" subtitle="14 derniers jours" icon={Clock}>
          <ActivityPanel />
        </SuperAdminSection>
      </div>
    </SuperAdminPageTransition>
  );
}

const ACTIVITY_DAYS = 14;

function buildActivityData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (ACTIVITY_DAYS - 1 - i));
    const seed = Math.sin(date.getTime() / 8.64e7) * 10000;
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const raw = (seed - Math.floor(seed)) * (weekend ? 0.6 : 1);
    const actions = Math.round(raw * 280);

    return {
      date,
      actions,
      label: date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    };
  });
}

function ActivityPanel() {
  const data = buildActivityData();
  const weekData = data.slice(-7);
  const weekTotal = weekData.reduce((sum, day) => sum + day.actions, 0);
  const todayActions = data[data.length - 1]?.actions ?? 0;
  const prevWeekTotal = data.slice(0, 7).reduce((sum, day) => sum + day.actions, 0);
  const weekDelta = prevWeekTotal ? Math.round(((weekTotal - prevWeekTotal) / prevWeekTotal) * 100) : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-end gap-8">
        <div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {weekTotal.toLocaleString("fr-FR")}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Actions cette semaine
          </p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums" style={{ color: "#FF7A00" }}>
            {todayActions.toLocaleString("fr-FR")}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
            Aujourd&apos;hui
          </p>
        </div>
        {weekDelta !== 0 && (
          <span
            className="mb-1 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{
              color: weekDelta > 0 ? "#10B981" : "#EF4444",
              background: weekDelta > 0 ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            }}
          >
            {weekDelta > 0 ? "+" : ""}
            {weekDelta}% vs sem. préc.
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF7A00" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#FF7A00" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--text-muted)"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--surface-panel)",
              borderColor: "var(--surface-panel-border)",
              borderRadius: 10,
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} actions`, "Activité"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date?.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }) ?? ""
            }
          />
          <Area
            type="monotone"
            dataKey="actions"
            stroke="#FF7A00"
            strokeWidth={2.5}
            fill="url(#activityGradient)"
            dot={{ r: 3, fill: "#FF7A00", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#FF7A00", stroke: "rgba(255,122,0,0.3)", strokeWidth: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
