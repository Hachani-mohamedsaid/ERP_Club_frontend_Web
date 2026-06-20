import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Tag, LayoutGrid, Clock, TrendingUp, ShieldCheck } from "lucide-react";

const KPI = [
  { label: "MRR", value: "45 000 DT", icon: TrendingUp },
  { label: "ARR", value: "540 000 DT", icon: LayoutGrid },
  { label: "Abonnements actifs", value: "98", icon: ShieldCheck },
  { label: "Expirations", value: "7", icon: Clock },
];

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Abonnements
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Suivi des plans, revenus et renouvellements.
          </p>
        </div>
        <Button variant="ghost">Créer plan</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI.map((item) => {
          const Icon = item.icon;
          return (
            <GlassCard key={item.label} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                </div>
                <Icon size={22} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {PLANS.map((plan) => (
          <GlassCard raised className="p-5" key={plan.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{plan.name}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{plan.price}</p>
              </div>
              <Tag size={20} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span>•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>{plan.clubs} clubs</p>
          </GlassCard>
        ))}
      </div>

      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Abonnements récents</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Suivi des paiements et échéances.</p>
          </div>
          <Button variant="ghost">Exporter</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Club</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Plan</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Date début</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Expiration</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: "var(--text-muted)" }}>Paiement</th>
              </tr>
            </thead>
            <tbody>
              {SUBSCRIPTIONS.map((item) => (
                <tr key={item.club} style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{item.club}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{item.plan}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{item.starts}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>{item.expires}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}><Badge tone="success">{item.payment}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
