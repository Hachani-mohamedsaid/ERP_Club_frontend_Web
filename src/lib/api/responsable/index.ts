import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export const responsableApi = {
  getValidation: () => apiFetch("/responsable/validation").then(parse),

  decideValidation: (id: string, action: "approve" | "reject" | "return", comment?: string) =>
    apiFetch(`/responsable/validation/${id}/decide`, {
      method: "PATCH",
      body: JSON.stringify({ action, comment }),
    }).then(parse),

  getDocuments: () => apiFetch("/responsable/documents").then(parse),

  createDocument: (body: Record<string, unknown>) =>
    apiFetch("/responsable/documents", { method: "POST", body: JSON.stringify(body) }).then(parse),

  deleteDocument: (id: string) =>
    apiFetch(`/responsable/documents/${id}`, { method: "DELETE" }).then(parse),

  getProspects: () => apiFetch("/responsable/recruitment/prospects").then(parse),

  getRecruitmentReports: () =>
    apiFetch("/responsable/recruitment/reports").then(parse),

  getRecruitmentShortlist: () =>
    apiFetch("/responsable/recruitment/shortlist").then(parse),

  createProspect: (body: Record<string, unknown>) =>
    apiFetch("/responsable/recruitment/prospects", { method: "POST", body: JSON.stringify(body) }).then(parse),

  updateProspect: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/responsable/recruitment/prospects/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),

  getBudget: () => apiFetch("/responsable/budget").then(parse),

  createExpense: (body: Record<string, unknown>) =>
    apiFetch("/responsable/budget/expenses", { method: "POST", body: JSON.stringify(body) }).then(parse),

  decideExpense: (id: string, action: "approve" | "reject") =>
    apiFetch(`/responsable/budget/expenses/${id}/decide`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    }).then(parse),
};
