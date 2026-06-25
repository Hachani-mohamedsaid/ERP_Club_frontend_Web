import type { PlatformOrganization } from "./index";
import {
  DEFAULT_PLATFORM_SETTINGS,
  readLocalSettings,
  writeLocalSettings,
} from "./settings";

export { readLocalSettings, writeLocalSettings } from "./settings";
export type { PlatformSettingsFull } from "./settings";

const DEFAULT_SETTINGS = DEFAULT_PLATFORM_SETTINGS;

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR");
}

export function buildSupportFromOrgs(
  orgs: PlatformOrganization[],
  params?: { status?: string; search?: string },
) {
  const tickets = orgs.map((org, i) => {
    const isSuspended = org.status === "Suspendu" || org.statusCode === "SUSPENDED";
    const isTrial = org.status === "Essai" || org.subscriptionStatus === "TRIALING";
    const status = isSuspended ? "Ouvert" : isTrial ? "En cours" : "Résolu";
    const priority = isSuspended ? "Critique" : isTrial ? "Haute" : "Normale";
    return {
      id: org.id,
      ticketNumber: `SUP-${String(i + 1).padStart(3, "0")}`,
      club: org.name,
      subject: isSuspended
        ? `Club suspendu — ${org.name}`
        : isTrial
          ? `Essai en cours — ${org.name}`
          : `Compte actif — ${org.name}`,
      description: org.description || `Club ${org.league} · ${org.city}`,
      priority,
      priorityCode: isSuspended ? "CRITICAL" : isTrial ? "HIGH" : "NORMAL",
      status,
      statusCode: isSuspended ? "OPEN" : isTrial ? "IN_PROGRESS" : "RESOLVED",
      agent: isSuspended || isTrial ? "Non assigné" : "Support ODIN",
      date: org.createdAt,
      updated: org.trialEndsAt ?? org.createdAt,
      organizationId: org.id,
    };
  });

  let filtered = tickets;
  if (params?.status && params.status !== "Tous") {
    filtered = filtered.filter((t) => t.status === params.status);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.club.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q),
    );
  }

  const open = tickets.filter((t) => t.status === "Ouvert").length;
  const inProgress = tickets.filter((t) => t.status === "En cours").length;
  const resolved = tickets.filter((t) => t.status === "Résolu").length;
  const slaPct = tickets.length
    ? Math.round(((resolved + inProgress) / tickets.length) * 100)
    : 100;

  return { summary: { open, inProgress, resolved, slaPct }, tickets: filtered };
}

export function buildSecurityFallback(input: {
  orgs: PlatformOrganization[];
  users: { email: string; fullName?: string; isActive?: boolean; role?: string }[];
  payments: { summary?: { failed?: number }; payments?: { status: string }[] };
  metrics?: { kpis?: { loginsToday?: number; failedPayments?: number; activeUsers?: number } };
}) {
  const { orgs, users, payments, metrics } = input;
  const blockedUsers = users.filter((u) => u.isActive === false && u.role !== "SUPER_ADMIN");
  const suspendedOrgs = orgs.filter((o) => o.status === "Suspendu");
  const failedPayments = payments.summary?.failed ?? metrics?.kpis?.failedPayments ?? 0;
  const activeSessions = metrics?.kpis?.activeUsers ?? users.filter((u) => u.isActive !== false).length;
  const adminUsers = users.filter((u) => u.role === "ADMIN_CLUB" && u.isActive !== false).length;
  const totalUsers = users.filter((u) => u.role !== "SUPER_ADMIN" && u.isActive !== false).length;
  const mfaAdoption = totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0;

  const failedLoginsByHour = Array.from({ length: 10 }, (_, i) => ({
    hour: `${String(8 + i).padStart(2, "0")}h`,
    count: Math.max(0, Math.round((metrics?.kpis?.loginsToday ?? 3) / 10) + (i % 3)),
  }));

  const suspicious = [
    ...suspendedOrgs.slice(0, 2).map((o) => ({
      type: "Club suspendu",
      user: o.name,
      ip: "—",
      time: formatDate(new Date()),
      severity: "Haute",
    })),
    ...blockedUsers.slice(0, 2).map((u) => ({
      type: "Compte bloqué",
      user: u.email,
      ip: "—",
      time: formatDate(new Date()),
      severity: "Haute",
    })),
  ];

  if (failedPayments > 0) {
    suspicious.push({
      type: "Paiements échoués",
      user: "billing@platform",
      ip: "—",
      time: formatDate(new Date()),
      severity: "Critique",
    });
  }

  return {
    kpis: {
      failedAttemptsToday: metrics?.kpis?.loginsToday ?? 0,
      blockedIps: 0,
      activeSessions,
      mfaAdoption,
      mfaTrend: mfaAdoption >= 50 ? "En hausse" : "À améliorer",
    },
    failedLoginsByHour,
    mfaData: [
      { name: "Activé", value: mfaAdoption, color: "#22C55E" },
      { name: "Désactivé", value: 100 - mfaAdoption, color: "#EF4444" },
    ],
    blockedIps: [] as { ip: string; reason: string; blockedAt: string; country: string }[],
    suspicious,
    apiAbuse: [
      { endpoint: "/platform/metrics", calls: 120, limit: 500 },
      { endpoint: "/club/players", calls: 340, limit: 500 },
      { endpoint: "/platform/payments", calls: failedPayments * 20 + 45, limit: 300 },
      { endpoint: "/auth/login", calls: 85, limit: 200 },
    ],
    mfaByRole: [
      { role: "Admin Club", pct: mfaAdoption },
      { role: "Coach", pct: Math.max(0, mfaAdoption - 15) },
      { role: "Staff", pct: Math.max(0, mfaAdoption - 25) },
      { role: "Joueur", pct: Math.max(0, mfaAdoption - 40) },
    ],
    securityActions: [
      { label: "2FA obligatoire pour admins", done: mfaAdoption >= 80 },
      { label: "Audit logs activés", done: true },
      { label: "Rate limiting API", done: true },
      { label: "Blocage IP automatique", done: false },
      { label: "Chiffrement données sensibles", done: true },
    ],
  };
}

export function buildBiFallback(metrics: {
  kpis: {
    mrr: number;
    growthPct: number;
    retentionPct: number;
    trialClubs: number;
    suspendedClubs: number;
  };
  charts: { revenueMonthly: { month: string; revenue: number }[] };
}, orgs: PlatformOrganization[]) {
  const mrrK = Math.round(metrics.kpis.mrr / 1000);
  const growth = 1 + metrics.kpis.growthPct / 100;
  const monthLabels = ["Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

  const forecast = monthLabels.map((month, i) => ({
    month,
    actual: i === 0 ? mrrK : null,
    forecast: Math.round((mrrK * Math.pow(growth, i + 1)) / growth),
  }));

  const riskClubs = orgs
    .filter((o) => o.status === "Suspendu" || o.status === "Essai")
    .slice(0, 6)
    .map((o) => ({
      club: o.name,
      risk: o.status === "Suspendu" ? 85 : 55,
    }));

  const churn = monthLabels.map((month, i) => ({
    month,
    churn: Math.max(2, 12 - i),
    retention: Math.min(98, metrics.kpis.retentionPct + i),
  }));

  return {
    kpis: {
      revenuePrediction: `${Math.round(mrrK * growth * 6)}k DT`,
      topGrowthClubs: orgs.filter((o) => o.status === "Actif").length,
      clubsAtRisk: metrics.kpis.suspendedClubs + metrics.kpis.trialClubs,
      forecast6m: `${Math.round(mrrK * Math.pow(growth, 6))}k DT`,
    },
    forecast,
    riskClubs,
    churn,
    recommendations: [
      `Relancer ${metrics.kpis.trialClubs} club(s) en essai avant expiration.`,
      metrics.kpis.suspendedClubs > 0
        ? `${metrics.kpis.suspendedClubs} club(s) suspendu(s) — vérifier paiements.`
        : "Aucun club suspendu — bonne rétention.",
      `MRR actuel ~${mrrK}k DT avec croissance ${metrics.kpis.growthPct}%.`,
    ],
  };
}
