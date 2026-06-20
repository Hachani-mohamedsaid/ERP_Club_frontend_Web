import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Clock, User, Users, X } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { CALENDAR_EVENTS, EVENT_COLORS } from "../../data/clubAdminData";

type CalendarEvent = (typeof CALENDAR_EVENTS)[number];

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export function ClubCalendrierPage() {
  const [month, setMonth] = useState(5);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const year = 2026;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getEvents(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return CALENDAR_EVENTS.filter((e) => e.date === dateStr);
  }

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <ClubPageTransition>
      <ClubKpiCard hover={false}>
        <div className="mb-6 flex items-center justify-between">
          <button type="button" onClick={() => setMonth((m) => Math.max(0, m - 1))} className="rounded-lg p-2 hover:bg-white/5"><ChevronLeft size={18} style={{ color: "var(--text-muted)" }} /></button>
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{MONTHS[month]} {year}</h3>
          <button type="button" onClick={() => setMonth((m) => Math.min(11, m + 1))} className="rounded-lg p-2 hover:bg-white/5"><ChevronRight size={18} style={{ color: "var(--text-muted)" }} /></button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            const events = day ? getEvents(day) : [];
            return (
              <div
                key={i}
                className="min-h-[80px] rounded-xl border p-1.5"
                style={{ borderColor: "rgba(255,255,255,0.03)", background: day ? "rgba(255,255,255,0.02)" : "transparent" }}
              >
                {day && <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{day}</span>}
                <div className="mt-1 space-y-0.5">
                  {events.map((ev) => {
                    const colors = EVENT_COLORS[ev.type];
                    return (
                      <motion.div
                        key={ev.id}
                        className="cursor-pointer rounded-md px-1 py-0.5 text-[9px] font-medium leading-tight"
                        style={{ background: colors.bg, borderLeft: `2px solid ${colors.border}`, color: colors.border }}
                        whileHover={{ scale: 1.03, boxShadow: `0 0 12px ${colors.border}40` }}
                        onClick={() => setSelectedEvent(ev)}
                      >
                        {ev.title.length > 18 ? ev.title.slice(0, 18) + "…" : ev.title}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(EVENT_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <div className="h-2 w-2 rounded-full" style={{ background: val.border }} />{val.label}
            </div>
          ))}
        </div>
      </ClubKpiCard>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
            <motion.div
              className="relative w-full max-w-md rounded-[20px] border p-6"
              style={{ background: "rgba(15,29,58,0.98)", borderColor: "rgba(255,255,255,0.05)" }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: EVENT_COLORS[selectedEvent.type].bg, color: EVENT_COLORS[selectedEvent.type].border }}>
                    {EVENT_COLORS[selectedEvent.type].label}
                  </span>
                  <h3 className="mt-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{selectedEvent.title}</h3>
                </div>
                <button type="button" onClick={() => setSelectedEvent(null)}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <Clock size={14} /> {formatDate(selectedEvent.date)} — {selectedEvent.time}
                </div>
                <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <MapPin size={14} /> {selectedEvent.location}
                </div>
                <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <User size={14} /> Coach : <span style={{ color: "var(--text-primary)" }}>{selectedEvent.coach}</span>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    <Users size={14} /> Effectif convoqué
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEvent.squad.map((name) => (
                      <span key={name} className="rounded-lg px-2 py-1 text-xs" style={{ background: "rgba(255,107,87,0.1)", color: "#FF6B57" }}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
