import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Loader2, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { ScoutPage, SCard, SBadge, SGauge, SCOUT_TOOLTIP } from "../../components/scout/ScoutUI";
import { PROSPECTS, S, PRIORITY_META } from "../../data/scoutData";

const QUICK_PROMPTS = [
  "Cherche un BU ≤21 ans, potentiel >85, budget <1.5M",
  "Meilleur MC créateur en Afrique du Nord",
  "DC rapide avec bon jeu aérien ≤24 ans",
  "Ailier gauche technique contrat libre ou <1M",
  "Top 3 profils immédiatement disponibles",
  "Qui a le meilleur rapport potentiel / valeur ?",
];

interface AIResult {
  id: string;
  rank: number;
  compatibility: number;
  reasoning: string[];
  warnings: string[];
  recommendation: string;
}

function runAI(query: string): AIResult[] {
  const q = query.toLowerCase();

  let candidates = [...PROSPECTS];

  if (q.includes("bu") || q.includes("buteur") || q.includes("avant")) {
    candidates = candidates.filter(p => p.position === "BU");
  } else if (q.includes("mc") || q.includes("milieu")) {
    candidates = candidates.filter(p => p.position === "MC");
  } else if (q.includes("dc") || q.includes("défenseur")) {
    candidates = candidates.filter(p => p.position === "DC");
  } else if (q.includes("ailier")) {
    candidates = candidates.filter(p => p.position.includes("Ailier"));
  }

  if (q.match(/\d+\s*ans?/) || q.includes("≤21") || q.includes("21 ans")) {
    candidates = candidates.filter(p => p.age <= 21);
  } else if (q.includes("≤24") || q.includes("24 ans")) {
    candidates = candidates.filter(p => p.age <= 24);
  }

  if (q.includes(">85") || q.includes("85")) {
    candidates = candidates.filter(p => p.potential >= 85);
  }

  if (q.includes("1.5m") || q.includes("1m") || q.includes("<1m")) {
    candidates = candidates.filter(p => p.valueMK <= 1500);
  }

  if (q.includes("disponible") || q.includes("libre")) {
    candidates = candidates.sort((a, b) => a.contractEnd.localeCompare(b.contractEnd));
  }

  if (candidates.length === 0) candidates = [...PROSPECTS];

  candidates.sort((a, b) => b.aiScore - a.aiScore);

  return candidates.slice(0, 5).map((p, i) => {
    const compat = Math.max(55, p.aiScore - i * 4);
    const reasoning: string[] = [];
    if (p.potential >= 85) reasoning.push(`Potentiel élite (${p.potential}/100)`);
    if (p.age <= 21) reasoning.push(`Profil jeune à fort potentiel de développement (${p.age} ans)`);
    if (p.goals >= 10) reasoning.push(`Productivité offensive élevée (${p.goals} buts)`);
    if (p.assists >= 8) reasoning.push(`Passes décisives remarquables (${p.assists} assists)`);
    if (p.contractEnd <= "2027-01") reasoning.push(`Contrat expirant ${p.contractEnd} — opportunité de négociation`);
    if (!p.agent) reasoning.push("Sans agent — négociation directe possible");
    if (p.speed >= 88) reasoning.push(`Vitesse exceptionnelle (${p.speed}/100)`);
    if (p.passing >= 85) reasoning.push(`Vision de jeu très développée (${p.passing}/100)`);
    if (reasoning.length === 0) reasoning.push(`ODIN Score ${p.aiScore}% de compatibilité avec le profil recherché`);

    const warnings: string[] = [];
    if (p.injuryRisk > 25) warnings.push(`Risque blessure ${p.injuryRisk}% — suivi médical recommandé`);
    if (p.valueMK > 1000) warnings.push(`Budget élevé: ${p.marketValue}`);
    if (p.agent) warnings.push(`Agent impliqué: ${p.agent}`);

    return { id: p.id, rank: i + 1, compatibility: compat, reasoning, warnings, recommendation: p.name };
  });
}

export function ScoutAIPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AIResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const launch = (q: string) => {
    if (!q.trim() || loading) return;
    setLoading(true);
    setRan(false);
    setResults([]);
    setTimeout(() => {
      setResults(runAI(q));
      setLoading(false);
      setRan(true);
    }, 1600);
  };

  const RANK_COLORS = ["#F59E0B", S.accent, "#3B82F6", S.success, "#8B5CF6"];

  return (
    <ScoutPage>
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: `linear-gradient(135deg,${S.accent},#4F46E5)`, boxShadow: `0 0 28px ${S.accent}50` }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Brain size={22} className="text-white" />
        </motion.div>
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>ODIN AI Scout</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Moteur de recommandation intelligent · Analyse de compatibilité</p>
        </div>
      </div>

      {/* Search input */}
      <SCard glow>
        <p className="mb-3 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Décrivez le profil recherché en langage naturel</p>
        <div className="flex gap-2 mb-3">
          <div className="flex flex-1 items-center gap-2 rounded-xl border px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: `${S.accent}30` }}>
            <Brain size={15} style={{ color: S.accent }} className="shrink-0" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && launch(query)}
              placeholder="Ex: Cherche un BU ≤21 ans, potentiel >85, budget <1.5M €"
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary)" }} />
          </div>
          <motion.button type="button" onClick={() => launch(query)} disabled={!query.trim() || loading}
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
            style={{ background: `linear-gradient(135deg,${S.accent},#4F46E5)`, boxShadow: `0 0 16px ${S.accent}40` }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <><Send size={14} /> Lancer</>}
          </motion.button>
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_PROMPTS.map(q => (
            <motion.button key={q} type="button" onClick={() => { setQuery(q); launch(q); }}
              className="rounded-full border px-3 py-1 text-[10px]"
              style={{ borderColor: `${S.accent}25`, color: "var(--text-muted)", background: `${S.accent}05` }}
              whileHover={{ borderColor: S.accent, color: S.accent, scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Zap size={8} className="inline mr-1" style={{ color: S.accent }} />{q}
            </motion.button>
          ))}
        </div>
      </SCard>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SCard className="py-10 flex flex-col items-center justify-center gap-3">
              <motion.div className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: `linear-gradient(135deg,${S.accent},#4F46E5)` }}
                animate={{ scale: [1,1.2,1], rotate: [0,180,360] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Brain size={24} className="text-white" />
              </motion.div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>ODIN analyse la base de données...</p>
              <div className="flex gap-1.5">
                {["Recherche", "Scoring", "Classement", "Analyse contextuelle"].map((step, i) => (
                  <motion.span key={step} className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                    style={{ background: `${S.accent}18`, color: S.accent }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}>
                    {step}
                  </motion.span>
                ))}
              </div>
            </SCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {ran && results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {results.length} résultats trouvés pour: <em style={{ color: S.accent }}>"{query}"</em>
              </p>
            </div>

            {results.map((res, i) => {
              const p = PROSPECTS.find(pr => pr.id === res.id)!;
              const rankColor = RANK_COLORS[i] ?? S.accent;
              const isExp = expanded === res.id;
              const radarData = [
                { subject: "Vitesse",  A: p.speed    },
                { subject: "Dribble",  A: p.dribble  },
                { subject: "Passes",   A: p.passing  },
                { subject: "Défense",  A: p.defense  },
                { subject: "Physique", A: p.physical },
                { subject: "Mental",   A: p.mental   },
              ];
              return (
                <motion.div key={res.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="rounded-[20px] border overflow-hidden"
                  style={{ background: "rgba(12,9,30,0.88)", borderColor: `${rankColor}25` }}>
                  {/* Header */}
                  <div className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl"
                      style={{ background: `${rankColor}18`, color: rankColor }}>
                      {["🥇","🥈","🥉","4️⃣","5️⃣"][i]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>{p.flag} {p.name}</p>
                        <SBadge color={PRIORITY_META[p.priority].color} bg={PRIORITY_META[p.priority].bg}>P.{p.priority}</SBadge>
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {p.position} · {p.age} ans · {p.club} · {p.marketValue}
                      </p>
                    </div>
                    {/* Compat score */}
                    <div className="text-center shrink-0">
                      <motion.div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4"
                        style={{ borderColor: rankColor, background: `${rankColor}10` }}
                        animate={{ boxShadow: [`0 0 0px ${rankColor}00`, `0 0 18px ${rankColor}55`, `0 0 0px ${rankColor}00`] }}
                        transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}>
                        <p className="text-sm font-extrabold" style={{ color: rankColor }}>{res.compatibility}%</p>
                      </motion.div>
                      <p className="text-[8px] mt-0.5" style={{ color: "var(--text-muted)" }}>Match IA</p>
                    </div>
                    <motion.button type="button" onClick={() => setExpanded(isExp ? null : res.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${rankColor}12`, color: rankColor }}
                      whileHover={{ scale: 1.1 }}>
                      {isExp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </motion.button>
                  </div>

                  {/* Reasoning pills */}
                  <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                    {res.reasoning.slice(0, 3).map((r, ri) => (
                      <span key={ri} className="rounded-full px-2.5 py-0.5 text-[9px] font-medium"
                        style={{ background: "rgba(34,197,94,0.1)", color: S.success, border: `1px solid ${S.success}20` }}>
                        ✓ {r}
                      </span>
                    ))}
                    {res.warnings.slice(0, 1).map((w, wi) => (
                      <span key={wi} className="rounded-full px-2.5 py-0.5 text-[9px] font-medium"
                        style={{ background: "rgba(245,158,11,0.1)", color: S.warning, border: `1px solid ${S.warning}20` }}>
                        ⚠ {w}
                      </span>
                    ))}
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExp && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                          {/* Radar */}
                          <div>
                            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Profil attributs</p>
                            <div className="h-44">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                                  <Radar dataKey="A" stroke={rankColor} fill={rankColor} fillOpacity={0.2} strokeWidth={2} />
                                  <Tooltip {...SCOUT_TOOLTIP} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          {/* Reasoning list */}
                          <div>
                            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Analyse complète ODIN</p>
                            <div className="space-y-1.5">
                              {res.reasoning.map((r, ri) => (
                                <div key={ri} className="flex items-start gap-2 rounded-xl border px-2.5 py-2"
                                  style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.15)" }}>
                                  <span className="text-[10px] text-green-400 shrink-0 mt-0.5">✓</span>
                                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{r}</p>
                                </div>
                              ))}
                              {res.warnings.map((w, wi) => (
                                <div key={wi} className="flex items-start gap-2 rounded-xl border px-2.5 py-2"
                                  style={{ background: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.15)" }}>
                                  <span className="text-[10px] text-yellow-400 shrink-0 mt-0.5">⚠</span>
                                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{w}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <motion.button type="button"
                                className="rounded-xl py-2 text-[10px] font-bold text-white"
                                style={{ background: `linear-gradient(135deg,${rankColor},${rankColor}99)` }}
                                whileHover={{ scale: 1.04 }}>
                                Voir profil complet
                              </motion.button>
                              <motion.button type="button"
                                className="rounded-xl py-2 text-[10px] font-bold"
                                style={{ background: `${S.success}15`, color: S.success }}
                                whileHover={{ scale: 1.04 }}>
                                Ajouter Watchlist
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {!ran && !loading && (
        <SCard className="flex flex-col items-center justify-center py-14">
          <Brain size={36} className="mb-3 opacity-20" style={{ color: S.accent }} />
          <p className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>Utilisez une requête rapide ou tapez votre critère</p>
          <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>L'IA analyse votre effectif, budget et besoins</p>
        </SCard>
      )}
    </ScoutPage>
  );
}
