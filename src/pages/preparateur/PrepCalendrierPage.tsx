import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Dumbbell, Swords, Heart, Zap,
  Plus, X, Clock, MapPin, RefreshCw, Calendar,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { PrepKpiCard } from "../../components/preparateur/PrepKpiCard";
import { useClubResource } from "../../hooks/useClubResource";
import { clubApi } from "../../lib/api/club";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;   // "YYYY-MM-DD"
  eventTime: string | null;
  eventType: string;
  location: string | null;
  notes?: string | null;
}

const EVENT_TYPES = [
  { value: "MEDICAL",      label: "Médical / Rééducation", icon: Heart,    color: "#EF4444" },
  { value: "ENTRAINEMENT", label: "Entraînement",           icon: Dumbbell, color: "#3B82F6" },
  { value: "RECUPERATION", label: "Récupération",           icon: Zap,      color: "#22C55E" },
  { value: "MATCH",        label: "Match",                  icon: Swords,   color: "#F59E0B" },
] as const;

const EVENT_COLORS: Record<string, string> = {
  MATCH: "#F59E0B", ENTRAINEMENT: "#3B82F6", MEDICAL: "#EF4444",
  RECUPERATION: "#22C55E", REUNION: "#8B5CF6",
};
const EVENT_LABELS: Record<string, string> = {
  MATCH: "Match", ENTRAINEMENT: "Entraînement", MEDICAL: "Médical",
  RECUPERATION: "Récupération", REUNION: "Réunion",
};

const DAYS   = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

// ─── Normalize ────────────────────────────────────────────────────────────────

function normalizeEvent(raw: Record<string, unknown>): CalendarEvent {
  const dateRaw = raw.eventDate;
  const iso =
    typeof dateRaw === "string"
      ? dateRaw.split("T")[0]
      : dateRaw instanceof Date
        ? dateRaw.toISOString().split("T")[0]
        : "";
  return {
    id:        String(raw.id ?? ""),
    title:     String(raw.title ?? ""),
    eventDate: iso,
    eventTime: raw.eventTime ? String(raw.eventTime) : null,
    eventType: String(raw.eventType ?? "ENTRAINEMENT").toUpperCase(),
    location:  raw.location ? String(raw.location) : null,
    notes:     raw.notes   ? String(raw.notes)    : null,
  };
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

// ─── AddEventModal ─────────────────────────────────────────────────────────────

function AddEventModal({
  defaultDate,
  onClose,
  onSubmit,
}: {
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "", eventDate: defaultDate ?? todayIso(),
    eventTime: "09:00", eventType: "ENTRAINEMENT", location: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedType = EVENT_TYPES.find((t) => t.value === form.eventType) ?? EVENT_TYPES[1];
  const TypeIcon = selectedType.icon;

  async function handleSubmit() {
    if (!form.title.trim()) { setError("Le titre est requis."); return; }
    if (!form.eventDate)    { setError("La date est requise."); return; }
    setSaving(true); setError("");
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
    color: "var(--text-primary)",
    colorScheme: "dark" as const,
  };

  function onFocusStyle(e: React.FocusEvent<HTMLElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,122,0,0.5)";
    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px rgba(255,122,0,0.12)";
  }
  function onBlurStyle(e: React.FocusEvent<HTMLElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
    (e.currentTarget as HTMLElement).style.boxShadow = "none";
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md overflow-hidden rounded-[28px] border"
        style={{ background: "rgba(8,14,32,0.98)", borderColor: "rgba(255,122,0,0.25)", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.93, y: 12, opacity: 0 }}
        transition={{ type: "spring", stiffness: 290, damping: 27 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "rgba(255,122,0,0.15)", color: "#FF7A00" }}>
              <Calendar size={17} />
            </div>
            <div>
              <h2 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>Nouvel événement</h2>
              <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Calendrier partagé · FC Carthage</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-white/[0.07]" style={{ color: "var(--text-muted)" }}>
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Titre */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Titre</label>
            <input type="text" value={form.title} onChange={field("title")} placeholder="Ex: Récupération active, Match vs EST…"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all" style={inputStyle}
              onFocus={onFocusStyle} onBlur={onBlurStyle} />
          </div>

          {/* Type */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Type</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_TYPES.map((t) => {
                const Icon = t.icon;
                const active = form.eventType === t.value;
                return (
                  <motion.button key={t.value} type="button" onClick={() => setForm((f) => ({ ...f, eventType: t.value }))}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all"
                    style={{ background: active ? `${t.color}15` : "rgba(255,255,255,0.03)", borderColor: active ? `${t.color}50` : "rgba(255,255,255,0.07)" }}
                  >
                    <Icon size={13} style={{ color: t.color }} />
                    <span className="text-xs font-semibold truncate" style={{ color: active ? t.color : "var(--text-secondary)" }}>{t.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                <Calendar size={10} /> Date
              </label>
              <input type="date" value={form.eventDate} onChange={field("eventDate")}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all" style={inputStyle}
                onFocus={onFocusStyle} onBlur={onBlurStyle} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                <Clock size={10} /> Heure
              </label>
              <input type="time" value={form.eventTime} onChange={field("eventTime")}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all" style={inputStyle}
                onFocus={onFocusStyle} onBlur={onBlurStyle} />
            </div>
          </div>

          {/* Lieu */}
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              <MapPin size={10} /> Lieu (optionnel)
            </label>
            <input type="text" value={form.location} onChange={field("location")} placeholder="Terrain B, Salle kiné…"
              className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all" style={inputStyle}
              onFocus={onFocusStyle} onBlur={onBlurStyle} />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Notes (optionnel)</label>
            <textarea value={form.notes} onChange={field("notes")} rows={2} placeholder="Protocole, consignes…"
              className="w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none transition-all" style={inputStyle}
              onFocus={onFocusStyle} onBlur={onBlurStyle} />
          </div>

          {error && (
            <p className="rounded-xl border px-3 py-2 text-xs font-medium" style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#EF4444" }}>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-white/[0.05]" style={{ color: "var(--text-muted)" }}>
            Annuler
          </button>
          <motion.button type="button" onClick={handleSubmit} disabled={saving}
            whileHover={saving ? undefined : { scale: 1.02, boxShadow: "0 8px 24px rgba(255,122,0,0.35)" }}
            whileTap={saving ? undefined : { scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-70"
            style={{ background: "linear-gradient(135deg,#FF7A00,#E65F00)" }}
          >
            <TypeIcon size={14} />
            {saving ? "Enregistrement…" : "Ajouter au calendrier"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PrepCalendrierPage() {
  const { data, loading, error, reload } = useClubResource(() => clubApi.getPreparateurCalendar());
  const now = new Date();
  const [viewDate, setViewDate] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState<string | undefined>();
  const [view, setView] = useState<"month" | "week">("month");

  const month = viewDate.getMonth();
  const year  = viewDate.getFullYear();

  const events = useMemo(
    () => (Array.isArray(data) ? data : []).map((e) => normalizeEvent(e as Record<string, unknown>)),
    [data],
  );

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.eventDate === dateStr);
  }

  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const eventsThisMonth = events.filter((e) => {
    const [y, m] = e.eventDate.split("-");
    return parseInt(m) - 1 === month && parseInt(y) === year;
  }).sort((a, b) => a.eventDate.localeCompare(b.eventDate));

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }

  // ── Week view dates ────────────────────────────────────────────
  const weekDates = useMemo(() => {
    const base = new Date(now);
    const dow = (base.getDay() + 6) % 7; // Mon=0
    base.setDate(base.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, []);

  return (
    <PrepPageTransition>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <motion.button type="button" onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-xl border transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            whileHover={{ borderColor: "rgba(255,122,0,0.4)" }} whileTap={{ scale: 0.92 }}>
            <ChevronLeft size={16} style={{ color: "var(--text-muted)" }} />
          </motion.button>

          <h2 className="min-w-[160px] text-center text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            {MONTHS[month]} {year}
          </h2>

          <motion.button type="button" onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-xl border transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            whileHover={{ borderColor: "rgba(255,122,0,0.4)" }} whileTap={{ scale: 0.92 }}>
            <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
          </motion.button>

          <motion.button type="button" onClick={reload} title="Actualiser"
            className="flex h-8 w-8 items-center justify-center rounded-xl border transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            whileHover={{ borderColor: "rgba(99,102,241,0.4)" }} whileTap={{ scale: 0.92, rotate: 180 }}>
            <RefreshCw size={13} style={{ color: "var(--text-muted)" }} />
          </motion.button>
        </div>

        <div className="flex items-center gap-2">
          {/* Sync badge */}
          <div className="flex items-center gap-1.5 rounded-full border px-3 py-1"
            style={{ borderColor: "rgba(99,102,241,0.25)", background: "rgba(99,102,241,0.07)" }}>
            <motion.div className="h-1.5 w-1.5 rounded-full" style={{ background: "#818CF8" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[10px] font-semibold" style={{ color: "#818CF8" }}>Sync Admin Club</span>
          </div>

          {/* View toggle */}
          {(["month", "week"] as const).map((v) => (
            <motion.button key={v} type="button" onClick={() => setView(v)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold"
              style={{
                background: view === v ? "linear-gradient(135deg,#FF7A00,#E65F00)" : "rgba(255,255,255,0.04)",
                color: view === v ? "white" : "var(--text-muted)",
              }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              {v === "month" ? "Mois" : "Semaine"}
            </motion.button>
          ))}

          <motion.button type="button" onClick={() => { setAddDate(undefined); setShowAdd(true); }}
            whileHover={{ scale: 1.04, boxShadow: "0 6px 18px rgba(255,122,0,0.35)" }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#FF7A00,#E65F00)" }}>
            <Plus size={13} /> Ajouter
          </motion.button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {EVENT_TYPES.map(({ value, label, icon: Icon, color }) => (
          <div key={value} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
            <div className="h-2 w-2 rounded-full" style={{ background: color }} />
            <Icon size={10} style={{ color }} />
            {label}
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <RefreshCw size={14} />
          </motion.div>
          Chargement du calendrier…
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1fr]">
        {/* Calendar grid / week */}
        <PrepKpiCard hover={false}>
          {view === "month" ? (
            <>
              <div className="mb-2 grid grid-cols-7 gap-1">
                {DAYS.map((d) => (
                  <div key={d} className="py-1 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  const today = day ? isToday(day) : false;
                  return (
                    <motion.div
                      key={i}
                      className="min-h-[64px] cursor-pointer overflow-hidden rounded-xl border p-1.5 transition-colors"
                      style={{
                        background: today ? "rgba(255,122,0,0.1)" : day ? "rgba(255,255,255,0.02)" : "transparent",
                        borderColor: today ? "rgba(255,122,0,0.4)" : "rgba(255,255,255,0.06)",
                      }}
                      whileHover={day ? { borderColor: "rgba(255,122,0,0.25)", background: "rgba(255,122,0,0.05)" } : undefined}
                      onDoubleClick={() => {
                        if (!day) return;
                        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                        setAddDate(dateStr);
                        setShowAdd(true);
                      }}
                    >
                      {day && (
                        <p className="mb-1 text-[11px] font-bold" style={{ color: today ? "#FF7A00" : "var(--text-muted)" }}>{day}</p>
                      )}
                      {dayEvents.slice(0, 3).map((e) => {
                        const color = EVENT_COLORS[e.eventType] ?? "#FF7A00";
                        const EvIcon = EVENT_TYPES.find((t) => t.value === e.eventType)?.icon;
                        return (
                          <motion.div key={e.id}
                            onClick={() => setSelectedEvent(e)}
                            className="mb-0.5 flex items-center gap-1 truncate rounded-lg px-1.5 py-0.5 text-[9px] font-semibold cursor-pointer"
                            style={{ background: `${color}22`, color, borderLeft: `2px solid ${color}` }}
                            whileHover={{ scale: 1.03 }}>
                            {EvIcon && <EvIcon size={8} />}
                            <span className="truncate">{e.title}</span>
                          </motion.div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <p className="text-[8px] font-semibold" style={{ color: "var(--text-muted)" }}>+{dayEvents.length - 3}</p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Week view */
            <div className="space-y-2">
              <p className="mb-3 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Semaine en cours</p>
              <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date, i) => {
                  const iso = date.toISOString().split("T")[0];
                  const dayEvs = events.filter((e) => e.eventDate === iso);
                  const isT = date.toDateString() === now.toDateString();
                  return (
                    <div key={i} className="min-h-[80px] rounded-xl border p-1.5"
                      style={{ background: isT ? "rgba(255,122,0,0.08)" : "rgba(255,255,255,0.02)", borderColor: isT ? "rgba(255,122,0,0.35)" : "rgba(255,255,255,0.06)" }}>
                      <p className="mb-1 text-center text-[10px] font-bold" style={{ color: isT ? "#FF7A00" : "var(--text-muted)" }}>
                        {DAYS[i]}<br />
                        <span style={{ color: isT ? "#FF7A00" : "var(--text-secondary)" }}>{date.getDate()}</span>
                      </p>
                      {dayEvs.map((e) => {
                        const color = EVENT_COLORS[e.eventType] ?? "#FF7A00";
                        return (
                          <motion.div key={e.id} onClick={() => setSelectedEvent(e)}
                            className="mb-0.5 truncate rounded px-1 py-0.5 text-[8px] font-semibold cursor-pointer"
                            style={{ background: `${color}22`, color }}
                            whileHover={{ scale: 1.03 }}>
                            {e.title}
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PrepKpiCard>

        {/* Right panel: list + detail */}
        <div className="space-y-4">
          <PrepKpiCard hover={false}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {MONTHS[month]} · {eventsThisMonth.length} événements
              </p>
            </div>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {eventsThisMonth.length === 0 && !loading && (
                <p className="py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>Aucun événement ce mois</p>
              )}
              {eventsThisMonth.map((e, i) => {
                const color = EVENT_COLORS[e.eventType] ?? "#FF7A00";
                const EvIcon = EVENT_TYPES.find((t) => t.value === e.eventType)?.icon ?? Calendar;
                return (
                  <motion.div key={e.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedEvent(e)} className="cursor-pointer">
                    <div className="flex items-center gap-2.5 rounded-xl border p-2.5 transition-colors hover:bg-white/[0.02]"
                      style={{ background: `${color}08`, borderColor: `${color}25` }}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}18` }}>
                        <EvIcon size={13} style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{e.title}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {formatDate(e.eventDate)}{e.eventTime ? ` · ${e.eventTime}` : ""}
                          {e.location ? ` · ${e.location}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                        style={{ background: `${color}18`, color }}>
                        {EVENT_LABELS[e.eventType] ?? e.eventType}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </PrepKpiCard>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {selectedEvent && (
              <motion.div key={selectedEvent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                <PrepKpiCard hover={false}>
                  <div className="mb-3 flex items-start justify-between">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Détail</p>
                    <button type="button" onClick={() => setSelectedEvent(null)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/[0.07]"
                      style={{ color: "var(--text-muted)" }}>
                      <X size={14} />
                    </button>
                  </div>
                  {(() => {
                    const color = EVENT_COLORS[selectedEvent.eventType] ?? "#FF7A00";
                    const EvIcon = EVENT_TYPES.find((t) => t.value === selectedEvent.eventType)?.icon ?? Calendar;
                    return (
                      <div className="rounded-xl border p-4 space-y-3" style={{ background: `${color}0c`, borderColor: `${color}30` }}>
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
                            <EvIcon size={16} />
                          </div>
                          <div>
                            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{selectedEvent.title}</p>
                            <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ background: `${color}20`, color }}>
                              {EVENT_LABELS[selectedEvent.eventType] ?? selectedEvent.eventType}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                          <div className="flex items-center gap-2">
                            <Clock size={12} style={{ color: "var(--text-muted)" }} />
                            {formatDate(selectedEvent.eventDate)}{selectedEvent.eventTime ? ` — ${selectedEvent.eventTime}` : ""}
                          </div>
                          {selectedEvent.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={12} style={{ color: "var(--text-muted)" }} />
                              {selectedEvent.location}
                            </div>
                          )}
                          {selectedEvent.notes && (
                            <div className="mt-2 rounded-lg border px-3 py-2 text-[11px] leading-relaxed"
                              style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "var(--text-muted)" }}>
                              {selectedEvent.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </PrepKpiCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <AddEventModal
            defaultDate={addDate}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createPreparateurCalendarEvent({
                title:     v.title.trim(),
                eventDate: v.eventDate,
                eventTime: v.eventTime || null,
                eventType: v.eventType,
                location:  v.location?.trim() || null,
                notes:     v.notes?.trim() || null,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>

      {/* Event detail overlay */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div className="fixed inset-0 z-40 xl:hidden flex items-end justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}>
          </motion.div>
        )}
      </AnimatePresence>
    </PrepPageTransition>
  );
}
