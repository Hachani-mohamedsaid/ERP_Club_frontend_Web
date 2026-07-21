import { isFootballApiAvailable } from "./footballApi";
import { isApiFootballQuotaError } from "./apiFootballQuota";
import { fetchProspectLiveProfile } from "./playerLive";

export interface ScoutRouteResult {
  status: number;
  body: unknown;
}

export async function handleProspectLiveRoute(
  method: string,
  searchParams: URLSearchParams,
): Promise<ScoutRouteResult | null> {
  if (method !== "GET" || !isFootballApiAvailable()) return null;

  const name = searchParams.get("name")?.trim();
  if (!name) {
    return { status: 400, body: { message: "Paramètre name requis" } };
  }

  const club = searchParams.get("club")?.trim() ?? undefined;
  const legacyId = searchParams.get("legacyId")?.trim() ?? undefined;
  const apiSportsId = Number(searchParams.get("apiSportsId") ?? 0) || undefined;

  try {
    const profile = await fetchProspectLiveProfile({ name, club, legacyId, apiSportsId });
    if (!profile) return null;
    return { status: 200, body: profile };
  } catch (err) {
    if (isApiFootballQuotaError(err)) return null;
    return null;
  }
}
