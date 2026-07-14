import { parseApiError } from "../config";
import { apiFetch, apiFetchWithTimeout } from "../authHeaders";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

export type FinanceAiChart = {
  type: "area" | "bar" | "line";
  title: string;
  color: string;
  data: { label: string; val: number }[];
};

export type FinanceAiMeta = {
  status: string;
  model: string;
  provider: string;
  hasApiKey: boolean;
  clubName: string;
  financeStaffName: string;
  season: string;
  summary: {
    budget: number;
    revenue: number;
    expenses: number;
    profit: number;
    remaining: number;
    ratio: number | null;
    payrollMonthly: number;
  };
  kpiStats: {
    questionsToday: number;
    aiAccuracy: string;
    reportsGenerated: number;
    budgetAnalyzed: string;
  };
  suggestedQuestions: string[];
  greeting: string;
  avgResponseTime: string;
};

export type FinanceAiChatResponse = {
  question: string;
  text: string;
  chart: FinanceAiChart | null;
  aiGenerated: boolean;
  durationMs: number;
  model: string;
  clubName: string;
  kpiStats: {
    questionsToday: number;
    reportsGenerated: number;
  };
};

export const financeApi = {
  getAi: () => apiFetch("/club/finance/ai").then(parse<FinanceAiMeta>),

  chatAi: (question: string, context?: string) =>
    apiFetchWithTimeout("/club/finance/ai/chat", {
      method: "POST",
      body: JSON.stringify({ question, context }),
    }, 30000).then(parse<FinanceAiChatResponse>),

  getNotifications: () =>
    apiFetchWithTimeout("/club/finance/notifications", {}, 45000).then(parse<FinanceNotificationsResponse>),

  markAllNotificationsRead: () =>
    apiFetch("/club/finance/notifications/read", { method: "PATCH" }).then(parse),

  markNotificationRead: (id: string) =>
    apiFetch(`/club/finance/notifications/${id}/read`, { method: "PATCH" }).then(parse),

  dismissNotification: (id: string) =>
    apiFetch(`/club/finance/notifications/${id}`, { method: "DELETE" }).then(parse),

  getSearchIndex: () =>
    apiFetch("/club/finance/search").then(parse<FinanceSearchResponse>),
};

export type FinanceNotificationItem = {
  id: string;
  iconKey: "contract" | "sponsor" | "invoice" | "salary" | "budget";
  sev: "error" | "warning" | "info";
  title: string;
  body: string;
  time: string;
  read: boolean;
  path: string;
};

export type FinanceNotificationsResponse = {
  clubName: string;
  season: string;
  unread: number;
  items: FinanceNotificationItem[];
};

export type FinanceSearchResponse = {
  categories: { category: string; path: string; items: string[] }[];
};
