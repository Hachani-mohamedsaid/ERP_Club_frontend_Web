import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Brain, Users, FileText, CheckCircle2, Clock, TrendingUp, Star, ArrowRight } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { ScoutPage, SKpi, SCard, SBadge, SCOUT_TOOLTIP } from "../../components/scout/ScoutUI";
import { PROSPECTS, S, PRIORITY_META, WORKFLOW_COLS } from "../../data/scoutData";
import { useScoutDashboard } from "../../hooks/useScoutData";

const BY_POS_FALLBACK = [
  { name: "BU",     v: 8,  fill: "#FF7A00" },
  { name: "MC",     v: 9,  fill: "#6366F1" },
  { name: "DC",     v: 6,  fill: "#3B82F6" },
  { name: "Ailier", v: 7,  fill: "#22C55E" },
  { name: "DG/DD",  v: 5,  fill: "#F59E0B" },
  { name: "GK",     v: 3,  fill: "#8B5CF6" },
];

const BY_COUNTRY_FALLBACK = [
  { name: "Tunisie",       value: 18, fill: "#FF7A00" },
  { name: "Algérie",       value: 10, fill: "#6366F1" },
  { name: "Maroc",         value: 8,  fill: "#3B82F6" },
  { name: "Côte d'Ivoire", value: 6,  fill: "#22C55E" },
  { name: "Sénégal",       value: 5,  fill: "#F59E0B" },
];

const PIPELINE_TREND_FALLBACK = [
  { month: "Jan", prospects: 28, validated: 2 },
  { month: "Fév", prospects: 32, validated: 3 },
  { month: "Mar", prospects: 36, validated: 3 },
  { month: "Avr", prospects: 38, validated: 4 },
  { month: "Mai", prospects: 40, validated: 5 },
  { month: "Jun", prospects: 42, validated: 5 },
];

const AI_RECS_FALLBACK = [
  {
    id: "pr1", name: "Youssef Ben Ali", pos: "BU", age: 17, club: "AS Ariana", flag: "🇹🇳",
    score: 92, budget: "1.2M €",
    reasons: ["Accélération explosive (88)", "Profil jeune à fort potentiel (89)", "Contrat favorable"],
    warn: "Concurrence de 3 clubs",
  },
  {
    id: "pr6", name: "Ibrahim Touré", pos: "MC", age: 19, club: "Génération Foot", flag: "🇸🇳",
    score: 88, budget: "900K €",
    reasons: ["Passes décisives exceptionnelles (86)", "Polyvalent MC/MOC", "Formation élite"],
    warn: "Intérêt FC Metz signalé",
  },
  {
    id: "pr2", name: "Nader Trabelsi", pos: "MC", age: 19, club: "Stade Tunisien", flag: "🇹🇳",
    score: 85, budget: "850K €",
    reasons: ["Contrat expire décembre 2026", "Vision de jeu 88/100", "Pas d'agent — négociation directe"],
    warn: "Risque blessure modéré (22%)",
  },
];

export function ScoutDashboard() {
  const navigate = useNavigate();
  const { data, loading } = useScoutDashboard();

  const totalCount = data?.kpis.totalProspects ?? PROSPECTS.length;
  const totalBudget = data?.kpis.priorityABudget ?? PROSPECTS.filter(p => p.priority === "A").reduce((a, p) => a + p.valueMK, 0);
  const avgPotential = data?.kpis.avgPotential ?? Math.round(PROSPECTS.reduce((a, p) => a + p.potential, 0) / PROSPECTS.length * 10) / 10;
  const avgAge = data?.kpis.avgAge ?? Math.round(PROSPECTS.reduce((a, p) => a + p.age, 0) / PROSPECTS.length * 10) / 10;
  const BY_POS = data?.byPosition?.length
    ? data.byPosition.map((p, i) => ({ ...p, fill: ["#FF7A00", "#6366F1", "#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6"][i % 6] }))
    : BY_POS_FALLBACK;
  const BY_COUNTRY = data?.byCountry?.length
    ? data.byCountry.map((c, i) => ({ ...c, fill: ["#FF7A00", "#6366F1", "#3B82F6", "#22C55E", "#F59E0B"][i % 5] }))
    : BY_COUNTRY_FALLBACK;
  const AI_RECS = data?.aiRecs?.length ? data.aiRecs : AI_RECS_FALLBACK;
  const PIPELINE_TREND = PIPELINE_TREND_FALLBACK;

  return (
    <ScoutPage>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Tableau de Bord Scout
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Saison 2025-2026 · FC Carthage · {totalCount} prospects suivis
            {loading ? " · chargement..." : ""}
          </p>
        </div>
        <motion.button type="button" onClick={() => navigate("/scout/search")}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}cc)`, boxShadow: `0 0 16px ${S.primary}40` }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          + Nouveau prospect
        </motion.button>
      </div>

      {/* KPI row 1 - with sparklines */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SKpi label="Prospects observés" value={42} icon={Users}
          trend={{ value: 12, label: "ce mois" }} color={S.primary}
          sparkline={[28, 32, 36, 38, 40, 42]} delay={0} />
        <SKpi label="Rapports créés" value={18} icon={FileText}
          trend={{ value: 5, label: "ce mois" }} color={S.success}
          sparkline={[8, 10, 13, 14, 16, 18]} delay={1} />
        <SKpi label="Validations" value={5} icon={CheckCircle2}
          trend={{ value: 2, label: "ce mois" }} color={S.success}
          sparkline={[1, 2, 2, 3, 4, 5]} delay={2} />
        <SKpi label="En cours" value={8} icon={Clock}
          trend={{ value: 3, label: "ce mois" }} color={S.info}
          sparkline={[3, 4, 5, 6, 7, 8]} delay={3} />
      </div>

      {/* KPI row 2 - averages */}
      <div className="grid grid-cols-3 gap-3">
        <SKpi label="Potentiel moyen" value={`${avgPotential}/100`} color={S.success}
          sparkline={PROSPECTS.map(p => p.potential)} delay={4} />
        <SKpi label="Âge moyen" value={`${avgAge} ans`} color={S.info}
          sparkline={PROSPECTS.map(p => p.age)} delay={5} />
        <SKpi label="Budget priorité A" value={`${(totalBudget / 1000).toFixed(1)}M €`} color={S.primary}
          trend={{ value: 0.4, label: "M vs mois passé" }} delay={6} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Pipeline trend */}
        <SCard glow>
          <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Pipeline mensuel</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PIPELINE_TREND}>
                <defs>
                  <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={S.accent} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={S.accent} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={S.success} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={S.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...SCOUT_TOOLTIP} />
                <Area type="monotone" dataKey="prospects" stroke={S.accent} fill="url(#pgGrad)" strokeWidth={2} name="Prospects" />
                <Area type="monotone" dataKey="validated" stroke={S.success} fill="url(#valGrad)" strokeWidth={2} name="Validés" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-[10px]">
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full inline-block" style={{ background: S.accent }} /> Prospects</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full inline-block" style={{ background: S.success }} /> Validés</span>
          </div>
        </SCard>

        {/* By position */}
        <div className="grid grid-cols-2 gap-3">
          <SCard>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Par poste</p>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BY_POS} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip {...SCOUT_TOOLTIP} />
                  {BY_POS.map((entry) => null)}
                  <Bar dataKey="v" radius={[5,5,0,0]} name="Prospects">
                    {BY_POS.map((entry, i) => <Cell key={i} fill={entry.fill} fillOpacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SCard>
          <SCard>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Par pays</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={BY_COUNTRY} dataKey="value" innerRadius={28} outerRadius={52} paddingAngle={3}>
                    {BY_COUNTRY.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip {...SCOUT_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 space-y-0.5">
              {BY_COUNTRY.slice(0, 3).map(c => (
                <div key={c.name} className="flex items-center gap-1.5 text-[9px]">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.fill }} />
                  <span style={{ color: "var(--text-muted)" }}>{c.name}</span>
                  <span className="ml-auto font-bold" style={{ color: "var(--text-primary)" }}>{c.value}</span>
                </div>
              ))}
            </div>
          </SCard>
        </div>
      </div>

      {/* Workflow summary */}
      <SCard>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Statut pipeline</p>
        <div className="grid grid-cols-5 gap-2">
          {WORKFLOW_COLS.map(col => {
            const count = PROSPECTS.filter(p => p.status === col.id).length;
            return (
              <motion.div key={col.id} className="rounded-xl border p-3 text-center"
                style={{ background: col.bg, borderColor: `${col.color}30` }}
                whileHover={{ scale: 1.04 }}>
                <p className="text-xl font-extrabold" style={{ color: col.color }}>{count}</p>
                <p className="text-[9px] font-semibold mt-0.5" style={{ color: col.color }}>{col.label}</p>
              </motion.div>
            );
          })}
        </div>
      </SCard>

      {/* AI Recommendations */}
      <SCard glow>
        <div className="flex items-center gap-3 mb-4">
          <motion.div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `linear-gradient(135deg,${S.accent},${S.primary})`, boxShadow: `0 0 20px ${S.accent}50` }}
            animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <Brain size={18} className="text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>ODIN AI — Top 3 Recommandations</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Basé sur profil d'équipe + budget + besoins</p>
          </div>
        </div>
        <div className="space-y-3">
          {AI_RECS.map((rec, i) => (
            <motion.div key={rec.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 rounded-[16px] border p-4 cursor-pointer"
              style={{ background: "rgba(255,255,255,0.025)", borderColor: "var(--surface-panel-border)" }}
              whileHover={{ borderColor: `${S.accent}40`, y: -2 }}
              onClick={() => navigate(`/scout/prospect/${rec.id}`)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-black text-white"
                style={{
                  background: i === 0 ? "linear-gradient(135deg,#F59E0B,#D97706)" : i === 1 ? `linear-gradient(135deg,${S.accent},#4F46E5)` : "linear-gradient(135deg,#3B82F6,#1D4ED8)"
                }}>
                {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {rec.flag} {rec.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {rec.pos} · {rec.age} ans · {rec.club} · {rec.budget}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-center">
                      <p className="text-xl font-extrabold" style={{ color: S.accent }}>{rec.score}%</p>
                      <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Match IA</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rec.reasons.map((r, ri) => (
                    <span key={ri} className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                      style={{ background: "rgba(34,197,94,0.1)", color: S.success, border: `1px solid ${S.success}20` }}>
                      ✓ {r}
                    </span>
                  ))}
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                    style={{ background: "rgba(245,158,11,0.1)", color: S.warning, border: `1px solid ${S.warning}20` }}>
                    ⚠ {rec.warn}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: S.accent }} className="shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>
      </SCard>

      {/* Priority breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {(["A","B","C"] as const).map((p, i) => {
          const meta = PRIORITY_META[p];
          const count = PROSPECTS.filter(pr => pr.priority === p).length;
          return (
            <motion.div key={p} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-[20px] border p-4"
              style={{ background: meta.bg, borderColor: `${meta.color}30` }}
              whileHover={{ scale: 1.03 }}>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold" style={{ color: meta.color }}>{count}</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-black"
                  style={{ background: meta.color, color: "white" }}>P.{p}</span>
              </div>
              <p className="text-xs mt-1 font-medium" style={{ color: meta.color }}>{meta.label}</p>
            </motion.div>
          );
        })}
      </div>
    </ScoutPage>
  );
}
