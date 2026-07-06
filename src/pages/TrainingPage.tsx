import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Loader2 } from "lucide-react";
import { apiFetch } from "../lib/api/authHeaders";

const TYPE_COLORS: Record<string, { main: string; bg: string; border: string }> = {
  Physique: { main: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)" },
  Tactique: { main: "#8b5cf6", bg: "rgba(139,92,246,0.10)", border: "rgba(139,92,246,0.25)" },
  Technique: { main: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.25)" },
  Vidéo: { main: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
  Match: { main: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.25)" },
  Récupération: { main: "#0d9488", bg: "rgba(13,148,136,0.10)", border: "rgba(13,148,136,0.25)" },
  Musculation: { main: "#f97316", bg: "rgba(249,115,22,0.10)", border: "rgba(249,115,22,0.25)" },
  ENTRAINEMENT: { main: "#ff7a00", bg: "rgba(255,122,0,0.10)", border: "rgba(255,122,0,0.25)" },
};

const getTypeColor = (type: string) => {
  for (const [key, val] of Object.entries(TYPE_COLORS)) {
    if ((type ?? "").toLowerCase().includes(key.toLowerCase())) return val;
  }
  return {
    main: "#ff7a00",
    bg: "rgba(255,122,0,0.10)",
    border: "rgba(255,122,0,0.25)",
  };
};

const DAY_COLORS = ["#3b82f6", "#8b5cf6", "#ef4444", "#f59e0b", "#22c55e", "#0d9488", "#f97316"];
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

const DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function getWeekDates(offset: number): Date[] {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function TrainingPage() {
  const [loading, setLoading] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await apiFetch("/club/calendar");
        if (res.ok) {
          const json = await res.json();
          if (!cancelled) setCalendarEvents(normalizeCalendar(json));
        }
      } catch (e) {
        console.warn(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const weekLabel = `${weekStart.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })} — ${weekEnd.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  const weekEvents = useMemo(
    () =>
      calendarEvents.filter((e) => {
        const d = new Date(String(e.eventDate ?? e.date ?? ""));
        if (Number.isNaN(d.getTime())) return false;
        const start = new Date(weekStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(weekEnd);
        end.setHours(23, 59, 59, 999);
        return d >= start && d <= end;
      }),
    [calendarEvents, weekStart, weekEnd],
  );

  const grouped = useMemo(
    () =>
      weekDates.map((date, i) => ({
        day: DAYS_FR[i],
        date,
        dateStr: date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        }),
        isToday: date.toDateString() === new Date().toDateString(),
        events: weekEvents.filter((e) => {
          const d = new Date(String(e.eventDate ?? e.date ?? ""));
          return d.toDateString() === date.toDateString();
        }),
      })),
    [weekDates, weekEvents],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            Planning des Séances
          </h1>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {weekEvents.length > 0
              ? `${weekEvents.length} séance(s) planifiée(s) cette semaine`
              : "Aucune séance cette semaine"}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14,
            padding: "6px 10px",
          }}
        >
          <button
            type="button"
            onClick={() => setWeekOffset((w) => w - 1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={15} style={{ color: "var(--text-muted)" }} />
          </button>

          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-primary)",
              minWidth: 220,
              textAlign: "center",
              padding: "0 8px",
            }}
          >
            {weekLabel}
          </span>

          <button
            type="button"
            onClick={() => setWeekOffset((w) => w + 1)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={15} style={{ color: "var(--text-muted)" }} />
          </button>

          {weekOffset !== 0 && (
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#ff7a00",
                background: "rgba(255,122,0,0.10)",
                border: "1px solid rgba(255,122,0,0.25)",
                borderRadius: 8,
                padding: "4px 10px",
                cursor: "pointer",
                marginLeft: 4,
              }}
            >
              Aujourd&apos;hui
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--text-muted)", margin: "0 auto", display: "block" }}
          />
        </div>
      )}

      {!loading && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {grouped.map((day, di) => {
              const dayColor = DAY_COLORS[di];
              const hasEvents = day.events.length > 0;

              return (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: di * 0.04 }}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    border: day.isToday
                      ? "1px solid rgba(255,122,0,0.30)"
                      : "1px solid rgba(255,255,255,0.06)",
                    background: day.isToday ? "rgba(255,122,0,0.04)" : "rgba(255,255,255,0.02)",
                    boxShadow: day.isToday ? "0 0 20px rgba(255,122,0,0.08)" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      borderBottom: hasEvents ? "1px solid rgba(255,255,255,0.05)" : "none",
                      background: day.isToday ? "rgba(255,122,0,0.06)" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 32,
                        borderRadius: 99,
                        background: day.isToday ? "#ff7a00" : dayColor,
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ minWidth: 100 }}>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: day.isToday ? "#ff7a00" : "var(--text-primary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {day.day}
                      </p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
                        {day.dateStr}
                      </p>
                    </div>

                    {day.isToday && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "white",
                          background: "#ff7a00",
                          padding: "2px 10px",
                          borderRadius: 99,
                        }}
                      >
                        Aujourd&apos;hui
                      </span>
                    )}

                    <div style={{ marginLeft: "auto" }}>
                      {hasEvents ? (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: dayColor,
                            background: `${dayColor}15`,
                            border: `1px solid ${dayColor}30`,
                            padding: "3px 10px",
                            borderRadius: 99,
                          }}
                        >
                          {day.events.length} séance{day.events.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.20)",
                            fontStyle: "italic",
                          }}
                        >
                          Repos
                        </span>
                      )}
                    </div>
                  </div>

                  {hasEvents && (
                    <div style={{ padding: "8px 16px 12px" }}>
                      {day.events.map((e, ei) => {
                        const typeKey =
                          String(e.title ?? "")
                            .split("—")[0]
                            ?.trim() ||
                          String(e.eventType ?? "");
                        const c = getTypeColor(typeKey);
                        return (
                          <div
                            key={String(e.id ?? ei)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: c.bg,
                              border: `1px solid ${c.border}`,
                              borderLeft: `3px solid ${c.main}`,
                              marginTop: ei > 0 ? 6 : 0,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: c.main,
                                minWidth: 50,
                                flexShrink: 0,
                              }}
                            >
                              {String(e.eventTime ?? e.time ?? "—")}
                            </span>

                            <div
                              style={{
                                width: 1,
                                height: 28,
                                background: `${c.main}40`,
                                flexShrink: 0,
                              }}
                            />

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "var(--text-primary)",
                                  marginBottom: 3,
                                }}
                              >
                                {String(e.title ?? "")
                                  .split("—")[1]
                                  ?.trim() ?? String(e.title ?? "—")}
                              </p>
                              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                {e.location ? (
                                  <span
                                    style={{
                                      fontSize: 11,
                                      color: "var(--text-muted)",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 3,
                                    }}
                                  >
                                    <MapPin size={9} />
                                    {String(e.location)}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: c.main,
                                background: `${c.main}15`,
                                border: `1px solid ${c.border}`,
                                padding: "4px 12px",
                                borderRadius: 99,
                                flexShrink: 0,
                              }}
                            >
                              {typeKey || "Entraînement"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {weekEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "48px 24px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.01)",
                border: "1px dashed rgba(255,255,255,0.08)",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "rgba(255,122,0,0.08)",
                  border: "1px solid rgba(255,122,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Calendar size={24} style={{ color: "rgba(255,122,0,0.5)" }} />
              </div>
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Aucune séance cette semaine
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Créez des séances depuis le Training Builder
                <br />
                et elles apparaîtront automatiquement ici.
              </p>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
