import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sun, Wind, MapPin, User, Clock, BarChart3, Flame, X, CalendarDays } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { MatchPreviewCard } from "../../components/player/MatchPreviewCard";
import { useLocale } from "../../contexts/LocaleContext";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";

type PlanningEventType = "match" | "training" | "medical" | "rest";
interface PlanningEvent {
  id: string;
  title: string;
  date: string;
  day: number;
  month: number;
  year: number;
  start: string;
  end: string;
  type: PlanningEventType;
  location?: string;
  description?: string;
}

const PLANNING_TYPE_COLORS: Record<PlanningEventType, string> = {
  match: "#FF6B57",
  training: "#3B82F6",
  medical: "#22C55E",
  rest: "#9CA3AF",
};

const TYPE_LABELS: Record<PlanningEventType, string> = {
  match: "Match",
  training: "Entraînement",
  medical: "Médical",
  rest: "Repos",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const EVENT_TYPE_MAP: Record<string, PlanningEventType> = {
  MATCH: "match",
  ENTRAINEMENT: "training",
  MEDICAL: "medical",
  REPOS: "rest",
};

export function JoueurPlanningPage() {
  const { t } = useLocale();
  const { calendarEvents } = useJoueurBackendData();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedEvent, setSelectedEvent] = useState<PlanningEvent | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const { playerStats } = useJoueurBackendData();
  const trainingLoad = playerStats?.trainingLoad ?? 65;
  const sess = playerStats?.trainingSessions ?? { fatiguePredicted: 45 };
  const loadColor = trainingLoad >= 80 ? "#EF4444" : trainingLoad >= 60 ? "#F59E0B" : "#22C55E";

  // All events from backend
  const liveEvents: PlanningEvent[] = calendarEvents.length > 0
    ? calendarEvents.map((e) => {
        const d = new Date(e.eventDate);
        const type = EVENT_TYPE_MAP[e.eventType] ?? "training";
        return {
          id: e.id,
          title: e.title,
          date: d.toLocaleDateString("fr-TN"),
          day: d.getDate(),
          month: d.getMonth(),
          year: d.getFullYear(),
          start: e.eventTime ?? "09:00",
          end: "—",
          type,
          location: e.location ?? "FC Carthage",
          description: e.location ?? undefined,
        };
      })
    : [];

  const displayEvents = liveEvents;

  return (
    <JoueurPageTransition>
      {/* Match + charge row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[340px_1fr]">
        <MatchPreviewCard starterLabel={t.dashboard.starterProb} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <JoueurKpiCard delay={0.05}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} style={{ color: loadColor }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.trainingLoad}</h3>
              </div>
              <span className="text-lg font-black" style={{ color: loadColor }}>{trainingLoad}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background: loadColor }}
                initial={{ width: 0 }} animate={{ width: `${trainingLoad}%` }} transition={{ duration: 1 }} />
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
              {playerStats?.trainingSessions?.completed ?? 4}/{playerStats?.trainingSessions?.total ?? 5} séances · Intensité {playerStats?.trainingSessions?.intensity ?? "Moyenne"}
            </p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: playerStats?.trainingSessions?.total ?? 5 }).map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full"
                  style={{ background: i < (playerStats?.trainingSessions?.completed ?? 4) ? loadColor : "rgba(255,255,255,0.08)" }} />
              ))}
            </div>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.08}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} style={{ color: "#F59E0B" }} />
                <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.fatiguePredicted}</h3>
              </div>
              <span className="text-lg font-black" style={{ color: "#F59E0B" }}>{sess.fatiguePredicted ?? 45}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full" style={{ background: "#F59E0B" }}
                initial={{ width: 0 }} animate={{ width: `${sess.fatiguePredicted ?? 45}%` }} transition={{ duration: 1, delay: 0.1 }} />
            </div>
            <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Prédiction IA · repos recommandé jeudi</p>
            <div className="mt-3 rounded-xl border px-3 py-2 text-xs" style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.06)", color: "var(--text-secondary)" }}>
              ⚠️ Charge élevée avant match EST — réduire intensité vendredi
            </div>
          </JoueurKpiCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <JoueurKpiCard delay={0.1}>
            <div className="flex items-center gap-2">
              <Sun size={18} style={{ color: "#F59E0B" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.weather}</h3>
            </div>
            <p className="mt-3 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>28°</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Tunis — Partiellement nuageux</p>
            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Wind size={12} />15 km/h NE • Humidité 60%
            </div>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.12}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.timeline}</h3>
            <div className="relative space-y-0">
              {displayEvents.filter((e) => e.month === month && e.year === year).slice(0, 5).length > 0
                ? displayEvents.filter((e) => e.month === month && e.year === year).slice(0, 5).map((item, idx, arr) => (
                  <motion.div
                    key={item.id}
                    className="flex gap-4 pb-6"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + idx * 0.1 }}
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full" style={{ background: PLANNING_TYPE_COLORS[item.type] }} />
                      {idx < arr.length - 1 && (
                        <motion.div className="mt-1 w-0.5 flex-1" style={{ background: "rgba(255,255,255,0.1)", minHeight: 40 }} initial={{ height: 0 }} animate={{ height: 48 }} transition={{ delay: 0.25 + idx * 0.1 }} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold" style={{ color: "#FF6B57" }}>{item.day} — {item.start}</p>
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.location ?? TYPE_LABELS[item.type]}</p>
                    </div>
                  </motion.div>
                ))
                : <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun événement ce mois</p>
              }
            </div>
          </JoueurKpiCard>
        </div>

        <div className="lg:col-span-2">
          <JoueurKpiCard delay={0.05}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{monthLabel}</h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <ChevronLeft size={16} style={{ color: "var(--text-muted)" }} />
                </button>
                <button type="button" onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-xl border" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-medium" style={{ color: "var(--text-muted)" }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="aspect-square" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const events = displayEvents.filter((e) => e.day === day && e.month === month && e.year === year);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <motion.button
                    key={day}
                    type="button"
                    onClick={() => events[0] && setSelectedEvent(events[0])}
                    className="aspect-square rounded-xl border p-1 text-left"
                    style={{ borderColor: isToday ? "#FF6B57" : "rgba(255,255,255,0.06)", background: isToday ? "rgba(255,107,87,0.08)" : "transparent" }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="text-xs font-medium" style={{ color: isToday ? "#FF6B57" : "var(--text-secondary)" }}>{day}</span>
                    {events.slice(0, 2).map((ev) => (
                      <div key={ev.id} className="mt-0.5 truncate rounded px-0.5 text-[8px] font-medium" style={{ background: `${PLANNING_TYPE_COLORS[ev.type]}22`, color: PLANNING_TYPE_COLORS[ev.type] }}>
                        {ev.title.slice(0, 10)}
                      </div>
                    ))}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(Object.keys(TYPE_LABELS) as PlanningEventType[]).map((type) => (
                <div key={type} className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: PLANNING_TYPE_COLORS[type] }} />
                  {TYPE_LABELS[type]}
                </div>
              ))}
            </div>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.12}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.upcoming}</h3>
            <div className="grid grid-cols-1 gap-4">
              {displayEvents.slice(0, 4).map((ev, idx) => (
                <motion.button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelectedEvent(ev)}
                  className="flex gap-4 rounded-[20px] border p-4 text-left transition-all hover:scale-[1.01] hover:shadow-lg"
                  style={{ borderColor: `${PLANNING_TYPE_COLORS[ev.type]}33`, background: `${PLANNING_TYPE_COLORS[ev.type]}08` }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.06 }}
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${PLANNING_TYPE_COLORS[ev.type]}22`, border: `1px solid ${PLANNING_TYPE_COLORS[ev.type]}44` }}
                  >
                    {ev.type === "match" ? "⚽" : ev.type === "training" ? "🏃" : ev.type === "medical" ? "🩺" : "😴"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        <Clock size={12} style={{ color: PLANNING_TYPE_COLORS[ev.type] }} />
                        {ev.date} • {ev.start}{ev.end !== "—" ? ` - ${ev.end}` : ""}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                        <MapPin size={12} style={{ color: PLANNING_TYPE_COLORS[ev.type] }} />
                        {ev.location ?? TYPE_LABELS[ev.type]}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </JoueurKpiCard>
        </div>
      </div>

      {/* Event detail modal */}
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
              style={{ background: "#141B2D", border: `1px solid ${PLANNING_TYPE_COLORS[selectedEvent.type]}44` }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedEvent.type === "match" ? "⚽" : selectedEvent.type === "training" ? "🏃" : selectedEvent.type === "medical" ? "🩺" : "😴"}</span>
                  <div>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${PLANNING_TYPE_COLORS[selectedEvent.type]}22`, color: PLANNING_TYPE_COLORS[selectedEvent.type] }}>
                      {TYPE_LABELS[selectedEvent.type]}
                    </span>
                    <p className="mt-0.5 font-bold" style={{ color: "var(--text-primary)" }}>{selectedEvent.title}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedEvent(null)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <CalendarDays size={14} style={{ color: PLANNING_TYPE_COLORS[selectedEvent.type] }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <Clock size={14} style={{ color: PLANNING_TYPE_COLORS[selectedEvent.type] }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedEvent.start}{selectedEvent.end !== "—" ? ` – ${selectedEvent.end}` : ""}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <MapPin size={14} style={{ color: PLANNING_TYPE_COLORS[selectedEvent.type] }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <User size={14} style={{ color: PLANNING_TYPE_COLORS[selectedEvent.type] }} />
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>Staff Technique</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </JoueurPageTransition>
  );
}
