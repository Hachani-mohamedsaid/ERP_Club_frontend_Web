import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  TrendingUp,
  Plus,
  Calendar,
  Upload,
  FileText,
  Loader2,
  ShieldAlert,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/coach/ProgressBar";
import { BodyInjuryViewer } from "../components/medical/BodyInjuryViewer";
import type { BodyZone } from "../components/medical/BodyInjuryViewer";
import { AIRiskPrediction } from "../components/medical/AIRiskPrediction";
import { motion } from "framer-motion";
import { useMedicalDashboard, type MedicalAlert, type MedicalPlayer } from "../hooks/useMedicalDashboard";
import { riskToPercent, riskToSeverity, type InjuryRow } from "../lib/injuryNormalize";

interface MedicalCase {
  id: string;
  player: string;
  returnEstimate: string;
  status: "Blessé" | "En rééducation" | "Disponible sous réserve";
  recovery: number;
  position: string;
  injury: string;
  grade: string;
  daysRemaining: number | null;
}

const TIMELINE_EVENTS = [
  { id: "1", date: "Aujourd'hui", title: "Contrôle kiné", description: "Rééducation ciblée pour Ahmed.", type: "warning" as const },
  { id: "2", date: "Hier", title: "Analyse IRM", description: "Bilan la cheville de Ali.", type: "info" as const },
  { id: "3", date: "2 jours", title: "Séance reprise", description: "Mobilité et proprioception.", type: "success" as const },
];

const QUICK_ACTIONS = [
  { label: "Nouvelle blessure", icon: Plus, path: "/medical/blessures", color: "var(--color-state-danger)" },
  { label: "Rendez-vous", icon: Calendar, path: "/medical/rendez-vous", color: "var(--color-state-info)" },
  { label: "Upload document", icon: Upload, path: "/medical/documents", color: "var(--color-state-warning)" },
  { label: "Rapport", icon: FileText, path: "/medical/rapports", color: "var(--color-state-success)" },
];

const BODY_ZONE_LABELS: Record<string, string> = {
  head: "Tête",
  "shoulder-left": "Épaule gauche",
  "shoulder-right": "Épaule droite",
  "arm-left": "Bras gauche",
  "arm-right": "Bras droit",
  chest: "Poitrine",
  abdomen: "Abdomen",
  groin: "Aine",
  "knee-left": "Genou gauche",
  "knee-right": "Genou droit",
  "ankle-left": "Cheville gauche",
  "ankle-right": "Cheville droite",
  "thigh-left": "Cuisse gauche",
  "thigh-right": "Cuisse droite",
};

const VIEWER_ZONE_IDS = [
  "head",
  "shoulder-left",
  "shoulder-right",
  "arm-left",
  "arm-right",
  "chest",
  "abdomen",
  "groin",
  "knee-left",
  "knee-right",
  "ankle-left",
  "ankle-right",
] as const;

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}

function parseReturnDate(returnDate: string): Date | null {
  if (!returnDate || returnDate === "—") return null;
  if (returnDate.includes("/")) {
    const parts = returnDate.split("/").map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      const [day, month, year] = parts;
      return new Date(year, month - 1, day);
    }
  }
  const isoMatch = returnDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch.map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(returnDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysRemaining(returnDate: string): number | null {
  const target = parseReturnDate(returnDate);
  if (!target) return null;
  const diff = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function injuryRecencyScore(row: InjuryRow): number {
  if (row.createdAt) {
    const created = new Date(row.createdAt).getTime();
    if (!Number.isNaN(created)) return created;
  }
  const returnDate = parseReturnDate(row.returnDate);
  return returnDate?.getTime() ?? 0;
}

function deduplicateInjuriesByPlayer(injuries: InjuryRow[]): InjuryRow[] {
  const byPlayer = new Map<string, InjuryRow>();
  for (const injury of injuries) {
    const key = normalizeName(injury.name);
    const existing = byPlayer.get(key);
    if (!existing || injuryRecencyScore(injury) >= injuryRecencyScore(existing)) {
      byPlayer.set(key, injury);
    }
  }
  return [...byPlayer.values()];
}

function findPlayerPosition(playerName: string, players: MedicalPlayer[]): string {
  const key = normalizeName(playerName);
  const match = players.find((player) => normalizeName(player.fullName) === key);
  return match?.position?.trim() || "—";
}

function resolveSide(lower: string): "left" | "right" | null {
  if (lower.includes("gauche") || lower.includes("left")) return "left";
  if (lower.includes("droit") || lower.includes("right")) return "right";
  return null;
}

function bodyPartToMedicalZoneId(bodyPart: string | null): string | null {
  if (!bodyPart?.trim()) return null;
  const lower = bodyPart.toLowerCase().trim();

  if (VIEWER_ZONE_IDS.includes(lower as (typeof VIEWER_ZONE_IDS)[number])) {
    return lower;
  }

  const side = resolveSide(lower);

  if (lower.includes("tête") || lower.includes("tete") || lower.includes("head")) {
    return "head";
  }
  if (lower.includes("épaule") || lower.includes("epaule") || lower.includes("shoulder")) {
    if (side === "left") return "shoulder-left";
    if (side === "right") return "shoulder-right";
    return null;
  }
  if (lower.includes("genou") || lower.includes("knee")) {
    if (side === "left") return "knee-left";
    if (side === "right") return "knee-right";
    return null;
  }
  if (lower.includes("cheville") || lower.includes("ankle")) {
    if (side === "left") return "ankle-left";
    if (side === "right") return "ankle-right";
    return null;
  }
  if (lower.includes("hamstring") || lower.includes("cuisse") || lower.includes("ischio")) {
    if (side === "left") return "thigh-left";
    if (side === "right") return "thigh-right";
    return null;
  }

  return null;
}

function viewerZoneId(zoneId: string): string {
  if (zoneId === "thigh-left" || zoneId === "thigh-right") return "groin";
  return zoneId;
}

function riskToGrade(riskIA: number): string {
  if (riskIA >= 8) return "Grade III";
  if (riskIA >= 5) return "Grade II";
  return "Grade I";
}

function formatReturnEstimate(returnDate: string): string {
  const days = daysRemaining(returnDate);
  if (days === null) return "—";
  return `${days} jours`;
}

function injuryToMedicalCase(row: InjuryRow, players: MedicalPlayer[]): MedicalCase {
  return {
    id: row.id,
    player: row.name,
    position: findPlayerPosition(row.name, players),
    returnEstimate: formatReturnEstimate(row.returnDate),
    status: "Blessé",
    recovery: Math.max(5, 100 - riskToPercent(row.riskIA)),
    injury: row.injury,
    grade: riskToGrade(row.riskIA),
    daysRemaining: daysRemaining(row.returnDate),
  };
}

function recoveryAccentColor(recovery: number): string {
  if (recovery < 50) return "var(--color-state-danger)";
  if (recovery < 80) return "var(--color-state-warning)";
  return "var(--color-state-success)";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function averageDaysRemaining(injuries: InjuryRow[]): number {
  const values = injuries
    .map((row) => daysRemaining(row.returnDate))
    .filter((days): days is number => days !== null);
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, days) => sum + days, 0) / values.length);
}

function availabilityPercent(injured: number, available: number): number {
  const total = injured + available;
  if (total === 0) return 0;
  return Math.round((available / total) * 100);
}

function buildMedicalBodyZones(injuries: InjuryRow[]): BodyZone[] {
  const zoneState = new Map<string, { severity: BodyZone["severity"]; risk: number; injury: InjuryRow }>();

  for (const injury of injuries) {
    const mappedZoneId = bodyPartToMedicalZoneId(injury.bodyPart);
    if (!mappedZoneId) continue;

    const viewerId = viewerZoneId(mappedZoneId);
    if (!VIEWER_ZONE_IDS.includes(viewerId as (typeof VIEWER_ZONE_IDS)[number])) continue;

    const severity = riskToSeverity(injury.riskIA);
    const risk = riskToPercent(injury.riskIA);
    const existing = zoneState.get(viewerId);

    if (!existing || risk > existing.risk) {
      zoneState.set(viewerId, { severity, risk, injury });
    }
  }

  return VIEWER_ZONE_IDS.map((id) => {
    const state = zoneState.get(id);
    if (!state) {
      return { id, name: BODY_ZONE_LABELS[id] ?? id, severity: "none" as const };
    }

    const days = daysRemaining(state.injury.returnDate) ?? 0;
    return {
      id,
      name: BODY_ZONE_LABELS[id] ?? id,
      severity: state.severity,
      risk: state.risk,
      lastControl: state.injury.createdAt
        ? new Date(state.injury.createdAt).toLocaleDateString("fr-FR")
        : "—",
      injuryInfo: {
        player: state.injury.name,
        grade: riskToGrade(state.injury.riskIA),
        risk: state.risk,
        daysRemaining: days,
      },
    };
  });
}

function calendarEventToTimelineType(eventType?: string): "info" | "warning" | "danger" {
  const upper = (eventType ?? "").toUpperCase();
  if (upper === "MEDICAL") return "warning";
  if (upper === "MATCH") return "danger";
  return "info";
}

type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "danger";
};

type PageAlert = MedicalAlert | { message: string; type: "info" };

const TIMELINE_TYPE_COLORS = {
  info: { border: "var(--color-state-info)", dot: "var(--color-state-info)" },
  success: { border: "var(--color-state-success)", dot: "var(--color-state-success)" },
  warning: { border: "var(--color-state-warning)", dot: "var(--color-state-warning)" },
  danger: { border: "var(--color-state-danger)", dot: "var(--color-state-danger)" },
};

function MedicalTimelineSection({ title, events }: { title: string; events: TimelineEvent[] }) {
  return (
    <GlassCard raised className="p-6">
      <div className="flex items-center gap-2">
        <Calendar size={16} style={{ color: "var(--color-state-info)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      </div>

      <div className="mt-4 space-y-0">
        {events.map((event, idx) => {
          const colors = TIMELINE_TYPE_COLORS[event.type || "info"];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.35, duration: 0.45, ease: "easeOut" }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="h-3 w-3 rounded-full"
                  style={{ background: colors.dot }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.35 + 0.1, type: "spring", stiffness: 300 }}
                />
                {idx < events.length - 1 && (
                  <motion.div
                    className="mt-2 w-0.5"
                    style={{ background: colors.border, originY: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 48, opacity: 1 }}
                    transition={{ delay: idx * 0.35 + 0.25, duration: 0.3 }}
                  />
                )}
              </div>

              <div className="flex-1 pb-6">
                <p className="text-xs font-medium" style={{ color: colors.border }}>{event.date}</p>
                <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.title}</p>
                {event.description ? (
                  <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function MedicalPage() {
  const navigate = useNavigate();
  const {
    kpis,
    injured,
    players,
    todayEvents,
    highRiskCount,
    priorities,
    alerts,
    loading,
    error,
  } = useMedicalDashboard();

  const recoveryInjuries = useMemo(() => deduplicateInjuriesByPlayer(injured), [injured]);

  const recoveryCases = useMemo(
    () => recoveryInjuries.map((row) => injuryToMedicalCase(row, players)),
    [recoveryInjuries, players],
  );

  const bodyZones = useMemo(() => buildMedicalBodyZones(injured), [injured]);

  const risksByZone = useMemo(
    () =>
      injured.map((row) => ({
        zone: row.injury,
        risk: riskToPercent(row.riskIA),
        severity: riskToSeverity(row.riskIA),
      })),
    [injured],
  );

  const averageReturnDays = useMemo(() => averageDaysRemaining(injured), [injured]);

  const overallRisk = useMemo(() => {
    if (injured.length === 0) return 0;
    return Math.round(
      injured.reduce((sum, row) => sum + riskToPercent(row.riskIA), 0) / injured.length,
    );
  }, [injured]);

  const builtTimeline = useMemo(
    () =>
      todayEvents.length > 0
        ? todayEvents.slice(0, 3).map((event, index) => ({
            id: String(index),
            date: "Aujourd'hui",
            title: event.title ?? event.name ?? "Événement",
            description: event.location ?? event.player ?? "",
            type: calendarEventToTimelineType(event.eventType),
          }))
        : TIMELINE_EVENTS,
    [todayEvents],
  );

  const dispoPercent = availabilityPercent(kpis.injured, kpis.available);

  const displayAlerts = useMemo((): PageAlert[] => {
    const calendarAlerts: PageAlert[] = todayEvents.map((event) => ({
      type: "info",
      message: `${event.title ?? event.name ?? "Événement"}${event.location ? ` — ${event.location}` : ""}`,
    }));
    return [...calendarAlerts, ...alerts];
  }, [todayEvents, alerts]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: "var(--color-state-danger)" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap gap-3">
        {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
          <Button key={label} variant="glass" onClick={() => navigate(path)} className="gap-2">
            <Icon size={15} style={{ color }} />
            <span style={{ color: "var(--text-primary)" }}>+ {label}</span>
          </Button>
        ))}
      </div>

      <motion.div
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          <GlassCard raised className="p-5" style={{ borderLeft: "3px solid var(--color-state-danger)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Blessés actifs</p>
                <p className="mt-1 text-3xl font-bold" style={{ color: "var(--color-state-danger)" }}>{kpis.injured}</p>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>blessures en cours</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "var(--color-state-danger-bg)" }}
              >
                <HeartPulse size={20} style={{ color: "var(--color-state-danger)" }} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          <GlassCard raised className="p-5" style={{ borderLeft: "3px solid var(--color-state-info)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Retour moyen</p>
                <p className="mt-1 text-3xl font-bold" style={{ color: "var(--color-state-info)" }}>
                  {averageReturnDays} jours
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>temps de récupération</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "var(--color-state-info-bg)" }}
              >
                <Clock size={20} style={{ color: "var(--color-state-info)" }} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          <GlassCard raised className="p-5" style={{ borderLeft: "3px solid var(--color-state-success)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Dispo effectif</p>
                <p className="mt-1 text-3xl font-bold" style={{ color: "var(--color-state-success)" }}>
                  {dispoPercent}%
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>joueurs disponibles</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "var(--color-state-success-bg)" }}
              >
                <TrendingUp size={20} style={{ color: "var(--color-state-success)" }} />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          <GlassCard raised className="p-5" style={{ borderLeft: "3px solid var(--color-state-warning)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Joueurs à risque</p>
                <p className="mt-1 text-3xl font-bold" style={{ color: "var(--color-state-warning)" }}>
                  {highRiskCount}
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>joueurs surveillés</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "var(--color-state-warning-bg)" }}
              >
                <ShieldAlert size={20} style={{ color: "var(--color-state-warning)" }} />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {priorities.length > 0 ? (
        <GlassCard raised className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert size={16} style={{ color: "var(--color-state-danger)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Priorités du jour
            </h2>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs"
              style={{ background: "var(--color-state-danger)20", color: "var(--color-state-danger)" }}
            >
              {priorities.length} action{priorities.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {priorities.map((priority, index) => {
              const isDanger = priority.type === "danger";
              const accentColor = isDanger ? "var(--color-state-danger)" : "var(--color-state-info)";
              const accentBg = isDanger ? "var(--color-state-danger-bg)" : "var(--color-state-info-bg)";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center justify-between rounded-[var(--radius-odin-md)] px-5 py-4"
                  style={{
                    background: isDanger
                      ? "linear-gradient(90deg, var(--color-state-danger-bg), transparent)"
                      : "linear-gradient(90deg, var(--color-state-info-bg), transparent)",
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: accentBg, color: accentColor }}
                    >
                      {getInitials(priority.player)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {priority.player}
                        <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          {priority.position}
                        </span>
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{priority.reason}</p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold"
                    style={{ background: accentColor, color: "var(--text-primary)" }}
                  >
                    {priority.action}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      ) : null}

      <MedicalTimelineSection title="Calendrier médical du jour" events={builtTimeline} />

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Progression de récupération
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {recoveryCases.map((medicalCase, idx) => {
            const accent = recoveryAccentColor(medicalCase.recovery);
            const daysLabel =
              medicalCase.daysRemaining === null
                ? "—"
                : medicalCase.daysRemaining === 0
                ? "0j restants"
                : `${medicalCase.daysRemaining}j restants`;
            return (
              <motion.div
                key={medicalCase.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
              >
                <div
                  className="rounded-[var(--radius-odin-md)] border p-4"
                  style={{ borderColor: "var(--surface-panel-border)", borderTop: `3px solid ${accent}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{medicalCase.player}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{medicalCase.position}</p>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{medicalCase.injury}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: accent }}>{medicalCase.recovery}%</p>
                      <p className="text-xs font-bold" style={{ color: accent }}>{daysLabel}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressBar
                      label="Récupération"
                      value={medicalCase.recovery}
                      color={accent}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard raised className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Alertes médicales
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {displayAlerts.map((alert, index) => {
            const isDanger = alert.type === "danger";
            const isWarning = alert.type === "warning";
            const isInfo = alert.type === "info";
            const accentColor = isDanger
              ? "var(--color-state-danger)"
              : isWarning
              ? "var(--color-state-warning)"
              : isInfo
              ? "var(--color-state-info)"
              : "var(--color-state-success)";
            const accentBg = isDanger
              ? "var(--color-state-danger-bg)"
              : isWarning
              ? "var(--color-state-warning-bg)"
              : isInfo
              ? "var(--color-state-info-bg)"
              : "var(--color-state-success-bg)";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex min-h-[3.5rem] items-center gap-3 rounded-xl px-4 py-4"
                style={{
                  background: accentBg,
                  border: "1px solid var(--surface-panel-border)",
                  borderLeft: `4px solid ${accentColor}`,
                }}
              >
                {isDanger ? (
                  <AlertCircle size={18} style={{ color: accentColor, flexShrink: 0 }} />
                ) : isWarning ? (
                  <Clock size={18} style={{ color: accentColor, flexShrink: 0 }} />
                ) : isInfo ? (
                  <Calendar size={18} style={{ color: accentColor, flexShrink: 0 }} />
                ) : (
                  <CheckCircle size={18} style={{ color: accentColor, flexShrink: 0 }} />
                )}
                <div className="min-w-0">
                  {isDanger ? (
                    <p className="text-xs font-semibold" style={{ color: accentColor }}>Risque élevé</p>
                  ) : isWarning ? (
                    <p className="text-xs font-semibold" style={{ color: accentColor }}>Retour imminent</p>
                  ) : isInfo ? (
                    <p className="text-xs font-semibold" style={{ color: accentColor }}>Événement du jour</p>
                  ) : null}
                  <p
                    className="text-sm"
                    style={{
                      color: alert.type === "success" ? accentColor : "var(--text-primary)",
                    }}
                  >
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Carte des blessures</h2>
        <p className="mb-6 text-xs" style={{ color: "var(--text-muted)" }}>
          Survolez une zone pour voir le joueur concerné
        </p>
        <div className="p-6">
          <BodyInjuryViewer zones={bodyZones} />
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="mb-6 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Bilan de santé de l&apos;effectif
        </h2>
        <AIRiskPrediction
          overallRisk={overallRisk}
          risksByZone={risksByZone}
        />
      </GlassCard>
    </div>
  );
}
