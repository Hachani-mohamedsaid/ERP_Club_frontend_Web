import { motion } from "framer-motion";
import { Users, UserCog, Wallet, Banknote, Bandage, FileWarning, Sparkles, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import {
  CLUB_INFO, DASHBOARD_KPIS, BUDGET_CHART, CLUB_ALERTS, AI_DASHBOARD_SUMMARY,
} from "../../data/clubAdminData";

const KPI_ICONS = { users: Users, staff: UserCog, budget: Wallet, salary: Banknote, injured: Bandage, contract: FileWarning };

export function ClubDashboard() {
  return (
    <ClubPageTransition>
      {/* Hero */}
      <motion.div
        className="relative overflow-hidden rounded-[20px] border p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(255,107,87,0.15) 0%, rgba(15,29,58,0.9) 50%, #070B1F 100%)",
          borderColor: "rgba(255,255,255,0.05)",
          backgroundSize: "200% 200%",
          animation: "gradientMove 8s ease infinite",
        }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <style>{`@keyframes gradientMove { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Bonjour {CLUB_INFO.adminName}</p>
            <h1 className="text-2xl font-bold lg:text-3xl" style={{ color: "var(--text-primary)" }}>{CLUB_INFO.name}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Saison {CLUB_INFO.season}</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold" style={{ background: "rgba(255,107,87,0.2)", color: "#FF6B57" }}>
            {CLUB_INFO.logo}
          </div>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {DASHBOARD_KPIS.map((kpi, i) => {
          const Icon = KPI_ICONS[kpi.icon];
          return (
            <ClubKpiCard key={kpi.label} delay={i * 0.05}>
              <div className="flex items-center gap-2">
                <Icon size={16} style={{ color: kpi.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</span>
              </div>
              <p className="mt-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                <CountUpStat end={kpi.value} suffix={kpi.suffix ?? ""} prefix={kpi.prefix ?? ""} />
              </p>
            </ClubKpiCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Budget Chart */}
        <ClubKpiCard className="lg:col-span-2" delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Budget — Jan → Déc</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={BUDGET_CHART}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="budget" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} animationDuration={1000} name="Budget" />
              <Line type="monotone" dataKey="spent" stroke="#FF6B57" strokeWidth={2} dot={{ r: 3 }} animationDuration={1000} name="Dépenses" />
            </LineChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        {/* Alerts */}
        <ClubKpiCard delay={0.2}>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={16} style={{ color: "#F59E0B" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertes</h3>
          </div>
          <div className="space-y-3">
            {CLUB_ALERTS.map((alert) => (
              <div
                key={alert.text}
                className="rounded-xl border px-3 py-2.5 text-xs"
                style={{
                  borderColor: alert.type === "danger" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)",
                  background: alert.type === "danger" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
                  color: alert.type === "danger" ? "#EF4444" : "#F59E0B",
                }}
              >
                ⚠ {alert.text}
              </div>
            ))}
          </div>
        </ClubKpiCard>
      </div>

      {/* AI Summary */}
      <ClubKpiCard delay={0.25}>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} style={{ color: "#FF6B57" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Résumé IA</h3>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {AI_DASHBOARD_SUMMARY.map((line) => (
            <p key={line} className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "rgba(255,255,255,0.05)", color: "var(--text-secondary)" }}>
              {line}
            </p>
          ))}
        </div>
      </ClubKpiCard>
    </ClubPageTransition>
  );
}
