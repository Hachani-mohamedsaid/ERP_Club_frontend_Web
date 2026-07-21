import type { ScoutSearchFilters, SearchPlayerResult } from "./searchFallback";
import {
  applyLocalProspectFilters,
  buildFlashscoreSearchResponse,
} from "./searchFallback";
import {
  fetchLeaguePlayers,
  fetchTopScorers,
  getActiveSeason,
  isFootballApiAvailable,
  searchPlayersInLeague,
  type ApiPlayerEntry,
  type ApiPlayerStatistics,
} from "./footballApi";
import { isApiFootballQuotaError } from "./apiFootballQuota";
import { DEFAULT_SEARCH_LEAGUE_IDS, leaguesByCountryName, MAJOR_LEAGUES } from "./majorLeagues";

export interface ScoutSearchRouteResult {
  status: number;
  body: unknown;
}

const TOP_LEAGUE_IDS = new Set([39, 140, 135, 78, 61]);
const DOMESTIC_LEAGUE_IDS = new Set(MAJOR_LEAGUES.map((l) => l.id));

const FLAG_BY_COUNTRY: Record<string, string> = {
  France: "🇫🇷", Tunisia: "🇹🇳", Tunisie: "🇹🇳", Morocco: "🇲🇦", Maroc: "🇲🇦",
  Algeria: "🇩🇿", Algérie: "🇩🇿", England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Spain: "🇪🇸", Espagne: "🇪🇸",
  Italy: "🇮🇹", Italie: "🇮🇹", Germany: "🇩🇪", Allemagne: "🇩🇪", Brazil: "🇧🇷",
  Brésil: "🇧🇷", Argentina: "🇦🇷", Argentine: "🇦🇷", Portugal: "🇵🇹",
  Netherlands: "🇳🇱", "Pays-Bas": "🇳🇱", Belgium: "🇧🇪", Belgique: "🇧🇪",
  Egypt: "🇪🇬", Égypte: "🇪🇬", Senegal: "🇸🇳", Sénégal: "🇸🇳", Nigeria: "🇳🇬",
  "Côte d'Ivoire": "🇨🇮", "Cote d'Ivoire": "🇨🇮",
};

function flagFor(country?: string | null) {
  if (!country) return "⚽";
  return FLAG_BY_COUNTRY[country] ?? "🏳️";
}

const NATIONALITY_UI: Record<string, string> = {
  Tunisia: "Tunisie",
  Algeria: "Algérie",
  Morocco: "Maroc",
  "Ivory Coast": "Côte d'Ivoire",
  Senegal: "Sénégal",
};

function uiNationality(apiNat: string | null | undefined): string {
  if (!apiNat) return "—";
  return NATIONALITY_UI[apiNat] ?? apiNat;
}

function displayName(entry: ApiPlayerEntry) {
  const p = entry.player;
  if (p.name?.trim()) return p.name.trim();
  const full = [p.firstname, p.lastname].filter(Boolean).join(" ").trim();
  return full || "—";
}

function mapPosition(pos: string | null | undefined): string {
  if (!pos) return "—";
  const p = pos.toLowerCase();
  if (p.includes("goal")) return "GK";
  if (p.includes("def")) return "DC";
  if (p.includes("mid")) return "MC";
  if (p.includes("attack") || p.includes("forw")) return "BU";
  return pos.slice(0, 3).toUpperCase();
}

function matchesPositionFilter(mapped: string, filter?: string) {
  if (!filter || filter === "Tous") return true;
  if (filter === "BU") return mapped === "BU";
  if (filter === "Ailier G" || filter === "Ailier D") return mapped === "BU";
  if (filter === "DG" || filter === "DD") return mapped === "DC";
  return mapped === filter;
}

function parseRating(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  const n = typeof raw === "number" ? raw : parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

function hasMeaningfulStats(stat: ApiPlayerStatistics): boolean {
  const apps = stat.games?.appearences ?? 0;
  const rating = parseRating(stat.games?.rating);
  return apps > 0 || rating != null;
}

function pickBestStatistics(entry: ApiPlayerEntry): ApiPlayerStatistics | null {
  const stats = (entry.statistics ?? []).filter(hasMeaningfulStats);
  if (stats.length === 0) return null;
  if (stats.length === 1) return stats[0];

  let best: ApiPlayerStatistics | null = null;
  let bestScore = -1;

  for (const stat of stats) {
    const apps = stat.games?.appearences ?? 0;
    const minutes = stat.games?.minutes ?? 0;
    const rating = parseRating(stat.games?.rating) ?? 0;
    const leagueId = stat.league?.id ?? 0;
    const goals = stat.goals?.total ?? 0;

    let score = apps * 100 + minutes + goals * 50 + rating * 20;
    if (TOP_LEAGUE_IDS.has(leagueId)) score += 50_000;
    else if (DOMESTIC_LEAGUE_IDS.has(leagueId)) score += 20_000;
    if (apps === 0 && minutes === 0) score -= 10_000;

    if (score > bestScore) {
      bestScore = score;
      best = stat;
    }
  }

  return best ?? stats[0];
}

/** Note API-Football (0–10) → score scout (55–95) */
function apiRatingToScore(rating: number | null, goals: number, apps: number): number {
  if (rating != null && rating > 0) {
    return Math.min(95, Math.max(55, Math.round(42 + rating * 7)));
  }
  if (apps >= 20 && goals >= 15) return 86;
  if (apps >= 15 && goals >= 8) return 80;
  if (apps >= 10) return 72;
  return 65;
}

function deriveAttributes(
  rating: number | null,
  stat: ApiPlayerStatistics,
  baseScore: number,
) {
  const pct = (a: number | null | undefined, b: number | null | undefined) => {
    if (!a || !b || b <= 0) return null;
    return Math.round((a / b) * 100);
  };

  const dribblePct = pct(stat.dribbles?.success, stat.dribbles?.attempts);
  const duelPct = pct(stat.duels?.won, stat.duels?.total);
  const passAcc = stat.passes?.accuracy ?? null;
  const goals = stat.goals?.total ?? 0;
  const tackles = (stat.tackles?.total ?? 0) + (stat.tackles?.interceptions ?? 0);

  return {
    speed: Math.min(95, baseScore + (goals >= 10 ? 4 : 0)),
    dribble: dribblePct ?? Math.min(95, baseScore + 2),
    passing: passAcc ?? Math.min(95, baseScore),
    defense: Math.min(92, 55 + tackles * 2),
    physical: duelPct ?? Math.min(92, baseScore - 2),
    mental: Math.min(95, rating != null ? Math.round(50 + rating * 6) : baseScore),
  };
}

function estimateMarketValueMK(score: number, goals: number, age: number, apps: number): number {
  let mk = 300 + apps * 15 + goals * 120;
  if (score >= 94 && goals >= 20) mk = Math.max(mk, age <= 26 ? 180_000 : 120_000);
  else if (score >= 90) mk = Math.max(mk, age <= 26 ? 18_000 : 12_000);
  else if (score >= 85) mk = Math.max(mk, age <= 27 ? 8_000 : 5_000);
  else if (score >= 80) mk = Math.max(mk, 2_500);
  else if (score >= 75) mk = Math.max(mk, 1_200);
  return Math.min(200_000, Math.round(mk));
}

function formatMarketValue(mk: number): string {
  if (mk >= 1000) return `${Math.round(mk / 100) / 10}M€`;
  return `${mk}K€`;
}

function mapApiPlayer(entry: ApiPlayerEntry, season: number): SearchPlayerResult | null {
  const stat = pickBestStatistics(entry);
  if (!stat?.team?.name) return null;

  const name = displayName(entry);
  if (!name || /\d{2,}$/.test(name)) return null;

  const position = mapPosition(stat.games?.position);
  const age = entry.player.age ?? 22;
  const apps = stat.games?.appearences ?? 0;
  const goals = stat.goals?.total ?? 0;
  const assists = stat.goals?.assists ?? 0;
  const rating = parseRating(stat.games?.rating);
  const score = apiRatingToScore(rating, goals, apps);
  const potential = Math.min(95, score + (age <= 23 ? 4 : age <= 26 ? 2 : 0));
  const valueMK = estimateMarketValueMK(score, goals, age, apps);
  const attrs = deriveAttributes(rating, stat, score);
  const nationality = uiNationality(entry.player.nationality ?? stat.league?.country);
  const height = entry.player.height ? parseInt(entry.player.height, 10) || 178 : 178;
  const weight = entry.player.weight ? parseInt(entry.player.weight, 10) || 74 : 74;

  return {
    id: `apisports-player-${entry.player.id}`,
    apiSportsId: entry.player.id,
    name,
    age,
    nationality,
    flag: flagFor(nationality),
    club: stat.team.name,
    league: stat.league?.name ?? "—",
    position,
    potential,
    currentRating: score,
    marketValue: formatMarketValue(valueMK),
    valueMK,
    priority: score >= 85 ? "A" : score >= 78 ? "B" : "C",
    status: "new",
    aiScore: score,
    injuryRisk: 12 + (age > 30 ? 15 : age > 28 ? 10 : 0),
    foot: "Droit",
    height,
    weight,
    goals,
    assists,
    matches: apps,
    speed: attrs.speed,
    dribble: attrs.dribble,
    passing: attrs.passing,
    defense: attrs.defense,
    physical: attrs.physical,
    mental: attrs.mental,
    contractEnd: "—",
    addedDate: new Date().toISOString().slice(0, 10),
    notes: [],
    inDatabase: false,
    source: "apisports",
    photoUrl: entry.player.photo ?? undefined,
    season: `${season}-${season + 1}`,
  };
}

function leagueIdsForFilters(filters: ScoutSearchFilters): number[] {
  const countryLeagues = leaguesByCountryName(filters.country ?? "");
  if (countryLeagues.length > 0) return countryLeagues.map((l) => l.id);
  return DEFAULT_SEARCH_LEAGUE_IDS;
}

async function fetchPlayersForFilters(filters: ScoutSearchFilters): Promise<SearchPlayerResult[]> {
  const season = getActiveSeason();
  const entries: ApiPlayerEntry[] = [];
  const leagueIds = leagueIdsForFilters(filters).slice(0, 4);
  const useTopScorers = !filters.query?.trim() && (!filters.position || filters.position === "Tous" || filters.position === "BU");

  if (filters.query?.trim()) {
    const q = filters.query.trim();
    for (const leagueId of leagueIds) {
      try {
        entries.push(...await searchPlayersInLeague(q, leagueId, season));
        if (entries.length > 0) break;
      } catch (err) {
        if (isApiFootballQuotaError(err)) throw err;
      }
    }
    if (entries.length === 0) {
      for (const leagueId of leagueIds) {
        try {
          const batch = await fetchLeaguePlayers(leagueId, 1, season);
          const needle = q.toLowerCase();
          entries.push(
            ...batch.filter((e) =>
              displayName(e).toLowerCase().includes(needle)
              || e.statistics.some((s) => s.team.name.toLowerCase().includes(needle)),
            ),
          );
        } catch (err) {
          if (isApiFootballQuotaError(err)) throw err;
        }
      }
    }
  } else if (useTopScorers) {
    for (const leagueId of leagueIds) {
      try {
        entries.push(...await fetchTopScorers(leagueId, season));
      } catch (err) {
        if (isApiFootballQuotaError(err)) throw err;
        try {
          entries.push(...await fetchLeaguePlayers(leagueId, 1, season));
        } catch (inner) {
          if (isApiFootballQuotaError(inner)) throw inner;
        }
      }
    }
  } else {
    for (const leagueId of leagueIds) {
      try {
        entries.push(...await fetchLeaguePlayers(leagueId, 1, season));
      } catch (err) {
        if (isApiFootballQuotaError(err)) throw err;
      }
    }
  }

  const seen = new Set<number>();
  const players: SearchPlayerResult[] = [];

  for (const entry of entries) {
    const mapped = mapApiPlayer(entry, season);
    if (!mapped) continue;
    if (!matchesPositionFilter(mapped.position, filters.position)) continue;
    if (filters.country && filters.country !== "Tous" && mapped.nationality !== filters.country) {
      const leagueCountry = MAJOR_LEAGUES.find((l) => l.id === pickBestStatistics(entry)?.league?.id)?.countryName;
      if (leagueCountry !== filters.country && mapped.nationality !== filters.country) continue;
    }
    if (seen.has(entry.player.id)) continue;
    seen.add(entry.player.id);
    players.push(mapped);
  }

  players.sort((a, b) => b.aiScore - a.aiScore || b.goals - a.goals);
  return applyLocalProspectFilters(players, filters);
}

export async function handleScoutSearchRoute(
  method: string,
  body: ScoutSearchFilters,
): Promise<ScoutSearchRouteResult | null> {
  if (method !== "POST") return null;

  if (isFootballApiAvailable()) {
    try {
      const results = await fetchPlayersForFilters(body);
      if (results.length > 0) {
        const season = getActiveSeason();
        return {
          status: 200,
          body: {
            summary: `${results.length} joueur(s) — API-Sports · saison ${season}-${season + 1}`,
            results,
            aiEnabled: false,
            sources: { database: 0, apisports: results.length },
            model: "api-football",
            season: `${season}-${season + 1}`,
          },
        };
      }
    } catch (err) {
      if (!isApiFootballQuotaError(err)) {
        /* fallback Flashscore ci-dessous */
      }
    }
  }

  return { status: 200, body: buildFlashscoreSearchResponse(body) };
}
