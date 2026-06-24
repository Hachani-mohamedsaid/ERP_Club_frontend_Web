export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/$/, "");

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
