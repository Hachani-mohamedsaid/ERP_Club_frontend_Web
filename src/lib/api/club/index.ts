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

  // ─── Player Photo ───────────────────────────────────────────
  updatePlayerPhoto: (id: string, photoUrl: string) =>
    apiFetch(`/club/players/${id}/photo`, { method: "PATCH", body: JSON.stringify({ photoUrl }) }).then(parse),

  // ─── Player Physical (self-edit by joueur) ──────────────────
  updatePlayerPhysical: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/players/${id}/physical`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),

  // ─── Player Contract ────────────────────────────────────────
  getPlayerContract: (id: string) => apiFetch(`/club/players/${id}/contract`).then(parse),

  // ─── Player Stats ───────────────────────────────────────────
  getPlayerStats: (id: string) => apiFetch(`/club/players/${id}/stats`).then(parse),
  updatePlayerStats: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/players/${id}/stats`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),

  // ─── Match Stats ────────────────────────────────────────────
  getMatchStats: (id: string) => apiFetch(`/club/players/${id}/match-stats`).then(parse),
  createMatchStat: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/players/${id}/match-stats`, { method: "POST", body: JSON.stringify(body) }).then(parse),

  // ─── Awards ─────────────────────────────────────────────────
  getAwards: (id: string) => apiFetch(`/club/players/${id}/awards`).then(parse),
  createAward: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/players/${id}/awards`, { method: "POST", body: JSON.stringify(body) }).then(parse),
  deleteAward: (awardId: string) =>
    apiFetch(`/club/awards/${awardId}`, { method: "DELETE" }).then(parse),

  // ─── Documents ──────────────────────────────────────────────
  getDocuments: (id: string) => apiFetch(`/club/players/${id}/documents`).then(parse),
  getDocumentFile: (docId: string) => apiFetch(`/club/documents/${docId}/file`).then(parse),
  createDocument: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/players/${id}/documents`, { method: "POST", body: JSON.stringify(body) }).then(parse),
  deleteDocument: (docId: string) =>
    apiFetch(`/club/documents/${docId}`, { method: "DELETE" }).then(parse),

  // ─── Transfers ──────────────────────────────────────────────
  getTransfers: () => apiFetch("/club/transfers").then(parse),
  createTransfer: (body: Record<string, unknown>) =>
    apiFetch("/club/transfers", { method: "POST", body: JSON.stringify(body) }).then(parse),
  deleteTransfer: (id: string) =>
    apiFetch(`/club/transfers/${id}`, { method: "DELETE" }).then(parse),

  // ─── Chemistry ──────────────────────────────────────────────
  getChemistry: () => apiFetch("/club/chemistry").then(parse),
  updateChemistry: (id: string, chemistry: number) =>
    apiFetch(`/club/chemistry/${id}`, { method: "PATCH", body: JSON.stringify({ chemistry }) }).then(parse),

  // ─── Medical Appointment (joueur self-request) ──────────────
  bookAppointment: (playerId: string, body: Record<string, unknown>) =>
    apiFetch(`/club/players/${playerId}/appointment`, { method: "POST", body: JSON.stringify(body) }).then(parse),

  // ─── Finance Extensions ──────────────────────────────────────
  getFinanceReport: () => apiFetch("/club/finance/report").then(parse),
  seedFinance: () => apiFetch("/club/finance/seed", { method: "POST" }).then(parse),
  updateFinanceEntry: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/finance/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteFinanceEntry: (id: string) =>
    apiFetch(`/club/finance/${id}`, { method: "DELETE" }).then(parse),

  // ─── Contracts Extensions ────────────────────────────────────
  updateContract: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/contracts/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteContract: (id: string) =>
    apiFetch(`/club/contracts/${id}`, { method: "DELETE" }).then(parse),

  // ─── Sponsors ────────────────────────────────────────────────
  getSponsors: () => apiFetch("/club/sponsors").then(parse),
  createSponsor: (body: Record<string, unknown>) =>
    apiFetch("/club/sponsors", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateSponsor: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/sponsors/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  deleteSponsor: (id: string) =>
    apiFetch(`/club/sponsors/${id}`, { method: "DELETE" }).then(parse),

  // ─── Invoices ────────────────────────────────────────────────
  getInvoices: () => apiFetch("/club/invoices").then(parse),
  createInvoice: (body: Record<string, unknown>) =>
    apiFetch("/club/invoices", { method: "POST", body: JSON.stringify(body) }).then(parse),
  updateInvoice: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/club/invoices/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
  markInvoicePaid: (id: string) =>
    apiFetch(`/club/invoices/${id}/pay`, { method: "PATCH" }).then(parse),
  deleteInvoice: (id: string) =>
    apiFetch(`/club/invoices/${id}`, { method: "DELETE" }).then(parse),

  getAi: () => apiFetch("/club/ai").then(parse<{
    status: string;
    model: string;
    provider: string;
    hasApiKey: boolean;
    clubName: string;
    season: string;
    insights: { text: string; severity: string }[];
    summary: string[];
    suggestedActions: { label: string; path: string }[];
    suggestedQuestions: string[];
    avgResponseTime: string;
    snapshot: {
      playersCount: number;
      staffCount: number;
      injuredCount: number;
      contractsToRenew: number;
      budgetUsedPct: number;
    };
  }>),

  chatAi: (question: string, context?: string) =>
    apiFetch("/club/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question, context }),
    }).then(parse<{ question: string; answer: string; durationMs: number; model: string; clubName: string }>),
};
