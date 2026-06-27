import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export const joueurApi = {
  getMe: () => apiFetch("/joueur/me").then(parse),
  getExtended: () => apiFetch("/joueur/me/extended").then(parse),
  getCalendar: () => apiFetch("/joueur/me/calendar").then(parse),
  getInjuries: () => apiFetch("/joueur/me/injuries").then(parse),
  getSquad: () => apiFetch("/joueur/squad").then(parse),
};
