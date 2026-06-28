import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Clock, X, Plus, Save } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string | null;
  eventType: string;
  location: string | null;
}

const EVENT_TYPES = [
  { value: "MATCH", label: "Match" },
  { value: "ENTRAINEMENT", label: "Entraînement" },
  { value: "MEDICAL", label: "Médical" },
  { value: "REUNION", label: "Réunion" },
] as const;

const EVENT_COLORS: Record<string, string> = {
  MATCH: "#22C55E",
  ENTRAINEMENT: "#3B82F6",
  MEDICAL: "#EF4444",
  REUNION: "#F59E0B",
};

const EVENT_LABELS: Record<string, string> = {
  MATCH: "Match",
  ENTRAINEMENT: "Entraînement",
  MEDICAL: "Médical",
  REUNION: "Réunion",
};

const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function normalizeEvent(raw: Record<string, unknown>): CalendarEvent {
  const dateRaw = raw.eventDate;
  const iso =
    typeof dateRaw === "string"
      ? dateRaw.split("T")[0]
      : dateRaw instanceof Date
        ? dateRaw.toISOString().split("T")[0]
        : "";
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    eventDate: iso,
    eventTime: raw.eventTime ? String(raw.eventTime) : null,
    eventType: String(raw.eventType ?? "ENTRAINEMENT").toUpperCase(),
    location: raw.location ? String(raw.location) : null,
  };
}

function formatDisplayDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}/${m}/${y}`;
}

function EventFormModal({
  defaultDate,
  onClose,
  onSubmit,
}: {
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "",
    eventDate: defaultDate ?? "",
    eventTime: "14:00",
    eventType: "ENTRAINEMENT",
    location: "",
  });
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Nouvel événement</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {[
            { key: "title", label: "Titre", type: "text", placeholder: "FC Carthage vs ES Tunis" },
            { key: "eventDate", label: "Date", type: "date" },
            { key: "eventTime", label: "Heure", type: "text", placeholder: "14:00" },
            { key: "location", label: "Lieu", type: "text", placeholder: "Stade Olympique" },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
              />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Type
            </label>
            <select
              value={form.eventType}
              onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <motion.button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSubmit(form);
              onClose();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erreur");
            } finally {
              setSaving(false);
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function MedicalRendezVousPage() {
  const { data, loading, error, reload } = useClubResource(() => clubApi.getCalendar());
  const now = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState<string | undefined>();

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();

  const events = useMemo(
    () => (Array.isArray(data) ? data : []).map((e) => normalizeEvent(e as Record<string, unknown>)),
    [data],
  );

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.eventDate === dateStr);
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <div className="space-y-6">
      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <GlassCard raised className="p-4 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={prevMonth} className="rounded-lg p-2 transition-colors hover:bg-white/5">
            <ChevronLeft size={20} style={{ color: "var(--text-muted)" }} />
          </button>
          <h3 className="text-lg font-bold capitalize" style={{ color: "var(--text-primary)" }}>
            {MONTHS[month]} {year}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setAddDate(undefined); setShowAdd(true); }}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white sm:text-sm"
              style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
            >
              <Plus size={14} /> Nouveau rendez-vous
            </button>
            <button type="button" onClick={nextMonth} className="rounded-lg p-2 transition-colors hover:bg-white/5">
              <ChevronRight size={20} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1.5">
          {DAYS.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            const today = day ? isToday(day) : false;
            return (
              <div
                key={i}
                className="min-h-[110px] rounded-xl border p-2 transition-colors"
                style={{
                  borderColor: today ? "rgba(255,107,87,0.4)" : "rgba(255,255,255,0.06)",
                  background: day ? (today ? "rgba(255,107,87,0.06)" : "rgba(255,255,255,0.02)") : "transparent",
                }}
                onDoubleClick={() => {
                  if (!day) return;
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  setAddDate(dateStr);
                  setShowAdd(true);
                }}
              >
                {day && (
                  <span
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                    style={{
                      color: today ? "#FF6B57" : "var(--text-muted)",
                      background: today ? "rgba(255,107,87,0.15)" : "transparent",
                    }}
                  >
                    {day}
                  </span>
                )}
                <div className="mt-1 space-y-1">
                  {dayEvents.map((ev) => {
                    const color = EVENT_COLORS[ev.eventType] ?? "#FF6B57";
                    return (
                      <motion.button
                        key={ev.id}
                        type="button"
                        className="block w-full truncate rounded-lg px-2 py-1 text-left text-[10px] font-semibold leading-tight"
                        style={{ background: `${color}22`, color, borderLeft: `3px solid ${color}` }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedEvent(ev)}
                        title={ev.title}
                      >
                        {ev.title}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {EVENT_TYPES.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: EVENT_COLORS[value] }} />
              {label}
            </div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
            <motion.div
              className="relative w-full max-w-md rounded-[20px] border p-6"
              style={{ background: "rgba(15,29,58,0.98)", borderColor: "rgba(255,255,255,0.08)" }}
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      background: `${EVENT_COLORS[selectedEvent.eventType] ?? "#FF6B57"}22`,
                      color: EVENT_COLORS[selectedEvent.eventType] ?? "#FF6B57",
                    }}
                  >
                    {EVENT_LABELS[selectedEvent.eventType] ?? selectedEvent.eventType}
                  </span>
                  <h3 className="mt-2 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{selectedEvent.title}</h3>
                </div>
                <button type="button" onClick={() => setSelectedEvent(null)}><X size={18} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
                  <Clock size={14} />
                  {formatDisplayDate(selectedEvent.eventDate)}
                  {selectedEvent.eventTime ? ` — ${selectedEvent.eventTime}` : ""}
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
          <EventFormModal
            defaultDate={addDate}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              if (!v.title?.trim()) throw new Error("Le titre est requis.");
              if (!v.eventDate) throw new Error("La date est requise.");
              await clubApi.createCalendarEvent({
                title: v.title.trim(),
                eventDate: v.eventDate,
                eventTime: v.eventTime || null,
                eventType: v.eventType,
                location: v.location?.trim() || null,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
