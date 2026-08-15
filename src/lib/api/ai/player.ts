/**
 * Client for the ERP Club AI microservice (FastAPI — erp-club-ai-service).
 *
 * Reached same-origin via the `/ai` proxy (Vite dev server + scripts/serve-dist.mjs),
 * mirroring the `/api` → backend proxy. The AI service has no auth, so no auth headers.
 *
 * Exposes the two player models:
 *  - GET  /player-season-heatmap  → geolocated season events (StatsBomb coords)
 *  - POST /predict-player-performance → trained monthly form forecast
 */
import { getApiErrorMessage } from "../config";

const AI_BASE = "/ai";

/** Single geolocated action event. StatsBomb coords: x∈[0,120], y∈[0,80]. */
export interface HeatmapEvent {
  id: number;
  x: number;
  y: number;
  action_type: "Pass" | "Shot" | "Carry" | string;
  success: 0 | 1;
}

export interface SeasonHeatmapResponse {
  playerId: number;
  total_actions: number;
  events: HeatmapEvent[];
}

export interface PerformanceForecastRequest {
  playerId: number;
  /** Monthly form scores oldest→newest, each 0–100 (≥3 required). */
  history: number[];
  /** How many months to forecast (1–6). */
  steps?: number;
  /** Matches played this period (0–20), a model feature. */
  matches_played?: number;
}

export interface PerformanceForecastResponse {
  playerId: number;
  history: number[];
  predictions: number[];
  steps: number;
  score_range: [number, number];
  source: string;
  model_metrics?: Record<string, unknown>;
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(getApiErrorMessage(data, `Service IA indisponible (${response.status})`));
  }
  return response.json() as Promise<T>;
}

async function aiFetch(path: string, init?: RequestInit, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${AI_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export const aiPlayerApi = {
  /** Season heatmap events for a player (id is echoed back by the service). */
  getSeasonHeatmap: (playerId: number) =>
    aiFetch(`/player-season-heatmap?playerId=${encodeURIComponent(playerId)}`).then(
      parse<SeasonHeatmapResponse>,
    ),

  /** Forecast the next monthly form scores from the player's history. */
  predictPerformance: (body: PerformanceForecastRequest) =>
    aiFetch("/predict-player-performance", {
      method: "POST",
      body: JSON.stringify({
        playerId: body.playerId,
        history: body.history,
        steps: body.steps ?? 3,
        matches_played: body.matches_played ?? 3,
      }),
    }).then(parse<PerformanceForecastResponse>),
};
