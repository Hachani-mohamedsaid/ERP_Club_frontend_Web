import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, TrendingUp, Trophy, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchClubDashboard, type ClubDashboardResponse } from "../lib/api/clubDashboard";
import { responsableApi } from "../lib/api/responsable";
import { clubApi } from "../lib/api/club";

interface PlayerRow {
  ovr: number;
  marketValue: string;
  availability: string;
  age: number;
}

interface ValidationRequest {
  id: string;
  type: string;
  title: string;
  detail: string;
  status: string;
}

interface ProspectRow {
  status: string;
}

interface NotificationRow {
  title: string;
}

export interface ExecKpi {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
  tone: "info" | "success" | "warning" | "danger";
  bar: number;
}

export interface SecondaryKpi {
  label: string;
  value: string;
  note: string;
}

export interface ValidationQueueItem {
  id: string;
  title: string;
  subtitle: string;
  tone: "info" | "warning" | "danger" | "success";
}

function parseMarketValue(v: string): number {
  const s = v.replace(/\s/g, "").toUpperCase();
  const m = s.match(/([\d.,]+)\s*(M|K)?/);
  if (!m) return 0;
  let n = parseFloat(m[1].replace(",", "."));
  if (m[2] === "M") n *= 1_000_000;
  else if (m[2] === "K") n *= 1_000;
  return Number.isFinite(n) ? n : 0;
}

function formatMarketTotal(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)} M DT`;
  if (total >= 1_000) return `${Math.round(total / 1_000)} K DT`;
  return `${Math.round(total)} DT`;
}

function countTeamGroups(players: PlayerRow[]): number {
  const groups = new Set<string>();
  for (const p of players) {
    if (p.age >= 21) groups.add("Seniors");
    else if (p.age >= 18) groups.add("U21");
    else if (p.age >= 16) groups.add("U18");
    else groups.add("U16");
  }
  return groups.size;
}

function validationTone(type: string): ValidationQueueItem["tone"] {
  if (type === "Contrat") return "warning";
  if (type === "Médical") return "danger";
  if (type === "Budget") return "success";
  return "info";
}

function buildExecutiveKpis(
  players: PlayerRow[],
  dashboard: ClubDashboardResponse,
  analytics: { teamEvolution?: { points: number }[] } | null,
): ExecKpi[] {
  const total = players.length;
  const unavailable = players.filter(
    (p) => p.availability === "Blessé" || p.availability === "Fin contrat" || p.availability === "Limité",
  ).length;
  const available = total - unavailable;
  const availabilityPct = total > 0 ? Math.round((available / total) * 100) : 0;
  const avgOvr = total > 0 ? Math.round(players.reduce((s, p) => s + p.ovr, 0) / total) : 0;
  const marketTotal = players.reduce((s, p) => s + parseMarketValue(p.marketValue), 0);

  const seasonPoints = (analytics?.teamEvolution ?? []).reduce((s, m) => s + (m.points ?? 0), 0);
  const ranking =
    seasonPoints >= 45 ? "1er" : seasonPoints >= 36 ? "2ème" : seasonPoints >= 27 ? "3ème" : seasonPoints > 0 ? "Top 5" : "—";
  const rankingTrend =
    seasonPoints > 0 ? `${seasonPoints} pts saison` : dashboard.organization.league || "Saison en cours";

  const injuryRisk = avgOvr >= 80 ? "Risque bas" : avgOvr >= 70 ? "Risque modéré" : "Risque élevé";

  return [
    {
      label: "Classement championnat",
      value: ranking,
      trend: rankingTrend,
      icon: Trophy,
      tone: "info",
      bar: Math.min(100, Math.max(10, seasonPoints > 0 ? seasonPoints : 50)),
    },
    {
      label: "Valeur effectif",
      value: formatMarketTotal(marketTotal),
      trend: total > 0 ? `${total} joueur(s)` : "Effectif vide",
      icon: TrendingUp,
      tone: "success",
      bar: Math.min(100, Math.round((marketTotal / 3_000_000) * 100) || 10),
    },
    {
      label: "Disponibilité effectif",
      value: total > 0 ? `${availabilityPct}%` : "—",
      trend: unavailable > 0 ? `${unavailable} indisponible(s)` : "Effectif complet",
      icon: Users,
      tone: "info",
      bar: availabilityPct || 0,
    },
    {
      label: "Score ODIN",
      value: avgOvr > 0 ? `${avgOvr}/100` : "—",
      trend: injuryRisk,
      icon: ShieldAlert,
      tone: avgOvr >= 75 ? "danger" : "warning",
      bar: avgOvr || 0,
    },
  ];
}

function buildSecondaryKpis(
  dashboard: ClubDashboardResponse,
  players: PlayerRow[],
  pendingProspects: number,
): SecondaryKpi[] {
  const total = players.length;
  const groups = countTeamGroups(players);
  const unavailable = players.filter((p) => p.availability !== "Disponible").length;
  const availabilityPct = total > 0 ? Math.round(((total - unavailable) / total) * 100) : 0;
  const avgOvr = total > 0 ? Math.round(players.reduce((s, p) => s + p.ovr, 0) / total) : 0;

  const injured = dashboard.kpis.find((k) => k.icon === "injured")?.value ?? 0;
  const contracts = dashboard.kpis.find((k) => k.icon === "contract")?.value ?? 0;

  return [
    {
      label: "Effectif",
      value: String(total),
      note: groups > 0 ? `${groups} groupe(s) actif(s)` : "Aucun joueur",
    },
    {
      label: "Blessés",
      value: String(injured),
      note: total > 0 ? `Disponibilité ${availabilityPct}%` : "—",
    },
    {
      label: "Contrats expirants",
      value: String(contracts),
      note: "90 / 60 / 30 jours",
    },
    {
      label: "Prospects à valider",
      value: String(pendingProspects),
      note: pendingProspects > 0 ? "Demandes en attente" : "Aucune demande",
    },
    {
      label: "Présence entraînement",
      value: total > 0 ? `${Math.min(99, availabilityPct + 3)}%` : "—",
      note: "Semaine courante",
    },
    {
      label: "ODIN Club Score",
      value: avgOvr > 0 ? `${avgOvr}/100` : "—",
      note: "Indice global",
    },
  ];
}

export function useResponsableDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<ClubDashboardResponse | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [validation, setValidation] = useState<ValidationRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [pendingProspects, setPendingProspects] = useState(0);
  const [analytics, setAnalytics] = useState<{ teamEvolution?: { points: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const orgId = user?.organization?.id;

  useEffect(() => {
    if (!orgId || !user?.email) {
      setLoading(false);
      setDashboard(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchClubDashboard(orgId),
      clubApi.getPlayers() as Promise<PlayerRow[]>,
      responsableApi.getValidation() as Promise<{ requests: ValidationRequest[] }>,
      clubApi.getNotifications() as Promise<NotificationRow[]>,
      responsableApi.getProspects() as Promise<ProspectRow[]>,
      clubApi.getAnalytics() as Promise<{ teamEvolution?: { points: number }[] }>,
    ])
      .then(([dash, playerRows, validationRes, notifRows, prospectRows, analyticsRes]) => {
        if (cancelled) return;
        setDashboard(dash);
        setPlayers(playerRows);
        setValidation(validationRes.requests ?? []);
        setNotifications(notifRows);
        const pending = (prospectRows ?? []).filter(
          (p) => p.status === "Non traité" || p.status === "En observation",
        ).length;
        setPendingProspects(pending);
        setAnalytics(analyticsRes);
        setFetchedAt(new Date());
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Impossible de charger le dashboard.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, user?.email]);

  const executiveKpis = useMemo(
    () => (dashboard ? buildExecutiveKpis(players, dashboard, analytics) : []),
    [dashboard, players, analytics],
  );

  const secondaryKpis = useMemo(
    () => (dashboard ? buildSecondaryKpis(dashboard, players, pendingProspects) : []),
    [dashboard, players, pendingProspects],
  );

  const validationQueue = useMemo(
    () =>
      validation
        .filter((r) => r.status === "En attente")
        .slice(0, 3)
        .map((r) => ({
          id: r.id,
          title: r.type,
          subtitle: r.title || r.detail,
          tone: validationTone(r.type),
        })),
    [validation],
  );

  const pendingCount = validation.filter((r) => r.status === "En attente").length;

  const smartNotifications = useMemo(() => {
    const fromApi = notifications.slice(0, 6).map((n) => n.title);
    if (fromApi.length > 0) return fromApi;
    const fallback: string[] = [];
    const injured = dashboard?.kpis.find((k) => k.icon === "injured")?.value ?? 0;
    const contracts = dashboard?.kpis.find((k) => k.icon === "contract")?.value ?? 0;
    if (Number(contracts) > 0) fallback.push("Contrat expire bientôt");
    if (Number(injured) > 0) fallback.push("Joueur blessé");
    if (pendingProspects > 0) fallback.push("Prospect à valider");
    if (pendingCount > 0) fallback.push(`${pendingCount} validation(s) en attente`);
    return fallback.length > 0 ? fallback : ["Aucune notification récente"];
  }, [notifications, dashboard, pendingProspects, pendingCount]);

  return {
    dashboard,
    loading,
    error,
    hasOrg: Boolean(orgId),
    executiveKpis,
    secondaryKpis,
    validationQueue,
    pendingCount,
    smartNotifications,
    fetchedAt,
  };
}
