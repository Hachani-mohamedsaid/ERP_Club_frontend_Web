import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { AICard } from "../components/coach/AICard";

interface Prospect {
  name: string;
  age: number;
  position: string;
  club: string;
  nationality: string;
  potential: number;
}

interface ScoutReport {
  label: string;
  value: number;
}

interface RecruitmentRequest {
  role: string;
  ageRange: string;
  budget: string;
}

const PROSPECTS: Prospect[] = [
  { name: "Youssef Ben Ali", age: 17, position: "Attaquant", club: "AS Ariana", nationality: "TN", potential: 89 },
  { name: "Nader Trabelsi", age: 19, position: "Milieu défensif", club: "Stade Tunisien", nationality: "TN", potential: 84 },
  { name: "Mouhamed Diallo", age: 21, position: "Ailier", club: "AFAD Djékanou", nationality: "CI", potential: 81 },
];

const REPORTS: ScoutReport[] = [
  { label: "Technique", value: 88 },
  { label: "Physique", value: 83 },
  { label: "Mental", value: 79 },
  { label: "Vitesse", value: 85 },
  { label: "Potentiel", value: 91 },
];

const REQUESTS: RecruitmentRequest[] = [
  { role: "Milieu défensif", ageRange: "18-25 ans", budget: "250 000 DT" },
  { role: "Arrière gauche", ageRange: "20-27 ans", budget: "180 000 DT" },
];

export function ScoutingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Scouting
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Prospects, rapports scouts et demandes de recrutement
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Prospects
          </h2>
          <div className="space-y-3">
            {PROSPECTS.map((prospect) => (
              <div
                key={prospect.name}
                className="rounded-[var(--radius-odin-md)] border px-4 py-3 transition-all duration-200 hover:bg-accent/5"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {prospect.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {prospect.age} ans · {prospect.position} · {prospect.club}
                    </p>
                  </div>
                  <Badge tone="info">Potentiel {prospect.potential}</Badge>
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  Nationalité {prospect.nationality}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="ghost">Voir profil</Button>
                  <Button type="button">Accepter</Button>
                  <Button type="button" variant="ghost">Refuser</Button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Scout Reports
          </h2>
          <div className="space-y-3">
            {REPORTS.map((report) => (
              <div key={report.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span style={{ color: "var(--text-secondary)" }}>{report.label}</span>
                  <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {report.value}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[color:var(--surface-panel-border)]">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${report.value}%`, background: "var(--accent)" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button type="button">Voir profil</Button>
            <Button type="button" variant="glass">Envoyer au coach</Button>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Recruitment Requests
          </h2>
          <div className="space-y-3">
            {REQUESTS.map((request) => (
              <div
                key={request.role}
                className="rounded-[var(--radius-odin-md)] border px-4 py-3"
                style={{ borderColor: "var(--surface-panel-border)" }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {request.role}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {request.ageRange} · Budget {request.budget}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <AICard
            title="Joueur du mois"
            message="Youssef Ben Ali progresse rapidement sur la phase offensive et gagne en régularité."
            accent="success"
          />
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Validation Recrutement
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button type="button">Accepter</Button>
            <Button type="button" variant="ghost">Refuser</Button>
            <Button type="button" variant="glass">Demander plus d'informations</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
