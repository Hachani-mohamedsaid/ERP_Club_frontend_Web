import { parseApiError } from "../config";
import { apiFetch } from "../authHeaders";
import {
  buildBiFallback,
  buildSecurityFallback,
  buildSupportFromOrgs,
  readLocalSettings,
  writeLocalSettings,
} from "./fallbacks";
import { mergeSettings, toApiPayload } from "./settings";

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(await parseApiError(response));
  return response.json() as Promise<T>;
}

async function tryApi<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

export interface PlatformMetrics {
  kpis: {
    totalClubs: number;
    activeClubs: number;
    suspendedClubs: number;
    trialClubs: number;
    newClubsThisMonth: number;
    totalUsers: number;
    activeUsers: number;
    totalPlayers: number;
    totalStaff: number;
    totalMatches: number;
    totalEvents: number;
    totalContracts: number;
    mrr: number;
    arr: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
    revenueMonth: number;
    revenueToday: number;
    failedPayments: number;
    pendingPayments: number;
    loginsToday: number;
    growthPct: number;
    retentionPct: number;
  };
  charts: {
    clubsGrowth: { month: string; clubs: number }[];
    revenueMonthly: { month: string; revenue: number }[];
    usersByRole: { name: string; value: number }[];
  };
  activityFeed: string[];
}

export interface PlatformOrganization {
  id: string;
  name: string;
  logo: string;
  city: string;
  country: string;
  league: string;
  users: number;
  plan: string;
  planCode: string;
  status: string;
  statusCode: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  createdAt: string;
  description: string;
}

export const platformApi = {
  getMetrics: () => apiFetch("/platform/metrics").then(parse<PlatformMetrics>),

  getOrganizations: (params?: { search?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return apiFetch(`/platform/organizations${qs ? `?${qs}` : ""}`).then(
      parse<PlatformOrganization[]>,
    );
  },

  getOrganization: (id: string) =>
    apiFetch(`/platform/organizations/${id}`).then(parse),

  createOrganization: (body: Record<string, unknown>) =>
    apiFetch("/platform/organizations", {
      method: "POST",
      body: JSON.stringify(body),
    }).then(parse),

  updateOrganization: (id: string, body: Record<string, unknown>) =>
    apiFetch(`/platform/organizations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then(parse),

  suspendOrganization: (id: string) =>
    apiFetch(`/platform/organizations/${id}/suspend`, { method: "POST" }).then(parse),

  reactivateOrganization: (id: string) =>
    apiFetch(`/platform/organizations/${id}/reactivate`, { method: "POST" }).then(parse),

  activateSubscription: (id: string, method?: string) =>
    apiFetch(`/platform/organizations/${id}/activate-subscription`, {
      method: "POST",
      body: JSON.stringify({ method }),
    }).then(parse),

  impersonate: (id: string) =>
    apiFetch(`/platform/organizations/${id}/impersonate`, { method: "POST" }).then(parse<{
      accessToken: string;
      user: { id: string; email: string; fullName: string; role: string; clubMemberRole: string };
      organization: { id: string; clubName: string; country: string; league: string; logoUrl: string | null };
    }>),

  getUsers: (params?: { role?: string; status?: string; club?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.status) q.set("status", params.status);
    if (params?.club) q.set("club", params.club);
    const qs = q.toString();
    return apiFetch(`/platform/users${qs ? `?${qs}` : ""}`).then(parse);
  },

  updateUser: (id: string, body: { isActive?: boolean }) =>
    apiFetch(`/platform/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then(parse),

  createUser: (body: Record<string, unknown>) =>
    apiFetch("/platform/users", {
      method: "POST",
      body: JSON.stringify(body),
    }).then(parse),

  getPlans: () => apiFetch("/platform/plans").then(parse),

  getSubscriptions: () => apiFetch("/platform/subscriptions").then(parse),

  getPayments: () => apiFetch("/platform/payments").then(parse),

  recordPayment: (body: Record<string, unknown>) =>
    apiFetch("/platform/payments", {
      method: "POST",
      body: JSON.stringify(body),
    }).then(parse),

  getSettings: async () => {
    try {
      const api = await apiFetch("/platform/settings").then(parse);
      const merged = mergeSettings(api as Record<string, unknown>);
      writeLocalSettings(merged);
      return merged;
    } catch {
      return readLocalSettings();
    }
  },

  updateSettings: async (body: Record<string, unknown>) => {
    const payload = toApiPayload(mergeSettings(body));
    try {
      const api = await apiFetch("/platform/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).then(parse);
      const merged = mergeSettings(api as Record<string, unknown>);
      writeLocalSettings(merged);
      return merged;
    } catch (err) {
      const local = writeLocalSettings(body);
      if (import.meta.env.DEV) {
        console.warn("[platform] settings API indisponible, cache local utilisé", err);
      }
      return local;
    }
  },

  getBi: async () => {
    const api = await tryApi(() => apiFetch("/platform/bi").then(parse));
    if (api) return api;
    const [metrics, orgs] = await Promise.all([
      platformApi.getMetrics(),
      platformApi.getOrganizations(),
    ]);
    return buildBiFallback(metrics, orgs);
  },

  getSupport: async (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    const api = await tryApi(() =>
      apiFetch(`/platform/support${qs ? `?${qs}` : ""}`).then(parse),
    );
    if (api) return api;
    const orgs = await platformApi.getOrganizations();
    return buildSupportFromOrgs(orgs, params);
  },

  createSupportTicket: async (body: Record<string, unknown>) => {
    const api = await tryApi(() =>
      apiFetch("/platform/support", { method: "POST", body: JSON.stringify(body) }).then(parse),
    );
    if (api) return api;
    return { message: "Ticket enregistré (mode local).", ticketNumber: `SUP-LOC-${Date.now()}` };
  },

  updateSupportTicket: async (id: string, body: Record<string, unknown>) => {
    const api = await tryApi(() =>
      apiFetch(`/platform/support/${id}`, { method: "PATCH", body: JSON.stringify(body) }).then(parse),
    );
    if (api) return api;
    return { message: "Ticket mis à jour (mode local)." };
  },

  getSecurity: async () => {
    const api = await tryApi(() => apiFetch("/platform/security").then(parse));
    if (api) return api;
    const [orgs, users, payments, metrics] = await Promise.all([
      platformApi.getOrganizations(),
      platformApi.getUsers(),
      platformApi.getPayments(),
      tryApi(() => platformApi.getMetrics()),
    ]);
    return buildSecurityFallback({
      orgs,
      users: users as { email: string; fullName?: string; isActive?: boolean; role?: string }[],
      payments: payments as { summary?: { failed?: number }; payments?: { status: string }[] },
      metrics: metrics ?? undefined,
    });
  },

  getNotifications: async () => {
    try {
      return await apiFetch("/platform/notifications").then(parse<{
        unread: number;
        items: {
          id: string;
          type: string;
          title: string;
          body: string;
          time: string;
          read: boolean;
          path: string;
          severity: "error" | "warning" | "info";
        }[];
      }>);
    } catch {
      const [orgs, payments] = await Promise.all([
        platformApi.getOrganizations(),
        platformApi.getPayments(),
      ]);
      const now = new Date().toLocaleDateString("fr-FR");
      const items: {
        id: string;
        type: string;
        title: string;
        body: string;
        time: string;
        read: boolean;
        path: string;
        severity: "error" | "warning" | "info";
      }[] = [];
      for (const org of orgs.filter((o) => o.status === "Suspendu").slice(0, 2)) {
        items.push({
          id: `sus-${org.id}`,
          type: "club",
          title: `Club suspendu — ${org.name}`,
          body: "Abonnement à régulariser",
          time: now,
          read: false,
          path: "/superadmin/clubs",
          severity: "error",
        });
      }
      const failed = (payments as { summary?: { failed?: number } }).summary?.failed ?? 0;
      if (failed > 0) {
        items.push({
          id: "pay-failed",
          type: "payment",
          title: `${failed} paiement(s) échoué(s)`,
          body: "Vérifier la facturation",
          time: now,
          read: false,
          path: "/superadmin/payments",
          severity: "error",
        });
      }
      if (items.length === 0) {
        items.push({
          id: "ok",
          type: "system",
          title: "Plateforme opérationnelle",
          body: "Aucune alerte",
          time: now,
          read: true,
          path: "/superadmin/dashboard",
          severity: "info",
        });
      }
      return { unread: items.filter((i) => !i.read).length, items };
    }
  },
};
