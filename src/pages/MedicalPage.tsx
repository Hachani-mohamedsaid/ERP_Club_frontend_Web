import { useNavigate } from "react-router-dom";
import { Activity, HeartPulse, TrendingUp, Plus, Calendar, Upload, FileText } from "lucide-react";
import { AnimatedGlassCard } from "../components/ui/AnimatedGlassCard";
import { GlassCard } from "../components/ui/GlassCard";
import { AnimatedBadge } from "../components/ui/AnimatedBadge";
import { Button } from "../components/ui/Button";
import { MedicalTimeline } from "../components/medical/MedicalTimeline";
import { ProgressBar } from "../components/coach/ProgressBar";
import { BodyInjuryViewer } from "../components/medical/BodyInjuryViewer";
import { AIRiskPrediction } from "../components/medical/AIRiskPrediction";
import { motion } from "framer-motion";

interface MedicalCase {
  player: string;
  returnEstimate: string;
  status: "Blessé" | "En rééducation" | "Disponible sous réserve";
  recovery: number;
  position: string;
  injury: string;
  grade: string;
}

const CASES: MedicalCase[] = [
  { player: "Ahmed Ben Salah", position: "BU", returnEstimate: "26 jours", status: "Blessé", recovery: 60, injury: "Genou Droit", grade: "Grade II" },
  { player: "Ali Ben Youssef", position: "MC", returnEstimate: "12 jours", status: "En rééducation", recovery: 45, injury: "Cheville Droite", grade: "Grade I" },
  { player: "Walid Hammami", position: "DG", returnEstimate: "6 jours", status: "Disponible sous réserve", recovery: 90, injury: "Cuisse Gauche", grade: "Grade I" },
];

const STATUS_TONE: Record<MedicalCase["status"], "danger" | "warning" | "info"> = {
  Blessé: "danger",
  "En rééducation": "warning",
  "Disponible sous réserve": "info",
};

const TIMELINE_EVENTS = [
  { id: "1", date: "Aujourd'hui", title: "Contrôle kiné", description: "Rééducation ciblée pour Ahmed.", type: "warning" as const },
  { id: "2", date: "Hier", title: "Analyse IRM", description: "Bilan la cheville de Ali.", type: "info" as const },
  { id: "3", date: "2 jours", title: "Séance reprise", description: "Mobilité et proprioception.", type: "success" as const },
];

const BODY_ZONES = [
  { id: "head", name: "Tête", severity: "none" as const },
  { id: "shoulder-left", name: "Épaule gauche", severity: "none" as const },
  { id: "shoulder-right", name: "Épaule droite", severity: "low" as const, injuryInfo: { player: "Ali Ben Youssef", grade: "Grade I", risk: 35, daysRemaining: 12 } },
  { id: "arm-left", name: "Bras gauche", severity: "none" as const },
  { id: "arm-right", name: "Bras droit", severity: "none" as const },
  { id: "chest", name: "Poitrine", severity: "none" as const },
  { id: "abdomen", name: "Abdomen", severity: "none" as const },
  { id: "groin", name: "Aine", severity: "none" as const },
  { id: "knee-left", name: "Genou gauche", severity: "critical" as const, injuryInfo: { player: "Walid Hammami", grade: "Grade I", risk: 58, daysRemaining: 6 } },
  { id: "knee-right", name: "Genou droit", severity: "medium" as const, injuryInfo: { player: "Ahmed Ben Salah", grade: "Grade II", risk: 85, daysRemaining: 26 } },
  { id: "ankle-left", name: "Cheville gauche", severity: "none" as const },
  { id: "ankle-right", name: "Cheville droite", severity: "low" as const, injuryInfo: { player: "Ali Ben Youssef", grade: "Grade I", risk: 42, daysRemaining: 12 } },
];

const QUICK_ACTIONS = [
  { label: "Nouvelle blessure", icon: Plus, path: "/medical/blessures", color: "var(--color-state-danger)" },
  { label: "Rendez-vous", icon: Calendar, path: "/medical/rendez-vous", color: "var(--color-state-info)" },
  { label: "Upload document", icon: Upload, path: "/medical/documents", color: "var(--color-state-warning)" },
  { label: "Rapport", icon: FileText, path: "/medical/rapports", color: "var(--color-state-success)" },
];

function CaseCard({ medicalCase }: { medicalCase: MedicalCase }) {
  const tone = STATUS_TONE[medicalCase.status];
  const borderColor = tone === "danger" ? "var(--color-state-danger)" : tone === "warning" ? "var(--color-state-warning)" : "var(--color-state-info)";

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <GlassCard raised className="p-4" style={{ borderTop: `3px solid ${borderColor}` }}>
        <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{medicalCase.injury}</h3>
        <AnimatedBadge tone={tone === "danger" ? "warning" : tone}>{medicalCase.grade}</AnimatedBadge>
        <p className="mt-3 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{medicalCase.player}</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{medicalCase.position}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold" style={{ color: "var(--accent)" }}>{medicalCase.returnEstimate}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>retour estimé</p>
          </div>
          <AnimatedBadge tone={tone}>{medicalCase.status}</AnimatedBadge>
        </div>
        <div className="mt-3">
          <ProgressBar
            label="Récupération"
            value={medicalCase.recovery}
            color={medicalCase.recovery > 80 ? "var(--color-state-success)" : "var(--color-state-warning)"}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function MedicalPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
          <Button key={label} variant="glass" onClick={() => navigate(path)} className="gap-2">
            <Icon size={15} style={{ color }} />
            <span style={{ color: "var(--text-primary)" }}>+ {label}</span>
          </Button>
        ))}
      </div>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
        }}
      >
        <AnimatedGlassCard className="p-4" delay={0}>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <HeartPulse size={15} style={{ color: "var(--accent)" }} /> Blessés actifs
          </div>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>3</p>
        </AnimatedGlassCard>
        <AnimatedGlassCard className="p-4" delay={0.1}>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <Activity size={15} style={{ color: "var(--color-state-warning)" }} /> Retour moyen
          </div>
          <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>15 jours</p>
        </AnimatedGlassCard>
        <AnimatedGlassCard className="p-4" delay={0.2}>
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <TrendingUp size={15} style={{ color: "var(--color-state-success)" }} /> Dispo effectif
          </div>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>89%</p>
        </AnimatedGlassCard>
      </motion.div>

      <MedicalTimeline title="Injury Timeline" events={TIMELINE_EVENTS} />

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recovery Progress</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CASES.map((medicalCase, idx) => (
            <motion.div
              key={medicalCase.player}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.3 }}
            >
              <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{medicalCase.player}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{medicalCase.position}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{medicalCase.recovery}%</p>
                </div>
                <div className="mt-4">
                  <ProgressBar
                    label="Récupération"
                    value={medicalCase.recovery}
                    description={`${medicalCase.returnEstimate} estimé`}
                    color={medicalCase.recovery > 80 ? "var(--color-state-success)" : "var(--color-state-warning)"}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <div>
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Suivi des dossiers</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <CaseCard key={c.player} medicalCase={c} />
          ))}
        </div>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Analyseur de Blessure</h2>
        <p className="mb-6 text-xs" style={{ color: "var(--text-muted)" }}>Survolez une zone pour voir les détails du joueur</p>
        <BodyInjuryViewer zones={BODY_ZONES} />
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="mb-6 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Prédiction IA - Risque de Blessure</h2>
        <AIRiskPrediction
          overallRisk={78}
          risksByZone={[
            { zone: "Genou droit", risk: 85, severity: "critical" },
            { zone: "Cheville gauche", risk: 45, severity: "medium" },
            { zone: "Épaule droite", risk: 25, severity: "low" },
          ]}
        />
      </GlassCard>
    </div>
  );
}
