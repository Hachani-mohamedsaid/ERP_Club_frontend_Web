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
  getPlayer: (id: string) => apiFetch(`/club/players/${id}`).then(parse),
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
  updateContract: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/contracts/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),

  getCalendar: () => apiFetch("/club/calendar").then(parse),
  getTraining: () => apiFetch("/club/training").then(parse),
  createCalendarEvent: (body: Record<string, unknown>) =>
    apiFetch("/club/calendar", { method: "POST", body: JSON.stringify(body) }).then(parse),

  getSessionPresence: () => apiFetch("/club/preparateur/presence").then(parse),

  getInjuries: () => apiFetch("/club/injuries").then(parse),
  createInjury: (body: Record<string, unknown>) =>
    apiFetch("/club/injuries", { method: "POST", body: JSON.stringify(body) }).then(parse),

  getAnalytics: () => apiFetch("/club/analytics").then(parse),

  getInfrastructures: () => apiFetch("/club/infrastructures").then(parse),
  createInfrastructure: (body: Record<string, unknown>) =>
    apiFetch("/club/infrastructures", { method: "POST", body: JSON.stringify(body) }).then(parse),
};
