import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Cloud, ShieldCheck, Zap, MessageCircle } from "lucide-react";

const API_STATS = [
  { label: "API Requests", value: "12 800" },
  { label: "Rate Limit", value: "1 000 / min" },
  { label: "Tokens actifs", value: "84" },
  { label: "Webhooks", value: "12" },
];

export function SuperAdminAPIManagement() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            API Management
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Supervision des clés, quotas et webhooks.
          </p>
        </div>
        <Button variant="ghost">Créer token</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {API_STATS.map((stat) => (
          <GlassCard raised key={stat.label} className="p-5">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard raised className="p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Clés API</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Gestion et expiration des jetons.</p>
            </div>
            <ShieldCheck size={20} />
          </div>
          <div className="space-y-3">
            {[
              "Token public-1234...",
              "Token admin-4321...",
              "Token billing-9876...",
            ].map((token) => (
              <div key={token} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{token}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Actif · Expires dans 48h</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Webhooks</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Derniers événements envoyés.</p>
            </div>
            <Cloud size={20} />
          </div>
          <div className="space-y-3">
            {[
              "Paiement créé",
              "Abonnement renouvelé",
              "Erreur de webhook",
            ].map((event) => (
              <div key={event} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm" style={{ color: "var(--text-primary)" }}>{event}</p>
                <Button variant="ghost" size="sm">Voir</Button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
