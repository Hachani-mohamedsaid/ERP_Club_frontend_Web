import { useMemo, useState } from "react";
import { Clock, MapPin, Users, CalendarDays, Plus, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { clubApi } from "../lib/api/club";
import { useClubResource } from "../hooks/useClubResource";
import { usePermissions } from "../hooks/usePermissions";

interface TrainingSession {
  id: string;
  title: string;
  eventDate: string;
  eventTime: string | null;
  location: string | null;
  duration: string | null;
  durationMinutes: number | null;
}

interface TrainingOverview {
  weekStart: string;
  summary: {
    attendancePct: number | null;
    presentCount: number;
    totalPlayers: number;
    seniorCount: number;
    sessionsThisWeek: number;
    avgDurationMinutes: number | null;
  };
  sessions: TrainingSession[];
}

const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${String(m).padStart(2, "0")}`;
}

function toInputDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function TrainingModal({
  defaultDate,
  onClose,
  onSubmit,
}: {
  defaultDate: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: "",
    eventDate: defaultDate,
    eventTime: "09:00",
    duration: "90 min",
    location: "",
    intensity: "Moyenne",
  });
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(59,130,246,0.35)" }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Nouvelle séance</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          {[
            { key: "title", label: "Titre", type: "text", placeholder: "Ex: Cardio endurance" },
            { key: "eventDate", label: "Date", type: "date" },
            { key: "eventTime", label: "Heure", type: "text", placeholder: "09:00" },
            { key: "duration", label: "Durée", type: "text", placeholder: "90 min ou 1h 30" },
            { key: "location", label: "Lieu", type: "text", placeholder: "Centre d'entraînement" },
          ].map((f) => (
            <div key={f.key}>
              <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
              />
            </div>
          ))}
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Intensité
            </label>
            <select
              value={form.intensity}
              onChange={(e) => setForm((prev) => ({ ...prev, intensity: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            >
              {["Faible", "Moyenne", "Élevée"].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>
        <button
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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#3B82F6,#2563EB)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : "Créer la séance"}
        </button>
      </motion.div>
    </motion.div>
  );
}

export function TrainingPage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(
    () => clubApi.getTraining() as Promise<TrainingOverview>,
  );

  const [showAdd, setShowAdd] = useState(false);
  const [addDate, setAddDate] = useState(() => toInputDate(new Date()));

  const overview = data;
  const summary = overview?.summary;
  const sessions = overview?.sessions ?? [];

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, TrainingSession[]>();
    for (const s of sessions) {
      const day = DAY_NAMES[new Date(`${s.eventDate}T12:00:00`).getDay()];
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(s);
    }
    for (const [, list] of map) {
      list.sort((a, b) => (a.eventTime ?? "").localeCompare(b.eventTime ?? ""));
    }
    return [...map.entries()].map(([day, daySessions]) => ({ day, sessions: daySessions }));
  }, [sessions]);

  const avgLoadLabel =
    summary?.avgDurationMinutes != null ? formatDuration(summary.avgDurationMinutes) : "—";

  const seniorCount = summary?.seniorCount ?? 0;
  const canCreate = can("Calendrier", "créer");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Entraînements
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Planning hebdomadaire — Semaine du {overview?.weekStart ?? "…"}
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setAddDate(toInputDate(new Date()));
              setShowAdd(true);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#3B82F6,#2563EB)" }}
          >
            <Plus size={16} /> Entraînement
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <GlassCard className="p-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Présence moyenne</p>
        <p className="text-2xl font-semibold" style={{ color: "var(--color-state-success)" }}>
          {summary?.attendancePct != null ? `${summary.attendancePct}%` : "—"}
        </p>
        {(summary?.totalPlayers ?? 0) > 0 && (
          <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
            {summary?.presentCount}/{summary?.totalPlayers} joueurs présents
          </p>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <Users size={15} style={{ color: "var(--accent)" }} /> Groupe senior
          </div>
          <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {seniorCount} {seniorCount <= 1 ? "joueur" : "joueurs"}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <CalendarDays size={15} style={{ color: "var(--color-state-info)" }} /> Séances prévues
          </div>
          <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {summary?.sessionsThisWeek ?? 0} cette semaine
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <Clock size={15} style={{ color: "var(--color-state-warning)" }} /> Charge moyenne
          </div>
          <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {avgLoadLabel}
          </p>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Séances de la semaine
        </h2>
        {sessionsByDay.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune séance planifiée cette semaine.
            {canCreate && " Cliquez sur « Entraînement » pour en ajouter une."}
          </p>
        ) : (
          <div className="space-y-6">
            {sessionsByDay.map(({ day, sessions: daySessions }) => (
              <div key={day}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                    {day}
                  </p>
                  {canCreate && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddDate(daySessions[0]?.eventDate ?? toInputDate(new Date()));
                        setShowAdd(true);
                      }}
                      className="rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
                      style={{ background: "rgba(59,130,246,0.15)", color: "#3B82F6" }}
                    >
                      + Entraînement
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {daySessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
                      style={{ borderColor: "var(--surface-panel-border)" }}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {s.eventTime ?? "—"}
                        </span>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.title}</span>
                        {s.duration && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                            <Clock size={12} /> {s.duration}
                          </span>
                        )}
                        {s.location && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                            <MapPin size={12} /> {s.location}
                          </span>
                        )}
                      </div>
                      <Badge tone="info">Entraînement</Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <AnimatePresence>
        {showAdd && (
          <TrainingModal
            defaultDate={addDate}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              if (!v.title?.trim()) throw new Error("Le titre est requis.");
              if (!v.eventDate) throw new Error("La date est requise.");
              await clubApi.createCalendarEvent({
                title: v.title.trim(),
                eventDate: v.eventDate,
                eventTime: v.eventTime || "09:00",
                eventType: "ENTRAINEMENT",
                location: v.location?.trim() || undefined,
                duration: v.duration?.trim() || "90 min",
                intensity: v.intensity,
                sessionType: "cardio",
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
