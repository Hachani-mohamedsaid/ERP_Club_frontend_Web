/** Dev + prod: same-origin `/api` proxy (Vite dev server or scripts/serve-dist.mjs). */
export const API_URL = "/api";

export function getApiErrorMessage(data: unknown, fallback: string): string {
  const d = data as { message?: string | string[]; error?: string };
  return (
    (Array.isArray(d.message) ? d.message[0] : d.message) ??
    d.error ??
    fallback
  );
}

export async function parseApiError(response: Response): Promise<string> {
  const data = await response.json().catch(() => ({}));
  return getApiErrorMessage(data, `Erreur serveur (${response.status})`);
}
