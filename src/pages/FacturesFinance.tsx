import { FileText, Clock, CheckCircle } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

interface Invoice {
  id: string;
  reference: string;
  fournisseur: string;
  type: "Fournisseur" | "Équipement" | "Médical" | "Transport";
  montant: number;
  date: string;
  status: "Payée" | "En attente" | "Retard";
}

const INVOICES: Invoice[] = [
  { id: "1", reference: "FAC-001", fournisseur: "Équipement Sport Plus", type: "Équipement", montant: 15000, date: "01/06/2026", status: "Payée" },
  { id: "2", reference: "FAC-002", fournisseur: "Maintenance Stade", type: "Transport", montant: 8500, date: "05/06/2026", status: "Payée" },
  { id: "3", reference: "FAC-003", fournisseur: "Transport Club", type: "Transport", montant: 12000, date: "10/06/2026", status: "En attente" },
  { id: "4", reference: "FAC-004", fournisseur: "Assurance Joueurs", type: "Fournisseur", montant: 25000, date: "15/05/2026", status: "Retard" },
  { id: "5", reference: "FAC-005", fournisseur: "Fournitures Médicales", type: "Médical", montant: 6500, date: "12/06/2026", status: "En attente" },
];

const KPI_CARDS = [
  { label: "Factures payées", value: "18", color: "#10B981" },
  { label: "En attente", value: "5", color: "#F59E0B" },
  { label: "Retard", value: "2", color: "#EF4444" },
];

type InvoiceStatus = Invoice["status"];

type InvoiceStatusConfig = {
  icon: typeof FileText;
  color: string;
  tone: "success" | "warning" | "danger" | "info" | "neutral";
};

const STATUS_CONFIG: Record<InvoiceStatus, InvoiceStatusConfig> = {
  Payée: { icon: CheckCircle, color: "#10B981", tone: "success" },
  "En attente": { icon: Clock, color: "#F59E0B", tone: "warning" },
  Retard: { icon: FileText, color: "#EF4444", tone: "danger" },
};

export function FacturesFinance() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Gestion des Factures
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Suivi des factures et paiements
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPI_CARDS.map((kpi) => (
          <GlassCard key={kpi.label} className="p-4">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Factures
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost">Ajouter facture</Button>
          <Button variant="ghost">Exporter</Button>
        </div>
      </div>

      {/* Invoices Table */}
      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Factures
        </h2>
        <div className="space-y-3">
          {INVOICES.map((invoice) => {
            const config: InvoiceStatusConfig = STATUS_CONFIG[invoice.status];
            return (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-lg p-4 transition-transform hover:scale-[1.02]"
                style={{ border: "1px solid var(--surface-panel-border)" }}
              >
                <div className="flex-1">
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {invoice.reference} - {invoice.fournisseur}
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {invoice.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {invoice.montant.toLocaleString("fr-TN")} DT
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {invoice.type}
                    </p>
                  </div>
                  <Badge tone={config.tone}>{invoice.status}</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Voir</Button>
                    <Button variant="ghost" size="sm">Modifier</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
