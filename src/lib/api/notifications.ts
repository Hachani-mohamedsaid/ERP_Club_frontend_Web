import { parseApiError } from "./config";
import { apiFetch } from "./authHeaders";

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}

export async function sendNotificationEmail(payload: {
  kind: string;
  subject: string;
  body: string;
}): Promise<{ sent: boolean }> {
  const res = await apiFetch("/notifications/email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
  return res.json() as Promise<{ sent: boolean }>;
}
