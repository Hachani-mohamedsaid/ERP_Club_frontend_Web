import { useState, useMemo } from "react";
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
} from "../components/superadmin";
import {
  MessageCircle, LifeBuoy, CheckCircle2, ClipboardList,
  Clock, AlertTriangle, ChevronRight, User, Calendar,
} from "lucide-react";

type TicketStatus = "Ouvert" | "En cours" | "Résolu";
type Priority = "Critique" | "Haute" | "Normale";

interface Ticket {
  id: string;
  club: string;
  subject: string;
  priority: Priority;
  status: TicketStatus;
  agent: string;
  date: string;
  updated: string;
}

const TICKETS: Ticket[] = [
  { id: "SUP-001", club: "FC Carthage", subject: "Problème de facturation récurrent", priority: "Critique", status: "Ouvert", agent: "Non assigné", date: "16/06/2026", updated: "18/06/2026" },
  { id: "SUP-002", club: "ES Sahel", subject: "Demande d'accès API étendue", priority: "Haute", status: "En cours", agent: "Amine Ben Ali", date: "15/06/2026", updated: "17/06/2026" },
  { id: "SUP-003", club: "CS Sfaxien", subject: "Incident de synchronisation données", priority: "Haute", status: "En cours", agent: "Sara Khlifi", date: "14/06/2026", updated: "16/06/2026" },
  { id: "SUP-004", club: "US Monastir", subject: "Réinitialisation mot de passe en masse", priority: "Normale", status: "Résolu", agent: "Mohamed Triki", date: "12/06/2026", updated: "14/06/2026" },
  { id: "SUP-005", club: "CA Bizertin", subject: "Export CSV ne fonctionne pas", priority: "Normale", status: "Résolu", agent: "Sara Khlifi", date: "10/06/2026", updated: "12/06/2026" },
  { id: "SUP-006", club: "FC Carthage", subject: "Erreur intégration Stripe webhook", priority: "Critique", status: "Ouvert", agent: "Non assigné", date: "18/06/2026", updated: "18/06/2026" },
];

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

  const filtered = useMemo(
    () =>
      TICKETS.filter((t) => {
        const matchesStatus = statusFilter === "Tous" || t.status === statusFilter;
        const matchesSearch =
          t.subject.toLowerCase().includes(search.toLowerCase()) ||
          t.club.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
      }),
    [statusFilter, search],
  );

  const counts = useMemo(
    () => ({
      open: TICKETS.filter((t) => t.status === "Ouvert").length,
      inProgress: TICKETS.filter((t) => t.status === "En cours").length,
      resolved: TICKETS.filter((t) => t.status === "Résolu").length,
    }),
    [],
  );

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Support & Assistance"
        subtitle="Gestion des tickets, SLA et centre d'aide."
        action={<SuperAdminActionButton><MessageCircle size={14} /> Nouveau ticket</SuperAdminActionButton>}
      />

      <SuperAdminKpiGrid cols={4}>
        <SuperAdminKpiCard label="Tickets ouverts" value={String(counts.open)} icon={LifeBuoy} color="#EF4444" trend="Nécessite attention" />
        <SuperAdminKpiCard label="En cours" value={String(counts.inProgress)} icon={Clock} color="#FF7A00" trend="Assignés" />
        <SuperAdminKpiCard label="Résolus" value={String(counts.resolved)} icon={CheckCircle2} color="#22C55E" trend="Ce mois" />
        <SuperAdminKpiCard label="SLA 24h" value="97%" icon={ClipboardList} color="#3B82F6" trend="Taux de réponse" />
      </SuperAdminKpiGrid>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* Ticket list */}
        <div className="space-y-4">
          {/* Filters */}
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
            subtitle={`${filtered.length} ticket${filtered.length > 1 ? "s" : ""} trouvé${filtered.length > 1 ? "s" : ""}`}
            action={<SuperAdminGhostButton>Exporter CSV</SuperAdminGhostButton>}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={statusFilter + search}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {filtered.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    whileHover={{ x: 2 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <SuperAdminListRow>
                      <div className="flex items-center gap-3">
                        {/* Priority indicator */}
                        <motion.div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ background: PRIORITY_COLOR[ticket.priority] }}
                          animate={{ scale: ticket.status === "Ouvert" ? [1, 1.5, 1] : 1, opacity: ticket.status === "Ouvert" ? [1, 0.5, 1] : 1 }}
                          transition={{ duration: 1.5, repeat: ticket.status === "Ouvert" ? Infinity : 0 }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                              {ticket.subject}
                            </p>
                          </div>
                          <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                            {ticket.id} · {ticket.club} · {ticket.updated}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1.5">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${STATUS_COLOR[ticket.status]}18`, color: STATUS_COLOR[ticket.status] }}>
                            {ticket.status}
                          </span>
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${PRIORITY_COLOR[ticket.priority]}18`, color: PRIORITY_COLOR[ticket.priority] }}>
                            {ticket.priority}
                          </span>
                        </div>

                        <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
                      </div>
                    </SuperAdminListRow>
                  </motion.div>
                ))}

                {filtered.length === 0 && (
                  <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
                    <LifeBuoy size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun ticket trouvé</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </SuperAdminSection>
        </div>

        {/* Ticket detail panel */}
        <AnimatePresence mode="wait">
          {selectedTicket ? (
            <motion.div
              key={selectedTicket.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.28 }}
            >
              <SuperAdminSection
                title={selectedTicket.id}
                subtitle="Détails du ticket"
                action={<SuperAdminGhostButton onClick={() => setSelectedTicket(null)}>Fermer</SuperAdminGhostButton>}
              >
                <div className="space-y-4">
                  <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{selectedTicket.subject}</p>

                  <div className="flex gap-2 flex-wrap">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: `${STATUS_COLOR[selectedTicket.status]}18`, color: STATUS_COLOR[selectedTicket.status] }}>
                      {selectedTicket.status}
                    </span>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: `${PRIORITY_COLOR[selectedTicket.priority]}18`, color: PRIORITY_COLOR[selectedTicket.priority] }}>
                      {selectedTicket.priority}
                    </span>
                  </div>

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

                  <div className="space-y-2 pt-2">
                    <SuperAdminActionButton>Prendre en charge</SuperAdminActionButton>
                    <SuperAdminGhostButton className="w-full justify-center">Marquer résolu</SuperAdminGhostButton>
                  </div>
                </div>
              </SuperAdminSection>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-64 items-center justify-center rounded-[20px] border"
              style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(15,29,58,0.6)" }}
            >
              <div className="text-center" style={{ color: "var(--text-muted)" }}>
                <MessageCircle size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sélectionnez un ticket pour voir les détails</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SuperAdminPageTransition>
  );
}
