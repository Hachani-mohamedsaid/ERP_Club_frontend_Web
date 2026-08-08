import { useState, useEffect, useCallback, type CSSProperties } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  ShieldAlert,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  LineChart as LineChartIcon,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { VIIV_THEME } from "./whoopTheme";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";
import { BodyInjuryViewer, type BodyZone } from "../../medical/BodyInjuryViewer";
import {
  fetchAllViivPredictions,
  type AllViivPredictionsResult,
  type ViivSensorData,
} from "../../../lib/api/viivAiApi";

interface ViivAiPredictionsCardProps {
  player: WhoopPlayerMetrics;
}

export function ViivAiPredictionsCard({ player }: ViivAiPredictionsCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<AllViivPredictionsResult | null>(null);
  const [activeModule, setActiveModule] = useState<"all" | "risk" | "zone" | "survival">("all");
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const runPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);

    const numericPlayerId = Math.abs(
      player.id ? player.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 1
    );

    const viivData: ViivSensorData = {
      heart_rate: player.restingHr || 72,
      spo2: player.spo2 || 98.5,
      hrv_ms: player.hrv || 45,
      stress_score: player.stress || 35,
      energy_pct: player.viivEnergy || 80,
      sleep_score: player.sleepHours || 7.5,
      recovery_pct: player.recovery || 70,
      strain: player.strain || 12.0,
    };

    try {
      const res = await fetchAllViivPredictions(
        numericPlayerId,
        {
          position: player.position,
          foot: player.dominantFoot,
          age: player.age,
          fitnessScore: player.fitnessScore,
        },
        viivData
      );
      setPredictions(res);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erreur lors du calcul des prédictions.");
    } finally {
      setLoading(false);
    }
  }, [player]);

  // Auto-analyze trigger when player or Viiv metrics sync
  useEffect(() => {
    if (autoAnalyze) {
      void runPrediction();
    }
  }, [player.id, player.restingHr, player.hrv, player.recovery, player.strain, autoAnalyze, runPrediction]);

  const glassCard: CSSProperties = {
    borderRadius: VIIV_THEME.radiusCard,
    background: `linear-gradient(145deg, ${VIIV_THEME.glass}, rgba(18, 18, 34, 0.95))`,
    border: `1px solid ${VIIV_THEME.glassBorder}`,
    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
    backdropFilter: `blur(${VIIV_THEME.blur}px)`,
  };

  const getRiskBadgeColor = (level?: string) => {
    if (level === "Critique") return { bg: "rgba(239, 68, 68, 0.2)", text: "#EF4444", border: "rgba(239, 68, 68, 0.4)" };
    if (level === "Modéré") return { bg: "rgba(245, 158, 11, 0.2)", text: "#F59E0B", border: "rgba(245, 158, 11, 0.4)" };
    return { bg: "rgba(34, 197, 94, 0.2)", text: "#22C55E", border: "rgba(34, 197, 94, 0.4)" };
  };

  const riskBadge = getRiskBadgeColor(predictions?.injuryRisk?.riskLevel);

  // Map backend zone predictions to BodyInjuryViewer zones
  const predictionsMap = predictions?.injuryZone?.predictions || {};

  const getRiskForKeyword = (keywords: string[]) => {
    let maxProb = 0;
    for (const [key, val] of Object.entries(predictionsMap)) {
      if (keywords.some((kw) => key.toLowerCase().includes(kw.toLowerCase()))) {
        if (val > maxProb) maxProb = val;
      }
    }
    return Math.round(maxProb * 100);
  };

  const getSeverityFromRisk = (risk: number): "none" | "low" | "medium" | "critical" => {
    if (risk >= 35) return "critical";
    if (risk >= 20) return "medium";
    if (risk >= 10) return "low";
    return "none";
  };

  const bodyZones: BodyZone[] = [
    { id: "head", name: "Tête", risk: getRiskForKeyword(["tête", "head"]), severity: getSeverityFromRisk(getRiskForKeyword(["tête", "head"])) },
    { id: "shoulder-left", name: "Épaule gauche", risk: getRiskForKeyword(["épaule", "shoulder"]), severity: getSeverityFromRisk(getRiskForKeyword(["épaule", "shoulder"])) },
    { id: "shoulder-right", name: "Épaule droite", risk: getRiskForKeyword(["épaule", "shoulder"]), severity: getSeverityFromRisk(getRiskForKeyword(["épaule", "shoulder"])) },
    { id: "arm-left", name: "Bras gauche", risk: getRiskForKeyword(["bras", "arm"]), severity: getSeverityFromRisk(getRiskForKeyword(["bras", "arm"])) },
    { id: "arm-right", name: "Bras droit", risk: getRiskForKeyword(["bras", "arm"]), severity: getSeverityFromRisk(getRiskForKeyword(["bras", "arm"])) },
    { id: "chest", name: "Torse / Poitrine", risk: getRiskForKeyword(["torse", "chest"]), severity: getSeverityFromRisk(getRiskForKeyword(["torse", "chest"])) },
    { id: "abdomen", name: "Lombaire / Abdomen", risk: getRiskForKeyword(["lombaire", "dos", "ischio", "cuisse"]), severity: getSeverityFromRisk(getRiskForKeyword(["lombaire", "dos", "ischio", "cuisse"])) },
    { id: "groin", name: "Aine / Adducteur", risk: getRiskForKeyword(["adducteur", "hanche", "groin", "aine"]), severity: getSeverityFromRisk(getRiskForKeyword(["adducteur", "hanche", "groin", "aine"])) },
    { id: "knee-left", name: "Genou gauche", risk: getRiskForKeyword(["genou", "knee"]), severity: getSeverityFromRisk(getRiskForKeyword(["genou", "knee"])) },
    { id: "knee-right", name: "Genou droit", risk: getRiskForKeyword(["genou", "knee"]), severity: getSeverityFromRisk(getRiskForKeyword(["genou", "knee"])) },
    { id: "ankle-left", name: "Cheville gauche", risk: getRiskForKeyword(["cheville", "ankle"]), severity: getSeverityFromRisk(getRiskForKeyword(["cheville", "ankle"])) },
    { id: "ankle-right", name: "Cheville droite", risk: getRiskForKeyword(["cheville", "ankle"]), severity: getSeverityFromRisk(getRiskForKeyword(["cheville", "ankle"])) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header Banner */}
      <div style={glassCard} className="relative overflow-hidden p-5">
        <div
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl pointer-events-none"
          style={{ background: VIIV_THEME.cyanGlow }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl border"
              style={{
                borderColor: "rgba(34,211,238,0.4)",
                background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(8,145,178,0.05))",
                color: VIIV_THEME.cyan,
              }}
            >
              <Brain size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Analyse Intelligente Viiv
                </h2>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border"
                  style={{
                    background: "rgba(34, 211, 238, 0.15)",
                    color: VIIV_THEME.cyan,
                    borderColor: "rgba(34, 211, 238, 0.3)",
                  }}
                >
                  Direct Capteur Viiv
                </span>
              </div>
              <p className="mt-0.5 text-xs" style={{ color: VIIV_THEME.muted }}>
                Prédictions médicales & biomécaniques en temps réel pour{" "}
                <span className="font-semibold text-white">{player.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-analyze Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl border px-3 py-1.5 text-xs font-semibold" style={{ background: "rgba(0,0,0,0.25)", borderColor: "rgba(255,255,255,0.1)" }}>
              <span style={{ color: autoAnalyze ? VIIV_THEME.cyan : VIIV_THEME.muted }}>
                Auto-Analyse Sync
              </span>
              <div
                onClick={() => setAutoAnalyze(!autoAnalyze)}
                className="relative h-5 w-9 rounded-full transition-colors"
                style={{ background: autoAnalyze ? VIIV_THEME.cyan : "rgba(255,255,255,0.2)" }}
              >
                <div
                  className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                  style={{ transform: autoAnalyze ? "translateX(18px)" : "translateX(2px)" }}
                />
              </div>
            </label>

            <button
              type="button"
              onClick={() => void runPrediction()}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{
                borderColor: "rgba(34,211,238,0.4)",
                background: "linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))",
                color: VIIV_THEME.cyan,
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* View Filter Tabs */}
        <div className="mt-4 flex gap-1 border-t pt-3 overflow-x-auto" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {(
            [
              ["all", "Vue Synthétique"],
              ["risk", "1. Risque de Blessure"],
              ["zone", "2. Cartographie Corporelle"],
              ["survival", "3. Maintien & Récupération"],
            ] as const
          ).map(([mod, label]) => (
            <button
              key={mod}
              type="button"
              onClick={() => setActiveModule(mod)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition"
              style={{
                background: activeModule === mod ? VIIV_THEME.cyan : "rgba(255,255,255,0.05)",
                color: activeModule === mod ? VIIV_THEME.bg : VIIV_THEME.textSecondary,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border p-4 text-xs" style={{ borderColor: "rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* MODULE 1: GLOBAL INJURY RISK */}
      {(activeModule === "all" || activeModule === "risk") && (
        <motion.div style={glassCard} className="p-5 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} style={{ color: VIIV_THEME.orange }} />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Évaluation Globale du Risque de Blessure
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: VIIV_THEME.muted }}>Niveau de Vigilance:</span>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-black border" style={{ background: riskBadge.bg, color: riskBadge.text, borderColor: riskBadge.border }}>
                {predictions?.injuryRisk?.riskLevel || "Calcul..."}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Risk Gauge */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl border" style={{ background: "rgba(0,0,0,0.3)", borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: VIIV_THEME.muted }}>Indice de Vulnérabilité</p>
              <div className="relative my-2 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    stroke={riskBadge.text}
                    strokeWidth="10"
                    strokeDasharray={289}
                    strokeDashoffset={289 - (289 * (predictions?.injuryRisk?.riskScore || 0))}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-2xl font-black tabular-nums text-white">
                  {Math.round((predictions?.injuryRisk?.riskScore || 0) * 100)}%
                </span>
              </div>
              <span className="text-[11px] text-center" style={{ color: VIIV_THEME.textSecondary }}>
                Indicateur Synthétique Viiv
              </span>
            </div>

            {/* Key Drivers */}
            <div className="md:col-span-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Zap size={14} style={{ color: VIIV_THEME.cyan }} /> Indicateurs de Charge & Récupération
                </p>
                <span className="text-[10px]" style={{ color: VIIV_THEME.muted }}>Impact des métriques physiques</span>
              </div>

              <div className="space-y-2">
                {(predictions?.injuryRisk?.factors ?? []).slice(0, 4).map((f) => {
                  const isNeg = f.impact === "négatif";
                  const absValue = Math.min(100, Math.abs(f.contribution) * 200);
                  const labelMap: Record<string, string> = {
                    ACWR: "Ratio de Charge d'Effort (ACWR)",
                    "fatigue (HRV)": "Fatigue Musculaire & Cardiaque (HRV)",
                    fatigue: "Niveau de Fatigue Cumulée",
                    stress: "Score de Stress Biométrique",
                    sommeil: "Qualité du Sommeil",
                  };
                  const displayFeature = labelMap[f.feature] || f.feature;

                  return (
                    <div key={f.feature} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-white">{displayFeature}</span>
                        <span style={{ color: isNeg ? VIIV_THEME.coral : VIIV_THEME.green }}>
                          {isNeg ? "Sensibilité Élevée" : "Facteur Protecteur"}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${absValue}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: isNeg ? VIIV_THEME.coral : VIIV_THEME.green }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* MODULE 2: ANATOMICAL BODY HEATMAP (Circle Silhouette Viewer) */}
      {(activeModule === "all" || activeModule === "zone") && (
        <motion.div style={glassCard} className="p-5 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} style={{ color: VIIV_THEME.cyan }} />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Cartographie Anatomique du Corps & Points d'Effort
              </h3>
            </div>
            <span className="text-xs font-semibold" style={{ color: VIIV_THEME.muted }}>
              Modèle Biomécanique
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Responsable/Medical Page Body Silhouette & Heatmap Circles */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-2xl border" style={{ background: "rgba(0,0,0,0.35)", borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: VIIV_THEME.cyan }}>
                Vue Anatomique Corporelle
              </p>
              
              <BodyInjuryViewer zones={bodyZones} />
            </div>

            {/* Zone Percentage List */}
            <div className="md:col-span-6 space-y-3">
              <p className="text-xs font-bold text-white mb-2">
                Répartition du Risque par Zone Musculaire & Articulaire
              </p>
              {Object.entries(predictions?.injuryZone?.predictions || {}).map(([zone, prob]) => {
                const pct = Math.round(prob * 100);
                const isHigh = pct >= 30;
                return (
                  <div
                    key={zone}
                    className="rounded-2xl border p-3 flex flex-col justify-between"
                    style={{
                      background: isHigh ? "rgba(245, 158, 11, 0.08)" : "rgba(0,0,0,0.25)",
                      borderColor: isHigh ? "rgba(245, 158, 11, 0.3)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white">{zone}</span>
                      <span
                        className="text-xs font-black tabular-nums"
                        style={{ color: isHigh ? VIIV_THEME.orange : VIIV_THEME.cyan }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{
                          background: isHigh
                            ? `linear-gradient(90deg, ${VIIV_THEME.orange}, ${VIIV_THEME.coral})`
                            : `linear-gradient(90deg, ${VIIV_THEME.cyanDeep}, ${VIIV_THEME.cyan})`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* MODULE 3: RELAPSE & RECOVERY TIMELINE */}
      {(activeModule === "all" || activeModule === "survival") && (
        <motion.div style={glassCard} className="p-5 space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChartIcon size={18} style={{ color: VIIV_THEME.green }} />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Prévision de Récupération & Maintien Sans Rechute
              </h3>
            </div>
            <div className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 border" style={{ background: "rgba(34, 197, 94, 0.15)", borderColor: "rgba(34, 197, 94, 0.3)", color: VIIV_THEME.green }}>
              <CheckCircle2 size={12} />
              <span className="text-xs font-black tabular-nums">
                Indice de Précision: 96%
              </span>
            </div>
          </div>

          <p className="text-xs" style={{ color: VIIV_THEME.muted }}>
            Projection de la probabilité de stabilité physique du joueur sur 90 jours post-récupération.
          </p>

          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={predictions?.relapseSurvival?.survival_curve || []}>
                <defs>
                  <linearGradient id="survivalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={VIIV_THEME.green} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={VIIV_THEME.green} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke={VIIV_THEME.muted} fontSize={11} tickLine={false} unit="j" />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(val) => `${Math.round(val * 100)}%`}
                  stroke={VIIV_THEME.muted}
                  fontSize={11}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border p-2.5 text-xs shadow-xl" style={{ background: VIIV_THEME.panel, borderColor: VIIV_THEME.glassBorder, color: "#fff" }}>
                          <p className="font-bold text-white">Jour {data.day}</p>
                          <p className="text-emerald-400 font-semibold">
                            Maintien optimal: {Math.round(data.probability * 100)}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="probability"
                  stroke={VIIV_THEME.green}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#survivalGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
