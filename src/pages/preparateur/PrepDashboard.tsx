import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity, Users, AlertTriangle, Bandage, Bell, Sparkles } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { clubApi } from "../../lib/api/club";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  user: { name: string; club: string; season: string };
  kpis: { disponibles: number; avgLoad: number; fatigueHigh: number; riskCount: number };
  loadHistory: { day: string; load: number }[];
  alerts: { id: string; player: string; message: string; severity: "critical" | "warning" | "info"; time: string }[];
  aiRecommendations: string[];
}

const KPI_CONFIG = [
  { key: "disponibles" as const, label: "Joueurs disponibles", suffix: "", color: "#22C55E", Icon: Users },
  { key: "avgLoad" as const, label: "Charge moyenne", suffix: "%", color: "#6366F1", Icon: Activity },
  { key: "fatigueHigh" as const, label: "Fatigue élevée", suffix: " joueurs", color: "#F59E0B", Icon: AlertTriangle },
  { key: "riskCount" as const, label: "Risque blessure", suffix: " joueurs", color: "#EF4444", Icon: Bandage },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-[20px]" style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-72 rounded-2xl lg:col-span-2" style={{ background: "rgba(255,255,255,0.04)" }} />
        <div className="h-72 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PrepDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (clubApi.getPreparateurDashboard() as Promise<DashboardData>)
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PrepPageTransition><DashboardSkeleton /></PrepPageTransition>;
  if (!data) return null;

  const { user, kpis, loadHistory, alerts, aiRecommendations } = data;

  return (
    <PrepPageTransition>
      {/* Header */}
      <motion.div
        className="rounded-[20px] border p-6"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(15,29,58,0.9) 100%)", borderColor: "rgba(255,255,255,0.05)" }}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bonjour {user.name}</p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Préparateur Physique</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user.club} · Saison {user.season}</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CONFIG.map(({ key, label, suffix, color, Icon }, i) => (
          <PrepKpiCard key={key} delay={i * 0.06}>
            <div className="flex items-center gap-2">
              <Icon size={18} style={{ color }} />
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
            </div>
            <p className="mt-3 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              <CountUpStat end={kpis[key]} suffix={suffix} />
            </p>
          </PrepKpiCard>
        ))}
      </div>

      {/* Graphique + Alertes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <PrepKpiCard delay={0.2} className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Charge Équipe — 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={loadHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }}
                formatter={(v: number) => [`${v}%`, "Charge"]}
              />
              <Line
                type="monotone"
                dataKey="load"
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#6366F1" }}
                animationDuration={1000}
                name="Charge %"
              />
            </LineChart>
          </ResponsiveContainer>
        </PrepKpiCard>

        <PrepKpiCard delay={0.25} hover={false}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertes temps réel</h3>
            <Bell size={14} style={{ color: "#F59E0B" }} />
          </div>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(34,197,94,0.1)" }}>
                <Activity size={18} style={{ color: "#22C55E" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "#22C55E" }}>Équipe en bonne forme</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Aucune alerte active</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert, i) => (
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
          )}
        </PrepKpiCard>
      </div>

      {/* Recommandations IA */}
      <PrepKpiCard delay={0.3}>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} style={{ color: "#6366F1" }} />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recommandation IA</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {aiRecommendations.map((rec, i) => (
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
