import {
  fetchPlayerFixtures,
  fetchPlayerProfile,
  getActiveSeason,
  searchPlayersInLeague,
  type ApiFixturePlayerEntry,
  type ApiPlayerEntry,
  type ApiPlayerStatistics,
} from "./footballApi";
import { DEFAULT_SEARCH_LEAGUE_IDS } from "./majorLeagues";
import { buildAiReels, type ProspectLiveReel } from "./playerReels";

export type { ProspectLiveReel } from "./playerReels";

export type ProspectLiveMatch = {
  match: string;
  date: string;
  rating: number;
  goals: number;
  assists: number;
  minutes: number;
};

export type ProspectLiveHeatmapZone = { zone: string; intensity: number };

export type ProspectLiveProfile = {
  apiSportsId: number;
  name: string;
  age: number;
  club: string;
  league: string;
  position: string;
  goals: number;
  assists: number;
  matches: number;
  potential: number;
  currentRating: number;
  aiScore: number;
  marketValue: string;
  valueMK: number;
  height: number;
  weight: number;
  speed: number;
  dribble: number;
  passing: number;
  defense: number;
  physical: number;
  mental: number;
  photoUrl?: string;
  season: string;
  source?: "api-football" | "flashscore";
  matchHistory: ProspectLiveMatch[];
  heatmapZones: ProspectLiveHeatmapZone[];
  monthlyPotential: number[];
  videos: { title: string; duration: string; type: string; icon: string }[];
  reels: ProspectLiveReel[];
};

const TOP_LEAGUE_IDS = new Set([39, 140, 135, 78, 61]);
const DOMESTIC_LEAGUE_IDS = new Set(DEFAULT_SEARCH_LEAGUE_IDS);

export function parseApiSportsPlayerId(ref?: string | null): number | null {
  if (!ref) return null;
  const m = ref.match(/apisports-player-(\d+)/i);
  return m ? Number(m[1]) : null;
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

export function pickBestStatistics(entry: ApiPlayerEntry): ApiPlayerStatistics | null {
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

function mapPosition(pos: string | null | undefined): string {
  if (!pos) return "MC";
  const p = pos.toLowerCase();
  if (p.includes("goal")) return "GK";
  if (p.includes("def")) return "DC";
  if (p.includes("mid")) return "MC";
  if (p.includes("attack") || p.includes("forw")) return "BU";
  return pos.slice(0, 3).toUpperCase();
}

function apiRatingToScore(rating: number | null, goals: number, apps: number): number {
  if (rating != null && rating > 0) {
    return Math.min(95, Math.max(55, Math.round(42 + rating * 7)));
  }
  if (apps >= 20 && goals >= 15) return 86;
  if (apps >= 15 && goals >= 8) return 80;
  if (apps >= 10) return 72;
  return 65;
}

function deriveAttributes(rating: number | null, stat: ApiPlayerStatistics, baseScore: number) {
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

function buildHeatmapZones(position: string, goals: number, assists: number): ProspectLiveHeatmapZone[] {
  const attackBoost = Math.min(15, goals);
  const wideBoost = Math.min(10, assists);

  if (position === "BU") {
    return [
      { zone: "Axe central att.", intensity: Math.min(98, 88 + attackBoost) },
      { zone: "Attaque gauche", intensity: Math.min(90, 70 + wideBoost) },
      { zone: "Attaque droite", intensity: Math.min(90, 70 + wideBoost) },
      { zone: "Milieu offensif", intensity: 62 },
      { zone: "Milieu central", intensity: 28 },
      { zone: "Défense", intensity: 10 },
    ];
  }
  if (position === "MC") {
    return [
      { zone: "Milieu central", intensity: 90 },
      { zone: "Milieu offensif", intensity: 72 },
      { zone: "Axe central att.", intensity: 48 },
      { zone: "Attaque gauche", intensity: 40 },
      { zone: "Attaque droite", intensity: 40 },
      { zone: "Défense", intensity: 35 },
    ];
  }
  if (position === "DC" || position === "GK") {
    return [
      { zone: "Défense", intensity: 92 },
      { zone: "Milieu central", intensity: 45 },
      { zone: "Milieu offensif", intensity: 18 },
      { zone: "Axe central att.", intensity: 12 },
      { zone: "Attaque gauche", intensity: 8 },
      { zone: "Attaque droite", intensity: 8 },
    ];
  }
  return [
    { zone: "Milieu offensif", intensity: 75 },
    { zone: "Axe central att.", intensity: 68 },
    { zone: "Attaque gauche", intensity: 55 },
    { zone: "Attaque droite", intensity: 55 },
    { zone: "Milieu central", intensity: 50 },
    { zone: "Défense", intensity: 20 },
  ];
}

function buildMonthlyPotential(current: number, matchHistory: ProspectLiveMatch[]): number[] {
  const ratings = matchHistory
    .slice(0, 6)
    .reverse()
    .map((m) => Math.min(95, Math.round(40 + m.rating * 7)));
  if (ratings.length >= 6) return ratings;
  const start = Math.max(60, current - 8);
  const step = (current - start) / 5;
  return Array.from({ length: 6 }, (_, i) => Math.round(start + step * i));
}

function buildVideos(name: string, club: string, goals: number, season: string) {
  return [
    {
      title: `Buts & actions — ${name} (${club})`,
      duration: `${Math.min(6, Math.max(2, Math.round(goals / 6)))}:${String(10 + (goals % 50)).padStart(2, "0")}`,
      type: "Highlights",
      icon: "⚽",
    },
    {
      title: `Technique & dribbles — ${name}`,
      duration: "2:18",
      type: "Technique",
      icon: "🎯",
    },
    {
      title: `Saison ${season} — ${goals} buts · ${club}`,
      duration: "4:42",
      type: "Saison",
      icon: "📊",
    },
  ];
}

function mapFixtureToMatch(entry: ApiFixturePlayerEntry, playerTeamId?: number): ProspectLiveMatch | null {
  const stat = entry.statistics?.[0];
  if (!stat) return null;
  const minutes = stat.games?.minutes ?? 0;
  if (minutes <= 0) return null;

  const rating = parseRating(stat.games?.rating) ?? 6.5;
  const home = entry.fixture?.teams?.home?.name ?? "—";
  const away = entry.fixture?.teams?.away?.name ?? "—";
  const teamName = stat.team?.name ?? "";
  const isHome = teamName === home || stat.team?.id === playerTeamId;
  const opponent = isHome ? away : home;
  const prefix = isHome ? "vs" : "@";

  const dateRaw = entry.fixture?.date ?? "";
  const date = dateRaw
    ? new Date(dateRaw).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
    : "—";

  return {
    match: `${prefix} ${opponent}`,
    date,
    rating: Math.round(rating * 10) / 10,
    goals: stat.goals?.total ?? 0,
    assists: stat.goals?.assists ?? 0,
    minutes,
  };
}

function displayName(entry: ApiPlayerEntry) {
  const p = entry.player;
  if (p.name?.trim()) return p.name.trim();
  const full = [p.firstname, p.lastname].filter(Boolean).join(" ").trim();
  return full || "—";
}

function normalizeName(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export async function resolveApiSportsPlayerId(
  name: string,
  club?: string,
  legacyId?: string,
  explicitId?: number,
): Promise<number | null> {
  if (explicitId && explicitId > 0) return explicitId;
  const fromLegacy = parseApiSportsPlayerId(legacyId);
  if (fromLegacy) return fromLegacy;

  const needle = normalizeName(name);
  const clubNeedle = club ? normalizeName(club) : "";

  for (const leagueId of DEFAULT_SEARCH_LEAGUE_IDS.slice(0, 6)) {
    try {
      const term = name.split(" ").pop() ?? name;
      const found = await searchPlayersInLeague(term, leagueId);
      const hit = found.find((e) => {
        const n = normalizeName(displayName(e));
        if (!n.includes(needle) && !needle.includes(n)) return false;
        if (!clubNeedle) return true;
        return e.statistics.some((s) => normalizeName(s.team.name).includes(clubNeedle));
      });
      if (hit) return hit.player.id;
    } catch {
      // try next league
    }
  }
  return null;
}

export function buildLiveProfileFromApi(
  entry: ApiPlayerEntry,
  fixtures: ApiFixturePlayerEntry[],
  season: number,
): ProspectLiveProfile | null {
  const stat = pickBestStatistics(entry);
  if (!stat?.team?.name) return null;

  const name = displayName(entry);
  const position = mapPosition(stat.games?.position);
  const apps = stat.games?.appearences ?? 0;
  const goals = stat.goals?.total ?? 0;
  const assists = stat.goals?.assists ?? 0;
  const rating = parseRating(stat.games?.rating);
  const score = apiRatingToScore(rating, goals, apps);
  const potential = Math.min(95, score + (entry.player.age != null && entry.player.age <= 23 ? 4 : 2));
  const valueMK = estimateMarketValueMK(score, goals, entry.player.age ?? 24, apps);
  const attrs = deriveAttributes(rating, stat, score);
  const seasonLabel = `${season}-${season + 1}`;

  const matchHistory = fixtures
    .map((f) => mapFixtureToMatch(f, stat.team.id))
    .filter((m): m is ProspectLiveMatch => m != null)
    .sort((a, b) => {
      const [da, ma] = a.date.split("/").map(Number);
      const [db, mb] = b.date.split("/").map(Number);
      return db - da || mb - ma;
    })
    .slice(0, 12);

  return {
    apiSportsId: entry.player.id,
    name,
    age: entry.player.age ?? 22,
    club: stat.team.name,
    league: stat.league?.name ?? "—",
    position,
    goals,
    assists,
    matches: apps,
    potential,
    currentRating: score,
    aiScore: score,
    marketValue: formatMarketValue(valueMK),
    valueMK,
    height: entry.player.height ? parseInt(entry.player.height, 10) || 178 : 178,
    weight: entry.player.weight ? parseInt(entry.player.weight, 10) || 74 : 74,
    speed: attrs.speed,
    dribble: attrs.dribble,
    passing: attrs.passing,
    defense: attrs.defense,
    physical: attrs.physical,
    mental: attrs.mental,
    photoUrl: entry.player.photo ?? undefined,
    season: seasonLabel,
    matchHistory,
    heatmapZones: buildHeatmapZones(position, goals, assists),
    monthlyPotential: buildMonthlyPotential(potential, matchHistory),
    videos: buildVideos(name, stat.team.name, goals, seasonLabel),
    reels: buildAiReels(name, stat.team.name, position, goals, assists),
  };
}

export async function fetchProspectLiveProfile(params: {
  name: string;
  club?: string;
  legacyId?: string;
  apiSportsId?: number;
}): Promise<ProspectLiveProfile | null> {
  const season = getActiveSeason();
  const playerId = await resolveApiSportsPlayerId(
    params.name,
    params.club,
    params.legacyId,
    params.apiSportsId,
  );
  if (!playerId) return null;

  const [profile, fixtures] = await Promise.all([
    fetchPlayerProfile(playerId, season),
    fetchPlayerFixtures(playerId, season).catch(() => [] as ApiFixturePlayerEntry[]),
  ]);

  const entry = profile[0];
  if (!entry) return null;
  return buildLiveProfileFromApi(entry, fixtures, season);
}
