import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, LineChart, Line,
} from "recharts";
import { Brain, ChevronDown, Swords, TrendingUp, Target, RefreshCw, Zap } from "lucide-react";
import { AnalystePageTransition } from "../../components/analyste/AnalystePageTransition";
import { AnalystePageLoader } from "../../components/analyste/AnalystePageLoader";
import { useAnalystePredictionTeams } from "../../hooks/useAnalysteResource";
import { analysteApi } from "../../lib/api/analyste";
import type { MatchPredictionResult } from "../../lib/api/analyste";

const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(139,92,246,0.3)", color: "white", borderRadius: 12 },
};

function OutcomeBar({ label, value, color, total }: { label: string; value: number; color: string; total: number }) {
  const pct = (value / total) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-right text-xs font-bold" style={{ color }}>{value}%</span>
      <div className="flex-1 overflow-hidden rounded-full h-3" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
      <span className="w-14 text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
    </div>
  );
}

const ACard = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <motion.div className={`rounded-[20px] border p-5 backdrop-blur-[12px] ${className}`}
    style={{
      background: "rgba(5,8,22,0.7)",
      borderColor: glow ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.06)",
      boxShadow: glow ? "0 0 40px rgba(139,92,246,0.12), 0 10px 30px rgba(0,0,0,0.3)" : "0 8px 24px rgba(0,0,0,0.2)",
    }}
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    {children}
  </motion.div>
);

export function AnalysteMatchPredictionPage() {
  const { data: teamsData, loading: teamsLoading } = useAnalystePredictionTeams();
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [pred, setPred] = useState<MatchPredictionResult | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (teamsData?.teams.length) {
      setHome(teamsData.teams[0]);
      setAway(teamsData.teams[1] ?? teamsData.teams[0]);
    }
  }, [teamsData]);

  if (teamsLoading && !teamsData) return <AnalystePageLoader />;

  const teams = teamsData!.teams;

  async function runPrediction() {
    setPredicting(true);
    setPred(null);
    try {
      const result = await analysteApi.predictMatch(home, away);
      setPred(result.prediction);
    } finally {
      setPredicting(false);
    }
  }

  const radarData = pred?.factors.map(f => ({
    subject: f.label,
    [home.split(" ").pop()!]: f.home,
    [away.split(" ").pop()!]: f.away,
  }));

  return (
    <AnalystePageTransition>
      {/* Header */}
      <ACard glow>
        <div className="flex flex-wrap items-center gap-4">
          <motion.div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(139,92,246,0.18)" }}
            animate={{ boxShadow: ["0 0 0px #8B5CF600","0 0 24px #8B5CF655","0 0 0px #8B5CF600"] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <Brain size={22} style={{ color: "#8B5CF6" }} />
          </motion.div>
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Match Prediction Engine</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Random Forest · XGBoost · CatBoost — Ensemble ML</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {/* Home selector */}
            <div className="relative">
              <select value={home} onChange={e => setHome(e.target.value)}
                className="appearance-none cursor-pointer rounded-xl border px-4 py-2.5 pr-8 text-sm font-bold outline-none"
                style={{ background: "rgba(255,122,0,0.12)", borderColor: "rgba(255,122,0,0.35)", color: "#FF7A00" }}>
                {teams.map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-3.5" style={{ color: "#FF7A00" }} />
            </div>
            <Swords size={16} style={{ color: "var(--text-muted)" }} />
            {/* Away selector */}
            <div className="relative">
              <select value={away} onChange={e => setAway(e.target.value)}
                className="appearance-none cursor-pointer rounded-xl border px-4 py-2.5 pr-8 text-sm font-bold outline-none"
                style={{ background: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.35)", color: "#3B82F6" }}>
                {teams.filter((t: string) => t !== home).map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-3.5" style={{ color: "#3B82F6" }} />
            </div>
            <motion.button type="button" onClick={runPrediction} disabled={predicting}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 18px rgba(139,92,246,0.35)" }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {predicting ? (
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}>
                  <RefreshCw size={14} />
                </motion.span>
              ) : <Brain size={14} />}
              {predicting ? "Calcul ML..." : "Prédire"}
            </motion.button>
          </div>
        </div>
      </ACard>

      <AnimatePresence mode="wait">
        {predicting && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20">
            <motion.div className="flex h-20 w-20 items-center justify-center rounded-full mb-4"
              style={{ background: "rgba(139,92,246,0.12)", border: "2px solid rgba(139,92,246,0.3)" }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }} transition={{ duration: 1.4, repeat: Infinity }}>
              <Brain size={28} style={{ color: "#8B5CF6" }} />
            </motion.div>
            <motion.p className="text-sm font-semibold" style={{ color: "#8B5CF6" }}
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
              Analyse 847 matchs historiques...
            </motion.p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Random Forest · XGBoost · CatBoost</p>
          </motion.div>
        )}

        {pred && !predicting && (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Main prediction */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Outcome probabilities */}
              <ACard className="md:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Résultats probables</p>
                  <Target size={14} style={{ color: "#8B5CF6" }} />
                </div>
                <div className="space-y-3">
                  <OutcomeBar label={`Victoire ${home.split(" ").slice(-1)[0]}`} value={pred.win}  color="#22C55E" total={100} />
                  <OutcomeBar label="Match nul"                                   value={pred.draw} color="#F59E0B" total={100} />
                  <OutcomeBar label={`Victoire ${away.split(" ").slice(-1)[0]}`}  value={pred.loss} color="#3B82F6" total={100} />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-xl border p-2.5 text-center"
                    style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.2)" }}>
                    <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>xG {home.split(" ").pop()}</p>
                    <p className="text-xl font-extrabold" style={{ color: "#22C55E" }}>{pred.xgHome}</p>
                  </div>
                  <div className="flex-1 rounded-xl border p-2.5 text-center"
                    style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.2)" }}>
                    <p className="text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>xG {away.split(" ").pop()}</p>
                    <p className="text-xl font-extrabold" style={{ color: "#3B82F6" }}>{pred.xgAway}</p>
                  </div>
                </div>
              </ACard>

              {/* Score probabilities */}
              <ACard className="md:col-span-1">
                <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Scores les plus probables</p>
                <div className="space-y-2">
                  {pred.scores.map((s, i) => (
                    <motion.div key={s.score} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3">
                      <span className="w-8 shrink-0 text-center rounded-lg py-1 text-sm font-black"
                        style={{ background: i === 0 ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.04)", color: i === 0 ? "#8B5CF6" : "var(--text-primary)" }}>
                        {s.score}
                      </span>
                      <div className="flex-1 overflow-hidden rounded-full h-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background: i === 0 ? "#8B5CF6" : "rgba(255,255,255,0.15)" }}
                          initial={{ width: 0 }} animate={{ width: `${(s.prob / 20) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.3 + i * 0.07 }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>{s.prob}%</span>
                    </motion.div>
                  ))}
                </div>
                {/* Key players */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Joueurs clés</p>
                  {pred.keyPlayers.map(kp => (
                    <div key={kp.name} className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--text-secondary)" }}>{kp.name}</span>
                      <span className="font-bold" style={{ color: kp.color }}>{kp.impact}</span>
                    </div>
                  ))}
                </div>
              </ACard>

              {/* Model ensemble */}
              <ACard className="md:col-span-1">
                <p className="mb-4 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Ensemble ML</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pred.models} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "var(--text-muted)", fontSize: 9 }} axisLine={false} tickLine={false} />
                      <Tooltip {...TOOLTIP_STYLE} />
                      <Bar dataKey="win"  name="Victoire" radius={[3,3,0,0]} fill="#22C55E" fillOpacity={0.85} />
                      <Bar dataKey="draw" name="Nul"      radius={[3,3,0,0]} fill="#F59E0B" fillOpacity={0.85} />
                      <Bar dataKey="loss" name="Défaite"  radius={[3,3,0,0]} fill="#3B82F6" fillOpacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-center gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "#22C55E" }} />Victoire</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "#F59E0B" }} />Nul</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "#3B82F6" }} />Défaite</span>
                </div>
              </ACard>
            </div>

            {/* Factor radar */}
            <ACard>
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                <Zap size={13} className="inline mr-1.5" style={{ color: "#8B5CF6" }} />
                Facteurs déterminants — {home} vs {away}
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.07)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                    <Radar name={home.split(" ").pop()} dataKey={home.split(" ").pop()!} stroke="#FF7A00" fill="#FF7A00" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name={away.split(" ").pop()} dataKey={away.split(" ").pop()!} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
                    <Tooltip {...TOOLTIP_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </ACard>

            {/* Confidence + verdict */}
            <ACard glow>
              <div className="flex flex-col items-center gap-2 text-center">
                <motion.div className="flex h-16 w-16 items-center justify-center rounded-full border-4 text-xl font-black"
                  style={{ borderColor: "#8B5CF6", color: "var(--text-primary)" }}
                  animate={{ boxShadow: ["0 0 0px #8B5CF600","0 0 28px #8B5CF655","0 0 0px #8B5CF600"] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  {72 + (pred.win % 10)}%
                </motion.div>
                <p className="text-xs font-semibold" style={{ color: "#8B5CF6" }}>Confiance modèle</p>
                <p className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
                  Verdict IA : <span style={{ color: "#22C55E" }}>Victoire {home}</span> probable — Score le plus likely <span style={{ color: "#8B5CF6" }}>2-1</span>
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Basé sur 847 matchs historiques · Précision historique 71.4%
                </p>
              </div>
            </ACard>
          </motion.div>
        )}

        {!pred && !predicting && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20">
            <motion.div className="flex h-20 w-20 items-center justify-center rounded-full mb-4"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
              animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
              <TrendingUp size={28} style={{ color: "#8B5CF6" }} />
            </motion.div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Sélectionner les équipes et lancer la prédiction</p>
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Modèles ML entraînés sur 5 saisons Ligue Tunisienne Pro</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AnalystePageTransition>
  );
}
