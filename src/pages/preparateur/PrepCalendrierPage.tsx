import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Dumbbell, Swords, Heart, Zap, Clock } from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { SESSION_COLORS } from "../../data/preparateurData";

type EventType = "entrainement" | "match" | "recuperation" | "programme";

interface CalEvent {
  day: number; month: number; year: number;
  title: string; type: EventType; time?: string; color: string;
}

const TYPE_COLOR: Record<EventType, string> = {
  entrainement: "#3B82F6", match: "#EF4444", recuperation: "#22C55E", programme: "#8B5CF6",
};
const TYPE_ICON: Record<EventType, typeof Clock> = {
  entrainement: Dumbbell, match: Swords, recuperation: Heart, programme: Zap,
};

const EVENTS: CalEvent[] = [
  { day: 21, month: 6, year: 2026, title: "Cardio endurance",    type: "entrainement", time: "09:00", color: "#3B82F6" },
  { day: 22, month: 6, year: 2026, title: "Force maximale",      type: "entrainement", time: "10:00", color: "#3B82F6" },
  { day: 23, month: 6, year: 2026, title: "Récupération active", type: "recuperation", time: "09:00", color: "#22C55E" },
  { day: 24, month: 6, year: 2026, title: "Vitesse & sprints",   type: "entrainement", time: "09:30", color: "#3B82F6" },
  { day: 25, month: 6, year: 2026, title: "Programme pré-saison",type: "programme",    time: "08:00", color: "#8B5CF6" },
  { day: 27, month: 6, year: 2026, title: "Match vs EST",        type: "match",        time: "16:00", color: "#EF4444" },
  { day: 28, month: 6, year: 2026, title: "Récupération match",  type: "recuperation", time: "10:00", color: "#22C55E" },
  { day: 29, month: 6, year: 2026, title: "Mobilité & yoga",     type: "entrainement", time: "09:00", color: "#3B82F6" },
  { day: 30, month: 6, year: 2026, title: "Force spécifique",    type: "entrainement", time: "10:30", color: "#3B82F6" },
  { day: 2,  month: 7, year: 2026, title: "Match vs CSS",        type: "match",        time: "19:00", color: "#EF4444" },
  { day: 5,  month: 7, year: 2026, title: "Programme J.Blessés", type: "programme",    time: "08:30", color: "#8B5CF6" },
  { day: 7,  month: 7, year: 2026, title: "Cardio récup.",       type: "recuperation", time: "09:00", color: "#22C55E" },
];

const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

export function PrepCalendrierPage() {
  const today = new Date();
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(5); // 0-indexed: 5 = June
  const [view,  setView]  = useState<"month" | "week">("month");
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = (firstDay.getDay() + 6) % 7; // Mon=0

  const eventsThisMonth = EVENTS.filter(e => e.month - 1 === month && e.year === year);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  }

  function eventsOnDay(d: number) {
    return EVENTS.filter(e => e.day === d && e.month - 1 === month && e.year === year);
  }

  const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <PrepPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.button type="button" onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            whileHover={{ borderColor: "rgba(255,122,0,0.35)" }} whileTap={{ scale: 0.92 }}>
            <ChevronLeft size={16} style={{ color: "var(--text-muted)" }} />
          </motion.button>
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            {MONTHS[month]} {year}
          </h2>
          <motion.button type="button" onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            whileHover={{ borderColor: "rgba(255,122,0,0.35)" }} whileTap={{ scale: 0.92 }}>
            <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          {(["month","week"] as const).map(v => (
            <motion.button key={v} type="button" onClick={() => setView(v)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold capitalize"
              style={{
                background: view === v ? "linear-gradient(135deg,var(--accent),#E66000)" : "rgba(255,255,255,0.04)",
                color: view === v ? "white" : "var(--text-muted)",
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              {v === "month" ? "Mois" : "Semaine"}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(TYPE_COLOR) as [EventType, string][]).map(([type, color]) => {
          const Icon = TYPE_ICON[type];
          return (
            <div key={type} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              <Icon size={10} style={{ color }} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
        {/* Calendar grid */}
        <PrepKpiCard hover={false}>
          {/* Day headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDow }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const dayEvents = eventsOnDay(day);
              const active = isToday(day);
              return (
                <motion.div key={day}
                  className="min-h-[64px] cursor-pointer overflow-hidden rounded-xl border p-1.5"
                  style={{
                    background: active ? "rgba(255,122,0,0.12)" : "rgba(255,255,255,0.02)",
                    borderColor: active ? "rgba(255,122,0,0.4)" : "rgba(255,255,255,0.06)",
                  }}
                  whileHover={{ borderColor: "rgba(255,122,0,0.3)", background: "rgba(255,122,0,0.06)" }}>
                  <p className={`text-[11px] font-bold mb-1 ${active ? "text-orange-400" : ""}`}
                    style={{ color: active ? "#FF7A00" : "var(--text-secondary)" }}>{day}</p>
                  {dayEvents.map((e, i) => {
                    const Icon = TYPE_ICON[e.type];
                    return (
                      <motion.div key={i} onClick={() => setSelected(e)}
                        className="mb-0.5 flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[9px] font-semibold truncate"
                        style={{ background: `${e.color}20`, color: e.color }}
                        whileHover={{ scale: 1.04 }}>
                        <Icon size={8} />
                        <span className="truncate">{e.title}</span>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </PrepKpiCard>

        {/* Event list + detail */}
        <div className="space-y-4">
          <PrepKpiCard hover={false}>
            <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Ce mois — {eventsThisMonth.length} événements
            </p>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {eventsThisMonth.map((e, i) => {
                const Icon = TYPE_ICON[e.type];
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelected(e)} className="cursor-pointer">
                    <div className="flex items-center gap-2.5 rounded-xl border p-2.5"
                      style={{ background: `${e.color}08`, borderColor: `${e.color}25` }}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: `${e.color}18` }}>
                        <Icon size={12} style={{ color: e.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{e.title}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{e.day}/{e.month}/{e.year}{e.time ? ` · ${e.time}` : ""}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </PrepKpiCard>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <PrepKpiCard hover={false}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Détail</p>
                    <motion.button type="button" onClick={() => setSelected(null)}
                      className="text-[11px] px-2 py-1 rounded-lg border"
                      style={{ borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
                      whileHover={{ borderColor: "rgba(255,122,0,0.3)" }}>×</motion.button>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: `${selected.color}10`, border: `1px solid ${selected.color}30` }}>
                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>{selected.title}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {selected.day}/{selected.month}/{selected.year} {selected.time ? `· ${selected.time}` : ""}
                    </p>
                    <span className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: `${selected.color}20`, color: selected.color }}>
                      {selected.type}
                    </span>
                  </div>
                </PrepKpiCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PrepPageTransition>
  );
}
