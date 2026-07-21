import type { ContinentId } from "./continentMap";

export interface MajorLeague {
  id: number;
  name: string;
  countryCode: string;
  countryName: string;
  continentId: ContinentId;
}

/** Ligues majeures API-Sports — 1 requête / ligue pour les équipes (évite 20+ appels /leagues) */
export const MAJOR_LEAGUES: MajorLeague[] = [
  // Afrique
  { id: 202, name: "Ligue 1", countryCode: "TN", countryName: "Tunisie", continentId: "afrique" },
  { id: 200, name: "Botola Pro", countryCode: "MA", countryName: "Maroc", continentId: "afrique" },
  { id: 186, name: "Ligue 1", countryCode: "DZ", countryName: "Algérie", continentId: "afrique" },
  { id: 233, name: "Premier League", countryCode: "EG", countryName: "Égypte", continentId: "afrique" },
  { id: 274, name: "Ligue 1", countryCode: "SN", countryName: "Sénégal", continentId: "afrique" },
  { id: 296, name: "NPFL", countryCode: "NG", countryName: "Nigeria", continentId: "afrique" },
  { id: 270, name: "Ligue 1", countryCode: "CI", countryName: "Côte d'Ivoire", continentId: "afrique" },
  { id: 288, name: "Premier Soccer League", countryCode: "ZA", countryName: "Afrique du Sud", continentId: "afrique" },
  // Europe
  { id: 39, name: "Premier League", countryCode: "GB", countryName: "Angleterre", continentId: "europe" },
  { id: 140, name: "La Liga", countryCode: "ES", countryName: "Espagne", continentId: "europe" },
  { id: 135, name: "Serie A", countryCode: "IT", countryName: "Italie", continentId: "europe" },
  { id: 78, name: "Bundesliga", countryCode: "DE", countryName: "Allemagne", continentId: "europe" },
  { id: 61, name: "Ligue 1", countryCode: "FR", countryName: "France", continentId: "europe" },
  { id: 88, name: "Eredivisie", countryCode: "NL", countryName: "Pays-Bas", continentId: "europe" },
  { id: 94, name: "Liga Portugal", countryCode: "PT", countryName: "Portugal", continentId: "europe" },
  { id: 144, name: "Pro League", countryCode: "BE", countryName: "Belgique", continentId: "europe" },
  { id: 203, name: "Süper Lig", countryCode: "TR", countryName: "Turquie", continentId: "europe" },
  { id: 235, name: "Premier League", countryCode: "RU", countryName: "Russie", continentId: "europe" },
  { id: 179, name: "Premiership", countryCode: "GB", countryName: "Écosse", continentId: "europe" },
  // Amérique du Sud
  { id: 71, name: "Brasileirão", countryCode: "BR", countryName: "Brésil", continentId: "am-sud" },
  { id: 128, name: "Liga Profesional", countryCode: "AR", countryName: "Argentine", continentId: "am-sud" },
  { id: 265, name: "Primera División", countryCode: "CL", countryName: "Chili", continentId: "am-sud" },
  { id: 239, name: "Primera A", countryCode: "CO", countryName: "Colombie", continentId: "am-sud" },
  // Amérique du Nord
  { id: 253, name: "MLS", countryCode: "US", countryName: "États-Unis", continentId: "am-nord" },
  { id: 262, name: "Liga MX", countryCode: "MX", countryName: "Mexique", continentId: "am-nord" },
  // Asie
  { id: 307, name: "Saudi Pro League", countryCode: "SA", countryName: "Arabie Saoudite", continentId: "asie" },
  { id: 301, name: "UAE Pro League", countryCode: "AE", countryName: "Émirats", continentId: "asie" },
  { id: 98, name: "J1 League", countryCode: "JP", countryName: "Japon", continentId: "asie" },
  { id: 292, name: "K League 1", countryCode: "KR", countryName: "Corée du Sud", continentId: "asie" },
  { id: 169, name: "Super League", countryCode: "CN", countryName: "Chine", continentId: "asie" },
  // Océanie
  { id: 188, name: "A-League", countryCode: "AU", countryName: "Australie", continentId: "oceanie" },
];

export function leaguesByContinent(continentId: ContinentId) {
  return MAJOR_LEAGUES.filter((l) => l.continentId === continentId);
}

export function leaguesByCountry(countryCode: string) {
  return MAJOR_LEAGUES.filter((l) => l.countryCode.toLowerCase() === countryCode.toLowerCase());
}

export function leaguesByCountryName(countryName: string) {
  if (!countryName || countryName === "Tous") return [];
  return MAJOR_LEAGUES.filter((l) => l.countryName === countryName);
}

/** Ligues utilisées pour la recherche par défaut (poste / tous pays) */
export const DEFAULT_SEARCH_LEAGUE_IDS = [140, 39, 135, 78, 61, 202, 200];

export function uniqueCountriesFromLeagues(leagues: MajorLeague[]) {
  const map = new Map<string, { code: string; name: string; leagues: MajorLeague[] }>();
  for (const l of leagues) {
    const existing = map.get(l.countryCode);
    if (existing) existing.leagues.push(l);
    else map.set(l.countryCode, { code: l.countryCode, name: l.countryName, leagues: [l] });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
