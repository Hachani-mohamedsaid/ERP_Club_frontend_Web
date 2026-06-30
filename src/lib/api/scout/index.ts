import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export interface ScoutProspectDto {
  id: string;
  legacyId?: string;
  name: string;
  age: number;
  nationality: string;
  flag: string;
  club: string;
  league: string;
  position: string;
  potential: number;
  currentRating: number;
  marketValue: string;
  valueMK: number;
  priority: string;
  status: string;
  aiScore: number;
  injuryRisk: number;
  foot: string;
  height: number;
  weight: number;
  goals: number;
  assists: number;
  matches: number;
  speed: number;
  dribble: number;
  passing: number;
  defense: number;
  physical: number;
  mental: number;
  contractEnd: string;
  agent?: string;
  addedDate: string;
  notes: { date: string; text: string }[];
  inWatchlist?: boolean;
  note?: string;
}

export interface ScoutDashboardDto {
  kpis: {
    totalProspects: number;
    watchlistCount: number;
    reportsCount: number;
    validatedCount: number;
    avgPotential: number;
    avgAge: number;
    priorityABudget: number;
  };
  byPosition: { name: string; v: number }[];
  byCountry: { name: string; value: number }[];
  workflowCounts: Record<string, number>;
  aiRecs: {
    id: string;
    name: string;
    pos: string;
    age: number;
    club: string;
    flag: string;
    score: number;
    budget: string;
    reasons: string[];
    warn?: string;
  }[];
  recentReports: {
    id: string;
    prospectName: string;
    aiScore: number | null;
    decision: string;
    createdAt: string;
  }[];
  upcomingMissions: {
    id: string;
    title: string;
    date: string;
    time: string | null;
    location: string | null;
    notes: string | null;
    extra: unknown;
  }[];
}

export interface ScoutReportDto {
  id: string;
  prospectId: string | null;
  prospectName: string;
  scoutName: string;
  matchDate: string | null;
  matchObserved: string | null;
  opponent: string | null;
  technique: number;
  physique: number;
  mental: number;
  tactique: number;
  vitesse: number;
  strengths: string | null;
  weaknesses: string | null;
  recommendation: string | null;
  decision: string;
  aiScore: number | null;
  status: string;
  createdAt: string;
}

export interface ScoutMissionDto {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  notes: string | null;
  extra: unknown;
}

export const scoutApi = {
  getDashboard: () => apiFetch("/scout/dashboard").then(parse<ScoutDashboardDto>),

  getProspects: () => apiFetch("/scout/prospects").then(parse<ScoutProspectDto[]>),

  getProspect: (id: string) => apiFetch(`/scout/prospects/${id}`).then(parse<ScoutProspectDto>),

  createProspect: (body: Record<string, unknown>) =>
    apiFetch("/scout/prospects", { method: "POST", body: JSON.stringify(body) }).then(parse),

  updateProspect: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/scout/prospects/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),

  getWatchlist: () => apiFetch("/scout/watchlist").then(parse<ScoutProspectDto[]>),

  addToWatchlist: (prospectId: string, priority = "B") =>
    apiFetch("/scout/watchlist", {
      method: "POST",
      body: JSON.stringify({ prospectId, priority }),
    }).then(parse),

  removeFromWatchlist: (prospectId: string) =>
    apiFetch(`/scout/watchlist/${prospectId}`, { method: "DELETE" }).then(parse),

  updateWatchlistPriority: (prospectId: string, priority: string) =>
    apiFetch(`/scout/watchlist/${prospectId}/priority`, {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    }).then(parse),

  addWatchlistNote: (prospectId: string, text: string) =>
    apiFetch(`/scout/watchlist/${prospectId}/notes`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }).then(parse),

  removeWatchlistNote: (prospectId: string, index: number) =>
    apiFetch(`/scout/watchlist/${prospectId}/notes/${index}`, { method: "DELETE" }).then(parse),

  getReports: () => apiFetch("/scout/reports").then(parse<ScoutReportDto[]>),

  createReport: (body: Record<string, unknown>) =>
    apiFetch("/scout/reports", { method: "POST", body: JSON.stringify(body) }).then(parse),

  getMissions: () => apiFetch("/scout/missions").then(parse<ScoutMissionDto[]>),

  createMission: (body: Record<string, unknown>) =>
    apiFetch("/scout/missions", { method: "POST", body: JSON.stringify(body) }).then(parse),
};
