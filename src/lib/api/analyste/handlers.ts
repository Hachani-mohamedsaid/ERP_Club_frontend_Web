import {
  AI_TACTICAL_CENTER,
  ANALYSTE_INFO,
  DEFAULT_SQUAD,
  DEFAULT_TRAINING_PLAN,
  DETECTED_PATTERNS,
  EVOLUTION_FORECASTS,
  EXECUTIVE_AI_RECO,
  EXECUTIVE_KPIS,
  INJURY_PREDICTIONS,
  MARKET_VALUES,
  MATCH_EVENTS,
  OPPONENT_INTEL,
  SCOUTING_COMPARE,
  TACTICAL_SUGGESTIONS,
  VIDEO_COACH_INSIGHTS,
  BENCH_PLAYERS,
} from "../../../data/analysteData";
import {
  CHEMISTRY_MATRIX,
  CHEMISTRY_NODE_POSITIONS,
  CHEMISTRY_PLAYERS,
  DASHBOARD_LIVE_STATS,
  INJURY_FORECASTS,
  LIVE_MATCH_DATA,
  LIVE_MATCH_EVENTS,
  LIVE_MATCH_PLAYERS,
  PATTERNS_SUMMARY,
  PLAYER_HEATMAPS,
  PPI_PLAYERS,
  PREDICTION_TEAMS,
  TEAM_FATIGUE_BY_MIN,
  TRAINING_BANNER,
  TRANSFER_TARGETS,
  VIDEO_AI_INSIGHTS,
  VIDEO_HIGHLIGHTS,
  computeMatchPrediction,
} from "../../../data/analysteExtendedData";
import { WHOOP_SQUAD } from "../../../data/whoopData";

export interface AnalysteRouteResult {
  status: number;
  body: unknown;
}

function ok(body: unknown): AnalysteRouteResult {
  return { status: 200, body };
}

function notFound(): AnalysteRouteResult {
  return { status: 404, body: { message: "Route analyste introuvable" } };
}

export function handleAnalysteRoute(
  method: string,
  pathname: string,
  body?: { home?: string; away?: string },
): AnalysteRouteResult {
  const path = pathname.replace(/^\/api/, "").replace(/\/$/, "") || "/analyste";

  if (method === "GET" && path === "/analyste/dashboard") {
    return ok({
      info: ANALYSTE_INFO,
      patterns: DETECTED_PATTERNS,
      liveStats: DASHBOARD_LIVE_STATS,
      tacticalCenter: AI_TACTICAL_CENTER,
    });
  }

  if (method === "GET" && path === "/analyste/executive") {
    return ok({ kpis: EXECUTIVE_KPIS, recommendations: EXECUTIVE_AI_RECO });
  }

  if (method === "GET" && path === "/analyste/live-match") {
    return ok({
      homeTeam: "FC Carthage",
      awayTeam: "EST",
      score: { home: 1, away: 1 },
      minute: 65,
      minuteData: LIVE_MATCH_DATA,
      events: LIVE_MATCH_EVENTS,
      players: LIVE_MATCH_PLAYERS,
    });
  }

  if (method === "GET" && path === "/analyste/prediction/teams") {
    return ok({ teams: PREDICTION_TEAMS });
  }

  if (method === "POST" && path === "/analyste/prediction") {
    const home = body?.home ?? PREDICTION_TEAMS[0];
    const away = body?.away ?? PREDICTION_TEAMS[1];
    return ok({ home, away, prediction: computeMatchPrediction(home, away) });
  }

  if (method === "GET" && path === "/analyste/ppi") {
    return ok({ players: PPI_PLAYERS });
  }

  if (method === "GET" && path === "/analyste/chemistry") {
    const teamAvg = Math.round(CHEMISTRY_MATRIX.reduce((s, m) => s + m.score, 0) / CHEMISTRY_MATRIX.length);
    const sorted = [...CHEMISTRY_MATRIX].sort((a, b) => b.score - a.score);
    return ok({
      players: CHEMISTRY_PLAYERS,
      matrix: CHEMISTRY_MATRIX,
      nodePositions: CHEMISTRY_NODE_POSITIONS,
      summary: {
        teamAvg,
        bestPair: sorted[0],
        worstPair: sorted[sorted.length - 1],
        topDuos: sorted.slice(0, 4),
      },
    });
  }

  if (method === "GET" && path === "/analyste/patterns") {
    return ok({ patterns: DETECTED_PATTERNS, summary: PATTERNS_SUMMARY });
  }

  if (method === "GET" && path === "/analyste/tactical") {
    return ok({
      squad: DEFAULT_SQUAD,
      bench: BENCH_PLAYERS,
      suggestions: TACTICAL_SUGGESTIONS,
      aiCenter: AI_TACTICAL_CENTER,
    });
  }

  if (method === "GET" && path === "/analyste/video-analysis") {
    return ok({
      matchTitle: "FC Carthage vs EST — Match Footage",
      highlights: VIDEO_HIGHLIGHTS,
      insights: VIDEO_AI_INSIGHTS,
      events: MATCH_EVENTS,
    });
  }

  if (method === "POST" && path === "/analyste/video-analysis/process") {
    const body = (init?.body ? JSON.parse(init.body as string) : {}) as {
      playerName?: string;
      durationSec?: number;
      frames?: { timeSec: number }[];
    };
    const frames = body.frames ?? [];
    return ok({
      summary: `Analyse locale — ${body.playerName ?? "Joueur"}. Connectez le backend Render pour OpenAI + Claude.`,
      confidence: 75,
      models: { openai: null, claude: null },
      aiEnabled: false,
      player: { name: body.playerName ?? "Joueur", detected: true, jersey: "#8", position: "MIL" },
      speed: {
        maxKmh: 31,
        avgKmh: 19,
        sprints: 4,
        timeline: frames.map((f, i) => ({ timeSec: f.timeSec, speedKmh: 16 + i * 2 })),
      },
      physical: { distanceKm: 1.7, highIntensityRuns: 5, accelerationPeaks: 7, decelerationPeaks: 6, workRate: "Modéré" },
      technical: [
        { category: "Course", score: 80, details: ["Mode démo local"] },
        { category: "Technique", score: 74, details: ["Mode démo local"] },
      ],
      events: frames.slice(0, 6).map((f, i) => ({
        timeSec: f.timeSec,
        timeLabel: `${String(Math.floor(f.timeSec / 60)).padStart(2, "0")}:${String(Math.floor(f.timeSec % 60)).padStart(2, "0")}`,
        type: "Sprint",
        description: `Segment ${i + 1} — analyse démo`,
        speedKmh: 18 + i * 2,
        confidence: 72,
      })),
      tactical: {
        strengths: ["Bon engagement"],
        weaknesses: ["À affiner avec IA"],
        recommendations: ["Configurer OPENAI_API_KEY sur Render"],
      },
      coachReport: "Rapport démo — déployez le backend avec les clés IA pour une analyse vidéo professionnelle complète.",
      durationSec: body.durationSec ?? 90,
      processedFrames: frames.length,
      durationMs: 1200,
      playerProfile: {
        ppi: 82, ppiTrend: [78, 79, 80, 81, 82, 83], form: "rising", age: 26,
        attributes: { speed: 78, pressing: 85, xg: 65, dribbling: 72, defending: 80, stamina: 70, vision: 82, leadership: 85 },
        fatigue: 68, injuryRisk: 22, potential: 86, marketValue: "1.2M€",
        rawAnalysis: `Profil RAW démo — ${body.playerName ?? "Joueur"}. Analyse complète disponible avec clés IA.`,
        predictions: [
          { label: "PPI 90j", value: "84", confidence: 86, horizon: "90 jours" },
          { label: "Forme prochain match", value: "Titulaire", confidence: 88, horizon: "7 jours" },
        ],
      },
      videoPredictions: frames.map((f, i) => ({
        timeSec: f.timeSec,
        speedKmh: 16 + i * 2,
        action: ["Marche", "Course", "Sprint", "Accélération"][i % 4],
        actionNext: "Course",
        fatiguePct: 15 + i * 8,
        ppiLive: 84 - i,
        injuryRiskPct: 18 + i * 2,
        intensity: (i > 2 ? "high" : "medium") as "medium" | "high",
        confidence: 80,
      })),
      movementFrames: frames.map((f, i) => ({
        timeSec: f.timeSec,
        timeLabel: `${String(Math.floor(f.timeSec / 60)).padStart(2, "0")}:${String(Math.floor(f.timeSec % 60)).padStart(2, "0")}`,
        action: ["Appui", "Accélération", "Sprint", "Contact balle"][i % 4],
        speedKmh: 16 + i * 2,
        accelerationMs2: 1.2 + i * 0.8,
        strideLengthCm: 120 + i * 4,
        cadenceSpm: 160 + i * 3,
        centerOfMass: "medium" as const,
        ballContact: i % 3 === 2,
        zone: "Zone médiane",
        direction: "Avant",
        biomechanics: `Analyse frame ${i + 1} — posture et appuis analysés (mode démo).`,
        technicalNote: "Configurer clés IA pour analyse NASA-level.",
        postureScore: 78 + i * 2,
        symmetryIndex: 82 + i,
        confidence: 75,
      })),
      biomechanics: {
        avgStrideLengthCm: 128,
        avgCadenceSpm: 168,
        symmetryIndex: 85,
        postureScore: 82,
        explosivenessIndex: 76,
        loadIndex: 58,
        keyFindings: ["Mode démo — biomécanique frame-par-frame avec clés IA"],
        microAdjustments: ["Déployer backend avec OPENAI + ANTHROPIC"],
      },
    });
  }

  if (method === "GET" && path === "/analyste/video-coach") {
    return ok({ insights: VIDEO_COACH_INSIGHTS });
  }

  if (method === "GET" && path === "/analyste/replay") {
    return ok({ events: MATCH_EVENTS, videoDuration: 5400 });
  }

  if (method === "GET" && path === "/analyste/opponent") {
    return ok({ intel: OPPONENT_INTEL });
  }

  if (method === "GET" && path === "/analyste/fatigue") {
    const crash = TEAM_FATIGUE_BY_MIN.reduce((max, d) => (d.fatigue > max.fatigue ? d : max), TEAM_FATIGUE_BY_MIN[0]);
    return ok({
      intervals: ["0-15", "15-30", "30-45", "45-60", "60-75", "75-90"],
      teamFatigue: TEAM_FATIGUE_BY_MIN,
      playerHeatmaps: PLAYER_HEATMAPS,
      summary: {
        maxFatigue: 89,
        collapseRange: "75-90",
        criticalErrors: 3,
        actionsDelta: -48,
        crashInterval: crash.interval,
      },
    });
  }

  if (method === "GET" && path === "/analyste/whoop") {
    return ok({ squad: WHOOP_SQUAD, defaultPlayerId: "2" });
  }

  if (method === "GET" && path === "/analyste/injuries") {
    return ok({ predictions: INJURY_PREDICTIONS });
  }

  if (method === "GET" && path === "/analyste/injury-forecast") {
    const avgConfidence = Math.round(INJURY_FORECASTS.reduce((s, f) => s + f.confidence, 0) / INJURY_FORECASTS.length);
    const avgRelapse = Math.round(INJURY_FORECASTS.reduce((s, f) => s + f.riskAfterReturn, 0) / INJURY_FORECASTS.length);
    const fastest = INJURY_FORECASTS.reduce((min, f) => (f.returnDays < min.returnDays ? f : min), INJURY_FORECASTS[0]);
    return ok({
      forecasts: INJURY_FORECASTS,
      summary: {
        injuredCount: INJURY_FORECASTS.length,
        fastestReturnDays: fastest.returnDays,
        avgConfidence,
        avgRelapseRisk: avgRelapse,
      },
    });
  }

  if (method === "GET" && path === "/analyste/transfer") {
    const avgCompat = Math.round(TRANSFER_TARGETS.reduce((s, t) => s + t.compatibility, 0) / TRANSFER_TARGETS.length);
    const maxXg = TRANSFER_TARGETS.reduce((max, t) => {
      const n = parseInt(t.xgGain.replace(/\D/g, ""), 10);
      return n > max ? n : max;
    }, 0);
    return ok({
      transfers: TRANSFER_TARGETS,
      summary: {
        targeted: TRANSFER_TARGETS.length,
        avgCompatibility: avgCompat,
        maxXgGain: `+${maxXg}%`,
        totalBudget: "5.1M€",
      },
    });
  }

  if (method === "GET" && path === "/analyste/market-value") {
    return ok({ values: MARKET_VALUES });
  }

  if (method === "GET" && path === "/analyste/scouting") {
    return ok({ compare: SCOUTING_COMPARE });
  }

  if (method === "GET" && path === "/analyste/evolution") {
    return ok({ forecasts: EVOLUTION_FORECASTS });
  }

  if (method === "GET" && path === "/analyste/training") {
    return ok({ plan: DEFAULT_TRAINING_PLAN, banner: TRAINING_BANNER });
  }

  return notFound();
}
