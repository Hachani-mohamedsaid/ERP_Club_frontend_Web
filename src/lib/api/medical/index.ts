import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type MedicalAiPlayer = {
  id: string;
  name: string;
  position: string;
  status: string;
  riskScore: number;
  level: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK";
};

export type MedicalRiskFactor = {
  label: string;
  impact: number;
};

export type MedicalAiCard = {
  title: string;
  value: string;
  color: string;
  detail: string;
};

export type MedicalPlayerAnalysis = {
  playerId: string;
  playerName: string;
  position: string;
  risk: number;
  level: "HIGH RISK" | "MEDIUM RISK" | "LOW RISK";
  mainInjury: string;
  grade: string;
  returnDays: number;
  recommendation: string;
  reasons: MedicalRiskFactor[];
  injuryStatus: string;
  summary: string;
  aiGenerated: boolean;
  durationMs?: number;
  model?: string;
};

export type MedicalReport = {
  playerId: string;
  playerName: string;
  title: string;
  sections: { heading: string; body: string }[];
  markdown: string;
  durationMs: number;
  model: string;
  generatedAt: string;
};

export const medicalApi = {
  getAi: () =>
    apiFetch("/club/medical/ai").then(parse<{
      status: string;
      model: string;
      provider: string;
      hasApiKey: boolean;
      clubName: string;
      medicalStaffName: string;
      season: string;
      summary: {
        squadSize: number;
        blesses: number;
        highRisk: number;
        avgRisk: number;
      };
      players: MedicalAiPlayer[];
      suggestedQuestions: string[];
      avgResponseTime: string;
    }>),

  analyzePlayer: (playerId: string) =>
    apiFetch("/club/medical/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ playerId }),
    }).then(parse<MedicalPlayerAnalysis>),

  chatAi: (question: string, playerId?: string) =>
    apiFetch("/club/medical/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question, context: playerId }),
    }).then(parse<{
      question: string;
      text: string;
      cards: MedicalAiCard[];
      durationMs: number;
      model: string;
      clubName: string;
      playerName: string | null;
    }>),

  generateReport: (playerId: string) =>
    apiFetch("/club/medical/ai/report", {
      method: "POST",
      body: JSON.stringify({ playerId }),
    }).then(parse<MedicalReport>),
};
