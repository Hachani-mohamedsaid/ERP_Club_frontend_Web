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
  source?: "database" | "ai";
};

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
