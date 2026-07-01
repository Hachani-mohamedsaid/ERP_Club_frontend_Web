import { S } from "./scoutData";
import type { BubbleNodeInput } from "../lib/scout/bubbleMapTypes";
import { getContinentLogoUrl, getRealLeagueLogoUrl, getRealTeamLogoUrl } from "./scoutTeamAssets";

/** Flag CDN (ISO 3166-1 alpha-2) */
export function flagUrl(code: string) {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

/** League badge via ui-avatars (competition acronym) */
export function leagueLogoUrl(league: string, color = "6366F1") {
  const acronym = league
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(acronym)}&background=${color.replace("#", "")}&color=fff&size=64&bold=true`;
}

/** Team crest placeholder (initials) — replace with real URLs when available */
export function teamLogoUrl(name: string, color = "FF7A00") {
  const short = name.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 12);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(short)}&background=${color.replace("#", "")}&color=fff&size=128&bold=true&format=svg`;
}

export interface GeoContinent {
  id: string;
  name: string;
  icon: string;
  color: string;
  prospects: number;
  countries: number;
}

export interface GeoCountry {
  id: string;
  continentId: string;
  name: string;
  flag: string;
  flagCode: string;
  color: string;
  leagues: string[];
  leagueId: string;
  prospects: number;
}

export interface GeoTeam {
  id: string;
  countryId: string;
  name: string;
  league: string;
  leagueId: string;
  city: string;
  tier: "Pro" | "D2" | "Elite";
  avgPotential: number;
  scoutActivity: "Haute" | "Moyenne" | "Faible";
  playerCount: number;
  logoColor?: string;
}

export const CONTINENTS: GeoContinent[] = [
  { id: "afrique", name: "Afrique", icon: "🌍", color: S.primary, prospects: 42, countries: 7 },
  { id: "europe", name: "Europe", icon: "🇪🇺", color: S.info, prospects: 70, countries: 8 },
  { id: "asie", name: "Asie", icon: "🌏", color: S.accent, prospects: 18, countries: 6 },
  { id: "am-nord", name: "Amérique du Nord", icon: "🌎", color: S.success, prospects: 14, countries: 3 },
  { id: "am-sud", name: "Amérique du Sud", icon: "🌎", color: "#8B5CF6", prospects: 22, countries: 2 },
  { id: "oceanie", name: "Océanie", icon: "🏝️", color: S.warning, prospects: 6, countries: 2 },
];

export const COUNTRIES: GeoCountry[] = [
  { id: "tn", continentId: "afrique", name: "Tunisie", flag: "🇹🇳", flagCode: "tn", color: S.primary, leagues: ["Ligue 1 TUN"], leagueId: "l1-tun", prospects: 18 },
  { id: "dz", continentId: "afrique", name: "Algérie", flag: "🇩🇿", flagCode: "dz", color: S.success, leagues: ["Ligue 1 DZ"], leagueId: "l1-dz", prospects: 10 },
  { id: "ma", continentId: "afrique", name: "Maroc", flag: "🇲🇦", flagCode: "ma", color: S.danger, leagues: ["Botola Pro"], leagueId: "botola", prospects: 8 },
  { id: "ci", continentId: "afrique", name: "Côte d'Ivoire", flag: "🇨🇮", flagCode: "ci", color: S.warning, leagues: ["Ligue 1 CI"], leagueId: "l1-ci", prospects: 6 },
  { id: "sn", continentId: "afrique", name: "Sénégal", flag: "🇸🇳", flagCode: "sn", color: S.info, leagues: ["Elite 1 SN"], leagueId: "elite-sn", prospects: 5 },
  { id: "ng", continentId: "afrique", name: "Nigeria", flag: "🇳🇬", flagCode: "ng", color: "#22C55E", leagues: ["NPFL"], leagueId: "npfl", prospects: 4 },
  { id: "eg", continentId: "afrique", name: "Égypte", flag: "🇪🇬", flagCode: "eg", color: S.accent, leagues: ["Premier League EG"], leagueId: "pl-eg", prospects: 6 },
  { id: "gb", continentId: "europe", name: "Angleterre", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagCode: "gb", color: "#7C3AED", leagues: ["Premier League"], leagueId: "pl-eng", prospects: 14 },
  { id: "de", continentId: "europe", name: "Allemagne", flag: "🇩🇪", flagCode: "de", color: "#DC2626", leagues: ["Bundesliga"], leagueId: "bundesliga", prospects: 11 },
  { id: "it", continentId: "europe", name: "Italie", flag: "🇮🇹", flagCode: "it", color: "#0284C7", leagues: ["Serie A"], leagueId: "serie-a-it", prospects: 10 },
  { id: "fr", continentId: "europe", name: "France", flag: "🇫🇷", flagCode: "fr", color: S.info, leagues: ["Ligue 1"], leagueId: "l1-fr", prospects: 12 },
  { id: "es", continentId: "europe", name: "Espagne", flag: "🇪🇸", flagCode: "es", color: S.danger, leagues: ["La Liga"], leagueId: "laliga", prospects: 8 },
  { id: "pt", continentId: "europe", name: "Portugal", flag: "🇵🇹", flagCode: "pt", color: S.success, leagues: ["Liga Portugal"], leagueId: "liga-pt", prospects: 5 },
  { id: "nl", continentId: "europe", name: "Pays-Bas", flag: "🇳🇱", flagCode: "nl", color: "#F97316", leagues: ["Eredivisie"], leagueId: "eredivisie", prospects: 6 },
  { id: "be", continentId: "europe", name: "Belgique", flag: "🇧🇪", flagCode: "be", color: "#EAB308", leagues: ["Pro League"], leagueId: "pro-league-be", prospects: 4 },
  { id: "br", continentId: "am-sud", name: "Brésil", flag: "🇧🇷", flagCode: "br", color: S.success, leagues: ["Série A"], leagueId: "serie-a-br", prospects: 15 },
  { id: "ar", continentId: "am-sud", name: "Argentine", flag: "🇦🇷", flagCode: "ar", color: S.info, leagues: ["Primera"], leagueId: "primera", prospects: 9 },
];

export const TEAMS: GeoTeam[] = [
  { id: "est", countryId: "tn", name: "ES Sahel", league: "Ligue 1 TUN", leagueId: "l1-tun", city: "Sousse", tier: "Pro", avgPotential: 82, scoutActivity: "Haute", playerCount: 4, logoColor: "DC2626" },
  { id: "ca", countryId: "tn", name: "Club Africain", league: "Ligue 1 TUN", leagueId: "l1-tun", city: "Tunis", tier: "Pro", avgPotential: 80, scoutActivity: "Haute", playerCount: 3, logoColor: "DC2626" },
  { id: "css", countryId: "tn", name: "CS Sfaxien", league: "Ligue 1 TUN", leagueId: "l1-tun", city: "Sfax", tier: "Pro", avgPotential: 79, scoutActivity: "Moyenne", playerCount: 2, logoColor: "1D4ED8" },
  { id: "st", countryId: "tn", name: "Stade Tunisien", league: "Ligue 1 TUN", leagueId: "l1-tun", city: "Tunis", tier: "Pro", avgPotential: 84, scoutActivity: "Haute", playerCount: 3, logoColor: "2563EB" },
  { id: "ari", countryId: "tn", name: "AS Ariana", league: "Ligue 2 TUN", leagueId: "l2-tun", city: "Ariana", tier: "D2", avgPotential: 86, scoutActivity: "Haute", playerCount: 2, logoColor: "FF7A00" },
  { id: "mon", countryId: "tn", name: "US Monastir", league: "Ligue 1 TUN", leagueId: "l1-tun", city: "Monastir", tier: "Pro", avgPotential: 78, scoutActivity: "Moyenne", playerCount: 2, logoColor: "059669" },
  { id: "kab", countryId: "dz", name: "JS Kabylie", league: "Ligue 1 DZ", leagueId: "l1-dz", city: "Tizi Ouzou", tier: "Pro", avgPotential: 76, scoutActivity: "Moyenne", playerCount: 2, logoColor: "FFD700" },
  { id: "mc", countryId: "dz", name: "MC Alger", league: "Ligue 1 DZ", leagueId: "l1-dz", city: "Alger", tier: "Pro", avgPotential: 77, scoutActivity: "Faible", playerCount: 1, logoColor: "059669" },
  { id: "wyd", countryId: "ma", name: "Wydad AC", league: "Botola Pro", leagueId: "botola", city: "Casablanca", tier: "Pro", avgPotential: 81, scoutActivity: "Moyenne", playerCount: 2, logoColor: "DC2626" },
  { id: "raj", countryId: "ma", name: "Raja CA", league: "Botola Pro", leagueId: "botola", city: "Rabat", tier: "Pro", avgPotential: 80, scoutActivity: "Moyenne", playerCount: 1, logoColor: "059669" },
  { id: "asec", countryId: "ci", name: "ASEC Mimosas", league: "Ligue 1 CI", leagueId: "l1-ci", city: "Abidjan", tier: "Pro", avgPotential: 79, scoutActivity: "Haute", playerCount: 1, logoColor: "FFD700" },
  { id: "afad", countryId: "ci", name: "AFAD Djékanou", league: "Ligue 1 CI", leagueId: "l1-ci", city: "Djékanou", tier: "Pro", avgPotential: 81, scoutActivity: "Haute", playerCount: 1, logoColor: "FF7A00" },
  { id: "gen", countryId: "sn", name: "Génération Foot", league: "Elite 1 SN", leagueId: "elite-sn", city: "Thiès", tier: "Elite", avgPotential: 86, scoutActivity: "Haute", playerCount: 1, logoColor: "DC2626" },
  { id: "jaraaf", countryId: "sn", name: "Jaraaf", league: "Elite 1 SN", leagueId: "elite-sn", city: "Dakar", tier: "Pro", avgPotential: 78, scoutActivity: "Moyenne", playerCount: 1, logoColor: "2563EB" },
  { id: "ahly", countryId: "eg", name: "Al Ahly", league: "Premier League EG", leagueId: "pl-eg", city: "Le Caire", tier: "Pro", avgPotential: 83, scoutActivity: "Moyenne", playerCount: 3, logoColor: "DC2626" },
  { id: "zamalek", countryId: "eg", name: "Zamalek", league: "Premier League EG", leagueId: "pl-eg", city: "Le Caire", tier: "Pro", avgPotential: 80, scoutActivity: "Moyenne", playerCount: 2, logoColor: "FFFFFF" },
  { id: "pyramids", countryId: "eg", name: "Pyramids FC", league: "Premier League EG", leagueId: "pl-eg", city: "Le Caire", tier: "Pro", avgPotential: 78, scoutActivity: "Faible", playerCount: 1, logoColor: "1D4ED8" },
  { id: "enyimba", countryId: "ng", name: "Enyimba", league: "NPFL", leagueId: "npfl", city: "Aba", tier: "Pro", avgPotential: 75, scoutActivity: "Faible", playerCount: 2, logoColor: "FFD700" },
  { id: "rivers", countryId: "ng", name: "Rivers United", league: "NPFL", leagueId: "npfl", city: "Port Harcourt", tier: "Pro", avgPotential: 73, scoutActivity: "Faible", playerCount: 1, logoColor: "2563EB" },
  { id: "psg", countryId: "fr", name: "Paris SG", league: "Ligue 1", leagueId: "l1-fr", city: "Paris", tier: "Pro", avgPotential: 88, scoutActivity: "Faible", playerCount: 4, logoColor: "004170" },
  { id: "ol", countryId: "fr", name: "Olympique Lyon", league: "Ligue 1", leagueId: "l1-fr", city: "Lyon", tier: "Pro", avgPotential: 85, scoutActivity: "Faible", playerCount: 2, logoColor: "0055A4" },
  { id: "om", countryId: "fr", name: "Olympique Marseille", league: "Ligue 1", leagueId: "l1-fr", city: "Marseille", tier: "Pro", avgPotential: 84, scoutActivity: "Moyenne", playerCount: 2, logoColor: "00A1E4" },
  { id: "rm", countryId: "es", name: "Real Madrid", league: "La Liga", leagueId: "laliga", city: "Madrid", tier: "Pro", avgPotential: 90, scoutActivity: "Faible", playerCount: 3, logoColor: "FEBE10" },
  { id: "barca", countryId: "es", name: "FC Barcelona", league: "La Liga", leagueId: "laliga", city: "Barcelone", tier: "Pro", avgPotential: 89, scoutActivity: "Faible", playerCount: 3, logoColor: "A50044" },
  { id: "atm", countryId: "es", name: "Atlético Madrid", league: "La Liga", leagueId: "laliga", city: "Madrid", tier: "Pro", avgPotential: 86, scoutActivity: "Faible", playerCount: 2, logoColor: "CB3524" },
  { id: "benfica", countryId: "pt", name: "Benfica", league: "Liga Portugal", leagueId: "liga-pt", city: "Lisbonne", tier: "Pro", avgPotential: 85, scoutActivity: "Moyenne", playerCount: 2, logoColor: "DC2626" },
  { id: "porto", countryId: "pt", name: "FC Porto", league: "Liga Portugal", leagueId: "liga-pt", city: "Porto", tier: "Pro", avgPotential: 84, scoutActivity: "Moyenne", playerCount: 2, logoColor: "00428C" },
  { id: "city", countryId: "gb", name: "Manchester City", league: "Premier League", leagueId: "pl-eng", city: "Manchester", tier: "Pro", avgPotential: 89, scoutActivity: "Faible", playerCount: 4, logoColor: "6CABDD" },
  { id: "arsenal", countryId: "gb", name: "Arsenal", league: "Premier League", leagueId: "pl-eng", city: "Londres", tier: "Pro", avgPotential: 87, scoutActivity: "Faible", playerCount: 3, logoColor: "EF0107" },
  { id: "liverpool", countryId: "gb", name: "Liverpool", league: "Premier League", leagueId: "pl-eng", city: "Liverpool", tier: "Pro", avgPotential: 88, scoutActivity: "Faible", playerCount: 3, logoColor: "C8102E" },
  { id: "manu", countryId: "gb", name: "Man United", league: "Premier League", leagueId: "pl-eng", city: "Manchester", tier: "Pro", avgPotential: 85, scoutActivity: "Faible", playerCount: 2, logoColor: "DA020E" },
  { id: "chelsea", countryId: "gb", name: "Chelsea", league: "Premier League", leagueId: "pl-eng", city: "Londres", tier: "Pro", avgPotential: 86, scoutActivity: "Faible", playerCount: 2, logoColor: "034694" },
  { id: "bayern", countryId: "de", name: "Bayern Munich", league: "Bundesliga", leagueId: "bundesliga", city: "Munich", tier: "Pro", avgPotential: 90, scoutActivity: "Faible", playerCount: 4, logoColor: "DC052D" },
  { id: "dortmund", countryId: "de", name: "Borussia Dortmund", league: "Bundesliga", leagueId: "bundesliga", city: "Dortmund", tier: "Pro", avgPotential: 87, scoutActivity: "Faible", playerCount: 3, logoColor: "FDE100" },
  { id: "leverkusen", countryId: "de", name: "Bayer Leverkusen", league: "Bundesliga", leagueId: "bundesliga", city: "Leverkusen", tier: "Pro", avgPotential: 86, scoutActivity: "Moyenne", playerCount: 2, logoColor: "E32221" },
  { id: "inter", countryId: "it", name: "Inter Milan", league: "Serie A", leagueId: "serie-a-it", city: "Milan", tier: "Pro", avgPotential: 88, scoutActivity: "Faible", playerCount: 3, logoColor: "010E80" },
  { id: "milan", countryId: "it", name: "AC Milan", league: "Serie A", leagueId: "serie-a-it", city: "Milan", tier: "Pro", avgPotential: 87, scoutActivity: "Faible", playerCount: 3, logoColor: "FB090B" },
  { id: "juve", countryId: "it", name: "Juventus", league: "Serie A", leagueId: "serie-a-it", city: "Turin", tier: "Pro", avgPotential: 86, scoutActivity: "Faible", playerCount: 2, logoColor: "FFFFFF" },
  { id: "napoli", countryId: "it", name: "Napoli", league: "Serie A", leagueId: "serie-a-it", city: "Naples", tier: "Pro", avgPotential: 85, scoutActivity: "Moyenne", playerCount: 2, logoColor: "12A0D7" },
  { id: "ajax", countryId: "nl", name: "Ajax Amsterdam", league: "Eredivisie", leagueId: "eredivisie", city: "Amsterdam", tier: "Pro", avgPotential: 84, scoutActivity: "Moyenne", playerCount: 2, logoColor: "D2122E" },
  { id: "psv", countryId: "nl", name: "PSV Eindhoven", league: "Eredivisie", leagueId: "eredivisie", city: "Eindhoven", tier: "Pro", avgPotential: 83, scoutActivity: "Moyenne", playerCount: 2, logoColor: "ED1C24" },
  { id: "feyenoord", countryId: "nl", name: "Feyenoord", league: "Eredivisie", leagueId: "eredivisie", city: "Rotterdam", tier: "Pro", avgPotential: 82, scoutActivity: "Moyenne", playerCount: 1, logoColor: "E30613" },
  { id: "brugge", countryId: "be", name: "Club Brugge", league: "Pro League", leagueId: "pro-league-be", city: "Bruges", tier: "Pro", avgPotential: 80, scoutActivity: "Moyenne", playerCount: 2, logoColor: "007BC1" },
  { id: "anderlecht", countryId: "be", name: "Anderlecht", league: "Pro League", leagueId: "pro-league-be", city: "Bruxelles", tier: "Pro", avgPotential: 79, scoutActivity: "Faible", playerCount: 1, logoColor: "4B0082" },
  { id: "flamengo", countryId: "br", name: "Flamengo", league: "Série A", leagueId: "serie-a-br", city: "Rio", tier: "Pro", avgPotential: 87, scoutActivity: "Moyenne", playerCount: 3, logoColor: "DC2626" },
  { id: "palmeiras", countryId: "br", name: "Palmeiras", league: "Série A", leagueId: "serie-a-br", city: "São Paulo", tier: "Pro", avgPotential: 86, scoutActivity: "Moyenne", playerCount: 2, logoColor: "059669" },
  { id: "boca", countryId: "ar", name: "Boca Juniors", league: "Primera", leagueId: "primera", city: "Buenos Aires", tier: "Pro", avgPotential: 85, scoutActivity: "Moyenne", playerCount: 2, logoColor: "004170" },
  { id: "river", countryId: "ar", name: "River Plate", league: "Primera", leagueId: "primera", city: "Buenos Aires", tier: "Pro", avgPotential: 86, scoutActivity: "Moyenne", playerCount: 2, logoColor: "DC2626" },
];

export const STEPS = [
  { id: 0, label: "Continent", icon: "🌍" },
  { id: 1, label: "Pays", icon: "🏳️" },
  { id: 2, label: "Équipe", icon: "⚽" },
  { id: 3, label: "Exploration", icon: "🔍" },
] as const;

export function getCountriesByContinent(continentId: string) {
  return COUNTRIES.filter((c) => c.continentId === continentId);
}

export function getTeamsByCountry(countryId: string) {
  return TEAMS.filter((t) => t.countryId === countryId);
}

export function getContinent(id: string) {
  return CONTINENTS.find((c) => c.id === id);
}

export function getCountry(id: string) {
  return COUNTRIES.find((c) => c.id === id);
}

export function getTeam(id: string) {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamLogo(team: Pick<GeoTeam, "id" | "name" | "logoColor">) {
  const fallback = teamLogoUrl(team.name, team.logoColor ?? "FF7A00");
  return getRealTeamLogoUrl(team.id, fallback, team.name);
}

export function getLeagueLogo(team: GeoTeam) {
  const fallback = leagueLogoUrl(team.league, "6366F1");
  return getRealLeagueLogoUrl(team.leagueId, fallback);
}

export function getCountryFlagUrl(country: GeoCountry) {
  return flagUrl(country.flagCode);
}

export function getCountryLeagueLogo(country: GeoCountry) {
  const fallback = leagueLogoUrl(country.leagues[0], country.color.replace("#", ""));
  return getRealLeagueLogoUrl(country.leagueId, fallback);
}

export function getContinentLogo(continent: GeoContinent) {
  const fallback = leagueLogoUrl(continent.name.slice(0, 3), continent.color.replace("#", ""));
  return getContinentLogoUrl(continent.id, fallback);
}

export function buildContinentNodes(): BubbleNodeInput[] {
  return CONTINENTS.map((c) => ({
    id: c.id,
    name: c.name,
    count: c.prospects,
    level: "continent" as const,
    color: c.color,
    icon: c.icon,
    logoUrl: getContinentLogoUrl(c.id, leagueLogoUrl(c.name.slice(0, 3), c.color.replace("#", ""))),
    subtitle: `${c.countries} pays`,
  }));
}

export function buildCountryNodes(continentId: string): BubbleNodeInput[] {
  return getCountriesByContinent(continentId).map((c) => ({
    id: c.id,
    name: c.name,
    count: c.prospects,
    level: "country" as const,
    parentId: continentId,
    color: c.color,
    icon: c.flag,
    logoUrl: getCountryLeagueLogo(c),
    subtitle: c.leagues[0],
  }));
}

export function buildTeamNodes(countryId: string, prospectCounts?: Record<string, number>): BubbleNodeInput[] {
  return getTeamsByCountry(countryId).map((t) => ({
    id: t.id,
    name: t.name,
    count: prospectCounts?.[t.id] ?? t.playerCount,
    level: "team" as const,
    parentId: countryId,
    color: S.primary,
    logoUrl: getTeamLogo(t),
    leagueLogoUrl: getLeagueLogo(t),
    subtitle: `${t.league} · ${t.city}`,
  }));
}
