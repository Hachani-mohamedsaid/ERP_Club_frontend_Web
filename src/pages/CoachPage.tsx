import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Brain,
  Shield,
  Zap,
  ChevronRight,
  Activity,
  HeartPulse,
  Target,
  Flag,
  Loader2,
  TrendingUp,
  Swords,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../contexts/AuthContext";
import { clubApi } from "../lib/api/club";
import { apiFetch } from "../lib/api/authHeaders";

type PlayerRow = Record<string, unknown>;
type InjuryRow = Record<string, unknown>;
type CalendarRow = Record<string, unknown>;

type AlertLevel = "danger" | "warning" | "success";

interface CoachAlert {
  level: AlertLevel;
  message: string;
  sub: string;
  link: string;
}

interface ColorSet {
  main: string;
  bg: string;
  border: string;
  glow?: string;
}

interface QuickAccessItem extends ColorSet {
  label: string;
  icon: string;
  path: string;
}

function normalizePlayers(raw: unknown): PlayerRow[] {
  if (!Array.isArray(raw)) return [];
  return raw as PlayerRow[];
}

function normalizeInjuries(raw: unknown): InjuryRow[] {
  if (Array.isArray(raw)) return raw as InjuryRow[];
  if (raw && typeof raw === "object") {
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.injured)) return data.injured as InjuryRow[];
  }
  return [];
}

function normalizeCalendarEvents(raw: unknown): CalendarRow[] {
  if (Array.isArray(raw)) return raw as CalendarRow[];
  if (raw && typeof raw === "object") {
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.events)) return data.events as CalendarRow[];
  }
  return [];
}

function eventDateKey(e: CalendarRow): string {
  return String(e.eventDate ?? e.date ?? "").slice(0, 10);
}

function eventType(e: CalendarRow): string {
  return String(e.eventType ?? e.type ?? "");
}

export function CoachPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [playersRes, injuriesRes, calendarRes] = await Promise.all([
          clubApi.getPlayers(),
          clubApi.getInjuries(),
          apiFetch("/club/calendar").then((r) => r.json()),
        ]);
        if (cancelled) return;
        setPlayers(normalizePlayers(playersRes));
        setInjuries(normalizeInjuries(injuriesRes));
        setCalendarEvents(normalizeCalendarEvents(calendarRes));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const COLORS = {
    match: {
      main: "#3b82f6",
      bg: "rgba(59,130,246,0.10)",
      border: "rgba(59,130,246,0.25)",
      glow: "0 0 24px rgba(59,130,246,0.15)",
    },
    total: { main: "var(--accent)", bg: "rgba(255,122,0,0.10)", border: "rgba(255,122,0,0.25)" },
    dispo: { main: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)" },
    limite: { main: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
    blesse: { main: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
    pct: { main: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.25)" },
    training: {
      main: "#10b981",
      bg: "rgba(16,185,129,0.10)",
      border: "rgba(16,185,129,0.25)",
      glow: "0 0 24px rgba(16,185,129,0.12)",
    },
    schedule: {
      main: "#6366f1",
      bg: "rgba(99,102,241,0.08)",
      border: "rgba(99,102,241,0.20)",
    },
    alertDanger: { main: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.30)" },
    alertWarning: { main: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
    alertSuccess: { main: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)" },
    briefing: {
      main: "#0d9488",
      bg: "rgba(13,148,136,0.08)",
      border: "rgba(13,148,136,0.20)",
      glow: "0 0 20px rgba(13,148,136,0.10)",
    },
    quickAccess: [
      { main: "#ff7a00", bg: "rgba(255,122,0,0.10)", border: "rgba(255,122,0,0.25)", label: "Effectif", icon: "Users", path: "/coach/effectif" },
      { main: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)", label: "Composition", icon: "Shield", path: "/coach/lineup" },
      { main: "#10b981", bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.25)", label: "Entraînement", icon: "Activity", path: "/coach/training" },
      { main: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)", label: "Centre Médical", icon: "HeartPulse", path: "/coach/medical" },
      { main: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.25)", label: "Tactique", icon: "Target", path: "/coach/tactical" },
      { main: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)", label: "Analyse Match", icon: "Flag", path: "/coach/match-analysis" },
      { main: "#0d9488", bg: "rgba(13,148,136,0.10)", border: "rgba(13,148,136,0.25)", label: "Assistant IA", icon: "Brain", path: "/coach/ai" },
    ] as QuickAccessItem[],
  };

  const iconMap: Record<string, ComponentType<{ size?: number; style?: CSSProperties }>> = {
    Users,
    Shield,
    Activity,
    HeartPulse,
    Target,
    Flag,
    Brain,
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-4">
        <GlassCard className="max-w-md p-6 text-center">
          <AlertTriangle size={28} className="mx-auto mb-3" style={{ color: "#ef4444" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-state-danger)" }}>{error}</p>
        </GlassCard>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const disponibles = players.filter((p) => p.status === "DISPONIBLE");
  const blesses = players.filter((p) => p.status === "BLESSE");
  const limites = players.filter((p) => p.status === "LIMITE");
  const dispoPercent =
    players.length > 0 ? Math.round((disponibles.length / players.length) * 100) : 0;

  const todayEvents = calendarEvents
    .filter((e) => eventDateKey(e) === today)
    .slice(0, 5);

  const nextMatch =
    calendarEvents
      .filter((e) => eventType(e) === "MATCH")
      .sort(
        (a, b) =>
          new Date(String(a.eventDate ?? a.date)).getTime() -
          new Date(String(b.eventDate ?? b.date)).getTime(),
      )[0] ?? null;

  const daysToMatch = nextMatch
    ? Math.ceil(
        (new Date(String(nextMatch.eventDate ?? nextMatch.date)).getTime() - Date.now()) /
          86400000,
      )
    : null;

  const todayTraining = todayEvents.find((e) => eventType(e) === "ENTRAINEMENT");

  const alerts: CoachAlert[] = [
    ...injuries.map((inj) => ({
      level: "danger" as const,
      message: `${String(inj.name ?? "")} — ${String(inj.injury ?? inj.injuryType ?? "Blessure")}`,
      sub: `Retour estimé: ${String(inj.returnDate ?? "—")}`,
      link: "/coach/medical",
    })),
    ...injuries
      .filter((inj) => String(inj.returnDate ?? "").slice(0, 10) === today)
      .map((inj) => ({
        level: "success" as const,
        message: `Retour prévu aujourd'hui — ${String(inj.name ?? "")}`,
        sub: "Évaluation médicale recommandée",
        link: "/coach/medical",
      })),
    ...limites.map((p) => ({
      level: "warning" as const,
      message: `${String(p.fullName ?? "")} — En surveillance médicale`,
      sub: "Charge d'entraînement à surveiller",
      link: "/coach/medical",
    })),
  ].slice(0, 5);

  const briefing = [
    `${disponibles.length} joueur${disponibles.length > 1 ? "s" : ""} disponible${disponibles.length > 1 ? "s" : ""} pour l'entraînement.`,
    blesses.length > 0
      ? `${blesses.length} joueur${blesses.length > 1 ? "s" : ""} indisponible${blesses.length > 1 ? "s" : ""} pour blessure.`
      : "Aucune blessure active dans l'effectif.",
    nextMatch
      ? `Prochain match dans ${daysToMatch} jour${daysToMatch !== 1 ? "s" : ""} contre ${String(nextMatch.opponent ?? nextMatch.title ?? "adversaire inconnu")}.`
      : "Aucun match programmé prochainement.",
  ].join(" ");

  const coachName = user?.fullName?.split(" ")[0] ?? "Coach";

  const KPIS: {
    label: string;
    value: string | number;
    c: ColorSet;
    icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  }[] = [
    { label: "Total joueurs", value: players.length, c: COLORS.total, icon: Users },
    { label: "Disponibles", value: disponibles.length, c: COLORS.dispo, icon: CheckCircle2 },
    { label: "Limités", value: limites.length, c: COLORS.limite, icon: AlertTriangle },
    { label: "Blessés", value: blesses.length, c: COLORS.blesse, icon: Zap },
    { label: "Disponibilité", value: `${dispoPercent}%`, c: COLORS.pct, icon: TrendingUp },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* SECTION 1: HEADER */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {`👋 Bienvenue, ${coachName}`}
          </motion.h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {nextMatch ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: COLORS.match.bg,
              border: `1px solid ${COLORS.match.border}`,
              borderRadius: 16,
              padding: "14px 20px",
              boxShadow: COLORS.match.glow,
              minWidth: 260,
              borderLeft: `4px solid ${COLORS.match.main}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Swords size={14} style={{ color: COLORS.match.main }} />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.match.main,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Prochain Match
              </span>
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              {String(nextMatch.opponent ?? nextMatch.title ?? "À définir")}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {String(nextMatch.competition ?? "Ligue 1")}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: COLORS.match.main,
                  background: COLORS.match.bg,
                  padding: "2px 10px",
                  borderRadius: 99,
                }}
              >
                {daysToMatch === 0
                  ? "Aujourd'hui !"
                  : daysToMatch === 1
                    ? "Demain"
                    : `Dans ${daysToMatch}j`}
              </span>
            </div>
          </motion.div>
        ) : null}
      </div>

      {/* SECTION 2: SQUAD KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {KPIS.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                background: k.c.bg,
                border: `1px solid ${k.c.border}`,
                borderLeft: `4px solid ${k.c.main}`,
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: k.c.main,
                      lineHeight: 1,
                    }}
                  >
                    {k.value}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                    {k.label}
                  </p>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: k.c.border,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} style={{ color: k.c.main }} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* SECTION 3: TODAY'S TRAINING */}
      {todayTraining ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: COLORS.training.bg,
            border: `1px solid ${COLORS.training.border}`,
            borderLeft: `4px solid ${COLORS.training.main}`,
            borderRadius: 16,
            padding: "18px 22px",
            boxShadow: COLORS.training.glow,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "rgba(16,185,129,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Activity size={22} style={{ color: COLORS.training.main }} />
            </div>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.training.main,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Entraînement du jour
              </p>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: 2,
                }}
              >
                {String(todayTraining.title ?? "Séance d'entraînement")}
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 6, flexWrap: "wrap" }}>
                {todayTraining.eventTime ? (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Clock size={11} />
                    {String(todayTraining.eventTime)}
                  </span>
                ) : null}
                {todayTraining.location ? (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    📍 {String(todayTraining.location)}
                  </span>
                ) : null}
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  👥 {disponibles.length} joueurs attendus
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/coach/training")}
            style={{
              background: COLORS.training.main,
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            Voir détails <ChevronRight size={14} />
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Activity size={20} style={{ color: "var(--text-muted)" }} />
            <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Aucun entraînement planifié aujourd'hui
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/coach/training")}
            style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Planifier une séance →
          </button>
        </motion.div>
      )}

      {/* SECTION 4: 2-COLUMN GRID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* LEFT — Today's Schedule */}
        <div
          style={{
            background: COLORS.schedule.bg,
            border: `1px solid ${COLORS.schedule.border}`,
            borderRadius: 16,
            padding: "18px 20px",
            borderLeft: `4px solid ${COLORS.schedule.main}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Calendar size={15} style={{ color: COLORS.schedule.main }} />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              Planning du jour
            </h3>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: COLORS.schedule.main,
                background: COLORS.schedule.bg,
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              {todayEvents.length} événement{todayEvents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {todayEvents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <Calendar
                size={32}
                style={{ color: "var(--text-muted)", margin: "0 auto 8px", display: "block" }}
              />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Aucune activité planifiée aujourd'hui
              </p>
              <button
                type="button"
                onClick={() => navigate("/coach/training")}
                style={{
                  fontSize: 12,
                  color: "var(--accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginTop: 8,
                  fontWeight: 600,
                }}
              >
                Ajouter au calendrier →
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {todayEvents.map((e, i) => {
                const type = eventType(e);
                const typeColor =
                  type === "MATCH"
                    ? "#3b82f6"
                    : type === "MEDICAL"
                      ? "#ef4444"
                      : type === "REUNION"
                        ? "#8b5cf6"
                        : "#10b981";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                      borderLeft: `3px solid ${typeColor}`,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: typeColor,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${typeColor}`,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {String(e.title ?? e.name ?? "Événement")}
                      </p>
                      {e.location ? (
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          📍 {String(e.location)}
                        </p>
                      ) : null}
                    </div>
                    {e.eventTime ?? e.time ? (
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: typeColor,
                          flexShrink: 0,
                        }}
                      >
                        {String(e.eventTime ?? e.time)}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Alerts */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "18px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <AlertTriangle
              size={15}
              style={{ color: alerts.length > 0 ? "#ef4444" : "#22c55e" }}
            />
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              Alertes
            </h3>
            {alerts.length > 0 ? (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.10)",
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontWeight: 600,
                }}
              >
                {alerts.length} alerte{alerts.length > 1 ? "s" : ""}
              </span>
            ) : null}
          </div>

          {alerts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <CheckCircle2
                size={32}
                style={{ color: "#22c55e", margin: "0 auto 8px", display: "block" }}
              />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Aucune alerte — Effectif en bonne santé
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.map((a, i) => {
                const c =
                  a.level === "danger"
                    ? COLORS.alertDanger
                    : a.level === "warning"
                      ? COLORS.alertWarning
                      : COLORS.alertSuccess;
                return (
                  <motion.div
                    key={`${a.message}-${i}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      borderLeft: `4px solid ${c.main}`,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {a.message}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                        {a.sub}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(a.link)}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: c.main,
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                        borderRadius: 8,
                        padding: "4px 10px",
                        cursor: "pointer",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Voir →
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: COACH BRIEFING */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: COLORS.briefing.bg,
          border: `1px solid ${COLORS.briefing.border}`,
          borderLeft: `4px solid ${COLORS.briefing.main}`,
          borderRadius: 16,
          padding: "18px 22px",
          boxShadow: COLORS.briefing.glow,
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "rgba(13,148,136,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Brain size={20} style={{ color: COLORS.briefing.main }} />
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: COLORS.briefing.main,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 8,
            }}
          >
            Briefing Coach
          </p>
          <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.7 }}>
            {briefing}
          </p>
        </div>
      </motion.div>

      {/* SECTION 6: QUICK ACCESS */}
      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 12,
          }}
        >
          Accès rapide
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {COLORS.quickAccess.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Users;
            return (
              <motion.button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  borderRadius: 14,
                  padding: "16px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 20px ${item.border}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} style={{ color: item.main }} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    textAlign: "center",
                    lineHeight: 1.3,
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
