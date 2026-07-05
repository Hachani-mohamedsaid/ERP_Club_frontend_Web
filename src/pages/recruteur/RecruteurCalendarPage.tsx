import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, X, Calendar, Clock, MapPin } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";

type EventType = "match" | "agent" | "validation" | "contrat" | "deplacement";

interface REvent {
  id: string;
  date: string;
  title: string;
  type: EventType;
  time: string;
  location?: string;
  note?: string;
}

const TYPE_META: Record<EventType, { label: string; color: string; bg: string }> = {
  match:      { label: "Match à observer",    color: "#EF4444", bg: "rgba(239,68,68,0.14)"  },
  agent:      { label: "Rendez-vous agent",   color: "#8B5CF6", bg: "rgba(139,92,246,0.14)" },
  validation: { label: "Réunion validation",  color: "#F59E0B", bg: "rgba(245,158,11,0.14)" },
  contrat:    { label: "Signature contrat",   color: "#22C55E", bg: "rgba(34,197,94,0.14)"  },
  deplacement:{ label: "Déplacement scout",   color: "#3B82F6", bg: "rgba(59,130,246,0.14)" },
};

const SEED_EVENTS: REvent[] = [
  { id: "e1", date: "2026-06-22", title: "CSS vs EST — Observer Khemiri",   type: "match",      time: "20:00", location: "Stade Taïeb Mhiri, Sfax" },
  { id: "e2", date: "2026-06-24", title: "RDV Agent Mourad Belhaj",          type: "agent",      time: "14:00", location: "Tunis, siège FC Carthage", note: "Discuter contrat Ahmed Ali" },
  { id: "e3", date: "2026-06-25", title: "Validation Ibrahim Touré",         type: "validation", time: "10:30", location: "Visioconférence", note: "Présenter rapport scout" },
  { id: "e4", date: "2026-06-28", title: "Signature contrat Sofiane Bellal", type: "contrat",    time: "16:00", location: "Bureau juridique" },
  { id: "e5", date: "2026-07-02", title: "Mission scout — Algérie",          type: "deplacement",time: "Journée", location: "Alger, Ligue Pro 1" },
  { id: "e6", date: "2026-07-05", title: "CAF U23 — Observation",           type: "match",      time: "18:30", location: "Stade de Radès" },
  { id: "e7", date: "2026-07-10", title: "Réunion DS + Coach Principal",     type: "validation", time: "09:00", location: "Salle de conférence" },
  { id: "e8", date: "2026-06-30", title: "RDV Agent Carlos Mendez",          type: "agent",      time: "11:00", location: "Visioconférence", note: "Ibrahim Touré négociation" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAY_NAMES = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

export function RecruteurCalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [events, setEvents] = useState<REvent[]>(SEED_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<REvent>>({ type: "match", time: "10:00" });

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay   = getFirstDayOfMonth(year, month);

  const eventsForDay = (day: number) => {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === key);
  };

  const selectedEvents = selected ? events.filter(e => e.date === selected) : [];

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const ev: REvent = {
      id: `ev${Date.now()}`,
      date: newEvent.date!,
      title: newEvent.title!,
      type: newEvent.type as EventType ?? "match",
      time: newEvent.time ?? "10:00",
      location: newEvent.location,
      note: newEvent.note,
    };
    setEvents(prev => [...prev, ev]);
    setNewEvent({ type: "match", time: "10:00" });
    setShowModal(false);
  };

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Calendrier Recrutement</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{events.length} événements planifiés</p>
        </div>
        <motion.button type="button" onClick={() => { setNewEvent({ type: "match", time: "10:00" }); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", boxShadow: "0 0 16px rgba(139,92,246,0.35)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Plus size={14} /> Planifier
        </motion.button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(TYPE_META).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold"
            style={{ background: v.bg, color: v.color }}>
            <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: v.color }} />
            {v.label}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        {/* Calendar grid */}
        <div className="rounded-[20px] border p-5" style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <motion.button type="button" onClick={prevMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
              <ChevronLeft size={14} />
            </motion.button>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{MONTH_NAMES[month]} {year}</p>
            <motion.button type="button" onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>
              <ChevronRight size={14} />
            </motion.button>
          </div>
          {/* Day names */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="py-1 text-center text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvts = eventsForDay(day);
              const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
              const isSelected = selected === key;
              return (
                <motion.button key={day} type="button" onClick={() => setSelected(isSelected ? null : key)}
                  className="relative min-h-[52px] rounded-xl border p-1.5 text-left"
                  style={{
                    background: isSelected ? "rgba(139,92,246,0.15)" : isToday ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.02)",
                    borderColor: isSelected ? "rgba(139,92,246,0.5)" : isToday ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)",
                  }}
                  whileHover={{ borderColor: "rgba(139,92,246,0.3)" }}>
                  <span className={`text-xs font-bold mb-0.5 block ${isToday ? "" : ""}`}
                    style={{ color: isToday ? "#8B5CF6" : "var(--text-secondary)" }}>{day}</span>
                  <div className="space-y-0.5">
                    {dayEvts.slice(0, 2).map(ev => (
                      <div key={ev.id} className="rounded-sm px-1 text-[8px] font-semibold truncate"
                        style={{ background: TYPE_META[ev.type].bg, color: TYPE_META[ev.type].color }}>
                        {ev.title.slice(0, 14)}
                      </div>
                    ))}
                    {dayEvts.length > 2 && (
                      <div className="text-[8px]" style={{ color: "var(--text-muted)" }}>+{dayEvts.length - 2}</div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Event detail */}
        <AnimatePresence mode="wait">
          {selected && selectedEvents.length > 0 ? (
            <motion.div key={selected} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="rounded-[20px] border p-5" style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {selected ? new Date(selected + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) : ""}
                  </p>
                  <button type="button" onClick={() => setSelected(null)} className="rounded-lg p-1.5"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <X size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
                {selectedEvents.map(ev => (
                  <div key={ev.id} className="mb-3 rounded-xl border p-3"
                    style={{ background: TYPE_META[ev.type].bg, borderColor: `${TYPE_META[ev.type].color}40` }}>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_META[ev.type].color }} />
                      <div className="flex-1">
                        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: TYPE_META[ev.type].color }}>{TYPE_META[ev.type].label}</p>
                        <div className="mt-1.5 space-y-0.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
                          <p className="flex items-center gap-1"><Clock size={9} /> {ev.time}</p>
                          {ev.location && <p className="flex items-center gap-1"><MapPin size={9} /> {ev.location}</p>}
                          {ev.note && <p className="italic">{ev.note}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex flex-col items-center justify-center rounded-[20px] border py-16"
                style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
                <Calendar size={28} className="mb-3 opacity-25" style={{ color: "var(--text-muted)" }} />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {selected ? "Aucun événement ce jour" : "Cliquez sur un jour pour voir les événements"}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming events list */}
      <div className="rounded-[20px] border p-5" style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
        <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Prochains événements</p>
        <div className="space-y-2">
          {[...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6).map((ev, i) => (
            <motion.div key={ev.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.02)", borderColor: "var(--surface-panel-border)" }}>
              <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_META[ev.type].color }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{ev.title}</p>
                <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                  <Calendar size={8} /> {ev.date} · <Clock size={8} /> {ev.time}
                  {ev.location && <><MapPin size={8} /> {ev.location}</>}
                </p>
              </div>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold"
                style={{ background: TYPE_META[ev.type].bg, color: TYPE_META[ev.type].color }}>
                {TYPE_META[ev.type].label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowModal(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-[24px] border p-6"
              style={{ background: "rgba(14,10,35,0.98)", borderColor: "rgba(139,92,246,0.35)" }}
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Nouvel événement</p>
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5"
                  style={{ background: "rgba(255,255,255,0.06)" }}>
                  <X size={14} style={{ color: "var(--text-muted)" }} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Titre", key: "title", placeholder: "Ex: CSS vs EST — Observer Khemiri", type: "text" },
                  { label: "Date",  key: "date",  placeholder: "YYYY-MM-DD", type: "date" },
                  { label: "Heure", key: "time",  placeholder: "10:00", type: "time" },
                  { label: "Lieu",  key: "location", placeholder: "Ex: Stade de Radès", type: "text" },
                  { label: "Note",  key: "note",  placeholder: "Note optionnelle...", type: "text" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key}>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>{label}</label>
                    <input type={type} placeholder={placeholder} value={(newEvent as Record<string, string>)[key] ?? ""}
                      onChange={e => setNewEvent(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
                  </div>
                ))}
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: "var(--text-muted)" }}>Type</label>
                  <select value={newEvent.type} onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as EventType }))}
                    className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                    style={{ background: "var(--surface-modal)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}>
                    {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="rounded-xl border px-4 py-2 text-xs" style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
                  Annuler
                </button>
                <motion.button type="button" onClick={addEvent}
                  className="rounded-xl px-5 py-2 text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  Planifier
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </RecruteurPageTransition>
  );
}
