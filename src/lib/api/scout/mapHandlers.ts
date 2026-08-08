import { CONTINENTS } from "../../../data/scoutGeoData";
import { CONTINENT_META } from "./continentMap";
import { bustCache, isFootballApiAvailable } from "./footballApi";
import { isApiFootballQuotaError } from "./apiFootballQuota";
import { fallbackCountries, fallbackOverview, fallbackSquad, fallbackTeams } from "./mapFallback";
import {
  buildLiveCountries,
  buildLiveOverview,
  buildLiveSquad,
  buildLiveTeams,
  resolveTeamApiId,
} from "./mapLive";

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

async function handleOverview() {
  if (isFootballApiAvailable()) {
    try {
      const live = await buildLiveOverview();
      if (live.continents.length > 0) return ok(live);
    } catch {
      // fallback below
    }
  }
  return ok(fallbackOverview());
}

async function handleContinent(continentId: string) {
  if (!(continentId in CONTINENT_META) && !CONTINENTS.some((c) => c.id === continentId)) {
    return notFound("Continent inconnu");
  }

  if (isFootballApiAvailable()) {
    try {
      const live = await buildLiveCountries(continentId);
      if (live) return ok(live);
    } catch {
      // fallback
    }
  }

  const fb = fallbackCountries(continentId);
  return fb ? ok(fb) : notFound("Continent inconnu");
}

async function handleCountryTeams(countryId: string) {
  if (isFootballApiAvailable()) {
    try {
      const live = await buildLiveTeams(countryId);
      if (live && live.teams.length > 0) return ok(live);
    } catch {
      // fallback
    }
  }

  const fb = fallbackTeams(countryId);
  return fb ? ok(fb) : notFound("Pays inconnu");
}

async function handleTeamSquad(teamId: string, refresh = false) {
  const apiId = resolveTeamApiId(teamId);

  if (apiId && isFootballApiAvailable()) {
    if (refresh) bustCache(String(apiId));
    try {
      const live = await buildLiveSquad(apiId, teamId.startsWith("apisports-") ? teamId : `apisports-${apiId}`, refresh);
      if (live) return ok(live);
    } catch (err) {
      if (!isApiFootballQuotaError(err)) {
        /* fallback ci-dessous */
      }
    }
  }

  const local = fallbackSquad(teamId);
  if (local) return ok(local);

  return notFound("Effectif indisponible — configurez API_FOOTBALL_KEY dans .env");
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
      body: { message: err instanceof Error ? err.message : "Erreur carte scout" },
    };
  }
}
