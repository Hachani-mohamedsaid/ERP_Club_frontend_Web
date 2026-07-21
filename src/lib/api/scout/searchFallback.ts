import { TEAMS, getCountry } from "../../../data/scoutGeoData";
import { resolveFlashscoreSquad } from "./flashscoreSquads";
import type { ScoutProspectDto } from "./index";

export type ScoutSearchFilters = {
  query?: string;
  position?: string;
  country?: string;
  ageRange?: string;
  potRange?: string;
  budgetRange?: string;
};

export type SearchPlayerResult = ScoutProspectDto & {
  inDatabase?: boolean;
  source?: "database" | "ai" | "flashscore" | "apisports";
  apiSportsId?: number;
};

export const SCOUT_FALLBACK_SEASON = "2026-2027";

function parseMarketValueMK(value: string): number {
  const v = value.toLowerCase().replace(/\s/g, "");
  const m = v.match(/([\d,.]+)(m|k)?€?/);
  if (!m) return 500;
  const num = parseFloat(m[1]!.replace(",", "."));
  if (Number.isNaN(num)) return 500;
  if (m[2] === "m") return Math.round(num * 1000);
  if (m[2] === "k" || v.includes("k")) return Math.round(num);
  return num >= 100 ? Math.round(num) : Math.round(num * 1000);
}

function normalizePos(pos: string): string {
  const map: Record<string, string> = {
    GB: "GK", GK: "GK",
    AG: "Ailier G", AD: "Ailier D",
    MOC: "MC", MDC: "MC", MC: "MC",
    BU: "BU", DC: "DC", DG: "DG", DD: "DD",
  };
  return map[pos] ?? pos;
}

function positionsMatch(playerPos: string, filter?: string) {
  if (!filter || filter === "Tous") return true;
  const p = normalizePos(playerPos);
  const f = normalizePos(filter);
  if (p === f) return true;
  if (filter === "BU" && (playerPos === "BU" || playerPos === "ATT")) return true;
  if ((filter === "Ailier G" || filter === "Ailier D") && (playerPos === "AG" || playerPos === "AD" || playerPos === "ATT")) return true;
  if ((filter === "DG" || filter === "DD") && (playerPos === "DG" || playerPos === "DD" || playerPos === "DC" || playerPos === "DEF")) return true;
  return false;
}

let cachedFlashscorePool: SearchPlayerResult[] | null = null;

function getFlashscoreSearchPool(): SearchPlayerResult[] {
  if (cachedFlashscorePool) return cachedFlashscorePool;

  const out: SearchPlayerResult[] = [];
  const seen = new Set<string>();

  for (const team of TEAMS) {
    const country = getCountry(team.countryId);
    const seeds = resolveFlashscoreSquad(
      team.id,
      team.name,
      team.countryId,
      country?.name ?? team.city,
      team.avgPotential,
    );

    for (let i = 0; i < seeds.length; i++) {
      const p = seeds[i]!;
      const key = `${p.name.toLowerCase()}|${team.name.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const valueMK = parseMarketValueMK(p.marketValue);
      out.push({
        id: `${team.id}-fs-${i}`,
        name: p.name,
        age: p.age,
        nationality: p.nationality,
        flag: country?.flag ?? "⚽",
        club: team.name,
        league: team.league,
        position: normalizePos(p.position),
        potential: p.potential,
        currentRating: p.currentRating,
        marketValue: p.marketValue.replace(/\s*€/, "€"),
        valueMK,
        priority: p.potential >= 85 ? "A" : p.potential >= 78 ? "B" : "C",
        status: "new",
        aiScore: p.potential,
        injuryRisk: 12 + (p.age > 30 ? 15 : 0),
        foot: "Droit",
        height: 178,
        weight: 72,
        goals: 0,
        assists: 0,
        matches: 0,
        speed: 70,
        dribble: 70,
        passing: 70,
        defense: 60,
        physical: 70,
        mental: 70,
        contractEnd: "2027-06",
        addedDate: new Date().toISOString().slice(0, 10),
        notes: [],
        inWatchlist: false,
        inDatabase: false,
        source: "flashscore",
        season: SCOUT_FALLBACK_SEASON,
      });
    }
  }

  cachedFlashscorePool = out.sort((a, b) => b.potential - a.potential);
  return cachedFlashscorePool;
}

/** Recherche locale Flashscore — utilisé quand API-Sports est indisponible / quota. */
export function buildFlashscoreSearchResponse(filters: ScoutSearchFilters) {
  const pool = getFlashscoreSearchPool();
  const q = filters.query?.trim().toLowerCase();

  let results = pool.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.club.toLowerCase().includes(q)) return false;
    if (!positionsMatch(p.position, filters.position)) return false;
    if (filters.country && filters.country !== "Tous" && p.nationality !== filters.country) return false;
    if (!matchesAge(p.age, filters.ageRange)) return false;
    if (!matchesPot(p.potential, filters.potRange)) return false;
    if (!matchesBudget(p.valueMK, filters.budgetRange)) return false;
    return true;
  });

  if (results.length === 0 && q) {
    results = pool
      .filter((p) => p.name.toLowerCase().includes(q) || p.club.toLowerCase().includes(q))
      .slice(0, 18);
  }
  if (results.length === 0) {
    results = pool.slice(0, 24);
  }

  results = results.slice(0, 60);

  return {
    summary: `${results.length} joueur(s) — Flashscore · saison ${SCOUT_FALLBACK_SEASON}`,
    results,
    aiEnabled: false,
    sources: { database: 0, flashscore: results.length },
    model: "flashscore-local",
    season: SCOUT_FALLBACK_SEASON,
  };
}

function matchesAge(age: number, range?: string) {
  if (!range || range === "Tous") return true;
  if (range === "≤18") return age <= 18;
  if (range === "19-21") return age >= 19 && age <= 21;
  if (range === "22-25") return age >= 22 && age <= 25;
  if (range === ">25") return age > 25;
  return true;
}

function matchesPot(pot: number, range?: string) {
  if (!range || range === "Tous") return true;
  if (range === "≥85") return pot >= 85;
  if (range === "78-84") return pot >= 78 && pot <= 84;
  if (range === "<78") return pot < 78;
  return true;
}

function matchesBudget(mk: number, range?: string) {
  if (!range || range === "Tous") return true;
  if (range === "<500K €") return mk < 500;
  if (range === "500K-1M €") return mk >= 500 && mk <= 1000;
  if (range === "1M-2M €") return mk > 1000 && mk <= 2000;
  if (range === ">2M €") return mk > 2000;
  return true;
}

export function applyLocalProspectFilters(
  prospects: ScoutProspectDto[],
  filters: ScoutSearchFilters,
): ScoutProspectDto[] {
  const q = filters.query?.trim().toLowerCase();
  return prospects.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.club.toLowerCase().includes(q)) return false;
    if (filters.position && filters.position !== "Tous" && p.position !== filters.position) return false;
    if (filters.country && filters.country !== "Tous" && p.nationality !== filters.country) return false;
    if (!matchesAge(p.age, filters.ageRange)) return false;
    if (!matchesPot(p.potential, filters.potRange)) return false;
    if (!matchesBudget(p.valueMK, filters.budgetRange)) return false;
    return true;
  });
}

export function buildAiSearchQuery(filters: ScoutSearchFilters): string {
  const parts: string[] = [];
  if (filters.query?.trim()) parts.push(filters.query.trim());
  if (filters.position && filters.position !== "Tous") parts.push(`poste ${filters.position}`);
  if (filters.country && filters.country !== "Tous") parts.push(`nationalité ${filters.country}`);
  if (filters.ageRange && filters.ageRange !== "Tous") parts.push(`âge ${filters.ageRange}`);
  if (filters.potRange && filters.potRange !== "Tous") parts.push(`potentiel ${filters.potRange}`);
  if (filters.budgetRange && filters.budgetRange !== "Tous") parts.push(`budget ${filters.budgetRange}`);
  return parts.length > 0
    ? `Trouve des vrais joueurs professionnels actuels: ${parts.join(", ")}`
    : "Meilleurs prospects football africains et maghrébins saison actuelle";
}

type AiSearchHit = {
  id: string;
  name: string;
  club: string;
  position: string;
  age: number;
  potential: number;
  flag: string;
  aiScore: number;
  inDatabase?: boolean;
};

export function mapAiHitToProspect(hit: AiSearchHit, index: number, countryHint?: string): SearchPlayerResult {
  const slug = hit.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  const nationality = countryHint && countryHint !== "Tous" ? countryHint : "—";
  return {
    id: hit.id || `ai-search-${slug || index}`,
    name: hit.name,
    age: hit.age,
    nationality,
    flag: hit.flag || "🏳️",
    club: hit.club,
    league: "—",
    position: hit.position,
    potential: hit.potential,
    currentRating: Math.max(55, hit.potential - 8),
    marketValue: "—",
    valueMK: 500,
    priority: "B",
    status: "new",
    aiScore: hit.aiScore ?? hit.potential,
    injuryRisk: 18,
    foot: "Droit",
    height: 178,
    weight: 72,
    goals: 0,
    assists: 0,
    matches: 0,
    speed: 70,
    dribble: 70,
    passing: 70,
    defense: 60,
    physical: 70,
    mental: 70,
    contractEnd: "2027-06",
    addedDate: new Date().toISOString().split("T")[0],
    notes: [],
    inWatchlist: false,
    inDatabase: hit.inDatabase ?? false,
    source: hit.inDatabase ? "database" : "ai",
  };
}
