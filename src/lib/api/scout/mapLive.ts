import { getTeam } from "../../../data/scoutGeoData";
import { getApiSportsTeamId } from "../../../data/scoutTeamAssets";
import { CONTINENT_META, flagEmoji, slugify, type ContinentId } from "./continentMap";
import { fetchSquad, fetchTeams, fetchTransfers, getActiveSeason } from "./footballApi";
import {
  leaguesByContinent,
  leaguesByCountry,
  MAJOR_LEAGUES,
  uniqueCountriesFromLeagues,
} from "./majorLeagues";
import type { ApiTeam } from "./footballApi";

function countryColor(code: string): string {
  const colors: Record<string, string> = {
    TN: "#FF7A00", FR: "#3B82F6", GB: "#7C3AED", ES: "#EF4444", DE: "#DC2626",
    IT: "#0284C7", BR: "#10B981", AR: "#6366F1", MA: "#F59E0B", DZ: "#22C55E",
  };
  return colors[code.toUpperCase()] ?? "#8B5CF6";
}

function mapTeam(t: ApiTeam, leagueId: number, leagueName: string, countryId: string) {
  return {
    id: `apisports-${t.team.id}`,
    countryId,
    name: t.team.name,
    league: leagueName,
    leagueId: slugify(leagueName),
    city: t.venue.city ?? t.team.country,
    tier: "Pro",
    avgPotential: 76,
    scoutActivity: "Haute",
    playerCount: 25,
    dbProspects: 0,
    logoUrl: t.team.logo,
    leagueLogoUrl: `https://media.api-sports.io/football/leagues/${leagueId}.png`,
    apiSportsId: t.team.id,
  };
}

export function resolveTeamApiId(teamId: string): number | null {
  const parsed = teamId.startsWith("apisports-") ? Number(teamId.replace("apisports-", "")) : null;
  if (parsed && Number.isFinite(parsed)) return parsed;
  const local = getTeam(teamId);
  return getApiSportsTeamId(teamId, local?.name);
}

export async function buildLiveOverview() {
  const season = getActiveSeason();
  const continents = (Object.keys(CONTINENT_META) as ContinentId[])
    .map((id) => {
      const meta = CONTINENT_META[id];
      const leagues = leaguesByContinent(id);
      const countries = uniqueCountriesFromLeagues(leagues);
      return {
        id,
        name: meta.name,
        icon: meta.icon,
        color: meta.color,
        countries: countries.length,
        prospects: leagues.length * 22,
        teams: leagues.length * 18,
      };
    })
    .filter((c) => c.countries > 0);

  return {
    status: "ok",
    model: "api-football",
    season: `${season}-${season + 1}`,
    continents,
    stats: {
      continents: continents.length,
      countries: uniqueCountriesFromLeagues(MAJOR_LEAGUES).length,
      clubs: MAJOR_LEAGUES.length * 18,
      prospectsInDb: 0,
      leagues: MAJOR_LEAGUES.length,
    },
    notice: `Données réelles API-Sports · ${MAJOR_LEAGUES.length} ligues majeures · saison ${season}-${season + 1}`,
  };
}

export async function buildLiveCountries(continentId: string) {
  const meta = CONTINENT_META[continentId as ContinentId];
  if (!meta) return null;

  const leagues = leaguesByContinent(continentId as ContinentId);
  const countries = uniqueCountriesFromLeagues(leagues);

  return {
    continent: { id: continentId, name: meta.name, icon: meta.icon, color: meta.color },
    countries: countries.map((c) => ({
      id: c.code.toLowerCase(),
      continentId,
      name: c.name,
      flag: flagEmoji(c.code),
      flagCode: c.code.toLowerCase(),
      color: countryColor(c.code),
      leagues: c.leagues.map((l) => l.name),
      leagueId: slugify(c.leagues[0]?.name ?? c.code),
      leagueLogoUrl: c.leagues[0]
        ? `https://media.api-sports.io/football/leagues/${c.leagues[0].id}.png`
        : undefined,
      teamCount: c.leagues.length * 18,
      prospects: c.leagues.length * 22,
      leagueCount: c.leagues.length,
    })),
    source: "api-football",
    season: `${getActiveSeason()}-${getActiveSeason() + 1}`,
  };
}

export async function buildLiveTeams(countryId: string) {
  const leagues = leaguesByCountry(countryId.toUpperCase());
  if (leagues.length === 0) return null;

  const season = getActiveSeason();
  const teams: ReturnType<typeof mapTeam>[] = [];

  for (const lg of leagues) {
    try {
      const apiTeams = await fetchTeams(lg.id, season);
      for (const t of apiTeams) teams.push(mapTeam(t, lg.id, lg.name, countryId));
    } catch {
      // skip failed league
    }
  }

  if (teams.length === 0) return null;

  teams.sort((a, b) => a.league.localeCompare(b.league, "fr") || a.name.localeCompare(b.name, "fr"));
  const country = leagues[0]!;

  return {
    country: {
      id: countryId,
      name: country.countryName,
      flag: flagEmoji(country.countryCode),
      flagCode: countryId,
      color: countryColor(country.countryCode),
      leagues: leagues.map((l) => l.name),
      leagueId: slugify(leagues[0]!.name),
      leagueCount: leagues.length,
    },
    teams,
    totalTeams: teams.length,
    source: "api-football",
    season: `${season}-${season + 1}`,
  };
}

export async function buildLiveSquad(apiId: number, teamId: string, refresh: boolean) {
  const squadRes = await fetchSquad(apiId);
  const squad = squadRes[0];
  if (!squad) return null;

  let transfersRes: Awaited<ReturnType<typeof fetchTransfers>> = [];
  try {
    transfersRes = await fetchTransfers(apiId);
  } catch {
    // transferts optionnels si quota limité
  }

  const recentTransferPlayerIds = new Set<number>();
  const transferList: {
    playerId: number;
    playerName: string;
    date: string;
    type: string;
    from: string;
    to: string;
    isIncoming: boolean;
  }[] = [];

  const cutoff = Date.now() - 180 * 24 * 60 * 60 * 1000;

  for (const tr of transfersRes) {
    for (const t of tr.transfers) {
      const isIncoming = t.teams.in.id === apiId;
      if (new Date(t.date).getTime() >= cutoff) {
        recentTransferPlayerIds.add(tr.player.id);
        transferList.push({
          playerId: tr.player.id,
          playerName: tr.player.name,
          date: t.date,
          type: t.type,
          from: t.teams.out.name,
          to: t.teams.in.name,
          isIncoming,
        });
      }
    }
  }

  transferList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const players = squad.players.map((p) => {
    const age = p.age ?? 22;
    const potential = Math.min(92, Math.max(58, 88 - Math.max(0, age - 20) * 2));
    const isNewTransfer = recentTransferPlayerIds.has(p.id);
    return {
      id: `apisports-player-${p.id}`,
      name: p.name,
      position: positionFr(p.position),
      age,
      nationality: squad.team.name,
      flag: "⚽",
      potential,
      currentRating: Math.max(50, potential - 6),
      marketValue: potential >= 82 ? `${5 + (p.id % 20)}M€` : `${400 + (p.id % 600)}K€`,
      source: "flashscore" as const,
      inDatabase: false,
      photoUrl: p.photo ?? undefined,
      isNewTransfer,
      isNew: isNewTransfer,
      number: p.number,
      apiSportsId: p.id,
    };
  });

  const season = getActiveSeason();

  return {
    team: {
      id: teamId,
      name: squad.team.name,
      league: "",
      leagueId: "",
      city: "",
      tier: "Pro",
      avgPotential: players.length
        ? Math.round(players.reduce((s, p) => s + p.potential, 0) / players.length)
        : 0,
      scoutActivity: "Haute",
      logoUrl: squad.team.logo,
      country: { id: "", name: "", flag: "⚽", flagCode: "" },
    },
    players,
    transfers: transferList,
    newPlayers: players.filter((p) => p.isNewTransfer).length,
    sources: { database: 0, flashscore: players.length },
    cached: !refresh,
    dataSource: "live" as const,
    season: `${season}-${season + 1}`,
    updatedAt: new Date().toISOString(),
    autoRefresh: true,
  };
}

function positionFr(pos: string | null): string {
  if (!pos) return "—";
  const p = pos.toLowerCase();
  if (p.includes("goal")) return "GK";
  if (p.includes("def")) return "DEF";
  if (p.includes("mid")) return "MID";
  if (p.includes("attack") || p.includes("forw")) return "ATT";
  return pos.slice(0, 3).toUpperCase();
}
