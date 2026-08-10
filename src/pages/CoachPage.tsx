import { useEffect, useMemo, useState } from "react";
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
  ChevronRight,
  Activity,
  HeartPulse,
  Target,
  Flag,
  Loader2,
  TrendingUp,
  Swords,
  Trophy,
  MapPin,
  Plus,
  BarChart3,
  Zap as ZapIcon,
} from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { useAuth } from "../contexts/AuthContext";
import { clubApi } from "../lib/api/club";
import { apiFetch } from "../lib/api/authHeaders";

const C = {
  orange: { main: "#ff7a00", bg: "rgba(255,122,0,0.10)", border: "rgba(255,122,0,0.25)" },
  green: { main: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)" },
  red: { main: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
  amber: { main: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  blue: { main: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)" },
  violet: { main: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.25)" },
  teal: { main: "#0d9488", bg: "rgba(13,148,136,0.08)", border: "rgba(13,148,136,0.20)" },
  indigo: { main: "#6366f1", bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.20)" },
};

type PlayerRow = Record<string, unknown>;
type InjuryRow = Record<string, unknown>;
type CalendarRow = Record<string, unknown>;

interface CoachAlert {
  level: "danger" | "warning" | "success" | "info";
  message: string;
  sub: string;
  link: string;
}

interface SeasonObjective {
  id: string;
  label: string;
  done: boolean;
}

function normalizePlayers(raw: unknown): PlayerRow[] {
  if (!Array.isArray(raw)) return [];
  return raw as PlayerRow[];
}

function normalizeInjuries(raw: unknown): InjuryRow[] {
  if (Array.isArray(raw)) return raw as InjuryRow[];
  if (raw && typeof raw === "object") {
    const d = raw as Record<string, unknown>;
    if (Array.isArray(d.injured)) return d.injured as InjuryRow[];
  }
  return [];
}

function normalizeCalendar(raw: unknown): CalendarRow[] {
  if (Array.isArray(raw)) return raw as CalendarRow[];
  if (raw && typeof raw === "object") {
    const d = raw as Record<string, unknown>;
    if (Array.isArray(d.events)) return d.events as CalendarRow[];
  }
  return [];
}

function eventType(e: CalendarRow): string {
  return String(e.eventType ?? e.type ?? "").toUpperCase();
}

function eventDateKey(e: CalendarRow): string {
  return String(e.eventDate ?? e.date ?? "").slice(0, 10);
}

const lsGet = <T,>(key: string, def: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
};

const lsSet = (key: string, val: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
};

export function CoachPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarRow[]>([]);
  const [nextMatchData, setNextMatchData] = useState<Record<string, unknown> | null>(null);
  const [daysToNextMatch, setDaysToNextMatch] = useState<number | null>(null);
  const [pastMatches, setPastMatches] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [objectives, setObjectives] = useState<SeasonObjective[]>(() =>
    lsGet("odin_season_objectives", [
      { id: "1", label: "Top 4 au championnat", done: false },
      { id: "2", label: "Atteindre la finale de Coupe", done: false },
      { id: "3", label: "Effectif à 80% disponible", done: false },
    ])
  );
  const [newObjective, setNewObjective] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [playersRes, injuriesRes, calendarRes, matchesRes] = await Promise.all([
          clubApi.getPlayers(),
          clubApi.getInjuries(),
          apiFetch("/club/calendar").then((r) => r.json()),
          apiFetch("/club/matches").then((r) => r.json()),
        ]);
        if (cancelled) return;
        setPlayers(normalizePlayers(playersRes));
        setInjuries(normalizeInjuries(injuriesRes));
        setCalendarEvents(normalizeCalendar(calendarRes));
        if (matchesRes?.nextMatch) {
          setNextMatchData(matchesRes.nextMatch);
          setDaysToNextMatch(matchesRes.daysToNext ?? null);
        } else {
          setNextMatchData(null);
          setDaysToNextMatch(null);
        }
        setPastMatches(Array.isArray(matchesRes?.past) ? matchesRes.past : []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur de chargement.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const coachName = user?.fullName?.split(" ")[0] ?? "Coach";

  const disponibles = players.filter(
    (p) => String(p.status ?? "").toUpperCase() === "DISPONIBLE"
  );
  const blesses = players.filter(
    (p) => String(p.status ?? "").toUpperCase() === "BLESSE"
  );
  const limites = players.filter(
    (p) => String(p.status ?? "").toUpperCase() === "LIMITE"
  );
  const dispoPercent =
    players.length > 0
      ? Math.round((disponibles.length / players.length) * 100)
      : 0;

  const todayEvents = calendarEvents
    .filter((e) => eventDateKey(e) === today)
    .slice(0, 5);

  const todayTraining = todayEvents.find((e) => eventType(e).includes("ENTR"));

  const teamForm = pastMatches.slice(0, 5).map((m) => String(m.result ?? "—"));

  const alerts = useMemo((): CoachAlert[] => {
    const list: CoachAlert[] = [];

    injuries.forEach((inj) => {
      list.push({
        level: "danger",
        message: `${String(inj.name ?? "")} — ${String(inj.injury ?? inj.injuryType ?? "Blessure")}`,
        sub: `Retour estimé: ${String(inj.returnDate ?? "—")}`,
        link: "/coach/medical",
      });
    });

    if (
      daysToNextMatch !== null &&
      daysToNextMatch <= 3 &&
      daysToNextMatch >= 0
    ) {
      list.push({
        level: "info",
        message: `Match dans ${daysToNextMatch}j — vs ${String(nextMatchData?.opponent ?? "")}`,
        sub: "Finaliser la composition et le plan tactique",
        link: "/matches",
      });
    }

    limites.forEach((p) => {
      list.push({
        level: "warning",
        message: `${String(p.fullName ?? "")} — Sous surveillance`,
        sub: "Charge d'entraînement à adapter",
        link: "/coach/medical",
      });
    });

    if (!todayTraining) {
      list.push({
        level: "info",
        message: "Aucune séance planifiée aujourd'hui",
        sub: "Planifier une séance d'entraînement",
        link: "/coach/training-builder",
      });
    }

    return list.slice(0, 6);
  }, [injuries, limites, daysToNextMatch, nextMatchData, todayTraining]);

  const top6Players = players.slice(0, 6);

  const briefing = useMemo(
    () =>
      [
        `${disponibles.length} joueur${disponibles.length > 1 ? "s" : ""} disponible${disponibles.length > 1 ? "s" : ""} pour l'entraînement.`,
        blesses.length > 0
          ? `${blesses.length} joueur${blesses.length > 1 ? "s" : ""} indisponible${blesses.length > 1 ? "s" : ""} pour blessure.`
          : "Aucune blessure active.",
        nextMatchData
          ? `Prochain match dans ${daysToNextMatch}j contre ${String(nextMatchData.opponent)} — ${String(nextMatchData.competition)}.`
          : "Aucun match programmé prochainement.",
        dispoPercent < 70
          ? "Effectif réduit — adapter les séances."
          : "Effectif en bonne forme globale.",
      ].join(" "),
    [disponibles, blesses, nextMatchData, daysToNextMatch, dispoPercent]
  );

  const toggleObjective = (id: string) => {
    const updated = objectives.map((o) =>
      o.id === id ? { ...o, done: !o.done } : o
    );
    setObjectives(updated);
    lsSet("odin_season_objectives", updated);
  };

  const addObjective = () => {
    if (!newObjective.trim()) return;
    const updated = [
      ...objectives,
      { id: Date.now().toString(), label: newObjective.trim(), done: false },
    ];
    setObjectives(updated);
    lsSet("odin_season_objectives", updated);
    setNewObjective("");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Loader2
          size={32}
          style={{
            color: "var(--accent)",
            animation: "spin 1s linear infinite",
          }}
        />
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          Chargement du dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
        }}
      >
        <GlassCard className="max-w-md p-6 text-center">
          <AlertTriangle
            size={28}
            style={{
              color: "#ef4444",
              margin: "0 auto 12px",
              display: "block",
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: "var(--color-state-danger)",
            }}
          >
            {error}
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* SECTION 1: HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(255,122,0,0.15)",
                border: "1px solid rgba(255,122,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={18} style={{ color: "#ff7a00" }} />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Bienvenue, {coachName}
            </h1>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginLeft: 46,
            }}
          >
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </motion.div>

        {nextMatchData ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: `linear-gradient(135deg,
          rgba(59,130,246,0.12),
          rgba(139,92,246,0.08))`,
              border: "1px solid rgba(99,102,241,0.30)",
              borderLeft: "4px solid #3b82f6",
              borderRadius: 16,
              padding: "14px 20px",
              boxShadow: "0 0 24px rgba(59,130,246,0.10)",
              minWidth: 280,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Swords size={13} style={{ color: C.blue.main }} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.blue.main,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Prochain match
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 13,
                  fontWeight: 900,
                  color: C.blue.main,
                  background: C.blue.bg,
                  padding: "2px 10px",
                  borderRadius: 99,
                }}
              >
                {daysToNextMatch === 0
                  ? "Aujourd'hui !"
                  : daysToNextMatch === 1
                    ? "Demain"
                    : `J-${daysToNextMatch}`}
              </span>
            </div>
            <p
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: 6,
              }}
            >
              vs {String(nextMatchData.opponent ?? "")}
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.55)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Trophy size={10} style={{ color: C.blue.main }} />
                {String(nextMatchData.competition ?? "")}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.55)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <MapPin size={10} style={{ color: C.violet.main }} />
                {String(nextMatchData.homeAwayLabel ?? "")}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.55)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Calendar size={10} style={{ color: C.teal.main }} />
                {String(nextMatchData.matchDate ?? "")}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: "14px 20px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Swords size={18} style={{ color: "var(--text-muted)" }} />
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                }}
              >
                Aucun match programmé
              </p>
              <button
                type="button"
                onClick={() => navigate("/matches")}
                style={{
                  fontSize: 11,
                  color: "#ff7a00",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: 0,
                  marginTop: 3,
                }}
              >
                Ajouter un match →
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* SECTION 2: KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10,
        }}
      >
        {[
          {
            label: "Disponibles",
            value: disponibles.length,
            sub: `sur ${players.length} joueurs`,
            c: C.green,
            icon: CheckCircle2,
          },
          {
            label: "Blessés",
            value: blesses.length,
            sub: "indisponibles",
            c: C.red,
            icon: HeartPulse,
          },
          {
            label: "Surveillance",
            value: limites.length,
            sub: "à observer",
            c: C.amber,
            icon: AlertTriangle,
          },
          {
            label: "Disponibilité",
            value: `${dispoPercent}%`,
            sub: "de l'effectif",
            c: C.violet,
            icon: TrendingUp,
          },
          {
            label: "Prochain match",
            value:
              daysToNextMatch !== null
                ? daysToNextMatch === 0
                  ? "Auj."
                  : `J-${daysToNextMatch}`
                : "—",
            sub: String(nextMatchData?.opponent ?? "Non planifié"),
            c: C.blue,
            icon: Swords,
          },
        ].map((k, i) => (
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
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginTop: 5,
                  }}
                >
                  {k.label}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginTop: 2,
                  }}
                >
                  {k.sub}
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
                <k.icon size={16} style={{ color: k.c.main }} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* SECTION 3: TRAINING + TEAM FORM */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {todayTraining ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: C.teal.bg,
              border: `1px solid ${C.teal.border}`,
              borderLeft: `4px solid ${C.teal.main}`,
              borderRadius: 16,
              padding: "18px 22px",
              boxShadow: "0 0 20px rgba(13,148,136,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(13,148,136,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={22} style={{ color: C.teal.main }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: C.teal.main,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 4,
                  }}
                >
                  Entraînement du jour
                </p>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {String(todayTraining.title ?? "Séance d'entraînement")}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 4,
                  }}
                >
                  {todayTraining.eventTime ? (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Clock size={10} />
                      {String(todayTraining.eventTime)}
                    </span>
                  ) : null}
                  {todayTraining.location ? (
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MapPin size={10} />
                      {String(todayTraining.location)}
                    </span>
                  ) : null}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Users size={10} />
                    {disponibles.length} joueurs
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/coach/training-builder")}
              style={{
                background: C.teal.main,
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Voir détails <ChevronRight size={13} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.10)",
              borderRadius: 16,
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Activity size={20} style={{ color: "var(--text-muted)" }} />
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                  }}
                >
                  Aucun entraînement aujourd&apos;hui
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    marginTop: 3,
                    opacity: 0.7,
                  }}
                >
                  Planifiez une séance pour votre équipe
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/coach/training-builder")}
              style={{
                fontSize: 12,
                color: "#ff7a00",
                background: "rgba(255,122,0,0.10)",
                border: "1px solid rgba(255,122,0,0.25)",
                borderRadius: 10,
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Plus size={13} />
              Planifier une séance
            </button>
          </motion.div>
        )}

        <GlassCard raised className="p-5">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <BarChart3 size={14} style={{ color: C.orange.main }} />
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Forme de l&apos;équipe
            </p>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: "var(--text-muted)",
              }}
            >
              5 derniers matchs
            </span>
          </div>

          {teamForm.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {teamForm.map((r, i) => {
                  const rc = r === "V" ? C.green : r === "N" ? C.amber : C.red;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: rc.bg,
                        border: `1px solid ${rc.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 900,
                        color: rc.main,
                        boxShadow: `0 0 12px ${rc.main}30`,
                      }}
                    >
                      {r}
                    </motion.div>
                  );
                })}
                {teamForm.length < 5 &&
                  Array(5 - teamForm.length)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px dashed rgba(255,255,255,0.10)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        —
                      </div>
                    ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                }}
              >
                {[
                  {
                    label: "Victoires",
                    val: teamForm.filter((r) => r === "V").length,
                    c: C.green,
                  },
                  {
                    label: "Nuls",
                    val: teamForm.filter((r) => r === "N").length,
                    c: C.amber,
                  },
                  {
                    label: "Défaites",
                    val: teamForm.filter((r) => r === "D").length,
                    c: C.red,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 9,
                      background: s.c.bg,
                      border: `1px solid ${s.c.border}`,
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: s.c.main,
                      }}
                    >
                      {s.val}
                    </p>
                    <p
                      style={{
                        fontSize: 9,
                        color: "var(--text-muted)",
                        marginTop: 2,
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 12,
              }}
            >
              <BarChart3
                size={28}
                style={{
                  color: "var(--text-muted)",
                  margin: "0 auto 8px",
                }}
              />
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                Aucun résultat enregistré
              </p>
              <button
                type="button"
                onClick={() => navigate("/matches")}
                style={{
                  fontSize: 11,
                  color: "#ff7a00",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                Ajouter des résultats →
              </button>
            </div>
          )}
        </GlassCard>
      </div>

      {/* SECTION 4: SCHEDULE + ALERTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <div
          style={{
            background: C.indigo.bg,
            border: `1px solid ${C.indigo.border}`,
            borderLeft: `4px solid ${C.indigo.main}`,
            borderRadius: 16,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Calendar size={14} style={{ color: C.indigo.main }} />
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Planning du jour
            </p>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: C.indigo.main,
                background: C.indigo.bg,
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              {todayEvents.length} événement(s)
            </span>
          </div>

          {todayEvents.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              <Calendar
                size={28}
                style={{
                  color: "var(--text-muted)",
                  margin: "0 auto 8px",
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                Aucune activité planifiée
              </p>
              <button
                type="button"
                onClick={() => navigate("/coach/training-builder")}
                style={{
                  fontSize: 11,
                  color: "#ff7a00",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginTop: 6,
                }}
              >
                Ajouter au calendrier →
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {todayEvents.map((e, i) => {
                const type = eventType(e);
                const tc =
                  type === "MATCH"
                    ? C.blue
                    : type === "MEDICAL"
                      ? C.red
                      : type === "REUNION"
                        ? C.violet
                        : C.teal;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                      borderLeft: `3px solid ${tc.main}`,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: tc.main,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${tc.main}`,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {String(e.title ?? e.name ?? "—")}
                      </p>
                      {e.location ? (
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            marginTop: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <MapPin size={8} />
                          {String(e.location)}
                        </p>
                      ) : null}
                    </div>
                    {e.eventTime ?? e.time ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: tc.main,
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

        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <AlertTriangle
              size={14}
              style={{
                color: alerts.some((a) => a.level === "danger")
                  ? C.red.main
                  : C.green.main,
              }}
            />
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Alertes intelligentes
            </p>
            {alerts.length > 0 ? (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: C.red.main,
                  background: C.red.bg,
                  padding: "2px 8px",
                  borderRadius: 99,
                  fontWeight: 600,
                }}
              >
                {alerts.length}
              </span>
            ) : null}
          </div>

          {alerts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              <CheckCircle2
                size={28}
                style={{
                  color: C.green.main,
                  margin: "0 auto 8px",
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                Aucune alerte — Effectif en bonne santé
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {alerts.map((a, i) => {
                const ac =
                  a.level === "danger"
                    ? C.red
                    : a.level === "warning"
                      ? C.amber
                      : a.level === "info"
                        ? C.blue
                        : C.green;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: ac.bg,
                      border: `1px solid ${ac.border}`,
                      borderLeft: `3px solid ${ac.main}`,
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.message}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {a.sub}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(a.link)}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: ac.main,
                        background: ac.bg,
                        border: `1px solid ${ac.border}`,
                        borderRadius: 7,
                        padding: "4px 8px",
                        cursor: "pointer",
                        flexShrink: 0,
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
          background: C.teal.bg,
          border: `1px solid ${C.teal.border}`,
          borderLeft: `4px solid ${C.teal.main}`,
          borderRadius: 16,
          padding: "18px 22px",
          boxShadow: "0 0 20px rgba(13,148,136,0.08)",
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
          <Brain size={20} style={{ color: C.teal.main }} />
        </div>
        <div>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: C.teal.main,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 6,
            }}
          >
            Briefing coach — IA
          </p>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-primary)",
              lineHeight: 1.7,
            }}
          >
            {briefing}
          </p>
        </div>
      </motion.div>

      {/* SECTION 6: SQUAD AVAILABILITY */}
      <GlassCard raised className="p-5">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Users size={14} style={{ color: C.orange.main }} />
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Disponibilité effectif
          </p>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 11,
              color: "var(--text-muted)",
            }}
          >
            6 meilleurs joueurs
          </span>
        </div>

        {top6Players.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              padding: "24px 0",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            Aucun joueur enregistré
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 8,
            }}
          >
            {top6Players.map((p, i) => {
              const status = String(p.status ?? "").toUpperCase();
              const sc =
                status === "DISPONIBLE"
                  ? C.green
                  : status === "BLESSE"
                    ? C.red
                    : C.amber;
              const statusLabel =
                status === "DISPONIBLE"
                  ? "Disponible"
                  : status === "BLESSE"
                    ? "Blessé"
                    : "Surveillance";
              const initials =
                String(p.fullName ?? p.name ?? "?")
                  .split(" ")
                  .map((n: string) => n[0] ?? "")
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "?";

              return (
                <motion.div
                  key={String(p.id ?? i)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/coach/player/${p.id}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 12,
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                    borderLeft: `3px solid ${sc.main}`,
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      flexShrink: 0,
                      background: `${sc.main}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 800,
                      color: sc.main,
                    }}
                  >
                    {initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {String(p.fullName ?? p.name ?? "?")}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        marginTop: 2,
                      }}
                    >
                      <motion.span
                        animate={{
                          opacity: [1, 0.3, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: sc.main,
                          display: "inline-block",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 10,
                          color: sc.main,
                          fontWeight: 600,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* SECTION 7: OBJECTIVES + ACTIONS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        <GlassCard raised className="p-5">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <Target size={14} style={{ color: C.violet.main }} />
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Objectifs de saison
            </p>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 11,
                color: C.violet.main,
                background: C.violet.bg,
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              {objectives.filter((o) => o.done).length}/{objectives.length}
            </span>
          </div>

          <div
            style={{
              height: 4,
              borderRadius: 99,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width:
                  objectives.length > 0
                    ? `${
                        (objectives.filter((o) => o.done).length /
                          objectives.length) *
                        100
                      }%`
                    : "0%",
              }}
              transition={{ duration: 0.8 }}
              style={{
                height: "100%",
                borderRadius: 99,
                background: C.violet.main,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {objectives.map((obj) => (
              <motion.div
                key={obj.id}
                onClick={() => toggleObjective(obj.id)}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 9,
                  cursor: "pointer",
                  background: obj.done ? C.green.bg : "rgba(255,255,255,0.02)",
                  border: `1px solid ${
                    obj.done ? C.green.border : "rgba(255,255,255,0.06)"
                  }`,
                  borderLeft: `2px solid ${
                    obj.done ? C.green.main : C.violet.main
                  }`,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    background: obj.done
                      ? C.green.main
                      : "rgba(255,255,255,0.08)",
                    border: `1px solid ${
                      obj.done ? C.green.main : "rgba(255,255,255,0.20)"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {obj.done ? (
                    <CheckCircle2 size={9} style={{ color: "white" }} />
                  ) : null}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-primary)",
                    textDecoration: obj.done ? "line-through" : "none",
                    flex: 1,
                  }}
                >
                  {obj.label}
                </p>
              </motion.div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <input
              placeholder="Nouvel objectif..."
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addObjective();
              }}
              style={{
                flex: 1,
                padding: "7px 10px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                fontSize: 11,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={addObjective}
              style={{
                padding: "7px 10px",
                borderRadius: 8,
                background: C.violet.bg,
                border: `1px solid ${C.violet.border}`,
                cursor: "pointer",
              }}
            >
              <Plus size={13} style={{ color: C.violet.main }} />
            </button>
          </div>
        </GlassCard>

        <GlassCard raised className="p-5">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            <ZapIcon size={14} style={{ color: C.orange.main }} />
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Accès rapide
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: 8,
            }}
          >
            {[
              {
                label: "Effectif",
                icon: Users,
                path: "/coach/effectif",
                c: C.orange,
              },
              {
                label: "Composition",
                icon: Shield,
                path: "/coach/lineup",
                c: C.blue,
              },
              {
                label: "Planification séances",
                icon: Activity,
                path: "/coach/training-builder",
                c: C.teal,
              },
              {
                label: "Centre Médical",
                icon: HeartPulse,
                path: "/coach/medical",
                c: C.red,
              },
              {
                label: "Tableau Tactique",
                icon: Target,
                path: "/coach/tactical",
                c: C.violet,
              },
              {
                label: "Analyse de match",
                icon: Flag,
                path: "/coach/match-analysis",
                c: C.amber,
              },
              {
                label: "Adversaire",
                icon: Swords,
                path: "/coach/opponent",
                c: C.indigo,
              },
              {
                label: "Assistant IA",
                icon: Brain,
                path: "/coach/ai",
                c: C.orange,
              },
            ].map((item, i) => (
              <motion.button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: item.c.bg,
                  border: `1px solid ${item.c.border}`,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 7,
                    background: `${item.c.main}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.icon size={13} style={{ color: item.c.main }} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
