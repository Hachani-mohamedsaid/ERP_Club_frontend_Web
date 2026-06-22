import { Badge } from "../components/ui/Badge";
import { Tag, LayoutGrid, Clock, TrendingUp, ShieldCheck } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminCard } from "../components/superadmin";

const PLANS = [
  { name: "Starter", price: "590 DT/mois", features: ["Gestion clubs", "Analytics basiques", "Support email"], clubs: 14 },
  { name: "Pro", price: "1 290 DT/mois", features: ["Tableaux avancés", "Monitoring", "Support prioritaire"], clubs: 45 },
  { name: "Enterprise", price: "2 990 DT/mois", features: ["API avancée", "SLA 24/7", "Plusieurs organisations"], clubs: 39 },
];

const SUBSCRIPTIONS = [
  { club: "FC Carthage", plan: "Enterprise", starts: "01/01/2026", expires: "31/12/2026", payment: "Automatique" },
  { club: "ES Sahel", plan: "Pro", starts: "01/04/2026", expires: "31/03/2027", payment: "Carte" },
  { club: "CS Sfaxien", plan: "Starter", starts: "01/06/2026", expires: "30/05/2027", payment: "Virement" },
];

export function SuperAdminSubscriptions() {
  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="Abonnements"
        subtitle="Suivi des plans, revenus et renouvellements."
        action={<SuperAdminGhostButton>Créer plan</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="MRR" value="45 000 DT" icon={TrendingUp} color="#FF7A00" />
        <SuperAdminKpiCard label="ARR" value="540 000 DT" icon={LayoutGrid} color="#3B82F6" />
        <SuperAdminKpiCard label="Abonnements actifs" value="98" icon={ShieldCheck} color="#10B981" />
        <SuperAdminKpiCard label="Expirations" value="7" icon={Clock} color="#EF4444" />
      </SuperAdminKpiGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {PLANS.map((plan) => (
          <SuperAdminCard key={plan.name} glow hover={false}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{plan.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.price}</p>
              </div>
              <Tag size={20} style={{ color: "#FF7A00" }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2"><span>•</span><span>{feature}</span></li>
              ))}
            </ul>
            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>{plan.clubs} clubs</p>
          </SuperAdminCard>
        ))}
      </div>

      <SuperAdminSection title="Abonnements récents" subtitle="Suivi des paiements et échéances." action={<SuperAdminGhostButton>Exporter</SuperAdminGhostButton>}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                {["Club", "Plan", "Date début", "Expiration", "Paiement"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBSCRIPTIONS.map((item) => (
                <tr key={item.club} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.club}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.plan}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{item.starts}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{item.expires}</td>
                  <td className="px-4 py-3"><Badge tone="success">{item.payment}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SuperAdminSection>
    </SuperAdminPageTransition>
  );
}
