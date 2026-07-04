import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Wind,
  MapPin,
  Clock,
  BarChart3,
  Flame,
  X,
  CalendarDays,
} from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { MatchPreviewCard } from "../../components/player/MatchPreviewCard";
import { useLocale } from "../../contexts/LocaleContext";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";

type PlanningEventType = "match" | "training" | "medical" | "meeting" | "recovery" | "scout" | "rest";

interface PlanningEvent {
  id: string;
  title: string;
  dateKey: string;
  dateLabel: string;
  day: number;
  month: number;
  year: number;
  start: string;
  type: PlanningEventType;
  location?: string;
}

const PLANNING_TYPE_COLORS: Record<PlanningEventType, string> = {
  match: "#FF6B57",
  training: "#3B82F6",
  medical: "#22C55E",
  meeting: "#F59E0B",
  recovery: "#8B5CF6",
  scout: "#06B6D4",
  rest: "#9CA3AF",
};

const TYPE_LABELS: Record<PlanningEventType, string> = {
  match: "Match",
  training: "Entraînement",
  medical: "Médical",
  meeting: "Réunion",
  recovery: "Récupération",
  scout: "Scout",
  rest: "Repos",
};

const TYPE_ICONS: Record<PlanningEventType, string> = {
  match: "⚽",
  training: "🏃",
  medical: "🩺",
  meeting: "📋",
  recovery: "🧊",
  scout: "🔭",
  rest: "😴",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const EVENT_TYPE_MAP: Record<string, PlanningEventType> = {
  MATCH: "match",
  ENTRAINEMENT: "training",
  MEDICAL: "medical",
  REUNION: "meeting",
  RECUPERATION: "recovery",
  SCOUT: "scout",
  REPOS: "rest",
};

function parseDateKey(raw: string): { dateKey: string; day: number; month: number; year: number } | null {
  const iso = raw.includes("T") ? raw.split("T")[0] : raw;
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (!year || month < 0 || month > 11 || !day) return null;
  return { dateKey: `${m[1]}-${m[2]}-${m[3]}`, day, month, year };
}

function formatDateLabel(dateKey: string) {
  const [y, mo, d] = dateKey.split("-");
  if (!y || !mo || !d) return dateKey;
  return `${d}/${mo}/${y}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function JoueurPlanningPage() {
  const { t } = useLocale();
  const { calendarEvents, playerStats, loading } = useJoueurBackendData();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDayEvents, setSelectedDayEvents] = useState<PlanningEvent[] | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const trainingLoad = playerStats?.trainingLoad ?? 0;
  const sess = playerStats?.trainingSessions ?? { fatiguePredicted: 0, completed: 0, total: 0, intensity: "—" };
  const loadColor = trainingLoad >= 80 ? "#EF4444" : trainingLoad >= 60 ? "#F59E0B" : "#22C55E";

  const liveEvents: PlanningEvent[] = useMemo(() => {
    return calendarEvents
      .map((e) => {
        const parsed = parseDateKey(e.eventDate);
        if (!parsed) return null;
        const typeKey = (e.eventType ?? "").toUpperCase();
        return {
          id: e.id,
          title: e.title,
          dateKey: parsed.dateKey,
          dateLabel: formatDateLabel(parsed.dateKey),
          day: parsed.day,
          month: parsed.month,
          year: parsed.year,
          start: e.eventTime ?? "—",
          type: EVENT_TYPE_MAP[typeKey] ?? "training",
          location: e.location ?? undefined,
        } satisfies PlanningEvent;
      })
      .filter((e): e is PlanningEvent => e != null)
      .sort((a, b) => {
        const byDate = a.dateKey.localeCompare(b.dateKey);
        if (byDate !== 0) return byDate;
        return a.start.localeCompare(b.start);
      });
  }, [calendarEvents]);

  const monthEvents = liveEvents.filter((e) => e.month === month && e.year === year);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const upcomingEvents = liveEvents.filter((e) => e.dateKey >= todayKey).slice(0, 6);

  function openDay(day: number) {
    const events = liveEvents.filter((e) => e.day === day && e.month === month && e.year === year);
    if (events.length === 0) return;
    if (events.length === 1) {
      setSelectedEvent(events[0]);
      setSelectedDayEvents(null);
    } else {
      setSelectedDayEvents(events);
      setSelectedEvent(null);
    }
  }

  return (
    <JoueurPageTransition>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
        <MatchPreviewCard starterLabel={t.dashboard.starterProb} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <JoueurKpiCard delay={0.05}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} style={{ color: loadColor }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {t.planning.trainingLoad}
                </h3>
              </div>
              <span className="text-lg font-black" style={{ color: loadColor }}>
                {trainingLoad}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: loadColor }}
                initial={{ width: 0 }}
                animate={{ width: `${trainingLoad}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              {sess.completed ?? 0}/{sess.total ?? 0} séances · Intensité {sess.intensity ?? "—"}
            </p>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.08}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} style={{ color: "#F59E0B" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {t.planning.fatiguePredicted}
                </h3>
              </div>
              <span className="text-lg font-black" style={{ color: "#F59E0B" }}>
                {sess.fatiguePredicted ?? 0}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#F59E0B" }}
                initial={{ width: 0 }}
                animate={{ width: `${sess.fatiguePredicted ?? 0}%` }}
                transition={{ duration: 1, delay: 0.1 }}
              />
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              Prédiction basée sur les entraînements
            </p>
          </JoueurKpiCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <JoueurKpiCard delay={0.1}>
            <div className="flex items-center gap-2">
              <Sun size={18} style={{ color: "#F59E0B" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {t.planning.weather}
              </h3>
            </div>
            <p className="mt-3 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>
              —°
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Données météo non disponibles
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Wind size={12} />
              Service météo non connecté
            </div>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.12}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {t.planning.timeline}
            </h3>
            <div className="relative space-y-0">
              {monthEvents.length > 0 ? (
                monthEvents.slice(0, 8).map((item, idx, arr) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedEvent(item)}
                    className="flex w-full gap-4 pb-6 text-left"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.06 }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ background: PLANNING_TYPE_COLORS[item.type] }}
                      />
                      {idx < arr.length - 1 && (
                        <div
                          className="mt-1 w-0.5 flex-1"
                          style={{ background: "rgba(255,255,255,0.1)", minHeight: 40 }}
                        />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: PLANNING_TYPE_COLORS[item.type] }}>
                        {item.day} — {item.start}
                      </p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.location ?? TYPE_LABELS[item.type]}
                      </p>
                    </div>
                  </motion.button>
                ))
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {loading ? "Chargement…" : "Aucun événement ce mois"}
                </p>
              )}
            </div>
          </JoueurKpiCard>
        </div>

        <div className="lg:col-span-2">
          <JoueurKpiCard delay={0.05}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
                  {monthLabel}
                </h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {monthEvents.length} événement{monthEvents.length !== 1 ? "s" : ""} · Calendrier du club
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <ChevronLeft size={16} style={{ color: "var(--text-muted)" }} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const events = liveEvents.filter(
                  (e) => e.day === day && e.month === month && e.year === year,
                );
                const isToday =
                  day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <motion.button
                    key={day}
                    type="button"
                    onClick={() => openDay(day)}
                    className="aspect-square rounded-xl border p-1 text-left"
                    style={{
                      borderColor: isToday ? "#FF6B57" : "rgba(255,255,255,0.06)",
                      background: isToday ? "rgba(255,107,87,0.08)" : "transparent",
                      cursor: events.length > 0 ? "pointer" : "default",
                    }}
                    whileHover={events.length > 0 ? { backgroundColor: "rgba(255,255,255,0.04)" } : undefined}
                  >
                    <span
                      className="text-xs font-medium"
                      style={{ color: isToday ? "#FF6B57" : "var(--text-secondary)" }}
                    >
                      {day}
                    </span>
                    {events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="mt-0.5 truncate rounded px-0.5 text-[8px] font-medium"
                        style={{
                          background: `${PLANNING_TYPE_COLORS[ev.type]}22`,
                          color: PLANNING_TYPE_COLORS[ev.type],
                        }}
                      >
                        {ev.title.slice(0, 10)}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>
                        +{events.length - 2}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {(Object.keys(TYPE_LABELS) as PlanningEventType[])
                .filter((type) => type !== "rest" || liveEvents.some((e) => e.type === "rest"))
                .map((type) => (
                  <div key={type} className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: PLANNING_TYPE_COLORS[type] }} />
                    {TYPE_LABELS[type]}
                  </div>
                ))}
            </div>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.12}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {t.planning.upcoming}
            </h3>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {loading
                  ? "Chargement du calendrier…"
                  : "Aucun événement à venir. Le staff (coach, médical, admin) ajoute les événements au calendrier du club."}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {upcomingEvents.map((ev, idx) => (
                  <motion.button
                    key={ev.id}
                    type="button"
                    onClick={() => setSelectedEvent(ev)}
                    className="flex gap-4 rounded-[20px] border p-4 text-left transition-all hover:scale-[1.01] hover:shadow-lg"
                    style={{
                      borderColor: `${PLANNING_TYPE_COLORS[ev.type]}33`,
                      background: `${PLANNING_TYPE_COLORS[ev.type]}08`,
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.06 }}
                  >
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                      style={{
                        background: `${PLANNING_TYPE_COLORS[ev.type]}22`,
                        border: `1px solid ${PLANNING_TYPE_COLORS[ev.type]}44`,
                      }}
                    >
                      {TYPE_ICONS[ev.type]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {ev.title}
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{
                            background: `${PLANNING_TYPE_COLORS[ev.type]}22`,
                            color: PLANNING_TYPE_COLORS[ev.type],
                          }}
                        >
                          {TYPE_LABELS[ev.type]}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                          <Clock size={12} style={{ color: PLANNING_TYPE_COLORS[ev.type] }} />
                          {ev.dateLabel} • {ev.start}
                        </div>
                        {ev.location && (
                          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                            <MapPin size={12} style={{ color: PLANNING_TYPE_COLORS[ev.type] }} />
                            {ev.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </JoueurKpiCard>
        </div>
      </div>

      <AnimatePresence>
        {selectedDayEvents && (
          <motion.div
            key="day-events"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedDayEvents(null)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: "#141B2D", border: "1px solid rgba(255,255,255,0.1)" }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>
                  {selectedDayEvents[0]?.dateLabel}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDayEvents(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {selectedDayEvents.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      setSelectedDayEvents(null);
                      setSelectedEvent(ev);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left"
                    style={{
                      borderColor: `${PLANNING_TYPE_COLORS[ev.type]}33`,
                      background: `${PLANNING_TYPE_COLORS[ev.type]}10`,
                    }}
                  >
                    <span className="text-lg">{TYPE_ICONS[ev.type]}</span>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {ev.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {ev.start} · {TYPE_LABELS[ev.type]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            key="event-modal"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl p-6"
              style={{
                background: "#141B2D",
                border: `1px solid ${PLANNING_TYPE_COLORS[selectedEvent.type]}44`,
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{TYPE_ICONS[selectedEvent.type]}</span>
                  <div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{
                        background: `${PLANNING_TYPE_COLORS[selectedEvent.type]}22`,
                        color: PLANNING_TYPE_COLORS[selectedEvent.type],
                      }}
                    >
                      {TYPE_LABELS[selectedEvent.type]}
                    </span>
                    <p className="mt-0.5 font-bold" style={{ color: "var(--text-primary)" }}>
                      {selectedEvent.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div
                  className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <CalendarDays size={14} style={{ color: PLANNING_TYPE_COLORS[selectedEvent.type] }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {selectedEvent.dateLabel}
                  </span>
                </div>
                <div
                  className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                  style={{ borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <Clock size={14} style={{ color: PLANNING_TYPE_COLORS[selectedEvent.type] }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {selectedEvent.start}
                  </span>
                </div>
                {selectedEvent.location && (
                  <div
                    className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}
                  >
                    <MapPin size={14} style={{ color: PLANNING_TYPE_COLORS[selectedEvent.type] }} />
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {selectedEvent.location}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </JoueurPageTransition>
  );
}
