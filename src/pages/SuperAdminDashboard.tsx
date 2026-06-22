import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  SuperAdminPageTransition,
  SuperAdminHero,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminListRow,
  SuperAdminGhostButton,
} from "../components/superadmin";
import { TrendingUp, Users, Globe, Sparkles, Zap } from "lucide-react";

const KPI_CARDS = [
  { label: "Clubs", value: "125", icon: Globe, color: "#3B82F6", trend: "+8 ce mois" },
  { label: "Users", value: "4 580", icon: Users, color: "#10B981", trend: "+120 actifs" },
  { label: "Revenue", value: "245 000 DT", icon: TrendingUp, color: "#FF7A00", trend: "+12% MRR" },
  { label: "Growth", value: "+12%", icon: Sparkles, color: "#8B5CF6", trend: "vs trimestre" },
];

const CLUBS_GROWTH = [
  { month: "Jan", clubs: 90 },
  { month: "Fév", clubs: 95 },
  { month: "Mar", clubs: 105 },
  { month: "Avr", clubs: 112 },
  { month: "Mai", clubs: 118 },
  { month: "Juin", clubs: 125 },
];

const REVENUE_MONTHLY = [
  { month: "Jan", revenue: 12000 },
  { month: "Fév", revenue: 18000 },
  { month: "Mar", revenue: 23000 },
  { month: "Avr", revenue: 19500 },
  { month: "Mai", revenue: 22000 },
  { month: "Juin", revenue: 24500 },
];

const USERS_BY_ROLE = [
  { name: "Responsable Club", value: 2200 },
  { name: "Scout", value: 900 },
  { name: "Coach", value: 800 },
  { name: "Finance", value: 400 },
  { name: "Médecin", value: 280 },
];

const ACTIVITY_FEED = [
  "FC Carthage créé",
  "5 nouveaux utilisateurs",
  "2 abonnements expirés",
  "3 tickets ouverts",
];

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#FF7A00"];

export function SuperAdminDashboard() {
  return (
    <SuperAdminPageTransition>
      <SuperAdminHero
        badge="SaaS Control Center"
        title="ODIN ERP Control Center"
        subtitle="Vue globale plateforme • Super Admin"
        icon={Zap}
        action={<SuperAdminGhostButton>Voir rapport complet</SuperAdminGhostButton>}
        stats={[
          { value: "245 000 DT", label: "MRR", color: "#FF7A00" },
          { value: "2.94M DT", label: "ARR", color: "#3B82F6" },
          { value: "+12%", label: "Growth", color: "#10B981" },
          { value: "96.8%", label: "Retention", color: "#8B5CF6" },
        ]}
      />

      <SuperAdminKpiGrid>
        {KPI_CARDS.map((item, i) => (
          <SuperAdminKpiCard key={item.label} {...item} delay={i * 0.08} />
        ))}
      </SuperAdminKpiGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SuperAdminSection title="Clubs Growth" subtitle="Évolution des clubs actifs par mois." className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={CLUBS_GROWTH}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
              <Line type="monotone" dataKey="clubs" stroke="#FF7A00" strokeWidth={3} dot={{ r: 4, fill: "#FF7A00" }} />
            </LineChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Users by Role" subtitle="Répartition des rôles sur la plateforme.">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={USERS_BY_ROLE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {USERS_BY_ROLE.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
            </PieChart>
          </ResponsiveContainer>
        </SuperAdminSection>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SuperAdminSection title="Monthly Revenue" subtitle="Chiffre d'affaires mensuel en DT.">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={REVENUE_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
              <Bar dataKey="revenue" fill="#FF7A00" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SuperAdminSection>

        <SuperAdminSection title="Activity Feed" subtitle="Dernières actions système.">
          <div className="space-y-3">
            {ACTIVITY_FEED.map((item) => (
              <SuperAdminListRow key={item}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item}</p>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>
      </div>
    </SuperAdminPageTransition>
  );
}
