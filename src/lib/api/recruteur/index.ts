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
  getNotifications: () => apiFetch("/club/recruteur/notifications").then(parse),
  markNotificationRead: (id: string) =>
    apiFetch(`/club/recruteur/notifications/${id}/read`, { method: "PATCH" }).then(parse),
  markAllNotificationsRead: () =>
    apiFetch("/club/recruteur/notifications/read-all", { method: "PATCH" }).then(parse),
  deleteNotification: (id: string) =>
    apiFetch(`/club/recruteur/notifications/${id}`, { method: "DELETE" }).then(parse),

  getAuditLogs: (params?: { action?: string; severity?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.action) q.set("action", params.action);
    if (params?.severity) q.set("severity", params.severity);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return apiFetch(`/club/recruteur/audit-logs${qs ? `?${qs}` : ""}`).then(parse);
  },

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
