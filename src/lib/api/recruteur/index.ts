import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type RecruteurAiPlayerResult = {
  id: string;
  name: string;
  club: string;
  country: string;
  countryFlag: string;
  age: number;
  position: string;
  positionFull: string;
  foot: string;
  height: string;
  value: string;
  valueNum: number;
  aiScore: number;
  potential: number;
  injuryRisk: number;
  teamCompat: number;
  transferSuccess: number;
  speed: number;
  technique: number;
  physical: number;
  vision: number;
  mental: number;
  finishing: number;
  goals: number;
  assists: number;
  league: string;
  matchScore: number;
  strengths: string[];
  warnings: string[];
  whyPick: string;
  similarTo?: { name: string; pct: number }[];
};

export const recruteurApi = {
  getAi: () =>
    apiFetch("/recruteur/ai").then(parse<{
      status: string;
      model: string;
      provider: string;
      hasApiKey: boolean;
      clubName: string;
      season: string;
      totalProspects: number;
      suggestedQueries: string[];
      avgResponseTime: string;
    }>),

  searchAi: (query: string) =>
    apiFetch("/recruteur/ai/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    }).then(parse<{
      query: string;
      summary: string;
      totalScanned: number;
      avgScore: number;
      results: RecruteurAiPlayerResult[];
      durationMs: number;
      model: string;
    }>),

  generateReport: (templateId: string, format?: string) =>
    apiFetch("/recruteur/ai/report", {
      method: "POST",
      body: JSON.stringify({ templateId, format }),
    }).then(parse<{
      templateId: string;
      title: string;
      format: string;
      content: string;
      durationMs: number;
      model: string;
      generatedAt: string;
    }>),
};
