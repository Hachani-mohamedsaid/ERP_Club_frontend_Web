import { motion } from "framer-motion";
import { Activity, Users, AlertTriangle, Bandage, Bell, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { PREP_INFO, PREP_KPIS, TEAM_LOAD_7_DAYS, PREP_ALERTS, PREP_NOTIFICATIONS, AI_DASHBOARD_RECOMMENDATIONS } from "../../data/preparateurData";

const KPI_ICONS = [Users, Activity, AlertTriangle, Bandage];

export function PrepDashboard() {
  return (
    <PrepPageTransition>
      <motion.div
        className="rounded-[20px] border p-6"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(15,29,58,0.9) 100%)", borderColor: "rgba(255,255,255,0.05)" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bonjour {PREP_INFO.name}</p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Préparateur Physique</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{PREP_INFO.club} · Saison {PREP_INFO.season}</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {PREP_KPIS.map((kpi, i) => {
          const Icon = KPI_ICONS[i];
          return (
            <PrepKpiCard key={kpi.label} delay={i * 0.06}>
              <div className="flex items-center gap-2">
                <Icon size={18} style={{ color: kpi.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</span>
              </div>
              <p className="mt-3 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                <CountUpStat end={kpi.value} suffix={kpi.suffix} />
              </p>
            </PrepKpiCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PrepKpiCard delay={0.2} className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Charge Équipe — 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={TEAM_LOAD_7_DAYS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} domain={[40, 90]} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="load" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366F1" }} animationDuration={1000} name="Charge %" />
            </LineChart>
          </ResponsiveContainer>
        </PrepKpiCard>

        <PrepKpiCard delay={0.25} hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertes temps réel</h3>
            <Bell size={14} style={{ color: "#F59E0B" }} />
          </div>
          <div className="space-y-2">
            {PREP_ALERTS.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-xl border px-3 py-2.5"
                style={{
                  borderColor: alert.severity === "critical" ? "rgba(239,68,68,0.3)" : alert.severity === "warning" ? "rgba(245,158,11,0.3)" : "rgba(99,102,241,0.3)",
                  background: alert.severity === "critical" ? "rgba(239,68,68,0.08)" : alert.severity === "warning" ? "rgba(245,158,11,0.08)" : "rgba(99,102,241,0.08)",
                }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{alert.player}</p>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{alert.time}</span>
                </div>
                <p className="text-xs" style={{ color: alert.severity === "critical" ? "#EF4444" : alert.severity === "warning" ? "#F59E0B" : "#6366F1" }}>
                  {alert.message}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <p className="mb-2 text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Notifications</p>
            {PREP_NOTIFICATIONS.slice(0, 2).map((n) => (
              <p key={n.id} className="text-xs" style={{ color: n.unread ? "var(--text-secondary)" : "var(--text-muted)" }}>
                {n.unread && "● "}{n.title} — {n.message}
              </p>
            ))}
          </div>
        </PrepKpiCard>
      </div>

      <PrepKpiCard delay={0.3}>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} style={{ color: "#6366F1" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recommandation IA</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {AI_DASHBOARD_RECOMMENDATIONS.map((rec, i) => (
            <motion.div
              key={rec}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.1 }}
              className="rounded-xl border px-3 py-2.5 text-xs"
              style={{ borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.08)", color: "var(--text-secondary)" }}
            >
              {rec}
            </motion.div>
          ))}
        </div>
      </PrepKpiCard>
    </PrepPageTransition>
  );
}
