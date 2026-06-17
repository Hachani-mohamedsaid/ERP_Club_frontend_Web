import { AlertTriangle, Calendar } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface ContractAlert {
  player: string;
  daysLeft: number;
}

const ALERTS: ContractAlert[] = [
  { player: "Mehdi Trabelsi", daysLeft: 12 },
  { player: "Anis Khelifi", daysLeft: 24 },
  { player: "Sami Jendoubi", daysLeft: 29 },
];

export function ContractAlerts() {
  return (
    <GlassCard className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={15} style={{ color: "var(--color-state-warning)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Contrats expirant bientôt
        </h2>
      </div>

      <div className="space-y-3">
        {ALERTS.map((a) => (
          <div
            key={a.player}
            className="flex items-center justify-between rounded-[var(--radius-odin-md)] px-3 py-2.5"
            style={{ background: "var(--color-state-warning-bg)" }}
          >
            <div className="flex items-center gap-2.5">
              <Calendar size={14} style={{ color: "var(--color-state-warning)" }} />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {a.player}
              </span>
            </div>
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--color-state-warning)" }}
            >
              {a.daysLeft} jours
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
