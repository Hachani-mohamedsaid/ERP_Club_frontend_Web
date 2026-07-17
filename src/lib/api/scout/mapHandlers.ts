import { CONTINENTS } from "../../../data/scoutGeoData";
import { CONTINENT_META } from "./continentMap";
import {
  bustCache,
  fetchSquad,
  fetchTransfers,
  getActiveSeason,
  hasFootballApiKey,
  parseApiTeamId,
} from "./footballApi";
import { fallbackCountries, fallbackOverview, fallbackSquad, fallbackTeams } from "./mapFallback";

export interface ScoutMapRouteResult {
  status: number;
  body: unknown;
}

function ok(body: unknown): ScoutMapRouteResult {
  return { status: 200, body };
}

function notFound(msg = "Not found"): ScoutMapRouteResult {
  return { status: 404, body: { message: msg } };
}

function estimatePotential(age: number | null, position: string | null): number {
  const a = age ?? 24;
  let base = a <= 20 ? 88 : a <= 23 ? 84 : a <= 26 ? 78 : a <= 29 ? 72 : a <= 32 ? 66 : 58;
  if (position?.toLowerCase().includes("attack")) base += 2;
  return Math.min(95, Math.max(50, base));
}

function estimateMarketValue(potential: number, age: number | null): string {
  const a = age ?? 24;
  const mk = Math.round((potential / 100) * (a <= 23 ? 15 : a <= 27 ? 8 : 3));
  return mk >= 1 ? `${mk}M€` : `${Math.round(mk * 1000)}K€`;
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

async function handleOverview() {
  // Plan gratuit API-Sports = 2022–2024 seulement → catalogue ODIN 2026-27
  return ok(fallbackOverview());
}

async function handleContinent(continentId: string) {
  if (!(continentId in CONTINENT_META) && !CONTINENTS.some((c) => c.id === continentId)) {
    return notFound("Continent inconnu");
  }
  const fb = fallbackCountries(continentId);
  return fb ? ok(fb) : notFound("Continent inconnu");
}

async function handleCountryTeams(countryId: string) {
  const fb = fallbackTeams(countryId);
  return fb ? ok(fb) : notFound("Pays inconnu");
}

async function handleTeamSquad(teamId: string, refresh = false) {
  const local = fallbackSquad(teamId);
  if (local) return ok(local);

  const apiId = parseApiTeamId(teamId);
  if (!apiId) return notFound("ID équipe invalide");

  if (!hasFootballApiKey()) {
    return notFound("Effectif indisponible — équipe hors catalogue ODIN 2026-27");
  }

  if (refresh) bustCache(String(apiId));

  try {
    const [squadRes, transfersRes] = await Promise.all([
      fetchSquad(apiId),
      fetchTransfers(apiId).catch(() => [] as Awaited<ReturnType<typeof fetchTransfers>>),
    ]);

    const squad = squadRes[0];
    if (!squad) return notFound("Effectif introuvable");

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

    const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;

    for (const tr of transfersRes) {
      for (const t of tr.transfers) {
        const isIncoming = t.teams.in.id === apiId;
        const date = new Date(t.date).getTime();
        if (date >= cutoff) {
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
      const potential = estimatePotential(p.age, p.position);
      const isNewTransfer = recentTransferPlayerIds.has(p.id);
      return {
        id: `apisports-player-${p.id}`,
        name: p.name,
        position: positionFr(p.position),
        age: p.age ?? 0,
        nationality: squad.team.name,
        flag: "⚽",
        potential,
        currentRating: Math.max(50, potential - 8),
        marketValue: estimateMarketValue(potential, p.age),
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

    return ok({
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
    });
  } catch (err) {
    return {
      status: 502,
      body: { message: err instanceof Error ? err.message : "Erreur chargement effectif" },
    };
  }
}

export async function handleScoutMapRoute(
  method: string,
  url: string,
): Promise<ScoutMapRouteResult | null> {
  if (method !== "GET") return null;

  const path = url.split("?")[0]!.replace(/^\/api/, "");
  if (!path.startsWith("/scout/map")) return null;

  const refresh = url.includes("refresh=1");

  try {
    if (path === "/scout/map") return await handleOverview();

    const continentMatch = path.match(/^\/scout\/map\/continents\/([^/]+)$/);
    if (continentMatch) return await handleContinent(continentMatch[1]!);

    const countryMatch = path.match(/^\/scout\/map\/countries\/([^/]+)\/teams$/);
    if (countryMatch) return await handleCountryTeams(countryMatch[1]!);

    const squadMatch = path.match(/^\/scout\/map\/teams\/([^/]+)\/squad$/);
    if (squadMatch) return await handleTeamSquad(squadMatch[1]!, refresh);

    return null;
  } catch (err) {
    return {
      status: 502,
      body: {
        message: err instanceof Error ? err.message : "Erreur carte scout",
      },
    };
  }
}
