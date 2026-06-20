import { useMemo } from "react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { DollarSign, CreditCard, ShieldCheck, Clock } from "lucide-react";

const PAYMENTS = [
  { id: "INV-001", club: "FC Carthage", amount: "24 500 DT", method: "Carte", status: "Paid", date: "18/06/2026" },
  { id: "INV-002", club: "ES Sahel", amount: "18 200 DT", method: "Virement", status: "Pending", date: "17/06/2026" },
  { id: "INV-003", club: "CS Sfaxien", amount: "12 900 DT", method: "Carte", status: "Failed", date: "16/06/2026" },
  { id: "INV-004", club: "US Monastir", amount: "9 400 DT", method: "Refund", status: "Refunded", date: "15/06/2026" },
];

export function SuperAdminPayments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Payment Management
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Tableau de bord des paiements et des factures.
          </p>
        </div>
        <Button variant="ghost">Nouveau paiement</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Paiements", value: "4", icon: CreditCard },
          { label: "Montant total", value: "65 000 DT", icon: DollarSign },
          { label: "En attente", value: "1", icon: Clock },
          { label: "Remboursés", value: "1", icon: ShieldCheck },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <GlassCard raised key={metric.label} className="p-5">
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{metric.label}</p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{metric.value}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique des paiements</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Dernières transactions récentes.</p>
          </div>
          <Button variant="ghost">Exporter</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Invoice</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Club</th>
                <th className="px-4 py-3 text-right font-semibold" style={{ color: "var(--text-muted)" }}>Amount</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Method</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{payment.id}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{payment.club}</td>
                  <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>{payment.amount}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{payment.method}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{payment.status}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
