import { useMemo, type CSSProperties } from "react";
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
import { ProgressBar } from "../components/coach/ProgressBar";
import { BodyInjuryViewer } from "../components/medical/BodyInjuryViewer";
import type { BodyZone } from "../components/medical/BodyInjuryViewer";
import { AIRiskPrediction } from "../components/medical/AIRiskPrediction";
import { motion } from "framer-motion";
import { useMedicalDashboard, type MedicalAlert, type MedicalPlayer } from "../hooks/useMedicalDashboard";
import { riskToPercent, riskToSeverity, type InjuryRow } from "../lib/injuryNormalize";

/** Clinical Steel — same language as Dossiers médicaux */
const C = {
  slate: "#64748b",
  ice: "#38bdf8",
  sky: "#7dd3fc",
  deep: "#0ea5e9",
  white: "#f8fafc",
  muted: "#94a3b8",
  panel: "rgba(100, 116, 139, 0.14)",
  border: "rgba(100, 116, 139, 0.4)",
  red: "#f83a3a",
  green: "#3af899",
  purple: "#993af8",
} as const;

const softBg = (hex: string, alpha = 0.12) => {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ICE_CARD: CSSProperties = {
  borderColor: C.border,
  borderTop: `2px solid ${C.ice}`,
  background: "linear-gradient(180deg, rgba(56,189,248,0.05) 0%, var(--surface-panel-solid) 32%)",
};

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
  if (recovery < 50) return C.red;
  if (recovery < 80) return C.ice;
  return C.green;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
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

const TIMELINE_EVENTS: TimelineEvent[] = [];

type PageAlert = MedicalAlert | { message: string; type: "info" };

const TIMELINE_TYPE_COLORS = {
  info: { border: C.ice, dot: C.ice },
  success: { border: C.green, dot: C.green },
  warning: { border: C.sky, dot: C.sky },
  danger: { border: C.red, dot: C.red },
};

function MedicalTimelineSection({ title, events }: { title: string; events: TimelineEvent[] }) {
  return (
    <GlassCard raised className="p-6" style={ICE_CARD}>
      <div className="flex items-center gap-2">
        <Calendar size={16} style={{ color: C.ice }} />
        <h2 className="text-sm font-semibold" style={{ color: C.white }}>{title}</h2>
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
                <p className="mt-0.5 text-sm font-medium" style={{ color: C.white }}>{event.title}</p>
                {event.description ? (
                  <p className="mt-1 text-xs" style={{ color: C.muted }}>{event.description}</p>
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
    priorities,
    alerts,
    loading,
    error,
  } = useMedicalDashboard();

  // Read reeducation phases from localStorage
  const phases = (() => {
    try {
      const v = localStorage.getItem("odin_reeducation_phases");
      return v ? (JSON.parse(v) as Record<string, number>) : {};
    } catch {
      return {};
    }
  })();

  const resolvedIds: string[] = (() => {
    try {
      const v = localStorage.getItem("odin_resolved_injuries");
      return v ? (JSON.parse(v) as string[]) : [];
    } catch {
      return [];
    }
  })();

  const QUICK_ACTIONS = [
    {
      label: `Nouvelle blessure${
        kpis.injured > 0
          ? ` (${kpis.injured})`
          : ""
      }`,
      icon: Plus,
      path: "/medical/blessures",
      color: "var(--color-state-danger)",
    },
    { label: "Rendez-vous", icon: Calendar, path: "/medical/rendez-vous", color: C.deep },
    { label: "Upload document", icon: Upload, path: "/medical/documents", color: C.sky },
    { label: "Rapport", icon: FileText, path: "/medical/rapports", color: C.slate },
  ];

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

  // Total injuries (all injuries in DB)
  const totalInjuries = injured.length;

  // Disponibles = players with DISPONIBLE status
  const disponiblesCount = useMemo(
    () =>
      players.filter(
        (p) => (p.status ?? "").toUpperCase() === "DISPONIBLE"
      ).length,
    [players]
  );

  // En rééducation = injuries in phase 1 or 2 not yet resolved
  const enReeducation = useMemo(
    () =>
      injured.filter((inj) => {
        const phase = phases[inj.id];
        const isResolved = resolvedIds.includes(inj.id);
        if (isResolved) return false;
        if (phase === 1 || phase === 2) return true;
        // If no phase set yet → still in treatment
        if (!phase) return true;
        return false;
      }).length,
    [injured, phases, resolvedIds]
  );

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
        : TIMELINE_EVENTS.length > 0
          ? TIMELINE_EVENTS
          : [
              {
                id: "empty",
                date: "—",
                title: "Aucun événement médical aujourd'hui",
                description: "Les rendez-vous apparaîtront ici",
                type: "info" as const,
              },
            ],
    [todayEvents],
  );

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
        <Loader2 size={24} className="animate-spin" style={{ color: C.ice }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm" style={{ color: C.red }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: C.white }}>
          Dashboard médical
        </h1>
        <p className="mt-1 text-sm" style={{ color: C.slate }}>
          Vue clinique de l&apos;effectif · {kpis.injured} blessé{kpis.injured !== 1 ? "s" : ""} actif{kpis.injured !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className="flex items-center gap-2 rounded-[var(--radius-odin-md)] px-3.5 py-2 text-sm font-medium transition-colors hover:bg-white/5"
            style={{
              border: `1px solid ${C.border}`,
              borderLeftWidth: 3,
              borderLeftColor: color,
              background: softBg(color, 0.1),
              color: C.white,
            }}
          >
            <Icon size={15} style={{ color }} />
            + {label}
          </button>
        ))}
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
        }}
      >
        {[
          {
            label: "Total blessures",
            sublabel: "blessures enregistrées",
            value: totalInjuries,
            color: "var(--color-state-danger)",
            bg: "var(--color-state-danger-bg)",
            borderColor: "var(--color-state-danger)",
            icon: HeartPulse,
          },
          {
            label: "Disponibles",
            sublabel: "joueurs aptes",
            value: disponiblesCount,
            color: "var(--color-state-success)",
            bg: "var(--color-state-success-bg)",
            borderColor: "var(--color-state-success)",
            icon: CheckCircle,
          },
          {
            label: "En rééducation",
            sublabel: "joueurs en traitement",
            value: enReeducation,
            color: "var(--color-state-warning)",
            bg: "var(--color-state-warning-bg)",
            borderColor: "var(--color-state-warning)",
            icon: TrendingUp,
          },
        ].map(({ label, sublabel, value, color, bg, borderColor, icon: Icon }) => (
          <motion.div
            key={label}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <GlassCard
              raised
              className="p-5"
              style={{ borderLeft: `3px solid ${borderColor}` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {label}
                  </p>
                  <p className="mt-1 text-3xl font-bold" style={{ color }}>
                    {value}
                  </p>
                  <p
                    className="mt-2 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {sublabel}
                  </p>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {priorities.length > 0 ? (
        <GlassCard raised className="p-5" style={ICE_CARD}>
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert size={16} style={{ color: C.ice }} />
            <h2 className="text-sm font-semibold" style={{ color: C.white }}>
              Priorités du jour
            </h2>
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ background: softBg(C.ice), color: C.ice }}
            >
              {priorities.length} action{priorities.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {priorities.map((priority, index) => {
              const isDanger = priority.type === "danger";
              const accentColor = isDanger ? C.red : C.ice;
              const accentBg = softBg(accentColor);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center justify-between rounded-[var(--radius-odin-md)] px-5 py-4"
                  style={{
                    background: `linear-gradient(90deg, ${accentBg}, transparent)`,
                    border: `1px solid ${C.border}`,
                    borderLeftWidth: 3,
                    borderLeftColor: accentColor,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ background: accentBg, color: accentColor, border: `1px solid ${accentColor}40` }}
                    >
                      {getInitials(priority.player)}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: C.white }}>
                        {priority.player}
                        <span className="ml-2 text-xs" style={{ color: C.muted }}>
                          {priority.position}
                        </span>
                      </p>
                      <p className="text-xs" style={{ color: C.muted }}>{priority.reason}</p>
                    </div>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold"
                    style={{ background: softBg(accentColor, 0.2), color: accentColor }}
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

      <GlassCard raised className="p-6" style={ICE_CARD}>
        <h2 className="mb-4 text-sm font-semibold" style={{ color: C.white }}>
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
                  style={{
                    borderColor: C.border,
                    borderTop: `3px solid ${accent}`,
                    background: softBg(C.slate, 0.08),
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium" style={{ color: C.white }}>{medicalCase.player}</p>
                      <p className="text-xs" style={{ color: C.muted }}>{medicalCase.position}</p>
                      <p className="mt-1 text-xs" style={{ color: C.muted }}>{medicalCase.injury}</p>
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

      <GlassCard raised className="p-5" style={{ ...ICE_CARD, borderTop: `2px solid ${C.slate}` }}>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-sm font-semibold" style={{ color: C.white }}>
            Alertes médicales
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {displayAlerts.map((alert, index) => {
            const isDanger = alert.type === "danger";
            const isWarning = alert.type === "warning";
            const isInfo = alert.type === "info";
            const accentColor = isDanger ? C.red : isWarning ? C.sky : isInfo ? C.ice : C.green;
            const accentBg = softBg(accentColor);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex min-h-[3.5rem] items-center gap-3 rounded-xl px-4 py-4"
                style={{
                  background: accentBg,
                  border: `1px solid ${C.border}`,
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
                    style={{ color: alert.type === "success" ? accentColor : C.white }}
                  >
                    {alert.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard raised className="p-6" style={ICE_CARD}>
        <h2 className="mb-2 text-sm font-semibold" style={{ color: C.white }}>Carte des blessures</h2>
        <p className="mb-6 text-xs" style={{ color: C.muted }}>
          Survolez une zone pour voir le joueur concerné
        </p>
        <div className="p-6">
          <BodyInjuryViewer zones={bodyZones} />
        </div>
      </GlassCard>

      <GlassCard raised className="p-6" style={ICE_CARD}>
        <h2 className="mb-6 text-sm font-semibold" style={{ color: C.white }}>
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
