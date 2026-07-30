import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";
import type { MatchPredictionResult } from "../../../data/analysteExtendedData";
import type { PPIPlayer, TransferTarget, InjuryForecastEntry } from "../../../data/analysteExtendedData";
import type {
  AITacticalCenterData,
  DetectedPattern,
  EvolutionForecast,
  ExecutiveAIReco,
  ExecutiveKpi,
  InjuryPrediction,
  MarketValueEntry,
  MatchEvent,
  OpponentIntel,
  PitchPlayer,
  ScoutingCompare,
  TacticalSuggestion,
  TrainingPlanDay,
  VideoCoachInsight,
} from "../../../data/analysteData";
import type { WhoopApiPayload } from "../../../data/whoopData";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

async function fetchAnalyste<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, init);
  return parse<T>(res);
}

export const analysteApi = {
  getDashboard: () =>
    fetchAnalyste<{
      info: { name: string; club: string; season: string };
      patterns: DetectedPattern[];
      liveStats: { label: string; value: string; color: string }[];
      tacticalCenter: AITacticalCenterData;
    }>("/analyste/dashboard"),

  getExecutive: () =>
    fetchAnalyste<{ kpis: ExecutiveKpi[]; recommendations: ExecutiveAIReco[] }>("/analyste/executive"),

  getLiveMatch: () =>
    fetchAnalyste<{
      homeTeam: string;
      awayTeam: string;
      score: { home: number; away: number };
      minute: number;
      minuteData: { minute: number; possession: number; fatigue: number; winProb: number; xg: number }[];
      events: { minute: number; type: string; player: string; team: string; desc: string }[];
      players: { name: string; fatigue: number; risk: number; readiness: number; shouldSub: boolean }[];
    }>("/analyste/live-match"),

  getPredictionTeams: () => fetchAnalyste<{ teams: string[] }>("/analyste/prediction/teams"),

  predictMatch: (home: string, away: string) =>
    fetchAnalyste<{ home: string; away: string; prediction: MatchPredictionResult }>("/analyste/prediction", {
      method: "POST",
      body: JSON.stringify({ home, away }),
    }),

  getPPI: () => fetchAnalyste<{ players: PPIPlayer[] }>("/analyste/ppi"),

  getChemistry: () =>
    fetchAnalyste<{
      players: string[];
      matrix: import("../../../data/analysteExtendedData").ChemistryLink[];
      nodePositions: Record<string, { x: number; y: number }>;
      summary: {
        teamAvg: number;
        bestPair: import("../../../data/analysteExtendedData").ChemistryLink;
        worstPair: import("../../../data/analysteExtendedData").ChemistryLink;
        topDuos: import("../../../data/analysteExtendedData").ChemistryLink[];
      };
    }>("/analyste/chemistry"),

  getPatterns: () => fetchAnalyste<{ patterns: DetectedPattern[]; summary: string }>("/analyste/patterns"),

  getTactical: () =>
    fetchAnalyste<{
      squad: PitchPlayer[];
      bench: PitchPlayer[];
      suggestions: TacticalSuggestion[];
      aiCenter: AITacticalCenterData;
    }>("/analyste/tactical"),

  getVideoAnalysis: () =>
    fetchAnalyste<{
      matchTitle: string;
      highlights: typeof import("../../../data/analysteExtendedData").VIDEO_HIGHLIGHTS;
      insights: typeof import("../../../data/analysteExtendedData").VIDEO_AI_INSIGHTS;
      events: MatchEvent[];
    }>("/analyste/video-analysis"),

  processVideoAnalysis: (body: {
    playerName: string;
    focus?: string;
    sport?: string;
    durationSec: number;
    fileName?: string;
    frames: { timeSec: number; imageBase64: string; motionScore?: number }[];
    poseSummary?: {
      detectionRate: number;
      avgLeftKnee: number;
      avgRightKnee: number;
      avgSymmetry: number;
      avgPowerIndex: number;
      dominantFoot: string;
      legInsights?: string[];
    };
    poseFrames?: {
      timeSec: number;
      leftKnee: number;
      rightKnee: number;
      leftHip?: number;
      rightHip?: number;
      leftLegPhase: string;
      rightLegPhase: string;
      footStrike: string;
      powerIndex: number;
      symmetryIndex?: number;
      trunkTilt?: number;
      notes?: string[];
    }[];
  }) =>
    fetchAnalyste<import("./videoAnalysisTypes").VideoAnalysisAiResult>("/analyste/video-analysis/process", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getVideoCoach: () => fetchAnalyste<{ insights: VideoCoachInsight[] }>("/analyste/video-coach"),

  getReplay: () => fetchAnalyste<{ events: MatchEvent[]; videoDuration: number }>("/analyste/replay"),

  getOpponent: () => fetchAnalyste<{ intel: OpponentIntel }>("/analyste/opponent"),

  getFatigue: () =>
    fetchAnalyste<{
      intervals: string[];
      teamFatigue: typeof import("../../../data/analysteExtendedData").TEAM_FATIGUE_BY_MIN;
      playerHeatmaps: typeof import("../../../data/analysteExtendedData").PLAYER_HEATMAPS;
      summary: {
        maxFatigue: number;
        collapseRange: string;
        criticalErrors: number;
        actionsDelta: number;
        crashInterval: string;
      };
    }>("/analyste/fatigue"),

  getWhoop: () => fetchAnalyste<WhoopApiPayload>("/analyste/whoop"),

  getInjuries: () => fetchAnalyste<{ predictions: InjuryPrediction[] }>("/analyste/injuries"),

  getInjuryForecast: () =>
    fetchAnalyste<{
      forecasts: InjuryForecastEntry[];
      summary: {
        injuredCount: number;
        fastestReturnDays: number;
        avgConfidence: number;
        avgRelapseRisk: number;
      };
    }>("/analyste/injury-forecast"),

  getTransfer: () =>
    fetchAnalyste<{
      transfers: TransferTarget[];
      summary: { targeted: number; avgCompatibility: number; maxXgGain: string; totalBudget: string };
    }>("/analyste/transfer"),

  getMarketValue: () => fetchAnalyste<{ values: MarketValueEntry[] }>("/analyste/market-value"),

  getScouting: () => fetchAnalyste<{ compare: ScoutingCompare }>("/analyste/scouting"),

  getEvolution: () => fetchAnalyste<{ forecasts: EvolutionForecast[] }>("/analyste/evolution"),

  getTraining: () => fetchAnalyste<{ plan: TrainingPlanDay[]; banner: string }>("/analyste/training"),
};

export type { MatchPredictionResult, PPIPlayer, TransferTarget, InjuryForecastEntry };
