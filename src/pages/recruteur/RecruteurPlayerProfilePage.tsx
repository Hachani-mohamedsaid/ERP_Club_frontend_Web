import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, TrendingUp, AlertTriangle, CheckCircle2,
  Target, Calendar, Flag, Ruler, Weight, Heart, MapPin, DollarSign, Users,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { SCOUT_PLAYERS } from "../../data/recruteurData";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

const TABS = ["Vue générale", "Statistiques", "Valeur marchande", "Blessures & Risque"] as const;
type Tab = typeof TABS[number];

const INJURY_HISTORY: Record<string, { date: string; injury: string; games: number }[]> = {
  sp1: [{ date: "2025-03", injury: "Ischio légère", games: 3 }],
  sp2: [{ date: "2024-11", injury: "Cheville Grade I", games: 5 }, { date: "2025-08", injury: "Genou inflammation", games: 4 }],
  sp3: [],
  sp4: [{ date: "2025-01", injury: "Lombalgie", games: 2 }],
  sp5: [{ date: "2024-09", injury: "Rupture LCA", games: 42 }],
};

const CLUB_HISTORY: Record<string, { club: string; years: string; apps: number }[]> = {
  sp1: [{ club: "Académie Sfax U21", years: "2022-2024", apps: 42 }, { club: "Académie Sfax", years: "2024-2026", apps: 56 }],
  sp2: [{ club: "Club Sportif Sfaxien", years: "2021-2023", apps: 38 }, { club: "US Monastir", years: "2023-2026", apps: 67 }],
  sp3: [{ club: "CA Bizertin U19", years: "2022-2023", apps: 30 }, { club: "CA Bizertin", years: "2023-2025", apps: 48 }, { club: "Maroc Pro", years: "2025-2026", apps: 22 }],
  sp4: [{ club: "EST Juniors", years: "2020-2022", apps: 35 }, { club: "ES Tunis", years: "2022-2026", apps: 72 }],
  sp5: [{ club: "Union Sportive", years: "2019-2022", apps: 65 }, { club: "CSS Pro", years: "2022-2025", apps: 58 }, { club: "CS Sfax", years: "2025-2026", apps: 18 }],
};

const STATS_SEASON: Record<string, { label: string; value: string | number; color: string }[]> = {
  sp1: [
    { label: "Buts",      value: 24,     color: "#22C55E" },
    { label: "Passes D.", value: 7,      color: "#3B82F6" },
    { label: "xG",        value: 0.78,   color: "#8B5CF6" },
    { label: "xA",        value: 0.21,   color: "#F59E0B" },
    { label: "Tacles",    value: 18,     color: "#FF7A00" },
    { label: "Interceptions", value: 12, color: "#EF4444" },
    { label: "Distance",  value: "10.8km", color: "#06B6D4" },
    { label: "Sprints",   value: 28,     color: "#A855F7" },
  ],
  sp2: [
    { label: "Buts",      value: 12,     color: "#22C55E" },
    { label: "Passes D.", value: 16,     color: "#3B82F6" },
    { label: "xG",        value: 0.45,   color: "#8B5CF6" },
    { label: "xA",        value: 0.52,   color: "#F59E0B" },
    { label: "Tacles",    value: 32,     color: "#FF7A00" },
    { label: "Interceptions", value: 28, color: "#EF4444" },
    { label: "Distance",  value: "11.2km", color: "#06B6D4" },
    { label: "Sprints",   value: 22,     color: "#A855F7" },
  ],
};

function getStats(id: string) {
  return STATS_SEASON[id] ?? STATS_SEASON.sp1;
}

function Gauge({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }} />
    </div>
  );
}

const RCard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div className={`rounded-[20px] border p-5 ${className}`}
    style={{
      background: "rgba(14,10,35,0.8)",
      borderColor: glow ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 40px rgba(139,92,246,0.12)" : "0 8px 24px rgba(0,0,0,0.2)",
    }}
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function RecruteurPlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const player = SCOUT_PLAYERS.find(p => p.id === id) ?? SCOUT_PLAYERS[0];
  const [tab, setTab] = useState<Tab>("Vue générale");

  const injuries = INJURY_HISTORY[player.id] ?? [];
  const clubs    = CLUB_HISTORY[player.id]   ?? [];
  const stats    = getStats(player.id);

  const radarData = [
    { subject: "Vitesse",     A: player.speed     },
    { subject: "Technique",   A: player.technique },
    { subject: "Physique",    A: player.physical  },
    { subject: "Vision",      A: player.vision    },
    { subject: "Mental",      A: player.mental    },
    { subject: "Finition",    A: player.finishing },
  ];

  const riskColor = player.injuryRisk < 20 ? "#22C55E" : player.injuryRisk < 45 ? "#FF7A00" : "#EF4444";

  return (
    <RecruteurPageTransition>
      {/* Back */}
      <div className="flex items-center gap-3">
        <motion.button type="button" onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-secondary)" }}
          whileHover={{ borderColor: "rgba(139,92,246,0.4)", color: "#8B5CF6" }} whileTap={{ scale: 0.96 }}>
          <ArrowLeft size={14} /> Retour
        </motion.button>
        <h1 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>Profil Joueur</h1>
      </div>

      {/* Hero */}
      <RCard glow>
        <div className="relative overflow-hidden">
          <motion.div className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.05),transparent)" }}
            animate={{ x: ["-100%","200%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 4 }} />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <motion.div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[20px] text-2xl font-black text-white"
              style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.35),rgba(99,102,241,0.25))", border: "2px solid rgba(139,92,246,0.4)" }}
              animate={{ boxShadow: ["0 0 0px #8B5CF600","0 0 28px #8B5CF660","0 0 0px #8B5CF600"] }}
              transition={{ duration: 2.5, repeat: Infinity }}>
              {player.countryFlag} {player.name.split(" ").map(n => n[0]).join("")}
            </motion.div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{player.name}</h2>
                <span className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: "rgba(139,92,246,0.2)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.4)" }}>
                  AI Score: {player.aiScore}/100
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><Target size={12} style={{ color: "#8B5CF6" }} /> {player.positionFull}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {player.age} ans</span>
                <span className="flex items-center gap-1"><Flag size={12} /> {player.country} {player.countryFlag}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {player.club}</span>
                <span className="flex items-center gap-1"><Heart size={12} /> Pied {player.foot}</span>
                <span className="flex items-center gap-1"><Ruler size={12} /> {player.height}</span>
                <span className="flex items-center gap-1"><DollarSign size={12} style={{ color: "#22C55E" }} /> {player.value}</span>
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                {player.league} · {player.matches} matchs · Contrat jusqu'à Juin 2027
              </p>
              {/* Similarity badges */}
              <div className="mt-2 flex flex-wrap gap-2">
                {player.similarTo.map(s => (
                  <span key={s.name} className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
                    ≈ {s.name} ({s.pct}%)
                  </span>
                ))}
              </div>
            </div>

            {/* Score ring */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              {/* AI Score SVG ring */}
              <svg width={72} height={72}>
                <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
                <motion.circle cx={36} cy={36} r={30} fill="none" stroke="#8B5CF6" strokeWidth={5}
                  strokeDasharray={2 * Math.PI * 30}
                  style={{ transformOrigin: "center", rotate: "-90deg" }}
                  initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 30 * (1 - player.aiScore / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut" }} />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#8B5CF6" fontSize={15} fontWeight="900">
                  {player.aiScore}
                </text>
              </svg>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>AI Score</p>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                style={{ background: riskColor === "#22C55E" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: riskColor }}>
                Risque {player.injuryRisk}%
              </span>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {[
              { label: "Buts",     value: player.goals,         color: "#22C55E" },
              { label: "Passes D.",value: player.assists,       color: "#3B82F6" },
              { label: "xG",       value: player.xg,            color: "#8B5CF6" },
              { label: "Compat.",  value: `${player.teamCompat}%`, color: "#F59E0B" },
              { label: "Potentiel",value: `${player.potential}%`,  color: "#A855F7" },
              { label: "Valeur",   value: player.value,         color: "#22C55E" },
            ].map(m => (
              <div key={m.label} className="rounded-xl border p-2 text-center"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                <p className="text-base font-extrabold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </RCard>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <motion.button key={t} type="button" onClick={() => setTab(t)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: tab === t ? "linear-gradient(135deg,#8B5CF6,#6D28D9)" : "rgba(255,255,255,0.04)",
              color: tab === t ? "white" : "var(--text-muted)",
              boxShadow: tab === t ? "0 0 16px rgba(139,92,246,0.35)" : "none",
            }}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {t}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

          {/* ── Vue générale ── */}
          {tab === "Vue générale" && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div className="space-y-4">
                {/* Radar */}
                <RCard>
                  <p className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Profil FIFA</p>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.07)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                        <Radar name="Joueur" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.22} strokeWidth={2} />
                        <Tooltip {...TOOLTIP_STYLE} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </RCard>

                {/* Attributes */}
                <RCard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Attributs</p>
                  <div className="space-y-2.5">
                    {[
                      { label: "Vitesse",   value: player.speed,     color: "#F59E0B" },
                      { label: "Technique", value: player.technique,  color: "#8B5CF6" },
                      { label: "Physique",  value: player.physical,   color: "#EF4444" },
                      { label: "Vision",    value: player.vision,     color: "#3B82F6" },
                      { label: "Mental",    value: player.mental,     color: "#22C55E" },
                      { label: "Finition",  value: player.finishing,  color: "#F59E0B" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "var(--text-muted)" }}>{label}</span>
                          <span className="font-bold" style={{ color }}>{value}/100</span>
                        </div>
                        <Gauge value={value} color={color} />
                      </div>
                    ))}
                  </div>
                </RCard>
              </div>

              <div className="space-y-4">
                {/* Club history */}
                <RCard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Historique clubs</p>
                  {clubs.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="mb-2 flex items-center gap-3 rounded-xl border px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                        style={{ background: "rgba(139,92,246,0.18)", color: "#8B5CF6" }}>
                        {c.club.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{c.club}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{c.years} · {c.apps} matchs</p>
                      </div>
                    </motion.div>
                  ))}
                </RCard>

                {/* Agent info */}
                <RCard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Agent</p>
                  <div className="rounded-xl border p-3" style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Mourad Belhaj</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>mourad@sportif.tn · +216 22 345 678</p>
                    <p className="text-xs mt-1" style={{ color: "#8B5CF6" }}>Commission: 8% · Actif depuis 2022</p>
                  </div>
                </RCard>

                {/* IA Compatibility */}
                <RCard>
                  <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Compatibilité équipe FC Carthage</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Compat. équipe",   value: player.teamCompat,      color: "#22C55E" },
                      { label: "Potentiel",         value: player.potential,       color: "#8B5CF6" },
                      { label: "Transfert réussi",  value: player.transferSuccess, color: "#F59E0B" },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl border p-2.5 text-center"
                        style={{ background: `${m.color}08`, borderColor: `${m.color}20` }}>
                        <p className="text-lg font-extrabold" style={{ color: m.color }}>{m.value}%</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </RCard>
              </div>
            </div>
          )}

          {/* ── Statistiques ── */}
          {tab === "Statistiques" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.slice(0, 4).map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <RCard>
                      <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    </RCard>
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.slice(4).map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 + 0.24 }}>
                    <RCard>
                      <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                    </RCard>
                  </motion.div>
                ))}
              </div>
              <RCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Comparaison stats saison</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.filter(s => typeof s.value === "number").map(s => ({ name: s.label, value: Number(s.value) }))} layout="vertical" barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} width={75} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="value" radius={[0,6,6,0]} fill="#8B5CF6" fillOpacity={0.85} name="Valeur" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </RCard>
            </div>
          )}

          {/* ── Valeur marchande ── */}
          {tab === "Valeur marchande" && (
            <RCard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Évolution valeur marchande</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={player.valueHistory}>
                    <defs>
                      <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}M€`, "Valeur"]} />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#valGrad)"
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        return <circle key={`d-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={payload.predicted ? "#F59E0B" : "#8B5CF6"} strokeWidth={0} />;
                      }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: "#8B5CF6" }} /> Réel</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: "#F59E0B" }} /> Projeté</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)" }}>
                  <p className="text-xl font-extrabold" style={{ color: "#22C55E" }}>{player.value}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Valeur actuelle</p>
                </div>
                <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}>
                  <p className="text-xl font-extrabold" style={{ color: "#8B5CF6" }}>{player.salary}</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Salaire mensuel</p>
                </div>
                <div className="rounded-xl border p-3 text-center" style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}>
                  <p className="text-xl font-extrabold" style={{ color: "#F59E0B" }}>
                    {(player.valueHistory.find(h => h.predicted) ?? { value: player.valueNum * 1.3 }).value}M€
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Projection Déc. 2026</p>
                </div>
              </div>
            </RCard>
          )}

          {/* ── Blessures & Risque ── */}
          {tab === "Blessures & Risque" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <RCard>
                <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Risque blessure IA</p>
                <div className="flex items-center gap-4 mb-5">
                  <motion.div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 text-xl font-black"
                    style={{ borderColor: riskColor, color: "var(--text-primary)" }}
                    animate={{ boxShadow: [`0 0 0px ${riskColor}00`, `0 0 20px ${riskColor}55`, `0 0 0px ${riskColor}00`] }}
                    transition={{ duration: 2, repeat: Infinity }}>
                    {player.injuryRisk}%
                  </motion.div>
                  <div>
                    <p className="font-bold" style={{ color: riskColor }}>
                      {player.injuryRisk < 20 ? "Risque faible" : player.injuryRisk < 45 ? "Risque modéré" : "Risque élevé"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Basé sur historique + charge physique + âge</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      Disponibilité: <strong style={{ color: player.injuryRisk < 30 ? "#22C55E" : "#FF7A00" }}>
                        {player.injuryRisk < 30 ? "Élevée" : "Modérée"}
                      </strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: "Risque blessure",  value: player.injuryRisk, color: riskColor },
                    { label: "Fatigue estimée",  value: Math.round(player.injuryRisk * 0.8), color: "#FF7A00" },
                    { label: "Disponibilité",    value: 100 - player.injuryRisk, color: "#22C55E" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-bold" style={{ color }}>{value}%</span>
                      </div>
                      <Gauge value={value} color={color} />
                    </div>
                  ))}
                </div>
              </RCard>

              <RCard>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  Historique blessures ({injuries.length} entrée{injuries.length !== 1 ? "s" : ""})
                </p>
                {injuries.length > 0 ? injuries.map((inj, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="mb-2 flex items-start gap-3 rounded-xl border p-3"
                    style={{ background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.2)" }}>
                    <AlertTriangle size={14} style={{ color: "#EF4444" }} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{inj.injury}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{inj.date} · {inj.games} matchs manqués</p>
                    </div>
                  </motion.div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <CheckCircle2 size={28} style={{ color: "#22C55E" }} className="mb-2 opacity-70" />
                    <p className="text-sm font-medium" style={{ color: "#22C55E" }}>Aucune blessure enregistrée</p>
                  </div>
                )}
              </RCard>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Ajouter à la shortlist", color: "#22C55E" },
          { label: "Comparer",               color: "#8B5CF6" },
          { label: "Contacter l'agent",      color: "#3B82F6" },
          { label: "Lancer négociation",     color: "#FF7A00" },
        ].map(({ label, color }) => (
          <motion.button key={label} type="button"
            className="rounded-xl border px-4 py-2 text-xs font-semibold"
            style={{ background: `${color}12`, borderColor: `${color}30`, color }}
            whileHover={{ scale: 1.05, background: `${color}22` }} whileTap={{ scale: 0.96 }}>
            {label}
          </motion.button>
        ))}
      </div>
    </RecruteurPageTransition>
  );
}
