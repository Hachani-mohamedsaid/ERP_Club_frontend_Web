import { parseApiError } from "../config";
import { apiFetch, apiFetchWithTimeout } from "../authHeaders";
import {
  applyLocalProspectFilters,
  buildAiSearchQuery,
  mapAiHitToProspect,
  type ScoutSearchFilters,
  type SearchPlayerResult,
} from "./searchFallback";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type ScoutAgentPlayerDto = {
  id: string;
  name: string;
  flag: string;
  position: string;
  club: string;
  potential: number;
  status: string;
};

export type ScoutAgentDto = {
  id: string;
  name: string;
  agency: string;
  email: string;
  phone: string;
  country: string;
  flag: string;
  players: ScoutAgentPlayerDto[];
  rating: number;
  deals: number;
  lastContact: string;
  status: "actif" | "négociation" | "inactif";
  aiNotes?: string;
};

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
  photoUrl?: string;
  season?: string;
}

export interface ScoutDashboardDto {
  clubName?: string;
  season?: string;
  aiPowered?: boolean;
  recSource?: "openai" | "rules";
  kpis: {
    totalProspects: number;
    watchlistCount: number;
    reportsCount: number;
    validatedCount: number;
    inProgress?: number;
    prospectsThisMonth?: number;
    reportsThisMonth?: number;
    validationsThisMonth?: number;
    avgPotential: number;
    avgAge: number;
    priorityABudget: number;
    budgetDeltaMK?: number;
  };
  sparklines?: {
    prospects: number[];
    reports: number[];
    validations: number[];
    inProgress: number[];
  };
  byPosition: { name: string; v: number }[];
  byCountry: { name: string; value: number }[];
  workflowCounts: Record<string, number>;
  priorityCounts?: { A: number; B: number; C: number };
  pipelineTrend?: { month: string; prospects: number; validated: number }[];
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

  getMapOverview: () =>
    apiFetch("/scout/map").then(parse<{
      status: string;
      model: string;
      continents: {
        id: string;
        name: string;
        icon: string;
        color: string;
        countries: number;
        prospects: number;
        teams: number;
      }[];
      stats: { continents: number; countries: number; clubs: number; prospectsInDb: number };
    }>),

  getMapCountries: (continentId: string) =>
    apiFetch(`/scout/map/continents/${continentId}`).then(parse<{
      continent: { id: string; name: string; icon: string; color: string };
      countries: {
        id: string;
        continentId: string;
        name: string;
        flag: string;
        flagCode: string;
        color: string;
        leagues: string[];
        leagueId: string;
        teamCount: number;
        prospects: number;
      }[];
    }>),

  getMapTeams: (countryId: string) =>
    apiFetch(`/scout/map/countries/${countryId}/teams`).then(parse<{
      country: {
        id: string;
        name: string;
        flag: string;
        flagCode: string;
        color: string;
        leagues: string[];
        leagueId: string;
      };
      teams: {
        id: string;
        countryId: string;
        name: string;
        league: string;
        leagueId: string;
        city: string;
        tier: string;
        avgPotential: number;
        scoutActivity: string;
        playerCount: number;
        dbProspects: number;
        logoColor?: string;
      }[];
    }>),

  getTeamSquad: (teamId: string, refresh = false) =>
    apiFetch(`/scout/map/teams/${teamId}/squad${refresh ? "?refresh=1" : ""}`).then(parse<{
      team: {
        id: string;
        name: string;
        league: string;
        leagueId: string;
        city: string;
        tier: string;
        avgPotential: number;
        scoutActivity: string;
        logoColor?: string;
        country: { id: string; name: string; flag: string; flagCode: string };
      };
      players: {
        id: string;
        name: string;
        position: string;
        age: number;
        nationality: string;
        flag: string;
        potential: number;
        currentRating: number;
        marketValue: string;
        source: "prospect" | "flashscore" | "ai";
        inDatabase?: boolean;
        prospectId?: string;
      }[];
      sources: { database: number; flashscore?: number; ai?: number };
      cached: boolean;
      aiEnabled?: boolean;
      dataSource?: "flashscore" | "live" | "ai";
      season?: string;
      updatedAt?: string;
      autoRefresh?: boolean;
    }>),

  getAi: () =>
    apiFetch("/scout/ai").then(parse<{
      status: string;
      model: string;
      provider: string;
      clubName: string;
      scoutName: string;
      summary: { prospects: number; flashscorePlayers?: number; continents: number; countries: number; clubs: number; avgPotential: number };
      suggestedQueries: string[];
      avgResponseTime: string;
      season?: string;
    }>),

  searchAi: (query: string) =>
    apiFetch("/scout/ai/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    }).then(parse<{
      query: string;
      text: string;
      results: {
        id: string;
        rank: number;
        name: string;
        club: string;
        position: string;
        age: number;
        potential: number;
        flag: string;
        aiScore: number;
        compatibility: number;
        reasoning: string[];
        warnings: string[];
        recommendation: string;
        inDatabase: boolean;
        source?: "database" | "flashscore" | "ai";
        season?: string;
      }[];
      durationMs: number;
      model: string;
      season?: string;
    }>),

  searchProspects: async (filters: ScoutSearchFilters) => {
    type SearchResponse = {
      summary: string;
      results: SearchPlayerResult[];
      aiEnabled: boolean;
      sources: { database: number; flashscore?: number; ai?: number };
      durationMs?: number;
      model: string;
      season?: string;
    };

    try {
      const response = await apiFetchWithTimeout(
        "/scout/search",
        { method: "POST", body: JSON.stringify(filters) },
        60_000,
      );
      if (response.ok) return parse<SearchResponse>(response);
      if (response.status !== 404 && response.status !== 405) {
        throw new Error(await parseApiError(response));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const isMissingRoute = /404|405|not found/i.test(msg);
      if (!isMissingRoute && !(err instanceof DOMException && err.name === "AbortError")) {
        throw err;
      }
    }

    const [prospectsRes, aiRes] = await Promise.allSettled([
      apiFetch("/scout/prospects"),
      apiFetchWithTimeout(
        "/scout/ai/search",
        { method: "POST", body: JSON.stringify({ query: buildAiSearchQuery(filters) }) },
        60_000,
      ),
    ]);

    let dbResults: SearchPlayerResult[] = [];
    if (prospectsRes.status === "fulfilled" && prospectsRes.value.ok) {
      const all = (await prospectsRes.value.json()) as ScoutProspectDto[];
      dbResults = applyLocalProspectFilters(all, filters).map((p) => ({
        ...p,
        inDatabase: true,
        source: "database" as const,
      }));
    }

    let aiResults: SearchPlayerResult[] = [];
    let aiEnabled = false;
    let model = "fallback-local";

    if (aiRes.status === "fulfilled" && aiRes.value.ok) {
      const data = (await aiRes.value.json()) as {
        results?: {
          id: string;
          name: string;
          club: string;
          position: string;
          age: number;
          potential: number;
          flag: string;
          aiScore: number;
          inDatabase?: boolean;
        }[];
        model?: string;
      };
      aiEnabled = true;
      model = data.model ?? "openai";
      const dbNames = new Set(dbResults.map((p) => p.name.toLowerCase()));
      aiResults = (data.results ?? [])
        .filter((r) => !dbNames.has(r.name.toLowerCase()))
        .map((r, i) => mapAiHitToProspect(r, i, filters.country));
    }

    const merged = [...dbResults, ...aiResults].sort((a, b) => b.potential - a.potential);
    return {
      summary:
        aiResults.length > 0
          ? `${merged.length} joueurs — ${dbResults.length} en base, ${aiResults.length} via IA (mode compat)`
          : dbResults.length > 0
            ? `${dbResults.length} joueur(s) en base (endpoint /scout/search indisponible)`
            : "Aucun résultat — déployez le backend ou vérifiez OPENAI_API_KEY",
      results: merged,
      aiEnabled,
      sources: { database: dbResults.length, ai: aiResults.length },
      model,
    } satisfies SearchResponse;
  },

  getAgents: (refresh = false) =>
    apiFetch(`/scout/agents${refresh ? "?refresh=1" : ""}`).then(parse<{
      status: string;
      model: string;
      agents: ScoutAgentDto[];
      withoutAgent: ScoutAgentPlayerDto[];
      summary: {
        totalAgents: number;
        active: number;
        inNegotiation: number;
        withoutAgent: number;
        saved?: number;
      };
      aiGenerated: boolean;
      cached?: boolean;
    }>),

  suggestAgents: () =>
    apiFetch("/scout/agents/suggestions").then(parse<{
      text: string;
      suggestions: ScoutAgentDto[];
      model: string;
    }>),

  searchAgents: (query: string) =>
    apiFetch("/scout/agents/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    }).then(parse<{
      query: string;
      text: string;
      results: ScoutAgentDto[];
      model: string;
    }>),

  addAgent: (agent: Partial<ScoutAgentDto>) =>
    apiFetch("/scout/agents/add", {
      method: "POST",
      body: JSON.stringify(agent),
    }).then(parse<{ ok: boolean; agent: ScoutAgentDto; total: number }>),

  removeAgent: (agentId: string) =>
    apiFetch(`/scout/agents/${agentId}`, { method: "DELETE" }).then(parse<{ ok: boolean; total: number }>),

  getAgentHistory: (agentId: string) =>
    apiFetch(`/scout/agents/${agentId}/history`).then(parse<{
      agentId: string;
      agentName: string;
      title: string;
      entries: { date: string; type: string; subject: string; outcome: string; player: string }[];
      summary: string;
    }>),

  getAgentContactDraft: (agentId: string) =>
    apiFetch(`/scout/agents/${agentId}/contact`).then(parse<{
      agentId: string;
      agentName: string;
      email: string;
      subject: string;
      body: string;
      tips: string[];
    }>),
};
