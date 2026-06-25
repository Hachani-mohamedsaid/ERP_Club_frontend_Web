import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminActionButton,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminListRow,
  SuperAdminFilterPills,
  SuperAdminSearchInput,
  SuperAdminCard,
} from "../components/superadmin";
import {
  MessageCircle, LifeBuoy, CheckCircle2, ClipboardList,
  Clock, ChevronRight, User, Calendar,
} from "lucide-react";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

type TicketStatus = "Ouvert" | "En cours" | "Résolu";
type Priority = "Critique" | "Haute" | "Normale";

interface Ticket {
  id: string;
  ticketNumber: string;
  club: string;
  subject: string;
  priority: Priority;
  status: TicketStatus;
  agent: string;
  date: string;
  updated: string;
  statusCode: string;
}

const STATUS_OPTIONS = ["Tous", "Ouvert", "En cours", "Résolu"] as const;
type StatusFilter = (typeof STATUS_OPTIONS)[number];

const STATUS_COLOR: Record<TicketStatus, string> = {
  Ouvert: "#EF4444",
  "En cours": "#FF7A00",
  Résolu: "#22C55E",
};

const PRIORITY_COLOR: Record<Priority, string> = {
  Critique: "#EF4444",
  Haute: "#FF7A00",
  Normale: "#3B82F6",
};

export function SuperAdminSupport() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Tous");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ clubName: "", subject: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, error, reload } = usePlatformResource(
    () => platformApi.getSupport({ status: statusFilter, search }),
    [statusFilter, search],
  );

  const tickets = (data?.tickets ?? []) as Ticket[];
  const summary = data?.summary ?? { open: 0, inProgress: 0, resolved: 0, slaPct: 100 };

  async function handleAssign(ticket: Ticket) {
    setActionLoading(true);
    try {
      await platformApi.updateSupportTicket(ticket.id, {
        status: "IN_PROGRESS",
        agentName: "Support ODIN",
      });
      await reload();
      setSelectedTicket(null);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleResolve(ticket: Ticket) {
    setActionLoading(true);
    try {
      await platformApi.updateSupportTicket(ticket.id, { status: "RESOLVED" });
      await reload();
      setSelectedTicket(null);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setActionLoading(true);
    try {
      await platformApi.createSupportTicket(form);
      setShowCreate(false);
      setForm({ clubName: "", subject: "" });
      await reload();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Support & Assistance"
        subtitle="Gestion des tickets, SLA et centre d'aide."
        action={
          <SuperAdminActionButton onClick={() => setShowCreate(true)}>
            <MessageCircle size={14} /> Nouveau ticket
          </SuperAdminActionButton>
        }
      />

      <SuperAdminKpiGrid cols={4}>
        <SuperAdminKpiCard label="Tickets ouverts" value={String(summary.open)} icon={LifeBuoy} color="#EF4444" trend="Nécessite attention" />
        <SuperAdminKpiCard label="En cours" value={String(summary.inProgress)} icon={Clock} color="#FF7A00" trend="Assignés" />
        <SuperAdminKpiCard label="Résolus" value={String(summary.resolved)} icon={CheckCircle2} color="#22C55E" trend="Total" />
        <SuperAdminKpiCard label="SLA 24h" value={`${summary.slaPct}%`} icon={ClipboardList} color="#3B82F6" trend="Taux de réponse" />
      </SuperAdminKpiGrid>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SuperAdminFilterPills
              options={[...STATUS_OPTIONS]}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as StatusFilter)}
            />
            <SuperAdminSearchInput value={search} onChange={setSearch} placeholder="Rechercher ticket..." className="sm:w-56" />
          </div>

          <SuperAdminSection
            title="Liste des tickets"
            subtitle={`${tickets.length} ticket${tickets.length > 1 ? "s" : ""} trouvé${tickets.length > 1 ? "s" : ""}`}
          >
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                  <SuperAdminListRow>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: PRIORITY_COLOR[ticket.priority] }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ticket.subject}</p>
                        <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          {ticket.ticketNumber} · {ticket.club} · {ticket.updated}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${STATUS_COLOR[ticket.status]}18`, color: STATUS_COLOR[ticket.status] }}>
                          {ticket.status}
                        </span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ background: `${PRIORITY_COLOR[ticket.priority]}18`, color: PRIORITY_COLOR[ticket.priority] }}>
                          {ticket.priority}
                        </span>
                      </div>
                      <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                    </div>
                  </SuperAdminListRow>
                </div>
              ))}
              {tickets.length === 0 && !loading && (
                <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucun ticket</p>
              )}
            </div>
          </SuperAdminSection>
        </div>

        {selectedTicket ? (
          <SuperAdminSection
            title={selectedTicket.ticketNumber}
            subtitle="Détails du ticket"
            action={<SuperAdminGhostButton onClick={() => setSelectedTicket(null)}>Fermer</SuperAdminGhostButton>}
          >
            <div className="space-y-4">
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedTicket.subject}</p>
              <div className="space-y-3 text-sm">
                {[
                  { icon: User, label: "Club", value: selectedTicket.club },
                  { icon: User, label: "Agent", value: selectedTicket.agent },
                  { icon: Calendar, label: "Créé le", value: selectedTicket.date },
                  { icon: Clock, label: "Mis à jour", value: selectedTicket.updated },
                ].map(({ icon: Icon, label, value }) => (
                  <SuperAdminListRow key={label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                        <Icon size={12} /> {label}
                      </div>
                      <span className="font-medium" style={{ color: "var(--text-primary)" }}>{value}</span>
                    </div>
                  </SuperAdminListRow>
                ))}
              </div>
              {selectedTicket.status !== "Résolu" && (
                <div className="space-y-2 pt-2">
                  <SuperAdminActionButton disabled={actionLoading} onClick={() => handleAssign(selectedTicket)}>
                    Prendre en charge
                  </SuperAdminActionButton>
                  <SuperAdminGhostButton className="w-full justify-center" disabled={actionLoading} onClick={() => handleResolve(selectedTicket)}>
                    Marquer résolu
                  </SuperAdminGhostButton>
                </div>
              )}
            </div>
          </SuperAdminSection>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-[20px] border" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(15,29,58,0.6)" }}>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sélectionnez un ticket</p>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <SuperAdminCard hover={false} className="w-full max-w-md !p-6">
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Nouveau ticket</h3>
            <form onSubmit={handleCreate} className="grid gap-3">
              <label className="text-sm">
                <span style={{ color: "var(--text-muted)" }}>Club</span>
                <input required className="glass-input mt-1 w-full" value={form.clubName} onChange={(e) => setForm((f) => ({ ...f, clubName: e.target.value }))} />
              </label>
              <label className="text-sm">
                <span style={{ color: "var(--text-muted)" }}>Sujet</span>
                <input required className="glass-input mt-1 w-full" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
              </label>
              <div className="mt-2 flex justify-end gap-2">
                <SuperAdminGhostButton type="button" onClick={() => setShowCreate(false)}>Annuler</SuperAdminGhostButton>
                <SuperAdminActionButton type="submit" disabled={actionLoading}>Créer</SuperAdminActionButton>
              </div>
            </form>
          </SuperAdminCard>
        </div>
      )}
    </SuperAdminPageTransition>
  );
}
