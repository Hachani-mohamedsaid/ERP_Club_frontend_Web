import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import { Flame, Radar, Star, Handshake, Wallet, ArrowUpRight, Sparkles } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { ParticlesField } from "../../components/recruteur/ParticlesField";
import { CountUpStat } from "../../components/player/CountUpStat";
import {
  RECRUTEUR_INFO, RECRUTEUR_KPIS, VALUE_EVOLUTION, POSITION_DISTRIBUTION,
  AGE_DISTRIBUTION, COUNTRY_DISTRIBUTION, AI_TALENT_ALERTS,
} from "../../data/recruteurData";

const KPI_ICONS = [Radar, Star, Handshake, Wallet];

export function RecruteurDashboard() {
  const navigate = useNavigate();

  return (
    <RecruteurPageTransition>
      <div
        className="relative overflow-hidden rounded-[24px] border p-6"
        style={{ background: "linear-gradient(135deg, rgba(15,29,58,0.95), rgba(40,15,60,0.85))", borderColor: "rgba(139,92,246,0.25)" }}
      >
        <ParticlesField count={26} />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={18} style={{ color: "#A855F7" }} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#A855F7" }}>Recruitment Intelligence Center</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{RECRUTEUR_INFO.name}</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{RECRUTEUR_INFO.role} • {RECRUTEUR_INFO.club} • Saison {RECRUTEUR_INFO.season}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/recruteur/discovery")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}
          >
            <Radar size={16} /> Explorer les talents
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {RECRUTEUR_KPIS.map((kpi, i) => {
          const Icon = KPI_ICONS[i];
          return (
            <RecruteurKpiCard key={kpi.label} delay={i * 0.08} glow>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${kpi.color}1f`, color: kpi.color }}>
                  <Icon size={18} />
                </div>
                <ArrowUpRight size={16} style={{ color: "#22C55E" }} />
              </div>
              <div className="mt-3 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                <CountUpStat end={kpi.value} suffix={kpi.suffix} decimals={kpi.decimals} />
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{kpi.label}</div>
              <div className="mt-1 text-[11px] font-medium" style={{ color: kpi.color }}>{kpi.trend}</div>
            </RecruteurKpiCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RecruteurKpiCard className="xl:col-span-2" hover={false}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Évolution valeur marché du portefeuille (M€)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={VALUE_EVOLUTION}>
              <defs>
                <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#valGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </RecruteurKpiCard>

        <RecruteurKpiCard hover={false}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Répartition par poste</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={POSITION_DISTRIBUTION} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {POSITION_DISTRIBUTION.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap justify-center gap-3">
            {POSITION_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} /> {d.name}
              </div>
            ))}
          </div>
        </RecruteurKpiCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <RecruteurKpiCard hover={false}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Répartition par âge</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={AGE_DISTRIBUTION}>
              <XAxis dataKey="range" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </RecruteurKpiCard>

        <RecruteurKpiCard hover={false}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Répartition par pays</h3>
          <div className="space-y-2.5">
            {COUNTRY_DISTRIBUTION.map((c, i) => {
              const max = Math.max(...COUNTRY_DISTRIBUTION.map((x) => x.count));
              return (
                <div key={c.country} className="flex items-center gap-2">
                  <span className="w-24 text-xs" style={{ color: "var(--text-secondary)" }}>{c.flag} {c.country}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#8B5CF6,#6366F1)" }} initial={{ width: 0 }} animate={{ width: `${(c.count / max) * 100}%` }} transition={{ duration: 1, delay: i * 0.05 }} />
                  </div>
                  <span className="w-6 text-right text-xs font-bold" style={{ color: "var(--text-primary)" }}>{c.count}</span>
                </div>
              );
            })}
          </div>
        </RecruteurKpiCard>

        <RecruteurKpiCard glow hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <Flame size={16} style={{ color: "#F59E0B" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Alertes IA — Talents détectés</h3>
          </div>
          <div className="space-y-2.5">
            {AI_TALENT_ALERTS.map((a, i) => (
              <motion.button
                key={a.id}
                type="button"
                onClick={() => navigate("/recruteur/discovery")}
                className="flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors hover:bg-white/5"
                style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold text-white" style={{ background: "linear-gradient(135deg,#F59E0B,#EF4444)" }}>
                  {a.score}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{a.name} • {a.age} ans</div>
                  <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{a.position} • {a.club} — {a.tag}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
