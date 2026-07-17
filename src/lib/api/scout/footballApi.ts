import { currentSeasonYear, seasonCandidates } from "./continentMap";

const BASE = "https://v3.football.api-sports.io";

type CacheEntry<T> = { data: T; expires: number };

const cache = new Map<string, CacheEntry<unknown>>();
const TTL_MS = 1000 * 60 * 60 * 6; // 6h

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

function getKey() {
  return process.env.API_FOOTBALL_KEY ?? process.env.VITE_API_FOOTBALL_KEY ?? "";
}

export function hasFootballApiKey() {
  return getKey().length > 10;
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

  const res = await fetch(url, {
    headers: { "x-apisports-key": key },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API-Football ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { response: T; errors?: Record<string, string> };
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Football: ${JSON.stringify(json.errors)}`);
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
    const key = getKey();
    const url = `${BASE}/leagues?season=${season}&page=${page}`;
    const cacheKey = url;
    const hit = cache.get(cacheKey) as CacheEntry<{ items: ApiLeague[]; total: number }> | undefined;
    let batch: ApiLeague[];
    let pagingTotal: number;

    if (hit && hit.expires > Date.now()) {
      batch = hit.data.items;
      pagingTotal = hit.data.total;
    } else {
      const res = await fetch(url, { headers: { "x-apisports-key": key } });
      const json = (await res.json()) as {
        response: ApiLeague[];
        paging?: { current: number; total: number };
        errors?: Record<string, string>;
      };
      if (!res.ok || (json.errors && Object.keys(json.errors).length > 0)) {
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
    if (page > 30) break;
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

export function parseApiTeamId(id: string): number | null {
  if (id.startsWith("apisports-")) return Number(id.replace("apisports-", ""));
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}
