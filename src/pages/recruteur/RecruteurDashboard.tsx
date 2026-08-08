import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { scoutApi, type ScoutProspectDto } from "../../lib/api/scout";

const KPI_ICONS = [Radar, Star, Handshake, Wallet];

const POSITION_CATEGORY: Record<string, "Attaquants" | "Milieux" | "Défenseurs" | "Gardiens"> = {
  BU: "Attaquants", ATT: "Attaquants", AG: "Attaquants", AD: "Attaquants",
  MOC: "Milieux", MC: "Milieux", MDF: "Milieux", MDC: "Milieux",
  DC: "Défenseurs", DG: "Défenseurs", DD: "Défenseurs", LB: "Défenseurs", LAT: "Défenseurs",
  GB: "Gardiens", GK: "Gardiens",
};
const POSITION_COLORS: Record<string, string> = {
  Attaquants: "#EF4444", Milieux: "#22C55E", Défenseurs: "#3B82F6", Gardiens: "#F59E0B",
};

const AGE_BUCKETS: { range: string; test: (age: number) => boolean }[] = [
  { range: "16-18", test: a => a <= 18 },
  { range: "19-21", test: a => a >= 19 && a <= 21 },
  { range: "22-24", test: a => a >= 22 && a <= 24 },
  { range: "25-27", test: a => a >= 25 && a <= 27 },
  { range: "28+",   test: a => a >= 28 },
];

export function RecruteurDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prospects, setProspects] = useState<ScoutProspectDto[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([scoutApi.getProspects(), scoutApi.getWatchlist()])
      .then(([p, w]) => { setProspects(p); setWatchlistCount(w.length); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const kpis = useMemo(() => {
    const avgScore = prospects.length ? Math.round(prospects.reduce((s, p) => s + p.aiScore, 0) / prospects.length) : 0;
    const inNegotiation = prospects.filter(p => p.status === "validation" || p.status === "signature").length;
    const totalValueMK = prospects.reduce((s, p) => s + p.valueMK, 0);
    const countries = new Set(prospects.map(p => p.nationality)).size;
    return [
      { label: "Prospects suivis", value: prospects.length, color: "#8B5CF6", trend: `Score IA moyen ${avgScore}%` },
      { label: "Shortlist",        value: watchlistCount,   color: "#22C55E", trend: `sur ${prospects.length} prospects` },
      { label: "En négociation",   value: inNegotiation,    color: "#F59E0B", trend: "validation / signature" },
      { label: "Valeur portefeuille", value: Math.round((totalValueMK / 1000) * 10) / 10, suffix: "M€", decimals: 1, color: "#3B82F6", trend: `${countries} pays représentés` },
    ];
  }, [prospects, watchlistCount]);

  const valueEvolution = useMemo(() => {
    const byMonth = new Map<string, number>();
    [...prospects]
      .sort((a, b) => a.addedDate.localeCompare(b.addedDate))
      .forEach(p => {
        const month = p.addedDate.slice(0, 7);
        byMonth.set(month, (byMonth.get(month) ?? 0) + p.valueMK);
      });
    let cumulative = 0;
    return Array.from(byMonth.entries()).map(([month, mk]) => {
      cumulative += mk;
      return { month, value: Math.round((cumulative / 1000) * 10) / 10 };
    });
  }, [prospects]);

  const positionDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    prospects.forEach(p => {
      const cat = POSITION_CATEGORY[p.position] ?? "Milieux";
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value, color: POSITION_COLORS[name] }));
  }, [prospects]);

  const ageDistribution = useMemo(() =>
    AGE_BUCKETS.map(b => ({ range: b.range, count: prospects.filter(p => b.test(p.age)).length })),
  [prospects]);

  const countryDistribution = useMemo(() => {
    const counts = new Map<string, { flag: string; count: number }>();
    prospects.forEach(p => {
      const cur = counts.get(p.nationality) ?? { flag: p.flag, count: 0 };
      cur.count += 1;
      counts.set(p.nationality, cur);
    });
    return Array.from(counts.entries())
      .map(([country, v]) => ({ country, flag: v.flag, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [prospects]);

  const talentAlerts = useMemo(() =>
    [...prospects].sort((a, b) => b.aiScore - a.aiScore).slice(0, 3),
  [prospects]);

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
            <h1 className="mt-2 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{user?.fullName ?? "Recruteur"}</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Recruteur • {user?.organization?.clubName ?? "Club"} • Saison {new Date().getFullYear()}
            </p>
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

      {error && !loading && (
        <div className="rounded-[20px] border p-5 text-center" style={{ background: "rgba(14,10,35,0.8)", borderColor: "rgba(239,68,68,0.3)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => {
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
                {loading ? "…" : <CountUpStat end={kpi.value} suffix={kpi.suffix} decimals={kpi.decimals} />}
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
          {valueEvolution.length === 0 ? (
            <div className="flex h-[240px] items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
              {loading ? "Chargement…" : "Pas encore de données"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={valueEvolution}>
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
          )}
        </RecruteurKpiCard>

        <RecruteurKpiCard hover={false}>
          <h3 className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Répartition par poste</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={positionDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {positionDistribution.map((d) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 flex flex-wrap justify-center gap-3">
            {positionDistribution.map((d) => (
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
            <BarChart data={ageDistribution}>
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
            {countryDistribution.map((c, i) => {
              const max = Math.max(...countryDistribution.map((x) => x.count), 1);
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
            {countryDistribution.length === 0 && !loading && (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Pas encore de données</p>
            )}
          </div>
        </RecruteurKpiCard>

        <RecruteurKpiCard glow hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <Flame size={16} style={{ color: "#F59E0B" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Alertes IA — Talents détectés</h3>
          </div>
          <div className="space-y-2.5">
            {talentAlerts.map((a, i) => (
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
                  {a.aiScore}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{a.name} • {a.age} ans</div>
                  <div className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{a.position} • {a.club}</div>
                </div>
              </motion.button>
            ))}
            {talentAlerts.length === 0 && !loading && (
              <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>Aucun prospect pour le moment</p>
            )}
          </div>
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
