import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { TrendingUp, Users, Globe, Sparkles } from "lucide-react";

const KPI_CARDS = [
  { label: "Clubs Actifs", value: "125", icon: Globe, color: "#3B82F6" },
  { label: "Utilisateurs", value: "4 580", icon: Users, color: "#10B981" },
  { label: "Revenus SaaS", value: "245 000 DT", icon: TrendingUp, color: "#EF4444" },
  { label: "Croissance", value: "+12%", icon: Sparkles, color: "#8B5CF6" },
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

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#F59E0B"];

export function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Bonjour Admin 👋</p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Vue globale de ODIN ERP
          </h1>
        </div>
        <Button variant="ghost">Voir rapport complet</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {KPI_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <GlassCard className="p-5 hover:-translate-y-1 transition-transform">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                    <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-odin-md)]" style={{ background: `${item.color}20` }}>
                    <Icon size={20} color={item.color} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Clubs Growth</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Évolution des clubs actifs par mois.</p>
            </div>
            <Button variant="ghost">Détails</Button>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={CLUBS_GROWTH} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Line type="monotone" dataKey="clubs" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Users by Role</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Répartition des rôles sur la plateforme.</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={USERS_BY_ROLE} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {USERS_BY_ROLE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Monthly Revenue</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Chiffre d'affaires mensuel en DT.</p>
            </div>
            <Button variant="ghost">Exporter</Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={REVENUE_MONTHLY} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" />
              <Tooltip contentStyle={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }} />
              <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Activity Feed</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Dernières actions système.</p>
          </div>
          <div className="space-y-3">
            {ACTIVITY_FEED.map((item) => (
              <div key={item} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
