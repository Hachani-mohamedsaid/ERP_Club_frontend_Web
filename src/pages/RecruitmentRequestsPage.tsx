import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { PerformanceChart } from "../components/coach/PerformanceChart";

const REQUESTS = [
  { position: "Milieu Défensif", age: "18-24", budget: "200k DT", status: "En attente" },
  { position: "Ailier gauche", age: "19-23", budget: "150k DT", status: "Analyse" },
  { position: "Attaquant", age: "20-25", budget: "320k DT", status: "Scout" },
];

const PIPELINE = [
  "Nouvelle",
  "Analyse",
  "Scout",
  "Validation",
  "Signature",
];

const CHART_DATA = [
  { name: "BU", value: 8 },
  { name: "MC", value: 6 },
  { name: "DG", value: 4 },
  { name: "DD", value: 3 },
  { name: "Att", value: 5 },
];

const KPI_CARDS = [
  { label: "Demandes ouvertes", value: 12, tone: "warning" as const },
  { label: "Prospects validés", value: 8, tone: "success" as const },
  { label: "Budget restant", value: "625k DT", tone: "info" as const },
];

export function RecruitmentRequestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Recrutement</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Pipeline, priorités et vision d’ensemble</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {KPI_CARDS.map((item) => (
          <GlassCard key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
            <p className="mt-3 text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
            <Badge tone={item.tone}>{item.tone === "warning" ? "Ouvert" : item.tone === "success" ? "Validé" : "Budget"}</Badge>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <GlassCard className="p-6 xl:col-span-1">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pipeline de recrutement</h2>
          <div className="mt-4 space-y-3">
            {PIPELINE.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold" style={{ color: "var(--accent)" }}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{step}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <PerformanceChart
          title="Recrutement par poste"
          subtitle="Priorité actuelle des besoins"
          data={CHART_DATA}
          type="bar"
          height={280}
          dataKey="value"
          className="xl:col-span-2"
        />
      </div>

      <GlassCard raised className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Demandes en cours</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Suivi prioritaire</p>
          </div>
          <button className="glass-input px-3 py-2">Créer une demande</button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ color: "var(--text-muted)" }}>
                <th className="pb-2 text-xs font-medium">Position</th>
                <th className="pb-2 text-xs font-medium">Age</th>
                <th className="pb-2 text-xs font-medium">Budget</th>
                <th className="pb-2 text-xs font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map((request, index) => (
                <tr key={index} style={{ borderTop: "1px solid var(--surface-panel-border)" }} className="transition-colors duration-300 hover:bg-accent/5">
                  <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>{request.position}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{request.age}</td>
                  <td className="py-3" style={{ color: "var(--text-secondary)" }}>{request.budget}</td>
                  <td className="py-3"><Badge tone={request.status === "En attente" ? "warning" : request.status === "Analyse" ? "info" : "success"}>{request.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
