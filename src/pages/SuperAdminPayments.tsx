import { DollarSign, AlertCircle, Clock, TrendingUp } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection } from "../components/superadmin";

const PAYMENTS = [
  { id: "INV-001", club: "FC Carthage", amount: "24 500 DT", method: "Carte", status: "Paid", date: "18/06/2026" },
  { id: "INV-002", club: "ES Sahel", amount: "18 200 DT", method: "Virement", status: "Pending", date: "17/06/2026" },
  { id: "INV-003", club: "CS Sfaxien", amount: "12 900 DT", method: "Carte", status: "Failed", date: "16/06/2026" },
  { id: "INV-004", club: "US Monastir", amount: "9 400 DT", method: "Refund", status: "Refunded", date: "15/06/2026" },
];

const STATUS_COLOR: Record<string, string> = {
  Paid: "#22C55E",
  Pending: "#FF7A00",
  Failed: "#EF4444",
  Refunded: "#8B5CF6",
};

export function SuperAdminPayments() {
  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Payment Management"
        subtitle="Tableau de bord des paiements et des factures."
        action={<SuperAdminGhostButton>Nouveau paiement</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Failed payments" value="5" icon={AlertCircle} color="#EF4444" />
        <SuperAdminKpiCard label="Pending payments" value="12" icon={Clock} color="#FF7A00" />
        <SuperAdminKpiCard label="Revenue today" value="8 400 DT" icon={DollarSign} color="#22C55E" />
        <SuperAdminKpiCard label="Revenue month" value="245 000 DT" icon={TrendingUp} color="#3B82F6" />
      </SuperAdminKpiGrid>

      <SuperAdminSection title="Historique des paiements" subtitle="Dernières transactions récentes." action={<SuperAdminGhostButton>Exporter</SuperAdminGhostButton>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                {["Invoice", "Club", "Amount", "Method", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{payment.id}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{payment.club}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{payment.amount}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{payment.method}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${STATUS_COLOR[payment.status]}18`, color: STATUS_COLOR[payment.status] }}>{payment.status}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SuperAdminSection>
    </SuperAdminPageTransition>
  );
}
