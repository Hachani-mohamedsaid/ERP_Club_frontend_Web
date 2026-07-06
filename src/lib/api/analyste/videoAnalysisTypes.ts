export type MovementFrame = {
  timeSec: number;
  timeLabel: string;
  action: string;
  actionNext?: string;
  speedKmh: number;
  accelerationMs2: number;
  strideLengthCm?: number;
  cadenceSpm?: number;
  bodyTiltDeg?: number;
  centerOfMass: "low" | "medium" | "high";
  footStrike?: string;
  ballContact: boolean;
  ballDistanceM?: number;
  zone: string;
  direction: string;
  biomechanics: string;
  technicalNote: string;
  postureScore: number;
  symmetryIndex: number;
  injuryFlag?: string | null;
  confidence: number;
};

export type BiomechanicsSummary = {
  avgStrideLengthCm: number;
  avgCadenceSpm: number;
  symmetryIndex: number;
  postureScore: number;
  explosivenessIndex: number;
  loadIndex: number;
  keyFindings: string[];
  microAdjustments: string[];
};

export type VideoAnalysisAiResult = {
  summary: string;
  confidence: number;
  models: { openai: string | null; claude: string | null };
  aiEnabled: boolean;
  player: {
    name: string;
    detected: boolean;
    jersey?: string;
    position?: string;
  };
  speed: {
    maxKmh: number;
    avgKmh: number;
    sprints: number;
    timeline: { timeSec: number; speedKmh: number }[];
  };
  physical: {
    distanceKm: number;
    highIntensityRuns: number;
    accelerationPeaks: number;
    decelerationPeaks: number;
    workRate: string;
  };
  technical: { category: string; score: number; details: string[] }[];
  events: {
    timeSec: number;
    timeLabel: string;
    type: string;
    description: string;
    speedKmh?: number;
    confidence: number;
  }[];
  tactical: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  coachReport: string;
  durationSec: number;
  processedFrames: number;
  durationMs: number;
  playerProfile: {
    ppi: number;
    ppiTrend: number[];
    form: "rising" | "stable" | "falling";
    age: number;
    attributes: {
      speed: number;
      pressing: number;
      xg: number;
      dribbling: number;
      defending: number;
      stamina: number;
      vision: number;
      leadership: number;
    };
    fatigue: number;
    injuryRisk: number;
    potential: number;
    marketValue: string;
    rawAnalysis: string;
    predictions: {
      label: string;
      value: string;
      confidence: number;
      horizon: string;
    }[];
  };
  videoPredictions: {
    timeSec: number;
    speedKmh: number;
    action: string;
    actionNext: string;
    fatiguePct: number;
    ppiLive: number;
    injuryRiskPct: number;
    intensity: "low" | "medium" | "high" | "max";
    confidence: number;
  }[];
  /** Analyse frame-par-frame — biomécanique & technique */
  movementFrames: MovementFrame[];
  biomechanics: BiomechanicsSummary;
};

export function nearestVideoPrediction(
  predictions: VideoAnalysisAiResult["videoPredictions"],
  currentSec: number,
) {
  if (!predictions.length) return null;
  return predictions.reduce((best, p) =>
    Math.abs(p.timeSec - currentSec) < Math.abs(best.timeSec - currentSec) ? p : best,
  predictions[0]);
}
