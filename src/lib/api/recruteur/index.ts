import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export const recruteurApi = {
  getNotifications: () => apiFetch("/club/recruteur/notifications").then(parse),
  markNotificationRead: (id: string) =>
    apiFetch(`/club/recruteur/notifications/${id}/read`, { method: "PATCH" }).then(parse),
  markAllNotificationsRead: () =>
    apiFetch("/club/recruteur/notifications/read-all", { method: "PATCH" }).then(parse),
  deleteNotification: (id: string) =>
    apiFetch(`/club/recruteur/notifications/${id}`, { method: "DELETE" }).then(parse),

  getAuditLogs: (params?: { action?: string; severity?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.action) q.set("action", params.action);
    if (params?.severity) q.set("severity", params.severity);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return apiFetch(`/club/recruteur/audit-logs${qs ? `?${qs}` : ""}`).then(parse);
  },
};
