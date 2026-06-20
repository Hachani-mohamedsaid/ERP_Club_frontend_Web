import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface RecruitmentRequest {
  id: string;
  prospect: string;
  position: string;
  potential: number;
  status: "new" | "analysis" | "validation" | "signature" | "done";
  date: string;
  notes: string;
}

const REQUESTS: RecruitmentRequest[] = [
  { id: "1", prospect: "Youssef Ben Ali", position: "BU", potential: 89, status: "new", date: "2026-06-18", notes: "Tout frais" },
  { id: "2", prospect: "Nader Trabelsi", position: "MC", potential: 84, status: "analysis", date: "2026-06-16", notes: "Analyse technique en cours" },
  { id: "3", prospect: "Mouhamed Diallo", position: "Ailier", potential: 81, status: "validation", date: "2026-06-10", notes: "Attente directeur sportif" },
  { id: "4", prospect: "Karim Sassi", position: "DC", potential: 78, status: "signature", date: "2026-06-05", notes: "Dernière étape" },
  { id: "5", prospect: "Ali Messi", position: "DG", potential: 76, status: "done", date: "2026-05-28", notes: "Recrutement finalisé" },
];

const COLUMNS = [
  { id: "new", title: "Nouvelle", icon: AlertCircle, color: "var(--color-state-warning)" },
  { id: "analysis", title: "Analyse", icon: Clock, color: "var(--accent)" },
  { id: "validation", title: "Validation", icon: Clock, color: "var(--color-state-info)" },
  { id: "signature", title: "Signature", icon: Clock, color: "var(--color-state-warning)" },
  { id: "done", title: "Terminée", icon: CheckCircle, color: "var(--color-state-success)" },
];

export function ScoutRecruitmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Workflow de Recrutement
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Suivi des demandes de recrutement
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-full pb-4">
          {COLUMNS.map((column) => {
            const Icon = column.icon;
            const columnRequests = REQUESTS.filter((r) => r.status === column.id);

            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className="mb-4 flex items-center gap-2">
                  <Icon size={18} style={{ color: column.color }} />
                  <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {column.title}
                  </h2>
                  <Badge tone="neutral">{columnRequests.length}</Badge>
                </div>

                <div className="space-y-3">
                  {columnRequests.map((request) => (
                    <GlassCard
                      key={request.id}
                      className="p-4 cursor-grab hover:cursor-grabbing active:cursor-grabbing transition-all"
                    >
                      <div className="mb-3">
                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                          {request.prospect}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          {request.position}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                              Potentiel
                            </p>
                            <span className="text-sm font-bold" style={{ color: "var(--accent)" }}>
                              {request.potential}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-[color:var(--surface-panel-border)]">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${request.potential}%`, background: "var(--accent)" }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                        {request.notes}
                      </p>

                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {request.date}
                      </p>
                    </GlassCard>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <GlassCard raised className="p-6">
        <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
          Statistiques du workflow
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          {COLUMNS.map((column) => {
            const Icon = column.icon;
            const count = REQUESTS.filter((r) => r.status === column.id).length;
            return (
              <div key={column.id} className="rounded-[var(--radius-odin-md)] border p-4 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
                <Icon size={20} className="mx-auto mb-2" style={{ color: column.color }} />
                <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {count}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {column.title}
                </p>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
