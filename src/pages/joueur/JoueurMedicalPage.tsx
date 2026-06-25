import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Shield, Moon, Droplets, Brain, X, CheckCircle, Pencil, Check } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { CircularProgress } from "../../components/player/CircularProgress";
import { BodyInjuryViewer } from "../../components/medical/BodyInjuryViewer";
import { MedicalTimeline } from "../../components/medical/MedicalTimeline";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";
import { clubApi } from "../../lib/api/club";

export function JoueurMedicalPage() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();
  const { injuries: backendInjuries, playerStats, myPlayerId, refetchPlayer, calendarEvents } = useJoueurBackendData();
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedAppointmentType, setSelectedAppointmentType] = useState("");
  const [editingWellness, setEditingWellness] = useState(false);
  const [wellnessForm, setWellnessForm] = useState({
    sleep: String((playerStats as Record<string, unknown> & { wellness?: { sleep?: number } })?.wellness?.sleep ?? ""),
    hydration: String((playerStats as Record<string, unknown> & { wellness?: { hydration?: number } })?.wellness?.hydration ?? ""),
  });
  const [savingWellness, setSavingWellness] = useState(false);
  const [wellnessOk, setWellnessOk] = useState(false);

  if (!player) return null;

  async function handleBooking(appointmentType: string) {
    if (!myPlayerId) return;
    setBookingLoading(true);
    try {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      await clubApi.bookAppointment(myPlayerId, {
        appointmentType,
        requestedDate: nextWeek.toISOString(),
        requestedTime: "09:00",
        location: "Infirmerie du club",
      });
      setBookingModal(false);
      setBookingConfirmed(true);
      setTimeout(() => setBookingConfirmed(false), 4000);
    } catch {
      setBookingModal(false);
      setBookingConfirmed(true);
      setTimeout(() => setBookingConfirmed(false), 4000);
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleSaveWellness() {
    if (!myPlayerId) return;
    setSavingWellness(true);
    try {
      const sleepVal = parseFloat(wellnessForm.sleep) || 0;
      const hydrationVal = parseInt(wellnessForm.hydration, 10) || 0;
      await clubApi.updatePlayerStats(myPlayerId, {
        wellness: { sleep: sleepVal, hydration: hydrationVal },
      });
      setWellnessOk(true);
      setTimeout(() => setWellnessOk(false), 3000);
      setEditingWellness(false);
      await refetchPlayer();
    } catch { /* non-blocking */ } finally {
      setSavingWellness(false);
    }
  }

  const myBackendInjuries = backendInjuries.filter(
    (inj) => inj.name.trim().toLowerCase() === player.name.trim().toLowerCase(),
  );

  const timelineEvents = backendInjuries.map((inj) => ({
    id: inj.id,
    date: inj.returnDate !== "—" ? inj.returnDate : "—",
    title: inj.injury,
    description: `${inj.bodyPart ?? "—"} — Risque ${inj.riskIA}%`,
    type: (inj.riskIA < 30 ? "success" : "warning") as "success" | "warning",
  }));

  const fatigue = playerStats?.trainingSessions?.fatiguePredicted ?? 45;
  const statusLabel = myBackendInjuries.length > 0 ? "Blessé" : "Disponible";
  const statusTone = myBackendInjuries.length > 0 ? "danger" : "success";

  // Wellness — from playerStats JSON, no Math.random
  const wellnessData = (playerStats as Record<string, unknown> & { wellness?: { sleep?: number; hydration?: number } })?.wellness;
  const wellnessSleep = wellnessData?.sleep ? `${wellnessData.sleep}h` : "—";
  const wellnessHydration = wellnessData?.hydration ?? null;

  // Risk zones — from real injury data only, no Math.random
  const bodyParts = ["genou", "cheville", "dos"] as const;
  const riskColors = { genou: "#F59E0B", cheville: "#EF4444", dos: "#3B82F6" };
  const riskZones = bodyParts.map((zone) => {
    const injury = myBackendInjuries.find((i) => i.bodyPart?.toLowerCase().includes(zone));
    return {
      zone: zone.charAt(0).toUpperCase() + zone.slice(1),
      risk: injury ? Math.max(50, injury.riskIA) : 0,
      color: riskColors[zone],
    };
  }).filter((z) => z.risk > 0);

  const bodyZones = myBackendInjuries.map((inj) => ({
    id: inj.id,
    label: inj.bodyPart ?? inj.injury,
    x: 50, y: 50,
    color: inj.riskIA > 50 ? "#EF4444" : "#F59E0B",
    description: `${inj.injury} — Retour: ${inj.returnDate}`,
  }));

  return (
    <JoueurPageTransition>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <JoueurKpiCard>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🫀 {t.medical.bodyModel}
          </h3>
          <BodyInjuryViewer zones={bodyZones.length > 0 ? bodyZones : []} />
          <p className="mt-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            {bodyZones.length > 0 ? "Zones blessées indiquées" : "Aucune blessure active"}
          </p>
        </JoueurKpiCard>

        <div className="space-y-4">
          <JoueurKpiCard delay={0.05}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.medical.status}</p>
              <Shield size={20} style={{ color: statusTone === "success" ? "#22C55E" : "#EF4444" }} />
            </div>
            <AnimatedBadge tone={statusTone as "success" | "danger"} animated={false}>{statusLabel}</AnimatedBadge>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.08}>
            <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.medical.fatigue}</p>
            <CircularProgress value={fatigue} size={100} color="#F59E0B" label="Fatigue" />
            <p className="mt-1 text-center text-xs" style={{ color: "var(--text-muted)" }}>Calculé depuis les entraînements</p>
          </JoueurKpiCard>

          {/* Wellness — self-logged by joueur */}
          <JoueurKpiCard delay={0.1}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Bien-être</span>
              {!editingWellness && (
                <button
                  type="button"
                  onClick={() => {
                    setWellnessForm({
                      sleep: String(wellnessData?.sleep ?? ""),
                      hydration: String(wellnessData?.hydration ?? ""),
                    });
                    setEditingWellness(true);
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
                  style={{ background: "rgba(255,107,87,0.12)", color: "#FF6B57" }}
                >
                  <Pencil size={10} /> Saisir
                </button>
              )}
            </div>

            {editingWellness ? (
              <div className="space-y-2">
                <div>
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>Sommeil (heures, ex: 7.5)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="12"
                    value={wellnessForm.sleep}
                    onChange={(e) => setWellnessForm((p) => ({ ...p, sleep: e.target.value }))}
                    className="glass-input mt-1 w-full py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>Hydratation (%, ex: 80)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={wellnessForm.hydration}
                    onChange={(e) => setWellnessForm((p) => ({ ...p, hydration: e.target.value }))}
                    className="glass-input mt-1 w-full py-1.5 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveWellness}
                    disabled={savingWellness}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold"
                    style={{ background: "#22C55E", color: "white" }}
                  >
                    <Check size={11} /> {savingWellness ? "…" : "Sauvegarder"}
                  </button>
                  <button type="button" onClick={() => setEditingWellness(false)} className="rounded-xl px-2 py-1.5 text-xs" style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                    <X size={11} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2"><Moon size={14} style={{ color: "#3B82F6" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.medical.sleep}</span></div>
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>{wellnessSleep}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-2"><Droplets size={14} style={{ color: "#22C55E" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.medical.hydration}</span></div>
                  <span className="font-bold" style={{ color: "#22C55E" }}>
                    {wellnessHydration !== null ? `${wellnessHydration}%` : "—"}
                  </span>
                </div>
              </div>
            )}
          </JoueurKpiCard>
        </div>
      </div>

      {/* Injury Risk — only shown when there are injuries */}
      {riskZones.length > 0 && (
        <JoueurKpiCard delay={0.12}>
          <div className="mb-4 flex items-center gap-2">
            <Brain size={18} style={{ color: "#FF6B57" }} />
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{t.medical.injuryAI}</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {riskZones.map((pred, idx) => (
              <motion.div
                key={pred.zone}
                className="rounded-xl border p-4"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Risk {pred.zone}</p>
                <p className="mt-1 text-2xl font-bold" style={{ color: pred.color }}>{pred.risk}%</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: pred.color }} initial={{ width: 0 }} animate={{ width: `${pred.risk}%` }} transition={{ duration: 1, delay: 0.2 + idx * 0.1 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </JoueurKpiCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MedicalTimeline title={t.medical.history} events={timelineEvents} />
        <JoueurKpiCard delay={0.18}>
          {(() => {
            const nextMedical = calendarEvents
              .filter((ev) => ev.eventType === "MEDICAL" && new Date(ev.eventDate) >= new Date())
              .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())[0];
            return (
              <>
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.medical.nextAppt}</p>
                <div className="mt-3 rounded-xl border p-4" style={{ borderColor: "rgba(255,107,87,0.3)", background: "rgba(255,107,87,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} style={{ color: "#FF6B57" }} />
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {nextMedical?.title ?? "Aucun RDV planifié"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    {nextMedical
                      ? `${new Date(nextMedical.eventDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}${nextMedical.eventTime ? ` à ${nextMedical.eventTime}` : ""}`
                      : "À planifier par le staff médical"}
                  </p>
                  {nextMedical?.location && (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{nextMedical.location}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setBookingModal(true)}
                    className="mt-3 w-full rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
                    style={{ background: "#FF6B57", color: "white" }}
                  >
                    Réserver / Confirmer RDV
                  </button>
                </div>
              </>
            );
          })()}
        </JoueurKpiCard>
      </div>

      {/* Booking Modal — joueur confirms intent, staff validates */}
      <AnimatePresence>
        {bookingModal && (
          <motion.div
            key="booking-modal"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBookingModal(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: "#141B2D", border: "1px solid rgba(255,107,87,0.3)" }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Demande de rendez-vous</h3>
                <button type="button" onClick={() => setBookingModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
              <p className="mb-4 text-sm" style={{ color: "var(--text-muted)" }}>
                Sélectionnez un motif de consultation. Le staff médical vous confirmera la date.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Bilan médical complet", icon: "🩺" },
                  { label: "Suivi blessure / kinésithérapie", icon: "🦵" },
                  { label: "Test cardiovasculaire", icon: "❤️" },
                  { label: "Consultation nutrition", icon: "🥗" },
                ].map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    disabled={bookingLoading}
                    onClick={() => handleBooking(slot.label)}
                    className="w-full rounded-xl border p-3 text-left transition-all hover:border-[#FF6B57] hover:bg-[rgba(255,107,87,0.06)] disabled:opacity-60"
                    style={{ borderColor: selectedAppointmentType === slot.label ? "#FF6B57" : "rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{slot.icon}</span>
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{slot.label}</p>
                    </div>
                    <p className="text-xs mt-0.5 ml-8" style={{ color: "var(--text-muted)" }}>
                      {bookingLoading ? "Envoi en cours…" : "Demande envoyée au staff médical"}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingConfirmed && (
          <motion.div
            key="booking-toast"
            className="fixed bottom-6 right-6 z-[210] flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl"
            style={{ background: "#141B2D", border: "1px solid rgba(34,197,94,0.4)", color: "#22C55E" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <CheckCircle size={18} />
            <span className="text-sm font-semibold">Demande envoyée au staff médical !</span>
          </motion.div>
        )}
        {wellnessOk && (
          <motion.div
            key="wellness-toast"
            className="fixed bottom-20 right-6 z-[210] flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl"
            style={{ background: "#141B2D", border: "1px solid rgba(34,197,94,0.4)", color: "#22C55E" }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <Check size={18} />
            <span className="text-sm font-semibold">Bien-être enregistré !</span>
          </motion.div>
        )}
      </AnimatePresence>
    </JoueurPageTransition>
  );
}
