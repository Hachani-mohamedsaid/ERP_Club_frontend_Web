import {
  CONTINENTS,
  COUNTRIES,
  TEAMS,
  getCountriesByContinent,
  getTeam,
  getTeamsByCountry,
  getCountry,
  type GeoTeam,
} from "../../../data/scoutGeoData";

export const SEASON_LABEL = "2026-2027";

const POSITIONS = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "ATT", "ATT", "ATT"] as const;
const FIRST = [
  "Amine", "Youssef", "Karim", "Lucas", "Hugo", "Noah", "Adam", "Rayan", "Elias", "Sami",
  "Marco", "Diego", "Kai", "Omar", "Ibrahim", "Gabriel", "Thiago", "Luka", "Enzo", "Victor",
];
const LAST = [
  "Ben Ali", "Traoré", "Silva", "Martinez", "Nakamura", "Diallo", "Santos", "Kovač", "Dupont",
  "Rossi", "Müller", "Kim", "Alvarez", "Hassan", "Chen", "Okoye", "Berg", "Costa", "Nguyen", "Moreau",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function seeded(seed: number) {
  let x = seed || 1;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 0xffffffff;
  };
}

export function fallbackOverview() {
  const continents = CONTINENTS.map((c) => {
    const countries = getCountriesByContinent(c.id);
    const teams = countries.reduce((n, co) => n + getTeamsByCountry(co.id).length, 0);
    return {
      id: c.id,
      name: c.name,
      icon: c.icon,
      color: c.color,
      countries: countries.length,
      prospects: countries.reduce((n, co) => n + co.prospects, 0),
      teams,
    };
  }).filter((c) => c.countries > 0);

  return {
    status: "ok",
    model: "odin-catalog",
    season: SEASON_LABEL,
    continents,
    stats: {
      continents: continents.length,
      countries: COUNTRIES.length,
      clubs: TEAMS.length,
      prospectsInDb: 0,
      leagues: COUNTRIES.length,
    },
  };
}

export function fallbackCountries(continentId: string) {
  const continent = CONTINENTS.find((c) => c.id === continentId);
  if (!continent) return null;

  const countries = getCountriesByContinent(continentId).map((c) => ({
    id: c.id,
    continentId,
    name: c.name,
    flag: c.flag,
    flagCode: c.flagCode,
    color: c.color,
    leagues: c.leagues,
    leagueId: c.leagueId,
    teamCount: getTeamsByCountry(c.id).length,
    prospects: c.prospects,
    leagueCount: c.leagues.length,
  }));

  return {
    continent: { id: continent.id, name: continent.name, icon: continent.icon, color: continent.color },
    countries,
    source: "odin-catalog",
    season: SEASON_LABEL,
  };
}

export function fallbackTeams(countryId: string) {
  const country = COUNTRIES.find((c) => c.id === countryId);
  if (!country) return null;

  const teams = getTeamsByCountry(countryId).map((t) => ({
    id: t.id,
    countryId,
    name: t.name,
    league: t.league,
    leagueId: t.leagueId,
    city: t.city,
    tier: t.tier,
    avgPotential: t.avgPotential,
    scoutActivity: t.scoutActivity,
    playerCount: Math.max(t.playerCount, 18),
    dbProspects: 0,
    logoColor: t.logoColor,
  }));

  return {
    country: {
      id: countryId,
      name: country.name,
      flag: country.flag,
      flagCode: country.flagCode,
      color: country.color,
      leagues: country.leagues,
      leagueId: country.leagueId,
      leagueCount: country.leagues.length,
    },
    teams,
    totalTeams: teams.length,
    source: "odin-catalog",
    season: SEASON_LABEL,
  };
}

function buildSquadPlayers(team: GeoTeam) {
  const country = getCountry(team.countryId);
  const rnd = seeded(hash(team.id + SEASON_LABEL));
  const count = 18 + Math.floor(rnd() * 8);
  const players = [];

  for (let i = 0; i < count; i++) {
    const age = 17 + Math.floor(rnd() * 16);
    const potBase = team.avgPotential + Math.floor((rnd() - 0.4) * 14);
    const potential = Math.min(95, Math.max(58, potBase));
    const isNew = rnd() < 0.18;
    const first = FIRST[Math.floor(rnd() * FIRST.length)]!;
    const last = LAST[Math.floor(rnd() * LAST.length)]!;
    const pos = POSITIONS[i % POSITIONS.length]!;

    players.push({
      id: `${team.id}-p${i}`,
      name: `${first} ${last}`,
      position: pos,
      age,
      nationality: country?.name ?? team.city,
      flag: country?.flag ?? "⚽",
      potential,
      currentRating: Math.max(50, potential - 6 - Math.floor(rnd() * 6)),
      marketValue: potential >= 85 ? `${8 + Math.floor(rnd() * 20)}M€` : potential >= 75 ? `${2 + Math.floor(rnd() * 6)}M€` : `${300 + Math.floor(rnd() * 700)}K€`,
      source: "flashscore" as const,
      inDatabase: false,
      isNewTransfer: isNew,
      isNew,
      number: i === 0 ? 1 : 2 + i,
    });
  }

  return players.sort((a, b) => b.potential - a.potential);
}

export function fallbackSquad(teamId: string) {
  const team = getTeam(teamId);
  if (!team) return null;
  const country = getCountry(team.countryId);
  const players = buildSquadPlayers(team);
  const transfers = players
    .filter((p) => p.isNewTransfer)
    .slice(0, 5)
    .map((p, i) => ({
      playerId: i,
      playerName: p.name,
      date: new Date(Date.UTC(2026, 6 + (i % 2), 5 + i * 3)).toISOString().slice(0, 10),
      type: "Transfer",
      from: "Club précédent",
      to: team.name,
      isIncoming: true,
    }));

  return {
    team: {
      id: team.id,
      name: team.name,
      league: team.league,
      leagueId: team.leagueId,
      city: team.city,
      tier: team.tier,
      avgPotential: team.avgPotential,
      scoutActivity: team.scoutActivity,
      logoColor: team.logoColor,
      country: {
        id: country?.id ?? team.countryId,
        name: country?.name ?? "",
        flag: country?.flag ?? "⚽",
        flagCode: country?.flagCode ?? "",
      },
    },
    players,
    transfers,
    newPlayers: transfers.length,
    sources: { database: 0, flashscore: players.length },
    cached: false,
    dataSource: "flashscore" as const,
    season: SEASON_LABEL,
    updatedAt: new Date().toISOString(),
    autoRefresh: false,
  };
}
