import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sun, Wind, MapPin, User, Clock } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { MatchCountdown } from "../../components/player/MatchCountdown";
import { useLocale } from "../../contexts/LocaleContext";
import {
  PLANNING_EVENTS,
  PLANNING_TYPE_COLORS,
  DAILY_TIMELINE,
  MATCH_WEATHER,
  NEXT_MATCH,
  type PlanningEventType,
} from "../../data/joueurPersonalData";

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

export function JoueurPlanningPage() {
  const { t } = useLocale();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const monthLabel = currentDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <JoueurPageTransition>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <JoueurKpiCard>
            <MatchCountdown targetDate={NEXT_MATCH.targetDate} label={t.planning.countdown} />
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.08}>
            <div className="flex items-center gap-2">
              <Sun size={18} style={{ color: "#F59E0B" }} />
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.weather}</h3>
            </div>
            <p className="mt-3 text-4xl font-bold" style={{ color: "var(--text-primary)" }}>{MATCH_WEATHER.temp}°</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{MATCH_WEATHER.condition}</p>
            <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Wind size={12} />{MATCH_WEATHER.wind} • Humidité {MATCH_WEATHER.humidity}%
            </div>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.1}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.timeline}</h3>
            <div className="relative space-y-0">
              {DAILY_TIMELINE.map((item, idx) => (
                <motion.div
                  key={item.time}
                  className="flex gap-4 pb-6"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + idx * 0.1 }}
                >
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full" style={{ background: PLANNING_TYPE_COLORS[item.type] }} />
                    {idx < DAILY_TIMELINE.length - 1 && (
                      <motion.div className="mt-1 w-0.5 flex-1" style={{ background: "rgba(255,255,255,0.1)", minHeight: 40 }} initial={{ height: 0 }} animate={{ height: 48 }} transition={{ delay: 0.25 + idx * 0.1 }} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "#FF6B57" }}>{item.time}</p>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.subtitle}</p>
                  </div>
                </motion.div>
              ))}
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
                const events = PLANNING_EVENTS.filter((e) => e.day === day);
                const isToday = day === 19 && month === 5;
                return (
                  <motion.div
                    key={day}
                    className="aspect-square rounded-xl border p-1"
                    style={{ borderColor: isToday ? "#FF6B57" : "rgba(255,255,255,0.06)", background: isToday ? "rgba(255,107,87,0.08)" : "transparent" }}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  >
                    <span className="text-xs font-medium" style={{ color: isToday ? "#FF6B57" : "var(--text-secondary)" }}>{day}</span>
                    {events.slice(0, 2).map((ev) => (
                      <div key={ev.id} className="mt-0.5 truncate rounded px-0.5 text-[8px] font-medium" style={{ background: `${PLANNING_TYPE_COLORS[ev.type]}22`, color: PLANNING_TYPE_COLORS[ev.type] }}>
                        {ev.title.slice(0, 10)}
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </div>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.12}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.planning.upcoming}</h3>
            <div className="grid grid-cols-1 gap-4">
              {PLANNING_EVENTS.slice(0, 4).map((ev, idx) => (
                <motion.div
                  key={ev.id}
                  className="flex gap-4 rounded-[20px] border p-4 transition-all hover:scale-[1.01] hover:shadow-lg"
                  style={{ borderColor: `${PLANNING_TYPE_COLORS[ev.type]}33`, background: `${PLANNING_TYPE_COLORS[ev.type]}08` }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + idx * 0.06 }}
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${PLANNING_TYPE_COLORS[ev.type]}22`, border: `1px solid ${PLANNING_TYPE_COLORS[ev.type]}44` }}
                  >
                    {ev.logo}
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
                        {ev.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <User size={12} style={{ color: PLANNING_TYPE_COLORS[ev.type] }} />
                        {ev.responsible}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </JoueurKpiCard>
        </div>
      </div>
    </JoueurPageTransition>
  );
}
