import { Activity, HeartPulse } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Timeline } from "../components/coach/Timeline";
import { ProgressBar } from "../components/coach/ProgressBar";

interface MedicalCase {
  player: string;
  returnEstimate: string;
  status: "Blessé" | "En rééducation" | "Disponible sous réserve";
  recovery: number;
  position: string;
}

const CASES: MedicalCase[] = [
  { player: "Ahmed Ben Salah", position: "BU", returnEstimate: "15 jours", status: "Blessé", recovery: 60 },
  { player: "Ali Ben Youssef", position: "MC", returnEstimate: "7 jours", status: "En rééducation", recovery: 45 },
  { player: "Walid Hammami", position: "DG", returnEstimate: "10 jours", status: "Disponible sous réserve", recovery: 90 },
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

export function MedicalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Médical
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Vue médicale avec timelines et récupération
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <HeartPulse size={15} style={{ color: "var(--accent)" }} /> Blessés actifs
          </div>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>3</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <Activity size={15} style={{ color: "var(--color-state-warning)" }} /> Retour moyen
          </div>
          <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>10 jours</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            <HeartPulse size={15} style={{ color: "var(--color-state-success)" }} /> Dispo effectif
          </div>
          <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>89%</p>
        </GlassCard>
      </div>

      <Timeline title="Injury Timeline" events={TIMELINE_EVENTS} />

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Recovery Progress
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {CASES.map((medicalCase) => (
            <div key={medicalCase.player} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
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
          ))}
        </div>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Suivi des dossiers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-2 text-xs font-medium">Joueur</th>
                <th className="pb-2 text-xs font-medium">Retour estimé</th>
                <th className="pb-2 text-xs font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((medicalCase) => (
                <tr key={medicalCase.player} style={{ borderTop: "1px solid var(--surface-panel-border)" }} className="transition-colors duration-300 hover:bg-accent/5">
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>{medicalCase.player}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{medicalCase.returnEstimate}</td>
                  <td className="py-3"><Badge tone={STATUS_TONE[medicalCase.status]}>{medicalCase.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
