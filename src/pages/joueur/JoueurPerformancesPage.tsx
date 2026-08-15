import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Zap, Brain, Dumbbell, Heart, Play, Target, Crosshair, AlertCircle, X } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { PlayerHeatmap } from "../../components/player/PlayerHeatmap";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";
import { usePlayerHeatmap } from "../../hooks/usePlayerHeatmap";
import { aiPlayerApi } from "../../lib/api/ai/player";
import { useLocale } from "../../contexts/LocaleContext";
import { staggerContainer, staggerItem } from "../../lib/animations";

const OVERVIEW_KEYS = [
  { key: "vitesse" as const, icon: Zap, color: "#FF6B57", label: "Vitesse" },
  { key: "technique" as const, icon: Brain, color: "#3B82F6", label: "Technique" },
  { key: "physique" as const, icon: Dumbbell, color: "#22C55E", label: "Physique" },
  { key: "mental" as const, icon: Heart, color: "#F59E0B", label: "Mental" },
];

// French month labels used to extend the evolution chart into forecast months.
const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function nextMonths(lastLabel: string, count: number): string[] {
  const idx = MONTHS_FR.findIndex((m) => m.toLowerCase() === lastLabel.trim().toLowerCase());
  if (idx === -1) return Array.from({ length: count }, (_, i) => `M+${i + 1}`);
  return Array.from({ length: count }, (_, i) => MONTHS_FR[(idx + 1 + i) % 12]);
}

type EvolutionPoint = { month: string; score: number | null; forecast: number | null };

/** Combine actual monthly scores with the AI forecast into one continuous chart series. */
function buildEvolutionChart(
  actual: Array<{ month: string; score: number }>,
  forecast: number[] | null,
): EvolutionPoint[] {
  const base: EvolutionPoint[] = actual.map((p) => ({ month: p.month, score: p.score, forecast: null }));
  if (!forecast || forecast.length === 0 || base.length === 0) return base;
  // Bridge the last actual point into the forecast series for a continuous line.
  const last = base[base.length - 1];
  base[base.length - 1] = { ...last, forecast: last.score };
  const labels = nextMonths(last.month, forecast.length);
  const fc: EvolutionPoint[] = forecast.map((v, i) => ({ month: labels[i], score: null, forecast: v }));
  return [...base, ...fc];
}

interface VideoModal { title: string; thumbnail: string }

export function JoueurPerformancesPage() {
  const { player } = useCurrentPlayer();
  const { playerStats, matchStats, squadPlayers, myPlayerId } = useJoueurBackendData();
  const { t } = useLocale();
  const [videoModal, setVideoModal] = useState<VideoModal | null>(null);

  // Numeric id for the AI endpoints (they only echo it back; fall back to 10).
  const playerIdNum = useMemo(() => {
    const n = parseInt(String(myPlayerId ?? ""), 10);
    return Number.isFinite(n) ? n : 10;
  }, [myPlayerId]);

  // Live heatmap from the AI service (falls back to curated static data).
  const { periods: heatmapPeriods, source: heatmapSource } = usePlayerHeatmap(playerIdNum);

  // AI performance forecast from the trained time-series model.
  const perfHistory = useMemo(
    () => (playerStats?.performanceEvolution ?? []).map((p) => p.score),
    [playerStats],
  );
  const [forecast, setForecast] = useState<number[] | null>(null);
  useEffect(() => {
    if (perfHistory.length < 3) return;
    let cancelled = false;
    aiPlayerApi
      .predictPerformance({
        playerId: playerIdNum,
        history: perfHistory,
        steps: 3,
        matches_played: Math.min(20, matchStats.length || 3),
      })
      .then((res) => { if (!cancelled) setForecast(res.predictions); })
      .catch(() => { if (!cancelled) setForecast(null); });
    return () => { cancelled = true; };
  }, [perfHistory, playerIdNum, matchStats.length]);

  if (!player) return null;

  // Derive team average from squad players' OVR
  const teamAvgOvr = squadPlayers.length
    ? Math.round(squadPlayers.reduce((s, p) => s + (p.ovr ?? 70), 0) / squadPlayers.length)
    : 72;

  // Top player in squad
  const topPlayer = squadPlayers.reduce(
    (best, p) => (p.ovr > (best?.ovr ?? 0) ? p : best),
    squadPlayers[0] ?? null,
  );

  // Radar data
  const radarSolo = [
    { stat: "Speed", value: player.radar.speed },
    { stat: "Passing", value: player.radar.passing },
    { stat: "Shooting", value: player.radar.shooting },
    { stat: "Physical", value: player.radar.physical },
    { stat: "Vision", value: player.radar.vision },
  ];

  // Real team radar averages computed per attribute from squad players
  function avgRadarAttr(attr: string): number {
    const vals = squadPlayers
      .map((p) => (p.radar as Record<string, number> | null)?.[attr])
      .filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return Math.round(teamAvgOvr * 0.95);
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  }

  const compareTeamData = [
    { stat: "Speed",    Moi: player.radar.speed,    Équipe: avgRadarAttr("speed") },
    { stat: "Passing",  Moi: player.radar.passing,  Équipe: avgRadarAttr("passing") },
    { stat: "Shooting", Moi: player.radar.shooting, Équipe: avgRadarAttr("shooting") },
    { stat: "Physical", Moi: player.radar.physical, Équipe: avgRadarAttr("physical") },
    { stat: "Vision",   Moi: player.radar.vision,   Équipe: avgRadarAttr("vision") },
  ];

  const topRadar = (topPlayer?.radar as Record<string, number> | null) ?? null;
  const compareTopData = [
    { stat: "Speed", Moi: player.radar.speed, Autre: topRadar?.speed ?? (player.ovr + 3) },
    { stat: "Passing", Moi: player.radar.passing, Autre: topRadar?.passing ?? (player.ovr + 3) },
    { stat: "Shooting", Moi: player.radar.shooting, Autre: topRadar?.shooting ?? (player.ovr + 3) },
    { stat: "Physical", Moi: player.radar.physical, Autre: topRadar?.physical ?? (player.ovr + 3) },
    { stat: "Vision", Moi: player.radar.vision, Autre: topRadar?.vision ?? (player.ovr + 3) },
  ];

  // Match ratings from backend (last 6)
  const matchRatings = matchStats.slice(0, 6).map((m) => ({
    label: m.opponent.split(" ").pop() ?? m.opponent,
    rating: m.rating,
  }));

  // Performance evolution
  const perfEvolution = playerStats?.performanceEvolution ?? [];
  // Only surface the forecast when we actually have enough history for it.
  const hasForecast = !!forecast && perfEvolution.length >= 3;
  // Actual months + AI forecast tail (dashed line). Falls back to actual-only.
  const evolutionChart = buildEvolutionChart(perfEvolution, hasForecast ? forecast : null);

  // Goal contribution pie — derived from real matchStats when backend data not available
  const totalGoals = matchStats.reduce((s, m) => s + m.goals, 0);
  const totalAssists = matchStats.reduce((s, m) => s + m.assists, 0);
  const totalKeyPasses = matchStats.reduce((s, m) => s + m.keyPasses, 0);
  const pieData = playerStats?.goalContribution ?? (
    totalGoals + totalAssists + totalKeyPasses > 0
      ? [
          { name: "Buts", value: totalGoals || 1, color: "#FF6B57" },
          { name: "Assists", value: totalAssists || 1, color: "#3B82F6" },
          { name: "Passes clés", value: totalKeyPasses || 1, color: "#22C55E" },
        ]
      : [
          { name: "Buts", value: 1, color: "#FF6B57" },
          { name: "Assists", value: 1, color: "#3B82F6" },
          { name: "Passes clés", value: 1, color: "#22C55E" },
        ]
  );

  // Last match for video section
  const lastMatch = matchStats[0];
  const THUMB = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=640&q=80";

  return (
    <JoueurPageTransition>
      {/* KPI Overview */}
      <motion.div className="grid grid-cols-2 gap-4 lg:grid-cols-4" variants={staggerContainer} initial="initial" animate="animate">
        {OVERVIEW_KEYS.map(({ key, icon: Icon, color, label }) => (
          <motion.div key={key} variants={staggerItem}>
            <JoueurKpiCard>
              <Icon size={18} style={{ color }} />
              <p className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="mt-1 text-3xl font-bold" style={{ color }}>
                {playerStats?.[key] ?? player.ovr}%
              </p>
            </JoueurKpiCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Heatmap */}
      <JoueurKpiCard delay={0.08}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {t.performances.heatmap}
        </h3>
        <PlayerHeatmap compact periods={heatmapPeriods} source={heatmapSource} />
      </JoueurKpiCard>

      {/* Video / Last Match Analysis */}
      {lastMatch && (
        <JoueurKpiCard delay={0.09}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.videoAnalysis}</h3>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(255,107,87,0.12)", color: "#FF6B57" }}>
              vs {lastMatch.opponent} · {lastMatch.result}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <div className="relative overflow-hidden rounded-xl">
              <img src={THUMB} alt="" className="h-40 w-full object-cover opacity-80 lg:h-full lg:min-h-[200px]" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <button
                  type="button"
                  onClick={() => setVideoModal({ title: `Analyse — vs ${lastMatch.opponent}`, thumbnail: THUMB })}
                  className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
                  style={{ background: "#FF6B57" }}
                >
                  <Play size={20} fill="white" color="white" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "rgba(0,0,0,0.6)" }}>
                {new Date(lastMatch.matchDate).toLocaleDateString("fr-FR")}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-4" style={{ borderColor: "rgba(34,197,94,0.25)", background: "rgba(34,197,94,0.06)" }}>
                <div className="mb-3 flex items-center gap-2">
                  <Target size={14} style={{ color: "#22C55E" }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: "#22C55E" }}>{t.performances.goals}</span>
                </div>
                <p className="text-3xl font-black" style={{ color: "#22C55E" }}>{lastMatch.goals}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>buts · {lastMatch.assists} assists</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{lastMatch.minutes}&apos; jouées</p>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: "rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.06)" }}>
                <div className="mb-3 flex items-center gap-2">
                  <Crosshair size={14} style={{ color: "#3B82F6" }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: "#3B82F6" }}>{t.performances.keyPasses}</span>
                </div>
                <p className="text-3xl font-black" style={{ color: "#3B82F6" }}>{lastMatch.keyPasses}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>passes clés</p>
                <div className="mt-3 space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                  <p>{lastMatch.passAccuracy}% précision</p>
                  <p>{lastMatch.distance} km parcourus</p>
                </div>
              </div>
              <div className="rounded-xl border p-4" style={{ borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)" }}>
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle size={14} style={{ color: "#EF4444" }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: "#EF4444" }}>Note Match</span>
                </div>
                <p className="text-3xl font-black" style={{ color: lastMatch.rating >= 8 ? "#22C55E" : lastMatch.rating >= 7 ? "#F59E0B" : "#EF4444" }}>
                  {lastMatch.rating.toFixed(1)}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>/ 10 · {lastMatch.sprints} sprints</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Top speed: {lastMatch.topSpeed} km/h</p>
              </div>
            </div>
          </div>
        </JoueurKpiCard>
      )}

      {/* Radar + Evolution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar FIFA</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarSolo}>
              <PolarGrid stroke="var(--chart-grid)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Radar dataKey="value" stroke="#FF6B57" fill="#FF6B57" fillOpacity={0.25} animationDuration={1200} />
            </RadarChart>
          </ResponsiveContainer>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.12}>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Évolution de performance
            {hasForecast && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
              >
                ● PRÉVISION IA
              </span>
            )}
          </h3>
          {perfEvolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={evolutionChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis domain={[60, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: "1px solid var(--surface-panel-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#FF6B57" strokeWidth={2} dot={{ r: 4, fill: "#FF6B57" }} animationDuration={1500} />
                {hasForecast && (
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={{ r: 3, fill: "#F59E0B" }}
                    animationDuration={1500}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>Données en cours de chargement…</div>
          )}
        </JoueurKpiCard>
      </div>

      {/* Match ratings + Goal contribution + Highlights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <JoueurKpiCard delay={0.15}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.matchRatings}</h3>
          {matchRatings.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={matchRatings}>
                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                <YAxis domain={[5, 10]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: "1px solid var(--surface-panel-border)", borderRadius: 12 }} />
                <Bar dataKey="rating" fill="#FF6B57" radius={[4, 4, 0, 0]} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun match enregistré</p>
          )}
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.18}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.goalContribution}</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" animationDuration={1200}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: "1px solid var(--surface-panel-border)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                <div className="h-2 w-2 rounded-full" style={{ background: d.color }} />{d.name}
              </div>
            ))}
          </div>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.2}>
          <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.highlights}</h3>
          <div className="relative overflow-hidden rounded-xl">
            <img src={THUMB} alt="" className="h-32 w-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <button
                type="button"
                onClick={() => setVideoModal({ title: "Highlights — Saison 2025-26", thumbnail: THUMB })}
                className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95"
                style={{ background: "#FF6B57" }}
              >
                <Play size={20} fill="white" color="white" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Best Of — Saison 2025-26</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{matchStats.length} matchs · HD</p>
        </JoueurKpiCard>
      </div>

      {/* Team comparisons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JoueurKpiCard delay={0.22}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.vsTeamAvg}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compareTeamData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Moi" fill="#FF6B57" radius={[4, 4, 0, 0]} animationDuration={1200} />
              <Bar dataKey="Équipe" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </JoueurKpiCard>

        <JoueurKpiCard delay={0.24}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-black" style={{ background: "rgba(255,107,87,0.15)", color: "#FF6B57" }}>
              #{topPlayer ? String(topPlayer.name[0]) : "—"}
            </div>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.performances.vsTopPlayer}</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{topPlayer?.name ?? "—"} · OVR {topPlayer?.ovr ?? "—"}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compareTopData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Moi" fill="#FF6B57" radius={[4, 4, 0, 0]} animationDuration={1200} />
              <Bar dataKey="Autre" name={topPlayer?.name.split(" ").pop() ?? "Autre"} fill="#3B82F6" radius={[4, 4, 0, 0]} animationDuration={1200} />
            </BarChart>
          </ResponsiveContainer>
        </JoueurKpiCard>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModal && (
          <motion.div
            key="video-modal"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.85)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setVideoModal(null)}
          >
            <motion.div
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl"
              style={{ background: "var(--surface-panel-solid)", border: "1px solid rgba(255,107,87,0.3)" }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img src={videoModal.thumbnail} alt={videoModal.title} className="h-full w-full object-cover opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#FF6B57" }}>
                    <Play size={28} fill="white" color="white" />
                  </div>
                  <p className="text-sm font-medium text-white/70">Lecture vidéo</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{videoModal.title}</p>
                <button
                  type="button"
                  onClick={() => setVideoModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "var(--surface-input)", color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </JoueurPageTransition>
  );
}
