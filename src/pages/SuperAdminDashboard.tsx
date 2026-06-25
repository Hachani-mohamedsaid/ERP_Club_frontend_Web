import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
import { TrendingUp, Users, Globe, Sparkles, Zap, Loader2 } from "lucide-react";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

const COLORS = ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#FF7A00", "#F59E0B", "#06B6D4"];

function fmt(n: number) {
  return n.toLocaleString("fr-FR");
}

function fmtDt(n: number) {
  return `${fmt(n)} DT`;
}

export function SuperAdminDashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { data, loading, error, reload, refreshing } = usePlatformResource(
    () => platformApi.getMetrics(),
    [],
  );

  async function handleRefresh() {
    await reload();
    setLastUpdated(new Date());
  }

  useEffect(() => {
    if (data && lastUpdated === null) setLastUpdated(new Date());
  }, [data, lastUpdated]);

  if (loading && !data) {
    return (
      <SuperAdminPageTransition>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement des métriques plateforme…</p>
      </SuperAdminPageTransition>
    );
  }

  if (error || !data) {
    return (
      <SuperAdminPageTransition>
        {error && (
          <div className="space-y-3">
            <p className="text-sm text-red-400">{error}</p>
            {error.includes("prisma db push") && (
              <pre className="rounded-lg p-3 text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}>
                cd erp-club-backend{"\n"}npm run db:setup{"\n"}npm run start:dev
              </pre>
            )}
            <SuperAdminGhostButton onClick={handleRefresh}>Réessayer</SuperAdminGhostButton>
          </div>
        )}
      </SuperAdminPageTransition>
    );
  }

  const { kpis, charts, activityFeed } = data;
  const kpiCards = [
    { label: "Clubs", value: fmt(kpis.totalClubs), icon: Globe, color: "#3B82F6", trend: `+${kpis.newClubsThisMonth} ce mois` },
    { label: "Users", value: fmt(kpis.totalUsers), icon: Users, color: "#10B981", trend: `${fmt(kpis.activeUsers)} actifs` },
    { label: "Revenue", value: fmtDt(kpis.mrr), icon: TrendingUp, color: "#FF7A00", trend: "MRR" },
    { label: "Essais", value: fmt(kpis.trialSubscriptions), icon: Sparkles, color: "#8B5CF6", trend: `${kpis.trialClubs} clubs` },
  ];

  return (
    <SuperAdminPageTransition>
      <SuperAdminHero
        badge="SaaS Control Center"
        title="ODIN ERP Control Center"
        subtitle={
          lastUpdated
            ? `Vue globale plateforme — mis à jour à ${lastUpdated.toLocaleTimeString("fr-FR")}`
            : "Vue globale plateforme • Super Admin"
        }
        icon={Zap}
        action={
          <SuperAdminGhostButton onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 size={14} className="animate-spin" /> : null}
            {refreshing ? "Actualisation…" : "Rafraîchir"}
          </SuperAdminGhostButton>
        }
        stats={[
          { value: fmtDt(kpis.mrr), label: "MRR", color: "#FF7A00" },
          { value: fmtDt(kpis.arr), label: "ARR", color: "#3B82F6" },
          { value: `+${kpis.growthPct}%`, label: "Growth", color: "#10B981" },
          { value: `${kpis.retentionPct}%`, label: "Retention", color: "#8B5CF6" },
        ]}
      />

      {refreshing && (
        <div className="mb-4 h-0.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,122,0,0.15)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg,#FF7A00,#E66000)", width: "40%" }}
            initial={{ x: "-100%" }}
            animate={{ x: "250%" }}
            transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
      )}

      <div className={`space-y-6 ${refreshing ? "opacity-90 transition-opacity" : ""}`}>
      <SuperAdminKpiGrid>
        {kpiCards.map((item) => (
          <SuperAdminKpiCard key={item.label} {...item} />
        ))}
      </SuperAdminKpiGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <SuperAdminSection title="Clubs Growth" subtitle="Évolution des clubs actifs par mois." className="xl:col-span-2">
          <div className="min-h-[280px]">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts.clubsGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
              <Line type="monotone" dataKey="clubs" stroke="#FF7A00" strokeWidth={3} dot={{ r: 4, fill: "#FF7A00" }} />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </SuperAdminSection>

        <SuperAdminSection title="Users by Role" subtitle="Répartition des rôles sur la plateforme.">
          <div className="min-h-[280px]">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={charts.usersByRole} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={4}>
                {charts.usersByRole.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </SuperAdminSection>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SuperAdminSection title="Monthly Revenue" subtitle="Chiffre d'affaires mensuel en DT.">
          <div className="min-h-[300px]">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.revenueMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", borderColor: "rgba(255,122,0,0.3)" }} />
              <Bar dataKey="revenue" fill="#FF7A00" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </SuperAdminSection>

        <SuperAdminSection title="Activity Feed" subtitle="Dernières actions système.">
          <div className="space-y-3">
            {activityFeed.map((item) => (
              <SuperAdminListRow key={item}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item}</p>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>
      </div>
      </div>
    </SuperAdminPageTransition>
  );
}
