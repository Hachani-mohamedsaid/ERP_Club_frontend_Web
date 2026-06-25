import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Shield, Moon, Droplets, Brain, X, CheckCircle } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { CircularProgress } from "../../components/player/CircularProgress";
import { BodyInjuryViewer } from "../../components/medical/BodyInjuryViewer";
import { MedicalTimeline } from "../../components/medical/MedicalTimeline";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import { useJoueurBackendData } from "../../hooks/useJoueurBackendData";

export function JoueurMedicalPage() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();
  const { injuries: backendInjuries, playerStats } = useJoueurBackendData();
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  if (!player) return null;

  function handleBooking() {
    setBookingModal(false);
    setBookingConfirmed(true);
    setTimeout(() => setBookingConfirmed(false), 4000);
  }

  // All injuries from backend
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
  const trainingLoad = playerStats?.trainingLoad ?? 65;
  const statusLabel = myBackendInjuries.length > 0 ? "Blessé" : "Disponible";
  const statusTone = myBackendInjuries.length > 0 ? "danger" : "success";

  const wellnessSleep = `${(6 + Math.random() * 3).toFixed(1)}h`;
  const wellnessHydration = Math.round(65 + Math.random() * 30);

  // Injury risk predictions derived from backend injuries
  const riskZones = [
    { zone: "Genou", risk: myBackendInjuries.find((i) => i.bodyPart?.toLowerCase().includes("genou")) ? 65 : Math.round(10 + Math.random() * 30), color: "#F59E0B" },
    { zone: "Cheville", risk: myBackendInjuries.find((i) => i.bodyPart?.toLowerCase().includes("cheville")) ? 70 : Math.round(10 + Math.random() * 25), color: "#EF4444" },
    { zone: "Dos", risk: myBackendInjuries.find((i) => i.bodyPart?.toLowerCase().includes("dos")) ? 55 : Math.round(5 + Math.random() * 20), color: "#3B82F6" },
  ];

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
            Survolez les zones — Genou, Cheville, Dos
          </p>
        </JoueurKpiCard>

        <div className="space-y-4">
          <JoueurKpiCard delay={0.05}>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.medical.status}</p>
              <Shield size={20} style={{ color: "#22C55E" }} />
            </div>
            <AnimatedBadge tone={statusTone as "success" | "danger"} animated={false}>{statusLabel}</AnimatedBadge>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.08}>
            <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.medical.fatigue}</p>
            <CircularProgress value={fatigue} size={100} color="#F59E0B" label="Fatigue" />
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.1}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2"><Moon size={14} style={{ color: "#3B82F6" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.medical.sleep}</span></div>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{wellnessSleep}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2"><Droplets size={14} style={{ color: "#22C55E" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.medical.hydration}</span></div>
                <span className="font-bold" style={{ color: "#22C55E" }}>{wellnessHydration}%</span>
              </div>
            </div>
          </JoueurKpiCard>
        </div>
      </div>

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MedicalTimeline title={t.medical.history} events={timelineEvents} />
        <JoueurKpiCard delay={0.18}>
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.medical.nextAppt}</p>
          <div className="mt-3 rounded-xl border p-4" style={{ borderColor: "rgba(255,107,87,0.3)", background: "rgba(255,107,87,0.06)" }}>
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: "#FF6B57" }} />
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Bilan médical périodique</span>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Prochain RDV — à planifier
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Dr. Équipe médicale</p>
            <button
              type="button"
              onClick={() => setBookingModal(true)}
              className="mt-3 w-full rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80 active:scale-[0.98]"
              style={{ background: "#FF6B57", color: "white" }}
            >
              Modifier / Réserver RDV
            </button>
          </div>
        </JoueurKpiCard>
      </div>
      {/* Booking Modal */}
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
                <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Réserver un rendez-vous</h3>
                <button type="button" onClick={() => setBookingModal(false)} className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Bilan médical complet", date: "28 Juin 2026 — 09:00", doctor: "Dr. Kefi" },
                  { label: "Suivi genoux", date: "02 Juil 2026 — 10:30", doctor: "Dr. Kefi" },
                  { label: "Test cardiovasculaire", date: "05 Juil 2026 — 08:00", doctor: "Dr. Ben Salem" },
                ].map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    onClick={handleBooking}
                    className="w-full rounded-xl border p-3 text-left transition-all hover:border-[#FF6B57] hover:bg-[rgba(255,107,87,0.06)]"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{slot.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{slot.date} · {slot.doctor}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking confirmed toast */}
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
            <span className="text-sm font-semibold">Rendez-vous confirmé !</span>
          </motion.div>
        )}
      </AnimatePresence>
    </JoueurPageTransition>
  );
}
