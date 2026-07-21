import { currentSeasonYear, seasonCandidates } from "./continentMap";
import {
  ApiFootballQuotaError,
  isApiFootballQuotaBlocked,
  isApiFootballQuotaError,
  markApiFootballQuotaBlocked,
} from "./apiFootballQuota";

const BASE = "https://v3.football.api-sports.io";

type CacheEntry<T> = { data: T; expires: number };

const cache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 1000 * 60 * 60 * 6; // 6h
const REQUEST_GAP_MS = 350;

let lastRequestAt = 0;

async function throttle() {
  const wait = REQUEST_GAP_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

async function apiFetchJson<T>(url: string): Promise<{ ok: boolean; status: number; json: T }> {
  const key = getKey();
  for (let attempt = 0; attempt < 4; attempt++) {
    await throttle();
    const res = await fetch(url, { headers: { "x-apisports-key": key } });
    const json = (await res.json()) as T;
    if (res.status === 429 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
      continue;
    }
    return { ok: res.ok, status: res.status, json };
  }
  return { ok: false, status: 429, json: {} as T };
}

let resolvedSeason = 2024;

export function getActiveSeason() {
  return resolvedSeason;
}

export interface ApiLeague {
  league: { id: number; name: string; type: string; logo: string };
  country: { name: string; code: string | null; flag: string | null };
  seasons: { year: number }[];
}

export interface ApiTeam {
  team: { id: number; name: string; code: string | null; country: string; logo: string };
  venue: { city: string | null; name: string | null };
}

export interface ApiSquadPlayer {
  id: number;
  name: string;
  age: number | null;
  number: number | null;
  position: string | null;
  photo: string | null;
}

export interface ApiTransfer {
  player: { id: number; name: string };
  update: string;
  transfers: {
    date: string;
    type: string;
    teams: {
      in: { id: number; name: string; logo: string };
      out: { id: number; name: string; logo: string };
    };
  }[];
}

export interface ApiPlayerEntry {
  player: {
    id: number;
    name: string;
    firstname: string | null;
    lastname: string | null;
    age: number | null;
    nationality: string | null;
    photo: string | null;
    height: string | null;
    weight: string | null;
  };
  statistics: ApiPlayerStatistics[];
}

export interface ApiPlayerStatistics {
  team: { id: number; name: string; logo: string };
  league: { id: number; name: string; country: string; season?: number };
  games: {
    position: string | null;
    appearences: number | null;
    minutes: number | null;
    rating: string | number | null;
  };
  goals: {
    total: number | null;
    assists: number | null;
  };
  passes?: { accuracy: number | null; key: number | null };
  dribbles?: { success: number | null; attempts: number | null };
  tackles?: { total: number | null; interceptions: number | null };
  duels?: { total: number | null; won: number | null };
  shots?: { total: number | null; on: number | null };
}

function getKey() {
  return process.env.API_FOOTBALL_KEY ?? process.env.VITE_API_FOOTBALL_KEY ?? "";
}

export function hasFootballApiKey() {
  return getKey().length > 10;
}

/** Clé présente et quota non épuisé */
export function isFootballApiAvailable() {
  return hasFootballApiKey() && !isApiFootballQuotaBlocked();
}

async function fetchApi<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const key = getKey();
  if (!key) throw new Error("API_FOOTBALL_KEY manquante — ajoutez-la dans .env");

  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  const cacheKey = url;

  const hit = cache.get(cacheKey) as CacheEntry<T> | undefined;
  if (hit && hit.expires > Date.now()) return hit.data;

  const { ok, status, json } = await apiFetchJson<{ response: T; errors?: Record<string, string> }>(url);
  if (!ok || (json.errors && Object.keys(json.errors).length > 0)) {
    const errMsg = `API-Football: ${JSON.stringify(json.errors ?? { status: "error" })}`;
    if (status === 429 || isApiFootballQuotaError(errMsg)) {
      markApiFootballQuotaBlocked();
      throw new ApiFootballQuotaError(errMsg);
    }
    throw new Error(errMsg);
  }

  cache.set(cacheKey, { data: json.response, expires: Date.now() + TTL_MS });
  return json.response;
}

export function bustCache(prefix?: string) {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const k of cache.keys()) {
    if (k.includes(prefix)) cache.delete(k);
  }
}

export async function fetchAllLeagues(season?: number) {
  if (season != null) {
    const leagues = await fetchLeaguesForSeason(season);
    if (leagues.length > 0) {
      resolvedSeason = season;
      return leagues;
    }
    return leagues;
  }

  for (const candidate of seasonCandidates()) {
    try {
      const leagues = await fetchLeaguesForSeason(candidate);
      if (leagues.length > 0) {
        resolvedSeason = candidate;
        return leagues;
      }
    } catch {
      // try next season
    }
  }

  return [];
}

async function fetchLeaguesForSeason(season: number) {
  const all: ApiLeague[] = [];
  let page = 1;
  let total = 1;

  while (page <= total) {
    const url = `${BASE}/leagues?season=${season}&page=${page}`;
    const cacheKey = url;
    const hit = cache.get(cacheKey) as CacheEntry<{ items: ApiLeague[]; total: number }> | undefined;
    let batch: ApiLeague[];
    let pagingTotal: number;

    if (hit && hit.expires > Date.now()) {
      batch = hit.data.items;
      pagingTotal = hit.data.total;
    } else {
      const { ok, json } = await apiFetchJson<{
        response: ApiLeague[];
        paging?: { current: number; total: number };
        errors?: Record<string, string>;
      }>(url);
      if (!ok || (json.errors && Object.keys(json.errors).length > 0)) {
        return [];
      }
      batch = json.response ?? [];
      pagingTotal = json.paging?.total ?? 1;
      if (batch.length > 0) {
        cache.set(cacheKey, {
          data: { items: batch, total: pagingTotal },
          expires: Date.now() + TTL_MS,
        });
      }
    }

    all.push(...batch);
    total = pagingTotal;
    page++;
    if (page > 8) break;
    if (batch.length === 0) break;
  }

  return all.filter((l) => l.league?.id && l.country?.name);
}

export function fetchTeams(leagueId: number, season = getActiveSeason()) {
  return fetchApi<ApiTeam[]>("/teams", { league: leagueId, season });
}

export function fetchSquad(teamId: number) {
  return fetchApi<{ team: { id: number; name: string; logo: string }; players: ApiSquadPlayer[] }[]>(
    "/players/squads",
    { team: teamId },
  );
}

export function fetchTransfers(teamId: number) {
  return fetchApi<ApiTransfer[]>("/transfers", { team: teamId });
}

export function searchPlayersByName(query: string, season = getActiveSeason()) {
  return fetchApi<ApiPlayerEntry[]>("/players", { search: query, season });
}

export function searchPlayersInLeague(query: string, leagueId: number, season = getActiveSeason()) {
  return fetchApi<ApiPlayerEntry[]>("/players", { search: query, league: leagueId, season });
}

export function fetchLeaguePlayers(leagueId: number, page = 1, season = getActiveSeason()) {
  return fetchApi<ApiPlayerEntry[]>("/players", { league: leagueId, season, page });
}

export function fetchTopScorers(leagueId: number, season = getActiveSeason()) {
  return fetchApi<ApiPlayerEntry[]>("/players/topscorers", { league: leagueId, season });
}

export function fetchPlayerProfile(playerId: number, season = getActiveSeason()) {
  return fetchApi<ApiPlayerEntry[]>("/players", { id: playerId, season });
}

export interface ApiFixturePlayerEntry {
  player: { id: number; name: string };
  statistics: {
    games: { minutes: number | null; rating: string | number | null; position: string | null };
    goals: { total: number | null; assists: number | null };
    team: { id: number; name: string };
  }[];
  fixture: {
    id: number;
    date: string;
    teams: { home: { id: number; name: string }; away: { id: number; name: string } };
  };
}

export function fetchPlayerFixtures(playerId: number, season = getActiveSeason()) {
  return fetchApi<ApiFixturePlayerEntry[]>("/fixtures/players", { player: playerId, season });
}

export { ApiFootballQuotaError, isApiFootballQuotaError } from "./apiFootballQuota";

export function parseApiTeamId(id: string): number | null {
  if (id.startsWith("apisports-")) return Number(id.replace("apisports-", ""));
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}
