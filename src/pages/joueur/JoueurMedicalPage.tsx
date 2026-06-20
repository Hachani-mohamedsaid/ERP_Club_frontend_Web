import { motion } from "framer-motion";
import { Calendar, Shield, Moon, Droplets, Brain } from "lucide-react";
import { JoueurPageTransition } from "../../components/player/JoueurPageTransition";
import { JoueurKpiCard } from "../../components/player/JoueurKpiCard";
import { CircularProgress } from "../../components/player/CircularProgress";
import { BodyInjuryViewer } from "../../components/medical/BodyInjuryViewer";
import { MedicalTimeline } from "../../components/medical/MedicalTimeline";
import { AnimatedBadge } from "../../components/ui/AnimatedBadge";
import { useCurrentPlayer } from "../../hooks/useCurrentPlayer";
import { useLocale } from "../../contexts/LocaleContext";
import {
  MEDICAL_STATUS,
  MEDICAL_WELLNESS,
  INJURY_HISTORY,
  PLAYER_BODY_ZONES,
} from "../../data/joueurPersonalData";

export function JoueurMedicalPage() {
  const { player } = useCurrentPlayer();
  const { t } = useLocale();
  if (!player) return null;

  const timelineEvents = INJURY_HISTORY.map((inj) => ({
    id: inj.id,
    date: inj.year,
    title: inj.injury,
    description: inj.status,
    type: (inj.status === "Récupéré" ? "success" : "warning") as "success" | "warning",
  }));

  return (
    <JoueurPageTransition>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <JoueurKpiCard>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🫀 {t.medical.bodyModel}
          </h3>
          <BodyInjuryViewer zones={PLAYER_BODY_ZONES} />
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
            <AnimatedBadge tone="success" animated={false}>{MEDICAL_STATUS.label}</AnimatedBadge>
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.08}>
            <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{t.medical.fatigue}</p>
            <CircularProgress value={MEDICAL_WELLNESS.fatigue} size={100} color="#F59E0B" label="Fatigue" />
          </JoueurKpiCard>

          <JoueurKpiCard delay={0.1}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2"><Moon size={14} style={{ color: "#3B82F6" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.medical.sleep}</span></div>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{MEDICAL_WELLNESS.sleep}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2"><Droplets size={14} style={{ color: "#22C55E" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.medical.hydration}</span></div>
                <span className="font-bold" style={{ color: "#22C55E" }}>{MEDICAL_WELLNESS.hydration}%</span>
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
          {MEDICAL_WELLNESS.injuryPredictions.map((pred, idx) => (
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
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{MEDICAL_STATUS.nextAppointment.reason}</span>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {MEDICAL_STATUS.nextAppointment.date} • {MEDICAL_STATUS.nextAppointment.time}
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{MEDICAL_STATUS.nextAppointment.doctor}</p>
          </div>
        </JoueurKpiCard>
      </div>
    </JoueurPageTransition>
  );
}
