import { Badge } from "../components/ui/Badge";
import { Tag, LayoutGrid, Clock, TrendingUp, ShieldCheck } from "lucide-react";
import {
  SuperAdminPageTransition,
  SuperAdminPageHeader,
  SuperAdminGhostButton,
  SuperAdminKpiCard,
  SuperAdminKpiGrid,
  SuperAdminSection,
  SuperAdminCard,
} from "../components/superadmin";
import { platformApi } from "../lib/api/platform";
import { usePlatformResource } from "../hooks/usePlatformResource";

function fmtDt(n: number) {
  return `${n.toLocaleString("fr-FR")} DT`;
}

export function SuperAdminSubscriptions() {
  const { data: plans, loading: plansLoading } = usePlatformResource(() => platformApi.getPlans(), []);
  const { data: subsData, loading: subsLoading, error } = usePlatformResource(
    () => platformApi.getSubscriptions(),
    [],
  );

  const summary = subsData?.summary ?? { mrr: 0, arr: 0, active: 0, expiring: 0 };
  const subscriptions = subsData?.subscriptions ?? [];

  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Abonnements"
        subtitle="Essai gratuit → paiement → abonnement actif."
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="MRR" value={fmtDt(summary.mrr)} icon={TrendingUp} color="#FF7A00" />
        <SuperAdminKpiCard label="ARR" value={fmtDt(summary.arr)} icon={LayoutGrid} color="#3B82F6" />
        <SuperAdminKpiCard label="Abonnements actifs" value={String(summary.active)} icon={ShieldCheck} color="#10B981" />
        <SuperAdminKpiCard label="Expirations (30j)" value={String(summary.expiring)} icon={Clock} color="#EF4444" />
      </SuperAdminKpiGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {(plans ?? []).map((plan: { id: string; name: string; priceLabel: string; features: string[]; clubs: number }) => (
          <SuperAdminCard key={plan.id} glow hover={false}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{plan.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.priceLabel}</p>
              </div>
              <Tag size={20} style={{ color: "#FF7A00" }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {plan.features.map((feature: string) => (
                <li key={feature} className="flex items-center gap-2"><span>•</span><span>{feature}</span></li>
              ))}
            </ul>
            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>{plan.clubs} clubs</p>
          </SuperAdminCard>
        ))}
        {plansLoading && <p className="text-sm col-span-3" style={{ color: "var(--text-muted)" }}>Chargement des plans…</p>}
      </div>

      <SuperAdminSection title="Abonnements récents" subtitle="Suivi essai, paiement et échéances.">
        {subsLoading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                {["Club", "Plan", "Statut", "Date début", "Expiration", "Paiement"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((item: { club: string; plan: string; status: string; starts: string; expires: string; payment: string }) => (
                <tr key={`${item.club}-${item.starts}`} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.club}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.plan}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.status}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{item.starts}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{item.expires}</td>
                  <td className="px-4 py-3">
                    <Badge tone={item.payment === "Payé" ? "success" : item.payment.includes("essai") ? "info" : "warning"}>
                      {item.payment}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SuperAdminSection>
    </SuperAdminPageTransition>
  );
}
