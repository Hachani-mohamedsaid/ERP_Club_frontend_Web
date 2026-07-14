export function getAccessToken(): string | null {
  try {
    return localStorage.getItem("odin_token");
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem("odin_token", token);
  else localStorage.removeItem("odin_token");
}

export function authHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  return {
    ...(extra ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const { API_URL } = await import("./config");
  return fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
}

export async function apiFetchWithTimeout(
  path: string,
  init?: RequestInit,
  timeoutMs = 25000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await apiFetch(path, { ...init, signal: controller.signal });
  } catch (e) {
    const aborted =
      (e instanceof DOMException && e.name === "AbortError") ||
      (e instanceof Error && /abort/i.test(e.message));
    if (aborted) {
      throw new Error(
        `Délai dépassé (${Math.round(timeoutMs / 1000)}s). Le backend peut être en réveil — réessayez.`,
      );
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
