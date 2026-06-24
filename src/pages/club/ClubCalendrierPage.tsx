import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Clock, X, Plus } from "lucide-react";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string | null;
  eventType: string;
  location: string | null;
}

const EVENT_COLORS: Record<string, string> = {
  ENTRAINEMENT: "#3B82F6",
  MATCH: "#FF6B57",
  REUNION: "#8B5CF6",
  MEDICAL: "#10B981",
};

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export function ClubCalendrierPage() {
  const { can } = usePermissions();
  const { data, reload } = useClubResource(() => clubApi.getCalendar() as Promise<CalendarEvent[]>);
  const events = data ?? [];
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const year = new Date().getFullYear();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getEvents(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.eventDate.startsWith(dateStr));
  }

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Calendrier", "créer") && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <Plus size={16} /> Ajouter événement
          </button>
        )}
      </div>
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
                    const color = EVENT_COLORS[ev.eventType] ?? "#FF6B57";
                    return (
                      <motion.div
                        key={ev.id}
                        className="cursor-pointer rounded-md px-1 py-0.5 text-[9px] font-medium leading-tight"
                        style={{ background: `${color}20`, borderLeft: `2px solid ${color}`, color }}
                        whileHover={{ scale: 1.03 }}
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
          {Object.entries(EVENT_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
              <div className="h-2 w-2 rounded-full" style={{ background: color }} />{key}
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
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: `${EVENT_COLORS[selectedEvent.eventType] ?? "#FF6B57"}20`, color: EVENT_COLORS[selectedEvent.eventType] ?? "#FF6B57" }}>
                    {selectedEvent.eventType}
                  </span>
                  <h3 className="mt-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{selectedEvent.title}</h3>
                </div>
                <button type="button" onClick={() => setSelectedEvent(null)}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <Clock size={14} /> {formatDate(selectedEvent.eventDate.split("T")[0])} {selectedEvent.eventTime ? `— ${selectedEvent.eventTime}` : ""}
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                    <MapPin size={14} /> {selectedEvent.location}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Nouvel événement"
            fields={[
              { key: "title", label: "Titre" },
              { key: "eventDate", label: "Date", type: "date" },
              { key: "eventTime", label: "Heure", placeholder: "14:00" },
              { key: "eventType", label: "Type", placeholder: "ENTRAINEMENT" },
              { key: "location", label: "Lieu" },
            ]}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createCalendarEvent({
                title: v.title,
                eventDate: v.eventDate,
                eventTime: v.eventTime,
                eventType: v.eventType || "ENTRAINEMENT",
                location: v.location,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
