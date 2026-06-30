/** Public CDN URLs for real team & league crests (api-sports.io + football-data.org) */

export const API_SPORTS = {
  team: (id: number) => `https://media.api-sports.io/football/teams/${id}.png`,
  league: (id: number) => `https://media.api-sports.io/football/leagues/${id}.png`,
} as const;

export const FOOTBALL_DATA = {
  crest: (id: number) => `https://crests.football-data.org/${id}.png`,
  league: (code: string) => `https://crests.football-data.org/${code}.png`,
} as const;

/** Direct crest URLs (TheSportsDB) when verified — avoids wrong api-sports ID swaps */
export const TEAM_BADGE_URLS: Record<string, string> = {
  est: "https://r2.thesportsdb.com/images/media/team/badge/zyy5p81753933927.png",
  ca: "https://r2.thesportsdb.com/images/media/team/badge/2gijg71753933998.png",
  css: "https://r2.thesportsdb.com/images/media/team/badge/d89tpa1589898020.png",
  st: "https://r2.thesportsdb.com/images/media/team/badge/ig19641753933662.png",
  mon: "https://r2.thesportsdb.com/images/media/team/badge/v1mr1z1777247628.png",
  ari: "https://r2.thesportsdb.com/images/media/team/badge/ac6bds1674116456.png",
};

/** api-sports team IDs — stable across seasons */
export const TEAM_SPORTS_IDS: Record<string, number> = {
  // Tunisie (IDs vérifiés via TheSportsDB / api-football)
  est: 990,      // Étoile du Sahel
  ca: 988,       // Club Africain
  css: 983,      // CS Sfaxien
  st: 991,       // Stade Tunisien
  mon: 992,      // US Monastir
  ari: 21435,    // AS Ariana
  // Algérie
  kab: 918,      // JS Kabylie
  mc: 906,       // MC Alger
  // Maroc
  wyd: 968,      // Wydad AC
  raj: 976,      // Raja CA
  // Côte d'Ivoire
  asec: 1698,    // ASEC Mimosas
  // Sénégal
  gen: 4133,     // Génération Foot
  jaraaf: 4134,  // Jaraaf (AS Douane/Jaraaf)
  // Égypte
  ahly: 1577,
  zamalek: 1040,
  pyramids: 10397,
  // Nigeria
  enyimba: 2620,
  rivers: 2621,
  // France
  psg: 85,
  ol: 80,
  om: 81,
  // Espagne
  rm: 541,
  barca: 529,
  atm: 530,
  // Portugal
  benfica: 211,
  porto: 212,
  // Angleterre
  city: 50,
  arsenal: 42,
  liverpool: 40,
  manu: 33,
  chelsea: 49,
  // Allemagne
  bayern: 157,
  dortmund: 165,
  leverkusen: 168,
  // Italie
  inter: 505,
  milan: 489,
  juve: 496,
  napoli: 492,
  // Pays-Bas
  ajax: 194,
  psv: 197,
  feyenoord: 198,
  // Belgique
  brugge: 569,
  anderlecht: 554,
  // Brésil
  flamengo: 127,
  palmeiras: 121,
  // Argentine
  boca: 451,
  river: 435,
};

/** api-sports league IDs for competition badges */
export const LEAGUE_SPORTS_IDS: Record<string, number> = {
  "l1-tun": 202,
  "l2-tun": 202,
  "l1-dz": 186,
  botola: 200,
  "l1-ci": 203,
  "elite-sn": 204,
  "pl-eg": 233,
  npfl: 287,
  "l1-fr": 61,
  laliga: 140,
  "liga-pt": 94,
  "pl-eng": 39,
  bundesliga: 78,
  "serie-a-it": 135,
  eredivisie: 88,
  "pro-league-be": 144,
  "serie-a-br": 71,
  primera: 128,
};

/** Representative confederation / top-competition logos per continent */
export const CONTINENT_LEAGUE_IDS: Record<string, number> = {
  afrique: 12,      // CAF Champions League
  europe: 2,        // UEFA Champions League
  asie: 17,         // AFC Champions League
  "am-nord": 16,    // CONCACAF Champions League
  "am-sud": 13,     // Copa Libertadores
  oceanie: 188,     // A-League (Océanie)
};

export function getContinentLogoUrl(continentId: string, fallback: string): string {
  const id = CONTINENT_LEAGUE_IDS[continentId];
  return id ? API_SPORTS.league(id) : fallback;
}

export function getRealTeamLogoUrl(teamId: string, fallback: string): string {
  const badgeUrl = TEAM_BADGE_URLS[teamId];
  if (badgeUrl) return badgeUrl;
  const sportsId = TEAM_SPORTS_IDS[teamId];
  return sportsId ? API_SPORTS.team(sportsId) : fallback;
}

export function getRealLeagueLogoUrl(leagueId: string, fallback: string): string {
  const sportsId = LEAGUE_SPORTS_IDS[leagueId];
  if (sportsId) return API_SPORTS.league(sportsId);
  // football-data.org codes for major European leagues
  const fdCodes: Record<string, string> = {
    "l1-fr": "FL1",
    laliga: "PD",
    "liga-pt": "PPL",
    "pl-eng": "PL",
    bundesliga: "BL1",
    "serie-a-it": "SA",
  };
  const code = fdCodes[leagueId];
  return code ? FOOTBALL_DATA.league(code) : fallback;
}
