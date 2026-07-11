import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type PrepAiCard = {
  player: string;
  risk: number;
  color: string;
  reasons: string[];
  recommendations: string[];
  ready?: boolean;
};

export const preparateurApi = {
  getAi: () =>
    apiFetch("/club/preparateur/ai").then(parse<{
      status: string;
      model: string;
      provider: string;
      hasApiKey: boolean;
      clubName: string;
      season: string;
      summary: {
        totalPlayers: number;
        disponibles: number;
        critiques: number;
        attentions: number;
        avgLoad: number;
        injuryRiskCount: number;
      };
      suggestedQuestions: string[];
      avgResponseTime: string;
    }>),

  chatAi: (question: string, context?: string) =>
    apiFetch("/club/preparateur/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question, context }),
    }).then(parse<{
      question: string;
      text: string;
      cards: PrepAiCard[];
      durationMs: number;
      model: string;
      clubName: string;
    }>),
};
