import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CalendarPlus, Clock, MapPin, Dumbbell, Heart, Swords,
  Zap, ShieldAlert, CheckCircle2, AlertTriangle,
} from "lucide-react";
import type { InjuryRiskEntry } from "../../data/preparateurData";
import { getRiskColor } from "../../data/preparateurData";

export interface CalendarEventPayload {
  title: string;
  eventDate: string;
  eventTime: string | null;
  eventType: string;
  location: string | null;
  notes?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CalendarEventPayload) => Promise<void>;
  riskEntry?: InjuryRiskEntry | null;
}

const EVENT_TYPES = [
  { value: "MEDICAL",      label: "Médical / Rééducation",  icon: Heart,    color: "#EF4444" },
  { value: "ENTRAINEMENT", label: "Entraînement adapté",    icon: Dumbbell, color: "#3B82F6" },
  { value: "RECUPERATION", label: "Récupération active",    icon: Zap,      color: "#22C55E" },
  { value: "MATCH",        label: "Match",                  icon: Swords,   color: "#F59E0B" },
] as const;

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function suggestTitle(entry: InjuryRiskEntry | null | undefined): string {
  if (!entry) return "";
  if (entry.risk >= 60) return `Rééducation — ${entry.name}`;
  if (entry.risk >= 30) return `Récupération — ${entry.name}`;
  return `Suivi préventif — ${entry.name}`;
}

function suggestType(entry: InjuryRiskEntry | null | undefined): string {
  if (!entry) return "MEDICAL";
  if (entry.risk >= 60) return "MEDICAL";
  if (entry.risk >= 30) return "RECUPERATION";
  return "ENTRAINEMENT";
}

export function PrepScheduleModal({ open, onClose, onSubmit, riskEntry }: Props) {
  const [title, setTitle]       = useState("");
  const [date, setDate]         = useState(todayIso());
  const [time, setTime]         = useState("09:00");
  const [type, setType]         = useState("MEDICAL");
  const [location, setLocation] = useState("");
  const [notes, setNotes]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(suggestTitle(riskEntry));
    setType(suggestType(riskEntry));
    setDate(todayIso());
    setTime("09:00");
    setLocation("");
    setNotes(riskEntry ? riskEntry.recommendation.map((r) => `• ${r}`).join("\n") : "");
    setError("");
    setSaving(false);
  }, [open, riskEntry]);

  async function handleSubmit() {
    if (!title.trim()) { setError("Le titre est requis."); return; }
    if (!date) { setError("La date est requise."); return; }
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        eventDate: date,
        eventTime: time || null,
        eventType: type,
        location: location.trim() || null,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'événement.");
    } finally {
      setSaving(false);
    }
  }

  const riskColor = riskEntry ? getRiskColor(riskEntry.risk) : "#FF6B57";
  const selectedTypeDef = EVENT_TYPES.find((t) => t.value === type) ?? EVENT_TYPES[0];
  const TypeIcon = selectedTypeDef.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(14px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-[28px] border"
            style={{
              background: "rgba(8,14,32,0.98)",
              borderColor: "rgba(99,102,241,0.3)",
              boxShadow: "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(99,102,241,0.15), 0 0 60px rgba(99,102,241,0.08)",
            }}
            initial={{ scale: 0.91, y: 28, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.93, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 290, damping: 27 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}
                >
                  <CalendarPlus size={18} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
                    Planifier dans le calendrier
                  </h2>
                  <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    Synchronisé avec Admin Club · FC Carthage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.07]"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {/* Joueur risque badge — si pré-rempli depuis un risque */}
              {riskEntry && (
                <div
                  className="flex items-center gap-3 rounded-2xl border px-4 py-3"
                  style={{ borderColor: `${riskColor}30`, background: `${riskColor}08` }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${riskColor}18`, color: riskColor }}
                  >
                    <ShieldAlert size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                      {riskEntry.name}
                    </p>
                    <p className="text-[11px]" style={{ color: riskColor }}>
                      {riskEntry.zone} · Risque {riskEntry.risk}%
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{ background: `${riskColor}18`, color: riskColor }}
                  >
                    {riskEntry.risk >= 60 ? "Critique" : riskEntry.risk >= 30 ? "Moyen" : "Faible"}
                  </span>
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Titre de l'événement
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Récupération — Ahmed Ben Salah"
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.12)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              {/* Type d'événement */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Type d'événement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const active = type === t.value;
                    return (
                      <motion.button
                        key={t.value}
                        type="button"
                        onClick={() => setType(t.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all"
                        style={{
                          background: active ? `${t.color}15` : "rgba(255,255,255,0.03)",
                          borderColor: active ? `${t.color}50` : "rgba(255,255,255,0.07)",
                          boxShadow: active ? `0 0 0 1px ${t.color}30` : "none",
                        }}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: `${t.color}18`, color: t.color }}
                        >
                          <Icon size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold" style={{ color: active ? t.color : "var(--text-secondary)" }}>
                            {t.label}
                          </p>
                        </div>
                        {active && (
                          <CheckCircle2 size={13} className="ml-auto shrink-0" style={{ color: t.color }} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Date + Heure */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    <CalendarPlus size={11} /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "var(--text-primary)",
                      colorScheme: "dark",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    <Clock size={11} /> Heure
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "var(--text-primary)",
                      colorScheme: "dark",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>
              </div>

              {/* Lieu */}
              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  <MapPin size={11} /> Lieu (optionnel)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Salle kiné, Terrain B, Infirmerie…"
                  className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.12)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  Notes / Protocole (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Protocole de récupération, recommandations…"
                  className="w-full resize-none rounded-xl border px-3 py-2.5 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 2px rgba(99,102,241,0.12)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>

              {/* Sync indicator */}
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
                style={{ borderColor: "rgba(99,102,241,0.2)", background: "rgba(99,102,241,0.06)" }}
              >
                <motion.div
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: "#818CF8" }}
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-[11px] font-medium" style={{ color: "#818CF8" }}>
                  Cet événement apparaîtra dans le calendrier Admin Club après validation
                </p>
              </div>

              {/* Erreur */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
                  style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#EF4444" }}
                >
                  <AlertTriangle size={13} />
                  <span className="text-xs font-medium">{error}</span>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between gap-3 px-6 py-4"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/[0.05]"
                style={{ color: "var(--text-muted)" }}
              >
                Annuler
              </button>
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                whileHover={saving ? undefined : { scale: 1.02, boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
                whileTap={saving ? undefined : { scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
              >
                <TypeIcon size={14} />
                {saving ? "Enregistrement…" : "Planifier l'événement"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
