import { useState, useCallback } from "react";
import { DollarSign, AlertCircle, Clock, TrendingUp } from "lucide-react";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminActionButton,
  SuperAdminCard,
} from "../components/superadmin";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";
import { useOpenFromNavState } from "../hooks/useOpenFromNavState";

const STATUS_COLOR: Record<string, string> = {
  Paid: "#22C55E",
  Pending: "#FF7A00",
  Failed: "#EF4444",
  Refunded: "#8B5CF6",
};

function fmtDt(n: number) {
  return `${n.toLocaleString("fr-FR")} DT`;
}

export function SuperAdminPayments() {
  const { data, loading, error, reload } = usePlatformResource(() => platformApi.getPayments(), []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ organizationId: "", amount: "", method: "Virement" });
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const summary = data?.summary ?? { failed: 0, pending: 0, revenueToday: 0, revenueMonth: 0 };
  const payments = data?.payments ?? [];

  const openForm = useCallback(async () => {
    setSubmitError(null);
    const list = await platformApi.getOrganizations();
    setOrgs(list.map((o) => ({ id: o.id, name: o.name })));
    setForm({ organizationId: list[0]?.id ?? "", amount: "", method: "Virement" });
    setShowForm(true);
  }, []);

  useOpenFromNavState("openForm", () => {
    void openForm();
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.organizationId || !form.amount) {
      setSubmitError("Sélectionnez un club et saisissez un montant.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await platformApi.recordPayment({
        organizationId: form.organizationId,
        amount: Math.round(Number(form.amount)),
        method: form.method,
        status: "PAID",
      });
      setShowForm(false);
      setForm({ organizationId: "", amount: "", method: "Virement" });
      await reload();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Payment Management"
        subtitle="Paiements SaaS après période d'essai."
        action={<SuperAdminGhostButton onClick={() => void openForm()}>Nouveau paiement</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Failed payments" value={String(summary.failed)} icon={AlertCircle} color="#EF4444" />
        <SuperAdminKpiCard label="Pending payments" value={String(summary.pending)} icon={Clock} color="#FF7A00" />
        <SuperAdminKpiCard label="Revenue today" value={fmtDt(summary.revenueToday)} icon={DollarSign} color="#22C55E" />
        <SuperAdminKpiCard label="Revenue month" value={fmtDt(summary.revenueMonth)} icon={TrendingUp} color="#3B82F6" />
      </SuperAdminKpiGrid>

      <SuperAdminSection title="Historique des paiements" subtitle="Transactions plateforme SaaS.">
        {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
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
              {payments.map((payment: { id: string; club: string; amountLabel: string; method: string; status: string; date: string }) => (
                <tr key={payment.id} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{payment.id}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{payment.club}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{payment.amountLabel}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{payment.method}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${STATUS_COLOR[payment.status] ?? "#94A3B8"}18`, color: STATUS_COLOR[payment.status] ?? "#94A3B8" }}>{payment.status}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SuperAdminSection>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <SuperAdminCard hover={false} className="w-full max-w-md !p-6">
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Enregistrer un paiement</h3>
            <form onSubmit={handleSubmit} className="grid gap-3">
              <label className="text-sm">
                <span style={{ color: "var(--text-muted)" }}>Club</span>
                <select
                  required
                  className="glass-input mt-1 w-full"
                  value={form.organizationId}
                  onChange={(e) => setForm((f) => ({ ...f, organizationId: e.target.value }))}
                >
                  <option value="">Sélectionner…</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span style={{ color: "var(--text-muted)" }}>Montant (DT)</span>
                <input
                  required
                  type="number"
                  min={1}
                  className="glass-input mt-1 w-full"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                />
              </label>
              <label className="text-sm">
                <span style={{ color: "var(--text-muted)" }}>Méthode</span>
                <select
                  className="glass-input mt-1 w-full"
                  value={form.method}
                  onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                >
                  <option>Virement</option>
                  <option>Carte</option>
                  <option>Espèces</option>
                </select>
              </label>
              {submitError && <p className="text-sm text-red-400">{submitError}</p>}
              <div className="mt-2 flex justify-end gap-2">
                <SuperAdminGhostButton type="button" onClick={() => setShowForm(false)}>Annuler</SuperAdminGhostButton>
                <SuperAdminActionButton type="submit" disabled={submitting}>Enregistrer</SuperAdminActionButton>
              </div>
            </form>
          </SuperAdminCard>
        </div>
      )}
    </SuperAdminPageTransition>
  );
}
