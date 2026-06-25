import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, Brain, Star, TrendingUp, AlertTriangle,
  CheckCircle2, X, ChevronRight, Target, Users,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { ParticlesField } from "../../components/recruteur/ParticlesField";
import { PlayerProfileDrawer } from "../../components/recruteur/PlayerProfileDrawer";
import { TypewriterText } from "../../components/analyste/TypewriterText";
import { SCOUT_PLAYERS, AI_SEARCH_PRESETS, type ScoutPlayer } from "../../data/recruteurData";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

const RANK_BADGES = ["🥇","🥈","🥉"];

interface ScoredPlayer { player: ScoutPlayer; matchScore: number; strengths: string[]; warnings: string[]; whyPick: string }

function scorePlayer(p: ScoutPlayer, query: string): ScoredPlayer {
  const base = p.aiScore + Math.random() * 5;
  const strengths: string[] = [];
  const warnings: string[] = [];

  if (p.aiScore >= 90) strengths.push("Score IA exceptionnel");
  if (p.potential >= 88) strengths.push(`Potentiel ${p.potential}%`);
  if (p.teamCompat >= 88) strengths.push(`Compatibilité équipe ${p.teamCompat}%`);
  if (p.injuryRisk < 20) strengths.push("Risque blessure faible");
  if (p.age <= 21) strengths.push("Jeune talent à valoriser");
  if (p.valueNum < 1.5) strengths.push("Budget accessible");

  if (p.injuryRisk > 35) warnings.push(`Risque blessure ${p.injuryRisk}%`);
  if (p.valueNum > 2.5) warnings.push(`Valeur élevée ${p.value}`);
  if (p.age > 26) warnings.push("Profil senior");
  if (p.teamCompat < 80) warnings.push("Compatibilité modérée");

  const whyPick = query.toLowerCase().includes("défenseur") || query.toLowerCase().includes("dc")
    ? `${p.name} offre une solidité défensive combinée à une distribution élevée (vision ${p.vision}/100).`
    : `${p.name} répond précisément aux critères: ${p.age} ans, ${p.value}, ${p.league}.`;

  return { player: p, matchScore: Math.min(99, Math.round(base)), strengths, warnings, whyPick };
}

function Gauge({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

function RankCard({ scored, rank, onProfile }: { scored: ScoredPlayer; rank: number; onProfile: (id: string) => void }) {
  const { player: p, matchScore, strengths, warnings, whyPick } = scored;
  const [expanded, setExpanded] = useState(false);

  const radarData = [
    { subject: "Vitesse",   A: p.speed     },
    { subject: "Technique", A: p.technique },
    { subject: "Physique",  A: p.physical  },
    { subject: "Vision",    A: p.vision    },
    { subject: "Mental",    A: p.mental    },
    { subject: "Finition",  A: p.finishing },
  ];

  const isTop3 = rank <= 3;
  const scoreColor = matchScore >= 90 ? "#22C55E" : matchScore >= 80 ? "#8B5CF6" : "#F59E0B";

  return (
    <motion.div layout className="rounded-[20px] border overflow-hidden"
      style={{
        background: isTop3 ? "rgba(16,12,40,0.95)" : "rgba(14,10,35,0.85)",
        borderColor: rank === 1 ? "rgba(139,92,246,0.5)" : rank === 2 ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.07)",
        boxShadow: rank === 1 ? "0 0 32px rgba(139,92,246,0.18)" : "none",
      }}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (rank - 1) * 0.07 }}>

      {/* Main row */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Rank */}
        <div className="flex w-8 shrink-0 flex-col items-center gap-0.5">
          {rank <= 3
            ? <span className="text-xl">{RANK_BADGES[rank - 1]}</span>
            : <span className="text-base font-black" style={{ color: "var(--text-muted)" }}>#{rank}</span>
          }
        </div>

        {/* Flag/Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-black"
          style={{ background: "rgba(139,92,246,0.18)", border: "1px solid rgba(139,92,246,0.25)" }}>
          {p.countryFlag}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
            <span className="text-[10px] rounded-full px-2 py-0.5 font-semibold"
              style={{ background: "rgba(139,92,246,0.15)", color: "#A855F7" }}>{p.positionFull}</span>
          </div>
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{p.club} · {p.age} ans · {p.league}</p>
          <div className="mt-1 flex flex-wrap gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span style={{ color: "#22C55E" }}>{p.value}</span>
            <span>Compat. {p.teamCompat}%</span>
            <span>Potentiel {p.potential}%</span>
          </div>
        </div>

        {/* Match score */}
        <div className="shrink-0 text-right">
          <motion.div className="text-2xl font-extrabold" style={{ color: scoreColor }}
            initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: (rank - 1) * 0.07 + 0.2, type: "spring" }}>
            {matchScore}%
          </motion.div>
          <p className="text-[9px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Match IA</p>
          <ChevronRight size={12} className={`inline-block mt-1 transition-transform ${expanded ? "rotate-90" : ""}`}
            style={{ color: "var(--text-muted)" }} />
        </div>
      </div>

      {/* Score bar */}
      <div className="px-4 pb-3">
        <Gauge value={matchScore} color={scoreColor} />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
              {/* Left */}
              <div className="space-y-3">
                {/* Why pick */}
                <div className="rounded-xl border px-3 py-2.5"
                  style={{ background: "rgba(139,92,246,0.08)", borderColor: "rgba(139,92,246,0.2)" }}>
                  <p className="text-[10px] font-semibold mb-0.5" style={{ color: "#A855F7" }}>Recommandation IA</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{whyPick}</p>
                </div>

                {/* Strengths + Warnings */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-semibold mb-1 flex items-center gap-1" style={{ color: "#22C55E" }}>
                      <CheckCircle2 size={9} /> Points forts
                    </p>
                    {strengths.map(s => (
                      <div key={s} className="mb-0.5 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#22C55E" }} />{s}
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold mb-1 flex items-center gap-1" style={{ color: "#F59E0B" }}>
                      <AlertTriangle size={9} /> Attention
                    </p>
                    {warnings.length > 0 ? warnings.map(w => (
                      <div key={w} className="mb-0.5 flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#F59E0B" }} />{w}
                      </div>
                    )) : <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Aucun point négatif</p>}
                  </div>
                </div>

                {/* Compatibility breakdown */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>Compatibilité détaillée</p>
                  {[
                    { label: "Équipe",     value: p.teamCompat,      color: "#8B5CF6" },
                    { label: "Potentiel",  value: p.potential,       color: "#22C55E" },
                    { label: "Succès transfer.", value: p.transferSuccess, color: "#3B82F6" },
                    { label: "Score IA",   value: p.aiScore,         color: "#F59E0B" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span style={{ color: "var(--text-muted)" }}>{label}</span>
                        <span className="font-bold" style={{ color }}>{value}%</span>
                      </div>
                      <Gauge value={value} color={color} />
                    </div>
                  ))}
                </div>

                {/* Similarity */}
                {p.similarTo.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {p.similarTo.map(s => (
                      <span key={s.name} className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
                        style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
                        ≈ {s.name} ({s.pct}%)
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <motion.button type="button" onClick={() => onProfile(p.id)}
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6" }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Target size={11} /> Voir profil
                  </motion.button>
                  <motion.button type="button"
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold"
                    style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Star size={11} /> Shortlist
                  </motion.button>
                  <motion.button type="button"
                    className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold"
                    style={{ background: "rgba(59,130,246,0.12)", color: "#3B82F6" }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <Users size={11} /> Contacter agent
                  </motion.button>
                </div>
              </div>

              {/* Radar */}
              <div className="h-44">
                <p className="text-[10px] text-center font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Profil attributs</p>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 8 }} />
                    <Radar dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.22} strokeWidth={1.5} />
                    <Tooltip {...TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function RecruteurAIPage() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"idle" | "thinking" | "results">("idle");
  const [rawResults, setRawResults] = useState<ScoutPlayer[]>([]);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const scoredResults = useMemo<ScoredPlayer[]>(() =>
    rawResults.map(p => scorePlayer(p, query)),
    [rawResults, query]
  );

  const run = (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setPhase("thinking");
    setTimeout(() => {
      const ranked = [...SCOUT_PLAYERS]
        .map(p => ({ p, s: p.aiScore + Math.random() * 8 }))
        .sort((a, b) => b.s - a.s)
        .map(x => x.p);
      setRawResults(ranked);
      setPhase("results");
    }, 1900);
  };

  const drawerPlayer = drawerId ? SCOUT_PLAYERS.find(p => p.id === drawerId) ?? null : null;

  const avgScore = scoredResults.length ? Math.round(scoredResults.reduce((a, s) => a + s.matchScore, 0) / scoredResults.length) : 0;

  return (
    <RecruteurPageTransition>
      {/* Search hero */}
      <div className="relative overflow-hidden rounded-[24px] border p-8"
        style={{ background: "linear-gradient(135deg,rgba(20,15,45,0.95),rgba(15,29,58,0.9))", borderColor: "rgba(139,92,246,0.3)" }}>
        <ParticlesField count={30} />
        <div className="relative mx-auto max-w-2xl text-center">
          <motion.div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 0 40px rgba(139,92,246,0.6)" }}
            animate={{ scale: [1,1.08,1], rotate: [0,4,-4,0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Brain size={30} className="text-white" />
          </motion.div>
          <h1 className="mt-4 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>AI Recruitment Engine</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Décrivez le profil — l'IA scanne 2 847 joueurs, les classe et génère un rapport de compatibilité détaillé.
          </p>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border p-2"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(139,92,246,0.3)" }}>
            <Sparkles size={18} className="ml-2" style={{ color: "#A855F7" }} />
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && run(query)}
              placeholder="Ex: Défenseur central, budget 500k, moins de 24 ans"
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
            {query && (
              <button type="button" onClick={() => { setQuery(""); setPhase("idle"); }} className="p-1" style={{ color: "var(--text-muted)" }}>
                <X size={14} />
              </button>
            )}
            <motion.button type="button" onClick={() => run(query)}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Send size={15} /> Lancer
            </motion.button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {AI_SEARCH_PRESETS.map(p => (
              <motion.button key={p} type="button" onClick={() => run(p)}
                className="rounded-full border px-3 py-1.5 text-xs"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "var(--text-muted)" }}
                whileHover={{ borderColor: "rgba(139,92,246,0.4)", color: "#8B5CF6" }}>
                {p}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === "thinking" && (
          <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-14">
            <motion.div className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 0 30px rgba(139,92,246,0.5)" }}
              animate={{ scale: [1,1.1,1], rotate: [0,180,360] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <Loader2 size={26} className="text-white" />
            </motion.div>
            <TypewriterText text="Analyse de 2 847 profils · Calcul de compatibilité · Scoring IA multi-critères..." className="text-sm" style={{ color: "var(--text-muted)" }} />
          </motion.div>
        )}

        {phase === "results" && (
          <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Results summary */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} style={{ color: "#A855F7" }} />
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {scoredResults.length} candidats analysés — Top {Math.min(scoredResults.length, 10)} recommandés
                </h3>
              </div>
              <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                <span className="flex items-center gap-1"><TrendingUp size={11} style={{ color: "#8B5CF6" }} /> Score IA moyen: <strong style={{ color: "#8B5CF6" }}>{avgScore}%</strong></span>
                <span>Requête: <em style={{ color: "#A855F7" }}>{query}</em></span>
              </div>
            </div>

            {/* AI summary chart */}
            {scoredResults.length > 0 && (
              <div className="rounded-[20px] border p-5" style={{ background: "rgba(14,10,35,0.8)", borderColor: "rgba(255,255,255,0.07)" }}>
                <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Comparaison scores IA — Top 8</p>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoredResults.slice(0, 8).map(s => ({ name: s.player.name.split(" ")[0], score: s.matchScore }))} barCategoryGap="28%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[70, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, "Match IA"]} />
                      <Bar dataKey="score" radius={[6,6,0,0]} fill="#8B5CF6" fillOpacity={0.85} name="Score IA" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Ranked cards */}
            <div className="space-y-3">
              {scoredResults.slice(0, 10).map((s, i) => (
                <RankCard key={s.player.id} scored={s} rank={i + 1} onProfile={setDrawerId} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PlayerProfileDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />
    </RecruteurPageTransition>
  );
}
