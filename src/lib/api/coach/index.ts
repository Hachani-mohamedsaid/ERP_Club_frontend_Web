import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type CoachAiCard = {
  title: string;
  value: string;
  color: string;
  detail: string;
};

export const coachApi = {
  getAi: () =>
    apiFetch("/club/coach/ai").then(parse<{
      status: string;
      model: string;
      provider: string;
      hasApiKey: boolean;
      clubName: string;
      coachName: string;
      season: string;
      summary: {
        squadSize: number;
        disponibles: number;
        blesses: number;
        avgLoad: number;
        critiques: number;
      };
      suggestedQuestions: string[];
      avgResponseTime: string;
    }>),

  chatAi: (question: string, context?: string) =>
    apiFetch("/club/coach/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question, context }),
    }).then(parse<{
      question: string;
      text: string;
      cards: CoachAiCard[];
      durationMs: number;
      model: string;
      clubName: string;
    }>),
};
