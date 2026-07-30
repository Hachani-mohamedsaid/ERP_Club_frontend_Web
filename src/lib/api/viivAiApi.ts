/**
 * Viiv AI Microservice API Client
 * Connects the Viiv Analyste page to the FastAPI AI microservice
 * Endpoint base: https://erp-club-ai-service-production.up.railway.app
 */

export const VIIV_AI_BASE_URL = "https://erp-club-ai-service-production.up.railway.app";

export interface ViivSensorData {
  heart_rate: number;
  spo2: number;
  hrv_ms: number;
  stress_score: number;
  energy_pct: number;
  sleep_score: number;
  recovery_pct: number;
  strain: number;
}

// Module 1: Global Injury Risk
export interface PlayerFeaturesInput {
  playerId: number;
  totalLoad: number;
  douleurMusculaire: number;
  acuteLoad: number;
  chronicLoad: number;
  ACWR: number;
  sommeil_7d_mean: number;
  fatigue_7d_mean: number;
  douleurMusculaire_7d_mean: number;
  stress_7d_mean: number;
  viiv: ViivSensorData;
}

export interface ShapFactor {
  feature: string;
  contribution: number;
  impact: "négatif" | "positif";
}

export interface InjuryRiskResponse {
  playerId: number;
  riskScore: number;
  riskLevel: "Faible" | "Modéré" | "Critique";
  factors: ShapFactor[];
  resolved_inputs: Record<string, number>;
  viiv_data?: ViivSensorData;
}

// Module 2: Injury Zone Mapping
export interface ZonePredictionInput {
  playerId: number;
  position: string;
  foot: string;
  age: number;
  fifa_rating: number;
  acuteLoad: number;
  chronicLoad: number;
  ACWR: number;
  douleurMusculaire: number;
  souplesse: number;
  agilite: number;
  viiv: ViivSensorData;
}

export interface InjuryZoneResponse {
  playerId: number;
  predictions: Record<string, number>;
}

// Module 3: Relapse Survival
export interface RelapseSurvivalInput {
  playerId: number;
  physio_adherence: number;
  post_recovery_ACWR: number;
  viiv: ViivSensorData;
}

export interface SurvivalPoint {
  day: number;
  probability: number;
}

export interface RelapseSurvivalResponse {
  playerId: number;
  c_index: number;
  survival_curve: SurvivalPoint[];
  resolved_inputs: Record<string, number>;
  viiv_data?: Record<string, number>;
}

export interface AllViivPredictionsResult {
  injuryRisk: InjuryRiskResponse;
  injuryZone: InjuryZoneResponse;
  relapseSurvival: RelapseSurvivalResponse;
  isMockFallback?: boolean;
}

/**
 * Calls Module 1 — Global Injury Risk (XGBoost + SHAP)
 */
export async function fetchInjuryRisk(input: PlayerFeaturesInput): Promise<InjuryRiskResponse> {
  const res = await fetch(`${VIIV_AI_BASE_URL}/predict-injury`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`AI Microservice /predict-injury error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Calls Module 2 — Anatomical Injury Zone Mapping (Random Forest / LightGBM)
 */
export async function fetchInjuryZone(input: ZonePredictionInput): Promise<InjuryZoneResponse> {
  const res = await fetch(`${VIIV_AI_BASE_URL}/predict-injury-zone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`AI Microservice /predict-injury-zone error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Calls Module 3 — Relapse Survival Analysis (Cox Proportional Hazards)
 */
export async function fetchRelapseSurvival(input: RelapseSurvivalInput): Promise<RelapseSurvivalResponse> {
  const res = await fetch(`${VIIV_AI_BASE_URL}/predict-relapse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`AI Microservice /predict-relapse error (${res.status}): ${errText}`);
  }

  return res.json();
}

/**
 * Generates reliable fallback predictions when offline or during microservice network errors
 */
export function getMockViivPredictions(playerId: number, viiv: ViivSensorData): AllViivPredictionsResult {
  const hrvFactor = Math.max(0, (60 - viiv.hrv_ms) / 100);
  const stressFactor = (viiv.stress_score || 35) / 100;
  const recFactor = (100 - (viiv.recovery_pct || 70)) / 100;
  const baseRisk = Math.min(0.92, Math.max(0.12, 0.25 + hrvFactor * 0.35 + stressFactor * 0.25 + recFactor * 0.15));
  const riskLevel = baseRisk > 0.7 ? "Critique" : baseRisk > 0.4 ? "Modéré" : "Faible";

  return {
    isMockFallback: true,
    injuryRisk: {
      playerId,
      riskScore: Math.round(baseRisk * 100) / 100,
      riskLevel,
      factors: [
        { feature: "ACWR", contribution: 0.28, impact: "négatif" },
        { feature: "fatigue (HRV)", contribution: 0.19, impact: "négatif" },
        { feature: "stress", contribution: 0.12, impact: "négatif" },
        { feature: "sommeil", contribution: -0.09, impact: "positif" },
      ],
      resolved_inputs: {
        totalLoad: 850,
        sommeil: Math.round((viiv.sleep_score || 7.5) * 10) / 10,
        fatigue: Math.round((10 - (viiv.hrv_ms / 10)) * 10) / 10,
        douleurMusculaire: 3.5,
        stress: Math.round((viiv.stress_score / 10) * 10) / 10,
        acuteLoad: 5900,
        chronicLoad: 5100,
        ACWR: 1.16,
      },
      viiv_data: viiv,
    },
    injuryZone: {
      playerId,
      predictions: {
        Genou: 0.38,
        "Ischio-jambiers": 0.29,
        Cheville: 0.18,
        Adducteur: 0.10,
        Lombaire: 0.05,
      },
    },
    relapseSurvival: {
      playerId,
      c_index: 0.96,
      survival_curve: [
        { day: 0, probability: 1.0 },
        { day: 15, probability: 0.92 },
        { day: 30, probability: 0.84 },
        { day: 45, probability: 0.75 },
        { day: 60, probability: 0.68 },
        { day: 75, probability: 0.61 },
        { day: 90, probability: 0.55 },
      ],
      resolved_inputs: {
        recovery_score: viiv.recovery_pct || 70,
        sleep_quality: viiv.sleep_score || 7.5,
        stress_level: (viiv.stress_score || 35) / 100,
        fatigue_index: 35,
        physio_adherence: 85,
        post_recovery_ACWR: 1.1,
      },
      viiv_data: {
        recovery_pct: viiv.recovery_pct,
        hrv_ms: viiv.hrv_ms,
        stress_score: viiv.stress_score,
      },
    },
  };
}

/**
 * Orchestrates fetching all 3 model predictions concurrently from the deployed FastAPI backend
 */
export async function fetchAllViivPredictions(
  playerId: number,
  playerProfile: { position?: string; foot?: string; age?: number; fitnessScore?: number },
  viiv: ViivSensorData
): Promise<AllViivPredictionsResult> {
  const riskInput: PlayerFeaturesInput = {
    playerId,
    totalLoad: 850,
    douleurMusculaire: 3.5,
    acuteLoad: 5900,
    chronicLoad: 5100,
    ACWR: 1.16,
    sommeil_7d_mean: 7.2,
    fatigue_7d_mean: 4.1,
    douleurMusculaire_7d_mean: 3.0,
    stress_7d_mean: 3.8,
    viiv,
  };

  const zoneInput: ZonePredictionInput = {
    playerId,
    position: playerProfile.position || "Attaquant",
    foot: playerProfile.foot || "Droitier",
    age: playerProfile.age || 24,
    fifa_rating: playerProfile.fitnessScore || 78,
    acuteLoad: 5900,
    chronicLoad: 5100,
    ACWR: 1.16,
    douleurMusculaire: 3.5,
    souplesse: 6.5,
    agilite: 7.5,
    viiv,
  };

  const relapseInput: RelapseSurvivalInput = {
    playerId,
    physio_adherence: 88,
    post_recovery_ACWR: 1.12,
    viiv,
  };

  try {
    const [injuryRisk, injuryZone, relapseSurvival] = await Promise.all([
      fetchInjuryRisk(riskInput),
      fetchInjuryZone(zoneInput),
      fetchRelapseSurvival(relapseInput),
    ]);

    return {
      injuryRisk,
      injuryZone,
      relapseSurvival,
      isMockFallback: false,
    };
  } catch (err) {
    console.warn("FastAPI Viiv microservice call failed, using graceful fallback:", err);
    return getMockViivPredictions(playerId, viiv);
  }
}
