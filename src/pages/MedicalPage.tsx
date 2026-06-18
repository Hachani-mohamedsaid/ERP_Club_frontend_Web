import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface MedicalCase {
  player: string;
  injury: string;
  injuryDate: string;
  returnEstimate: string;
  status: "Blessé" | "En rééducation";
}

const CASES: MedicalCase[] = [
  {
    player: "Walid Hammami",
    injury: "Entorse genou",
    injuryDate: "28 mai 2026",
    returnEstimate: "15 juil. 2026",
    status: "Blessé",
  },
  {
    player: "Mehdi Trabelsi",
    injury: "Fatigue musculaire",
    injuryDate: "5 juin 2026",
    returnEstimate: "20 juin 2026",
    status: "En rééducation",
  },
  {
    player: "Oussama Ben Youssef",
    injury: "Contusion cuisse",
    injuryDate: "10 juin 2026",
    returnEstimate: "25 juin 2026",
    status: "Blessé",
  },
  {
    player: "Rami Gharbi",
    injury: "Élongation ischio-jambiers",
    injuryDate: "2 juin 2026",
    returnEstimate: "30 juin 2026",
    status: "En rééducation",
  },
  {
    player: "Hichem Bouazizi",
    injury: "Tendinite cheville",
    injuryDate: "12 juin 2026",
    returnEstimate: "5 juil. 2026",
    status: "En rééducation",
  },
];

const STATUS_TONE: Record<MedicalCase["status"], "danger" | "warning"> = {
  Blessé: "danger",
  "En rééducation": "warning",
};

export function MedicalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Médical
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Suivi des indisponibilités et rééducation
        </p>
      </div>

      <GlassCard className="p-4">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          3 joueurs indisponibles, 1 en phase finale de rééducation
        </p>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Cas actifs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-2 text-xs font-medium">Joueur</th>
                <th className="pb-2 text-xs font-medium">Type de blessure</th>
                <th className="pb-2 text-xs font-medium">Date de blessure</th>
                <th className="pb-2 text-xs font-medium">Retour estimé</th>
                <th className="pb-2 text-xs font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((medicalCase) => (
                <tr
                  key={medicalCase.player}
                  style={{ borderTop: "1px solid var(--surface-panel-border)" }}
                >
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {medicalCase.player}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {medicalCase.injury}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {medicalCase.injuryDate}
                  </td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                    {medicalCase.returnEstimate}
                  </td>
                  <td className="py-3">
                    <Badge tone={STATUS_TONE[medicalCase.status]}>{medicalCase.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
