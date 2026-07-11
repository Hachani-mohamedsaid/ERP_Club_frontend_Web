import { parseApiError } from "./config";
import { apiFetch } from "./authHeaders";

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) throw new Error(await parseApiError(res));
}
