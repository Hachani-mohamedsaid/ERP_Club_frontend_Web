import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { TrendingUp, BarChart3, Sparkles, Compass } from "lucide-react";

export function SuperAdminBI() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Business Intelligence
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Prévisions IA, recommandations et risk-scoring pour ODIN ERP.
          </p>
        </div>
        <Button variant="ghost">Tendance 6 mois</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Prediction revenus", value: "+18%", icon: TrendingUp },
          { label: "Top clubs croissance", value: "8", icon: BarChart3 },
          { label: "Clubs à risque", value: "3", icon: Sparkles },
          { label: "Forecast 6 mois", value: "+24%", icon: Compass },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <GlassCard raised key={item.label} className="p-5">
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Forecast 6 mois</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Revenus et churn projetés.</p>
            </div>
            <TrendingUp size={20} />
          </div>
          <div className="grid gap-3">
            {[
              "Prévision de revenu stable",
              "Top 3 clubs à fort potentiel",
              "3 clubs à surveiller pour churn",
            ].map((item) => (
              <div key={item} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{item}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Recommandations IA</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Actions prioritaires du trimestre.</p>
            </div>
            <Sparkles size={20} />
          </div>
          <div className="space-y-3">
            {[
              "Renforcer plan Enterprise",
              "Relancer clubs inactifs",
              "Créer une offre Premium locale",
            ].map((item) => (
              <div key={item} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{item}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
