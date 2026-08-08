/** Détecte quota / rate-limit API-Sports (100 req/jour plan gratuit) */
export function isApiFootballQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /429|request limit|quota|rate limit|too many requests|limite/i.test(msg);
}

export class ApiFootballQuotaError extends Error {
  constructor(message = "API-Sports quota atteint") {
    super(message);
    this.name = "ApiFootballQuotaError";
  }
}

let quotaBlockedUntil = 0;

export function isApiFootballQuotaBlocked(): boolean {
  return Date.now() < quotaBlockedUntil;
}

export function markApiFootballQuotaBlocked(durationMs = 60 * 60 * 1000) {
  quotaBlockedUntil = Date.now() + durationMs;
}

export function noteApiFootballError(err: unknown) {
  if (isApiFootballQuotaError(err)) markApiFootballQuotaBlocked();
}
