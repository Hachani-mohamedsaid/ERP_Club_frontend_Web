/** Public CDN URLs for real team & league crests (api-sports.io + football-data.org) */

export const API_SPORTS = {
  team: (id: number) => `https://media.api-sports.io/football/teams/${id}.png`,
  league: (id: number) => `https://media.api-sports.io/football/leagues/${id}.png`,
} as const;

export const FOOTBALL_DATA = {
  crest: (id: number) => `https://crests.football-data.org/${id}.png`,
  league: (code: string) => `https://crests.football-data.org/${code}.png`,
} as const;

/** Direct crest URLs (TheSportsDB) when verified */
export const TEAM_BADGE_URLS: Record<string, string> = {
  est: "https://r2.thesportsdb.com/images/media/team/badge/zyy5p81753933927.png",
  ca: "https://r2.thesportsdb.com/images/media/team/badge/2gijg71753933998.png",
  css: "https://r2.thesportsdb.com/images/media/team/badge/d89tpa1589898020.png",
  st: "https://r2.thesportsdb.com/images/media/team/badge/ig19641753933662.png",
  mon: "https://r2.thesportsdb.com/images/media/team/badge/v1mr1z1777247628.png",
  ari: "https://r2.thesportsdb.com/images/media/team/badge/ac6bds1674116456.png",
  "tn-es-sahel": "https://r2.thesportsdb.com/images/media/team/badge/zyy5p81753933927.png",
  "tn-club-africain": "https://r2.thesportsdb.com/images/media/team/badge/2gijg71753933998.png",
  "tn-cs-sfaxien": "https://r2.thesportsdb.com/images/media/team/badge/d89tpa1589898020.png",
  "tn-stade-tunisien": "https://r2.thesportsdb.com/images/media/team/badge/ig19641753933662.png",
  "tn-us-monastir": "https://r2.thesportsdb.com/images/media/team/badge/v1mr1z1777247628.png",
  "tn-as-ariana": "https://r2.thesportsdb.com/images/media/team/badge/ac6bds1674116456.png",
};

/** Legacy catalog team IDs */
export const TEAM_SPORTS_IDS: Record<string, number> = {
  est: 990,
  ca: 988,
  css: 983,
  st: 991,
  mon: 992,
  ari: 21435,
  kab: 918,
  mc: 906,
  wyd: 968,
  raj: 976,
  asec: 1698,
  gen: 4133,
  jaraaf: 4134,
  ahly: 1577,
  zamalek: 1040,
  pyramids: 10397,
  enyimba: 2620,
  rivers: 2621,
  psg: 85,
  ol: 80,
  om: 81,
  rm: 541,
  barca: 529,
  atm: 530,
  benfica: 211,
  porto: 212,
  city: 50,
  arsenal: 42,
  liverpool: 40,
  manu: 33,
  chelsea: 49,
  bayern: 157,
  dortmund: 165,
  leverkusen: 168,
  inter: 505,
  milan: 489,
  juve: 496,
  napoli: 492,
  ajax: 194,
  psv: 197,
  feyenoord: 198,
  brugge: 569,
  anderlecht: 554,
  flamengo: 127,
  palmeiras: 121,
  boca: 451,
  river: 435,
};

/**
 * api-sports team IDs keyed by normalized club name.
 * Covers full league rosters (Premier League, La Liga, Ligue 1, etc.)
 */
export const TEAM_NAME_SPORTS_IDS: Record<string, number> = {
  // Angleterre — Premier League
  arsenal: 42,
  "aston villa": 66,
  bournemouth: 35,
  brentford: 55,
  brighton: 51,
  "brighton & hove albion": 51,
  chelsea: 49,
  "crystal palace": 52,
  everton: 45,
  fulham: 36,
  "ipswich town": 57,
  ipswich: 57,
  "leicester city": 46,
  leicester: 46,
  liverpool: 40,
  "manchester city": 50,
  "man city": 50,
  "manchester united": 33,
  "man united": 33,
  "newcastle united": 34,
  newcastle: 34,
  "nottingham forest": 65,
  southampton: 41,
  tottenham: 47,
  "tottenham hotspur": 47,
  "west ham": 48,
  "west ham united": 48,
  wolves: 39,
  wolverhampton: 39,
  "wolverhampton wanderers": 39,

  // Espagne — La Liga
  alaves: 724,
  "athletic bilbao": 531,
  "atletico madrid": 530,
  barcelona: 529,
  "fc barcelona": 529,
  betis: 543,
  "real betis": 543,
  "celta vigo": 538,
  espanyol: 540,
  getafe: 546,
  girona: 547,
  "las palmas": 534,
  leganes: 745,
  mallorca: 798,
  osasuna: 727,
  "rayo vallecano": 728,
  "real madrid": 541,
  "real sociedad": 548,
  sevilla: 536,
  valencia: 532,
  valladolid: 720,
  villarreal: 533,

  // France — Ligue 1
  angers: 77,
  auxerre: 108,
  brest: 106,
  "le havre": 111,
  lens: 116,
  lille: 79,
  lyon: 80,
  "olympique lyon": 80,
  marseille: 81,
  "olympique marseille": 81,
  monaco: 91,
  montpellier: 82,
  nantes: 83,
  nice: 84,
  "paris sg": 85,
  psg: 85,
  "paris saint-germain": 85,
  reims: 93,
  rennes: 94,
  "saint-etienne": 1063,
  strasbourg: 95,
  toulouse: 96,

  // Allemagne — Bundesliga
  augsburg: 170,
  "bayer leverkusen": 168,
  leverkusen: 168,
  "bayern munich": 157,
  bayern: 157,
  bochum: 176,
  "borussia dortmund": 165,
  dortmund: 165,
  "eintracht frankfurt": 169,
  frankfurt: 169,
  freiburg: 160,
  heidenheim: 180,
  hoffenheim: 167,
  "holstein kiel": 191,
  mainz: 164,
  "monchengladbach": 163,
  "borussia monchengladbach": 163,
  "rb leipzig": 173,
  leipzig: 173,
  "st pauli": 186,
  stuttgart: 172,
  "union berlin": 182,
  "werder bremen": 162,
  wolfsburg: 161,

  // Italie — Serie A
  atalanta: 499,
  bologna: 500,
  cagliari: 490,
  como: 895,
  empoli: 511,
  fiorentina: 502,
  genoa: 495,
  "inter milan": 505,
  inter: 505,
  juventus: 496,
  juve: 496,
  lazio: 487,
  lecce: 867,
  "ac milan": 489,
  milan: 489,
  monza: 1579,
  napoli: 492,
  parma: 523,
  roma: 497,
  torino: 503,
  udinese: 494,
  venezia: 517,
  verona: 504,
  "hellas verona": 504,

  // Portugal
  benfica: 211,
  porto: 212,
  "fc porto": 212,
  braga: 217,
  "sporting cp": 228,
  sporting: 228,

  // Pays-Bas
  ajax: 194,
  "ajax amsterdam": 194,
  psv: 197,
  "psv eindhoven": 197,
  feyenoord: 198,
  "az alkmaar": 201,
  twente: 415,

  // Belgique
  anderlecht: 554,
  "club brugge": 569,
  brugge: 569,
  genk: 742,
  gent: 631,
  antwerp: 740,

  // Tunisie
  "es sahel": 990,
  "etoile du sahel": 990,
  "club africain": 988,
  "cs sfaxien": 983,
  "stade tunisien": 991,
  "us monastir": 992,
  "as ariana": 21435,
  "ca bizertin": 993,
  "olympique beja": 21436,
  "js kairouan": 21437,
  "as gabes": 21438,
  "as soliman": 21439,

  // Turquie
  galatasaray: 645,
  fenerbahce: 611,
  besiktas: 549,
  trabzonspor: 998,
  basaksehir: 564,

  // Brésil / Argentine
  flamengo: 127,
  palmeiras: 121,
  "boca juniors": 451,
  boca: 451,
  "river plate": 435,
  river: 435,
};

/** Slug IDs from backend roster (e.g. gb-manchester-city) */
export const TEAM_SLUG_SPORTS_IDS: Record<string, number> = {
  arsenal: 42,
  "aston-villa": 66,
  bournemouth: 35,
  brentford: 55,
  brighton: 51,
  chelsea: 49,
  "crystal-palace": 52,
  everton: 45,
  fulham: 36,
  "ipswich-town": 57,
  "leicester-city": 46,
  liverpool: 40,
  "manchester-city": 50,
  "manchester-united": 33,
  "newcastle-united": 34,
  "nottingham-forest": 65,
  southampton: 41,
  tottenham: 47,
  "west-ham": 48,
  wolves: 39,
  alaves: 724,
  "athletic-bilbao": 531,
  "atletico-madrid": 530,
  barcelona: 529,
  betis: 543,
  "celta-vigo": 538,
  espanyol: 540,
  getafe: 546,
  girona: 547,
  "las-palmas": 534,
  leganes: 745,
  mallorca: 798,
  osasuna: 727,
  "rayo-vallecano": 728,
  "real-madrid": 541,
  "real-sociedad": 548,
  sevilla: 536,
  valencia: 532,
  valladolid: 720,
  villarreal: 533,
  angers: 77,
  auxerre: 108,
  brest: 106,
  "le-havre": 111,
  lens: 116,
  lille: 79,
  lyon: 80,
  marseille: 81,
  monaco: 91,
  montpellier: 82,
  nantes: 83,
  nice: 84,
  "paris-sg": 85,
  reims: 93,
  rennes: 94,
  "saint-etienne": 1063,
  strasbourg: 95,
  toulouse: 96,
  augsburg: 170,
  "bayer-leverkusen": 168,
  "bayern-munich": 157,
  bochum: 176,
  "borussia-dortmund": 165,
  "eintracht-frankfurt": 169,
  freiburg: 160,
  heidenheim: 180,
  hoffenheim: 167,
  "holstein-kiel": 191,
  mainz: 164,
  monchengladbach: 163,
  "rb-leipzig": 173,
  "st-pauli": 186,
  stuttgart: 172,
  "union-berlin": 182,
  "werder-bremen": 162,
  wolfsburg: 161,
  atalanta: 499,
  bologna: 500,
  cagliari: 490,
  como: 895,
  empoli: 511,
  fiorentina: 502,
  genoa: 495,
  "inter-milan": 505,
  juventus: 496,
  lazio: 487,
  lecce: 867,
  "ac-milan": 489,
  monza: 1579,
  napoli: 492,
  parma: 523,
  roma: 497,
  torino: 503,
  udinese: 494,
  venezia: 517,
  verona: 504,
};

export const LEAGUE_SPORTS_IDS: Record<string, number> = {
  "l1-tun": 202,
  "l2-tun": 202,
  "l1-dz": 186,
  botola: 200,
  "l1-ci": 386,
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
  "super-lig": 203,
  "serie-a-br": 71,
  primera: 128,
  // Asie
  spl: 307,
  "uae-pl": 301,
  "j-league": 98,
  "k-league": 292,
  // Amériques
  mls: 253,
  "mls-ca": 253,
  "liga-mx": 262,
  // Océanie
  "a-league": 188,
  "nz-prem": 1693,
};

/** Direct league badge URLs when api-sports ID needs a verified override */
export const LEAGUE_BADGE_URLS: Record<string, string> = {
  spl: "https://media.api-sports.io/football/leagues/307.png",
  "uae-pl": "https://media.api-sports.io/football/leagues/301.png",
  "j-league": "https://media.api-sports.io/football/leagues/98.png",
  "k-league": "https://media.api-sports.io/football/leagues/292.png",
  mls: "https://media.api-sports.io/football/leagues/253.png",
  "liga-mx": "https://media.api-sports.io/football/leagues/262.png",
  "a-league": "https://media.api-sports.io/football/leagues/188.png",
};

export const CONTINENT_LEAGUE_IDS: Record<string, number> = {
  afrique: 12,
  europe: 2,
  asie: 17,
  "am-nord": 16,
  "am-sud": 13,
  oceanie: 188,
};

function normTeamName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function resolveSportsTeamId(teamId: string, teamName?: string): number | undefined {
  const badge = TEAM_BADGE_URLS[teamId];
  if (badge) return undefined;

  if (TEAM_SPORTS_IDS[teamId]) return TEAM_SPORTS_IDS[teamId];

  if (teamName) {
    const byName = TEAM_NAME_SPORTS_IDS[normTeamName(teamName)];
    if (byName) return byName;
  }

  if (teamId.includes("-")) {
    const fullId = teamId;
    if (TEAM_BADGE_URLS[fullId]) return undefined;

    const slug = teamId.split("-").slice(1).join("-");
    if (TEAM_SLUG_SPORTS_IDS[slug]) return TEAM_SLUG_SPORTS_IDS[slug];

    const fromSlugName = teamId.split("-").slice(1).join(" ");
    const bySlugName = TEAM_NAME_SPORTS_IDS[normTeamName(fromSlugName)];
    if (bySlugName) return bySlugName;
  }

  return undefined;
}

export function getContinentLogoUrl(continentId: string, fallback: string): string {
  const id = CONTINENT_LEAGUE_IDS[continentId];
  return id ? API_SPORTS.league(id) : fallback;
}

export function getApiSportsTeamId(teamId: string, teamName?: string): number | null {
  return resolveSportsTeamId(teamId, teamName) ?? null;
}

export function getRealTeamLogoUrl(teamId: string, fallback: string, teamName?: string): string {
  const badgeUrl = TEAM_BADGE_URLS[teamId];
  if (badgeUrl) return badgeUrl;

  const sportsId = resolveSportsTeamId(teamId, teamName);
  return sportsId ? API_SPORTS.team(sportsId) : fallback;
}

export function getRealLeagueLogoUrl(leagueId: string, fallback: string): string {
  const direct = LEAGUE_BADGE_URLS[leagueId];
  if (direct) return direct;
  const sportsId = LEAGUE_SPORTS_IDS[leagueId];
  if (sportsId) return API_SPORTS.league(sportsId);
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
