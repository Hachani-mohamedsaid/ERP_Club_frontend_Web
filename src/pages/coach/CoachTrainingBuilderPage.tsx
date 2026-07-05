import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Calendar,
  Clock,
  Zap,
  CheckCircle2,
  Loader2,
  MapPin,
  ChevronRight,
  Target,
  Users,
} from "lucide-react";
import { CoachPageTransition, CCard } from "../../components/coach2/CoachPageTransition";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

type SessionType = "Physique" | "Tactique" | "Technique" | "Vidéo" | "Match";
type Intensity = "Faible" | "Modérée" | "Élevée" | "Maximale";

const TYPE_COLORS: Record<string, { main: string; bg: string; border: string }> = {
  Physique: { main: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
  Tactique: { main: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.25)" },
  Technique: { main: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)" },
  Vidéo: { main: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  Match: { main: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)" },
  Récupération: { main: "#0d9488", bg: "rgba(13,148,136,0.10)", border: "rgba(13,148,136,0.25)" },
  Musculation: { main: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.25)" },
};

const INTENSITY_COLORS: Record<string, string> = {
  Faible: "#22c55e",
  Modérée: "#f59e0b",
  Élevée: "#ff7a00",
  Maximale: "#ef4444",
};

const getTypeColor = (type: string) =>
  TYPE_COLORS[type] ?? {
    main: "#6b7280",
    bg: "rgba(107,114,128,0.10)",
    border: "rgba(107,114,128,0.25)",
  };

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
};

const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
};

const EMPTY_FORM = {
  type: "Tactique" as SessionType,
  date: new Date().toISOString().split("T")[0],
  time: "09:00",
  duration: 90,
  intensity: "Modérée" as Intensity,
  objective: "",
  location: "",
  notes: "",
};

type CalendarEvent = Record<string, unknown>;

function normalizeCalendar(raw: unknown): CalendarEvent[] {
  if (Array.isArray(raw)) return raw as CalendarEvent[];
  if (raw && typeof raw === "object") {
    const data = raw as Record<string, unknown>;
    if (Array.isArray(data.events)) return data.events as CalendarEvent[];
    if (Array.isArray(data.data)) return data.data as CalendarEvent[];
  }
  return [];
}

function eventDateStr(e: CalendarEvent): string {
  return String(e.eventDate ?? e.date ?? "").slice(0, 10);
}

function eventTypeStr(e: CalendarEvent): string {
  return String(e.eventType ?? e.type ?? "").toUpperCase();
}

function typeKeyFromTitle(e: CalendarEvent): string {
  return String(e.title ?? "")
    .split("—")[0]
    ?.trim() ?? "";
}

function intensityFromDescription(desc: string | undefined): string {
  if (!desc?.includes("Intensité:")) return "";
  return desc.split("Intensité:")[1]?.split(".")[0]?.trim() ?? "";
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 10,
  fontSize: 13,
  color: "var(--text-primary)",
  outline: "none",
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "rgba(255,255,255,0.45)",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  display: "block",
  marginBottom: 6,
};

export function CoachTrainingBuilderPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarRaw, setCalendarRaw] = useState<CalendarEvent[]>([]);
  const [playersData, setPlayersData] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      let calendarData: CalendarEvent[] = [];
      let players: CalendarEvent[] = [];

      try {
        const res = await apiFetch("/club/calendar");
        if (res.ok) {
          const json = await res.json();
          calendarData = normalizeCalendar(json);
        }
      } catch (e) {
        console.warn(e);
      }

      try {
        const res = await clubApi.getPlayers();
        players = Array.isArray(res) ? (res as CalendarEvent[]) : [];
      } catch (e) {
        console.warn(e);
      }

      if (cancelled) return;
      setCalendarRaw(calendarData);
      setPlayersData(players);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const disponibles = useMemo(
    () => playersData.filter((p) => String(p.status ?? "") === "DISPONIBLE").length,
    [playersData],
  );

  const allSessions = useMemo(
    () => calendarRaw.filter((e) => eventTypeStr(e).includes("ENTR")),
    [calendarRaw],
  );

  const todaySession = useMemo(
    () => allSessions.find((s) => eventDateStr(s) === today),
    [allSessions, today],
  );

  const upcoming = useMemo(
    () =>
      allSessions
        .filter((s) => eventDateStr(s) >= today)
        .sort((a, b) => eventDateStr(a).localeCompare(eventDateStr(b))),
    [allSessions, today],
  );

  const done = useMemo(
    () =>
      allSessions
        .filter((s) => eventDateStr(s) < today)
        .sort((a, b) => eventDateStr(b).localeCompare(eventDateStr(a))),
    [allSessions, today],
  );

  const thisWeekSessions = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);
    return allSessions.filter((s) => {
      const d = new Date(eventDateStr(s));
      return d >= weekStart && d <= weekEnd;
    });
  }, [allSessions]);

  const nextMatch = useMemo(
    () =>
      calendarRaw.find(
        (e) => eventTypeStr(e) === "MATCH" && eventDateStr(e) >= today,
      ),
    [calendarRaw, today],
  );

  const daysToMatch = useMemo(() => {
    if (!nextMatch) return null;
    const matchDate = new Date(String(nextMatch.eventDate ?? nextMatch.date ?? ""));
    return Math.ceil((matchDate.getTime() - Date.now()) / 86400000);
  }, [nextMatch]);

  const addSession = async () => {
    if (!form.date || !form.objective) return;
    setSubmitting(true);
    try {
      const res = await apiFetch("/club/calendar", {
        method: "POST",
        body: JSON.stringify({
          title: `${form.type} — ${form.objective}`,
          eventDate: form.date,
          eventTime: form.time,
          eventType: "ENTRAINEMENT",
          location: form.location || "Terrain principal",
          description: `Intensité: ${form.intensity}. ${form.notes || ""}`,
        }),
      });
      if (res.ok) {
        const updated = await apiFetch("/club/calendar");
        if (updated.ok) {
          const json = await updated.json();
          setCalendarRaw(normalizeCalendar(json));
        }
        setShowModal(false);
        setForm(EMPTY_FORM);
      }
    } catch (e) {
      console.warn("Create session failed:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const KPI_ITEMS = [
    {
      label: "Cette semaine",
      value: thisWeekSessions.length,
      sub: "séances planifiées",
      main: "#ff7a00",
      bg: "rgba(255,122,0,0.10)",
      border: "rgba(255,122,0,0.25)",
      icon: Calendar,
    },
    {
      label: "Effectuées",
      value: done.length,
      sub: "séances terminées",
      main: "#22c55e",
      bg: "rgba(34,197,94,0.10)",
      border: "rgba(34,197,94,0.25)",
      icon: CheckCircle2,
    },
    {
      label: "Joueurs dispo",
      value: disponibles,
      sub: "pour l'entraînement",
      main: "#3b82f6",
      bg: "rgba(59,130,246,0.10)",
      border: "rgba(59,130,246,0.25)",
      icon: Users,
    },
    {
      label: "Prochain match",
      value: daysToMatch !== null ? `J-${daysToMatch}` : "—",
      sub: String(nextMatch?.title ?? "Aucun match prévu"),
      main: "#8b5cf6",
      bg: "rgba(139,92,246,0.10)",
      border: "rgba(139,92,246,0.25)",
      icon: Zap,
    },
  ] as const;

  if (loading) {
    return (
      <CoachPageTransition>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin" size={32} style={{ color: "#ff7a00" }} />
        </div>
      </CoachPageTransition>
    );
  }

  const todayTypeKey = todaySession ? typeKeyFromTitle(todaySession) : "";
  const todayColor = getTypeColor(todayTypeKey);

  return (
    <CoachPageTransition>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)" }}>
              Planning des Séances
            </h1>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
              {upcoming.length} à venir · {done.length} effectuées
            </p>
          </div>
          <motion.button
            type="button"
            onClick={() => {
              setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
              setShowModal(true);
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "linear-gradient(135deg,#ff7a00,#e66000)",
              boxShadow: "0 0 20px rgba(255,122,0,0.35)",
              color: "white",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Plus size={15} />
            Créer une séance
          </motion.button>
        </div>

        {/* Hero: today's session */}
        {todaySession ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "20px 24px",
              borderRadius: 16,
              background: todayColor.bg,
              border: `1px solid ${todayColor.border}`,
              borderLeft: `4px solid ${todayColor.main}`,
              boxShadow: `0 0 24px ${todayColor.main}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: todayColor.bg,
                  border: `1px solid ${todayColor.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Target size={22} style={{ color: todayColor.main }} />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: todayColor.main,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 4,
                  }}
                >
                  Séance du jour
                </p>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  {String(todaySession.title ?? "Séance d'entraînement")}
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {todaySession.eventTime ? (
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
                      {String(todaySession.eventTime)}
                    </span>
                  ) : null}
                  {todaySession.location ? (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <MapPin size={11} />
                      {String(todaySession.location)}
                    </span>
                  ) : null}
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Users size={11} />
                    {disponibles} joueurs disponibles
                  </span>
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "white",
                background: todayColor.main,
                padding: "6px 14px",
                borderRadius: 99,
              }}
            >
              Planifiée
            </span>
          </motion.div>
        ) : (
          <div
            style={{
              padding: "18px 24px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Target size={20} style={{ color: "var(--text-muted)" }} />
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
                Aucune séance planifiée aujourd&apos;hui
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
                setShowModal(true);
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#ff7a00",
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Planifier <ChevronRight size={13} />
            </button>
          </div>
        )}

        {/* KPIs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {KPI_ITEMS.map(({ label, value, sub, main, bg, border, icon: Icon }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              style={{
                padding: "16px 18px",
                borderRadius: 14,
                background: bg,
                border: `1px solid ${border}`,
                borderLeft: `4px solid ${main}`,
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
                  <p style={{ fontSize: 28, fontWeight: 800, color: main, lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginTop: 6 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2, opacity: 0.7 }}>
                    {sub}
                  </p>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${main}20`,
                    border: `1px solid ${border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} style={{ color: main }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sessions list + detail */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 10,
                }}
              >
                Prochaines séances ({upcoming.length})
              </p>

              {upcoming.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    borderRadius: 14,
                    border: "1px dashed rgba(255,255,255,0.08)",
                  }}
                >
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Aucune séance à venir</p>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...EMPTY_FORM, date: new Date().toISOString().split("T")[0] });
                      setShowModal(true);
                    }}
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: "#ff7a00",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    + Créer la première séance
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {upcoming.map((s, i) => {
                    const typeKey = typeKeyFromTitle(s);
                    const c = getTypeColor(typeKey);
                    const isSelected = selected?.id === s.id;
                    const desc = String(s.description ?? "");
                    const intensity = intensityFromDescription(desc);
                    return (
                      <motion.div
                        key={String(s.id ?? i)}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelected(isSelected ? null : s)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "14px 16px",
                          borderRadius: 14,
                          background: isSelected ? c.bg : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isSelected ? c.border : "rgba(255,255,255,0.06)"}`,
                          borderLeft: `4px solid ${c.main}`,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: c.bg,
                            border: `1px solid ${c.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Target size={18} style={{ color: c.main }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: c.main }}>
                              {typeKey || String(s.title ?? "")}
                            </p>
                            {intensity ? (
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: INTENSITY_COLORS[intensity] ?? "#6b7280",
                                  background: "rgba(255,255,255,0.06)",
                                  padding: "2px 8px",
                                  borderRadius: 99,
                                }}
                              >
                                {intensity}
                              </span>
                            ) : null}
                          </div>
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--text-primary)",
                              marginBottom: 4,
                              fontWeight: 500,
                            }}
                          >
                            {String(s.title ?? "")
                              .split("—")[1]
                              ?.trim() ?? String(s.title ?? "")}
                          </p>
                          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              <Calendar size={10} />
                              {formatDate(eventDateStr(s))}
                            </span>
                            {s.eventTime ? (
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
                                {String(s.eventTime)}
                              </span>
                            ) : null}
                            {s.location ? (
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
                                {String(s.location)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            padding: "4px 10px",
                            borderRadius: 99,
                            flexShrink: 0,
                          }}
                        >
                          À venir
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {done.length > 0 && (
              <div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 10,
                    marginTop: 8,
                  }}
                >
                  Séances effectuées ({done.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {done.map((s, i) => {
                    const typeKey = typeKeyFromTitle(s);
                    const c = getTypeColor(typeKey);
                    return (
                      <motion.div
                        key={String(s.id ?? `done-${i}`)}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 16px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.015)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          borderLeft: `3px solid ${c.main}`,
                          opacity: 0.75,
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: c.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle2 size={16} style={{ color: c.main }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: c.main, marginBottom: 2 }}>
                            {typeKey || String(s.title ?? "")}
                          </p>
                          <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {formatDateShort(eventDateStr(s))}
                            {s.location ? ` · ${String(s.location)}` : ""}
                          </p>
                        </div>
                        <CheckCircle2 size={16} style={{ color: "#22c55e" }} />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {upcoming.length === 0 && done.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-muted)" }}>
                  Aucune séance enregistrée
                </p>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Créez votre première séance d&apos;entraînement
                </p>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={String(selected.id ?? "sel")}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <CCard glow>
                  {(() => {
                    const selType = typeKeyFromTitle(selected);
                    const selColor = getTypeColor(selType);
                    const selDesc = String(selected.description ?? "");
                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 16,
                            paddingBottom: 12,
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 12,
                                background: selColor.bg,
                                border: `1px solid ${selColor.border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Target size={18} style={{ color: selColor.main }} />
                            </div>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 800, color: selColor.main }}>
                                {selType}
                              </p>
                              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                                {formatDate(eventDateStr(selected))}
                                {selected.eventTime ? ` · ${String(selected.eventTime)}` : ""}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelected(null)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <X size={12} style={{ color: "var(--text-muted)" }} />
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {[
                            {
                              label: "Objectif",
                              value:
                                String(selected.title ?? "")
                                  .split("—")[1]
                                  ?.trim() ?? String(selected.title ?? "—"),
                            },
                            { label: "Lieu", value: String(selected.location ?? "—") },
                            {
                              label: "Durée",
                              value: selected.duration ? `${String(selected.duration)} min` : "—",
                            },
                            {
                              label: "Intensité",
                              value: intensityFromDescription(selDesc) || "—",
                            },
                            {
                              label: "Joueurs attendus",
                              value: `${disponibles} disponibles`,
                            },
                          ].map((row) => (
                            <div
                              key={row.label}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 0",
                                borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                              }}
                            >
                              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                {row.label}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>

                        {selDesc ? (
                          <div
                            style={{
                              marginTop: 12,
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{selDesc}</p>
                          </div>
                        ) : null}
                      </>
                    );
                  })()}
                </CCard>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <CCard>
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Calendar
                      size={32}
                      style={{ color: "var(--text-muted)", margin: "0 auto 12px", display: "block" }}
                    />
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Sélectionner une séance</p>
                  </div>
                </CCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)" }}
            onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                width: "100%",
                maxWidth: 480,
                background: "rgba(14,10,35,0.98)",
                border: "1px solid rgba(255,122,0,0.30)",
                borderTop: "4px solid #ff7a00",
                borderRadius: 20,
                padding: 24,
              }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                  Nouvelle séance d&apos;entraînement
                </p>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    borderRadius: 8,
                    padding: 6,
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <span style={labelStyle}>Type de séance</span>
                  <div className="flex flex-wrap gap-2">
                    {(["Physique", "Tactique", "Technique", "Vidéo", "Match"] as const).map((t) => {
                      const c = getTypeColor(t);
                      return (
                        <motion.button
                          key={t}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, type: t }))}
                          whileHover={{ scale: 1.04 }}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 99,
                            fontSize: 12,
                            fontWeight: 600,
                            background: form.type === t ? c.bg : "rgba(255,255,255,0.05)",
                            color: form.type === t ? c.main : "var(--text-muted)",
                            border: `1px solid ${form.type === t ? c.border : "transparent"}`,
                            cursor: "pointer",
                          }}
                        >
                          {t}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span style={labelStyle}>Date</span>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <span style={labelStyle}>Heure</span>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span style={labelStyle}>Durée (min)</span>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm((p) => ({ ...p, duration: +e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <span style={labelStyle}>Intensité</span>
                    <select
                      value={form.intensity}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, intensity: e.target.value as Intensity }))
                      }
                      style={{ ...inputStyle, background: "rgba(10,8,28,0.95)" }}
                    >
                      {(["Faible", "Modérée", "Élevée", "Maximale"] as const).map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span style={labelStyle}>Objectif de séance</span>
                  <input
                    placeholder="Ex: Pressing haut, transitions rapides..."
                    value={form.objective}
                    onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <span style={labelStyle}>Lieu</span>
                  <input
                    placeholder="Ex: Terrain principal, Salle de sport..."
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <span style={labelStyle}>Notes (optionnel)</span>
                  <textarea
                    placeholder="Observations, consignes..."
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.20)",
                  marginTop: 16,
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Users size={13} style={{ color: "#22c55e" }} />
                <p style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>
                  {disponibles} joueurs disponibles pour cette séance
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.10)",
                    padding: "10px 16px",
                    fontSize: 12,
                    color: "var(--text-muted)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
                <motion.button
                  type="button"
                  onClick={addSession}
                  disabled={submitting || !form.date || !form.objective}
                  whileHover={{ scale: submitting ? 1 : 1.04 }}
                  whileTap={{ scale: submitting ? 1 : 0.96 }}
                  style={{
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                    background: "linear-gradient(135deg,#ff7a00,#e66000)",
                    border: "none",
                    cursor: submitting || !form.date || !form.objective ? "not-allowed" : "pointer",
                    opacity: submitting || !form.date || !form.objective ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  Créer la séance
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CoachPageTransition>
  );
}
