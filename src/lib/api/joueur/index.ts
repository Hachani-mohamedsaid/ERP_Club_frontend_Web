import { parseApiError } from "../config";
import { apiFetch, apiFetchWithTimeout } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type JoueurAiWeeklyInsights = {
  speedChange: string;
  enduranceChange: string;
  fatigueRisk: string;
  advice: string;
};

export type JoueurAiMetric = {
  label: string;
  value: number;
  note: string;
};

export type JoueurAiTrainingDay = {
  day: string;
  focus: string;
  detail: string;
  intensity: number;
  icon: string;
};

export type JoueurAiInjuryPrevention = {
  zone: string;
  risk: number;
  level: string;
  advice: string;
};

export type JoueurAiChatHistoryItem = {
  id: string;
  period: string;
  question: string;
};

export type JoueurAiReport = {
  weeklyInsights: JoueurAiWeeklyInsights;
  strengths: JoueurAiMetric[];
  weaknesses: JoueurAiMetric[];
  trainingPlan: JoueurAiTrainingDay[];
  injuryPrevention: JoueurAiInjuryPrevention;
  recommendations: string[];
  suggestedQuestions: string[];
  chatHistory: JoueurAiChatHistoryItem[];
  clubName?: string;
  playerName?: string;
  position?: string;
  ovr?: number;
  cached?: boolean;
  aiGenerated?: boolean;
  generatedAt?: string;
  model?: string;
  durationMs?: number;
};

export const joueurApi = {
  getMe: () => apiFetch("/joueur/me").then(parse),
  getExtended: () => apiFetch("/joueur/me/extended").then(parse),
  getCalendar: () => apiFetch("/joueur/me/calendar").then(parse),
  getInjuries: () => apiFetch("/joueur/me/injuries").then(parse),
  getSquad: () => apiFetch("/joueur/squad").then(parse),

  getAi: () =>
    apiFetch("/joueur/ai").then(parse<{
      status: string;
      model: string;
      provider: string;
      clubName: string;
      playerName: string;
      position: string;
      ovr: number;
      hasReport: boolean;
      reportGeneratedAt: string | null;
    }>),

  getAiReport: (refresh = false) =>
    apiFetchWithTimeout(`/joueur/ai/report${refresh ? "?refresh=1" : ""}`, undefined, 25000).then(parse<JoueurAiReport>),

  chatAi: (question: string) =>
    apiFetch("/joueur/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question }),
    }).then(parse<{
      question: string;
      text: string;
      durationMs: number;
      model: string;
      playerName: string;
    }>),
};
