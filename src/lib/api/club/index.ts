import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export const clubApi = {
  getProfile: () => apiFetch("/club/profile").then(parse),
  updateProfile: (body: Record<string, unknown>) =>
    apiFetch("/club/profile", { method: "PATCH", body: JSON.stringify(body) }).then(parse),

  getMembers: () => apiFetch("/club/members").then(parse),
  createMember: (body: Record<string, unknown>) =>
    apiFetch("/club/members", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateMember: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/members/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteMember: (id: string) =>
    apiFetch(`/club/members/${id}`, { method: "DELETE" }).then(parse),

  getPermissions: () => apiFetch("/club/permissions").then(parse),
  updatePermissions: (body: Record<string, unknown>) =>
    apiFetch("/club/permissions", { method: "PUT", body: JSON.stringify(body) }).then(parse),

  getNotifications: () => apiFetch("/club/notifications").then(parse),
  markNotificationsRead: (ids?: string[]) =>
    apiFetch("/club/notifications/read", { method: "PATCH", body: JSON.stringify({ ids }) }).then(parse),
  deleteReadNotifications: () =>
    apiFetch("/club/notifications/read", { method: "DELETE" }).then(parse),

  getAuditLogs: (params?: { type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.type) q.set("type", params.type);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return apiFetch(`/club/audit-logs${qs ? `?${qs}` : ""}`).then(parse);
  },

  getPlayers: () => apiFetch("/club/players").then(parse),
  createPlayer: (body: Record<string, unknown>) =>
    apiFetch("/club/players", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updatePlayer: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/players/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deletePlayer: (id: string) =>
    apiFetch(`/club/players/${id}`, { method: "DELETE" }).then(parse),

  getStaff: () => apiFetch("/club/staff").then(parse),
  createStaff: (body: Record<string, unknown>) =>
    apiFetch("/club/staff", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateStaff: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/staff/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteStaff: (id: string) =>
    apiFetch(`/club/staff/${id}`, { method: "DELETE" }).then(parse),

  getFinance: () => apiFetch("/club/finance").then(parse),
  createFinance: (body: Record<string, unknown>) =>
    apiFetch("/club/finance", { method: "POST", body: JSON.stringify(body) }).then(parse),

  getContracts: () => apiFetch("/club/contracts").then(parse),
  createContract: (body: Record<string, unknown>) =>
    apiFetch("/club/contracts", { method: "POST", body: JSON.stringify(body) }).then(parse),

  getCalendar: () => apiFetch("/club/calendar").then(parse),
  createCalendarEvent: (body: Record<string, unknown>) =>
    apiFetch("/club/calendar", { method: "POST", body: JSON.stringify(body) }).then(parse),

  // Calendrier accessible au rôle Préparateur Physique
  getPreparateurCalendar: () => apiFetch("/club/preparateur/calendar").then(parse),
  createPreparateurCalendarEvent: (body: Record<string, unknown>) =>
    apiFetch("/club/preparateur/calendar", { method: "POST", body: JSON.stringify(body) }).then(parse),

  getInjuries: () => apiFetch("/club/injuries").then(parse),
  createInjury: (body: Record<string, unknown>) =>
    apiFetch("/club/injuries", { method: "POST", body: JSON.stringify(body) }).then(parse),

  getAnalytics: () => apiFetch("/club/analytics").then(parse),

  getInfrastructures: () => apiFetch("/club/infrastructures").then(parse),
  createInfrastructure: (body: Record<string, unknown>) =>
    apiFetch("/club/infrastructures", { method: "POST", body: JSON.stringify(body) }).then(parse),

  // ─── Préparateur ──────────────────────────────────────────────
  getPhysicalCondition: () => apiFetch("/club/preparateur/condition").then(parse),
  getPreparateurDashboard: () => apiFetch("/club/preparateur/dashboard").then(parse),
  getInjuryRisks: () => apiFetch("/club/preparateur/injury-risks").then(parse),
  createInjuryRisk: (body: Record<string, unknown>) =>
    apiFetch("/club/preparateur/injury-risks", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateInjuryRisk: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/preparateur/injury-risks/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteInjuryRisk: (id: string) =>
    apiFetch(`/club/preparateur/injury-risks/${id}`, { method: "DELETE" }).then(parse),

  getChargeEquipe: () => apiFetch("/club/preparateur/charge").then(parse),
  reducePlayerLoad: (playerId: string) =>
    apiFetch(`/club/preparateur/charge/${playerId}/reduce`, { method: "PATCH" }).then(parse),
  increasePlayerLoad: (playerId: string) =>
    apiFetch(`/club/preparateur/charge/${playerId}/increase`, { method: "PATCH" }).then(parse),
  setPlayerLoad: (
    playerId: string,
    body: { loadScore: number; fatigueScore: number; recoveryScore?: number; notes?: string },
  ) =>
    apiFetch(`/club/preparateur/charge/${playerId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }).then(parse),
  getPlayerLoadHistory: (playerId: string) =>
    apiFetch(`/club/preparateur/charge/${playerId}/history`).then(parse),

  getComparisonPlayers: () => apiFetch("/club/preparateur/comparison").then(parse),

  getMatchReadiness: () => apiFetch("/club/preparateur/match-readiness").then(parse),
  updateMatchReadiness: (playerId: string, readinessStatus: string) =>
    apiFetch(`/club/preparateur/match-readiness/${playerId}`, {
      method: "PATCH",
      body: JSON.stringify({ readinessStatus }),
    }).then(parse),

  getPrograms: () => apiFetch("/club/preparateur/programs").then(parse),
  createProgram: (body: Record<string, unknown>) =>
    apiFetch("/club/preparateur/programs", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateProgram: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/preparateur/programs/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteProgram: (id: string) =>
    apiFetch(`/club/preparateur/programs/${id}`, { method: "DELETE" }).then(parse),

  getPrepNotifications: () => apiFetch("/club/preparateur/notifications").then(parse),
  markPrepNotificationRead: (id: string) =>
    apiFetch(`/club/preparateur/notifications/${id}/read`, { method: "PATCH" }).then(parse),
  markAllPrepNotificationsRead: () =>
    apiFetch("/club/preparateur/notifications/read-all", { method: "PATCH" }).then(parse),
  deletePrepNotification: (id: string) =>
    apiFetch(`/club/preparateur/notifications/${id}`, { method: "DELETE" }).then(parse),

  getReports: () => apiFetch("/club/preparateur/reports").then(parse),

  getRecoverySessions: () => apiFetch("/club/preparateur/recovery").then(parse),
  createRecoverySession: (body: Record<string, unknown>) =>
    apiFetch("/club/preparateur/recovery", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateRecoverySession: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/preparateur/recovery/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteRecoverySession: (id: string) =>
    apiFetch(`/club/preparateur/recovery/${id}`, { method: "DELETE" }).then(parse),

  getWellness: () => apiFetch("/club/preparateur/wellness").then(parse),
  upsertWellness: (playerId: string, body: { sommeil: number; fatigue: number; stress: number; douleur: number; humeur: number }) =>
    apiFetch(`/club/preparateur/wellness/${playerId}`, { method: "PUT", body: JSON.stringify(body) }).then(parse),

  getSessions: () => apiFetch("/club/preparateur/sessions").then(parse),
  createSession: (body: Record<string, unknown>) =>
    apiFetch("/club/preparateur/sessions", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateSession: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/preparateur/sessions/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteSession: (id: string) =>
    apiFetch(`/club/preparateur/sessions/${id}`, { method: "DELETE" }).then(parse),

  getPresence: () => apiFetch("/club/preparateur/presence").then(parse),
  updatePresence: (playerId: string, status: string) =>
    apiFetch(`/club/preparateur/presence/${playerId}`, { method: "PATCH", body: JSON.stringify({ status }) }).then(parse),
};
