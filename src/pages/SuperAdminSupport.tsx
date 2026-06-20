import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { MessageCircle, LifeBuoy, CheckCircle2, ClipboardList } from "lucide-react";

const TICKETS = [
  { id: "SUP-001", club: "FC Carthage", subject: "Problème de facturation", status: "Ouvert", updated: "18/06/2026" },
  { id: "SUP-002", club: "ES Sahel", subject: "Demande d'accès API", status: "En cours", updated: "17/06/2026" },
  { id: "SUP-003", club: "CS Sfaxien", subject: "Incident de synchronisation", status: "Résolu", updated: "16/06/2026" },
];

export function SuperAdminSupport() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Support & Assistance
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Tableau de bord des tickets et centre d'aide.
          </p>
        </div>
        <Button variant="ghost">Nouveau ticket</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <LifeBuoy size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Tickets ouverts</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>8</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Réponse moyenne</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>1.2h</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <ClipboardList size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Articles KB</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>18</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>SLA 24h</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>98%</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Tickets récents</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Suivi des demandes en attente.</p>
          </div>
          <Button variant="ghost">Voir tout</Button>
        </div>
        <div className="space-y-3">
          {TICKETS.map((ticket) => (
            <div key={ticket.id} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{ticket.id}</p>
                <span className="rounded-full bg-[#E0F2FE] px-2 py-1 text-xs font-semibold text-[#0369A1]">{ticket.status}</span>
              </div>
              <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>{ticket.subject}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{ticket.club} · {ticket.updated}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
