import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { MessageCircle, Sparkles, Cpu, Bolt } from "lucide-react";

const AGENT_CARDS = [
  { label: "Assistant IA", value: "Disponible", icon: Sparkles, tone: "success" },
  { label: "Demandes traitées", value: "1 240", icon: MessageCircle, tone: "info" },
  { label: "Temps moyen", value: "1.2s", icon: Bolt, tone: "neutral" },
  { label: "Alertes IA", value: "4", icon: Cpu, tone: "warning" },
];

export function SuperAdminIA() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            IA Admin
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Contrôle des services AI et performance automatisée.
          </p>
        </div>
        <Button variant="ghost">Voir logs IA</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {AGENT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>{card.value}</p>
                </div>
                <Icon size={22} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard raised className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pipeline IA</h2>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Traitement des demandes et optimisation.</p>
            </div>
            <Bolt size={20} />
          </div>
          <div className="space-y-3">
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>4 demandes critiques en cours</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Analyse de risque, export automatisé, veille.</p>
            </div>
            <div className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>Temps de réponse moyen</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>1.2 seconde / requête</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Actions IA</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Rapports, automatisations et supervision.</p>
          </div>
          <div className="space-y-3">
            {['Analyse de performance', 'Rapport mensuel', 'Surveillance des anomalies'].map((item) => (
              <div key={item} className="rounded-[var(--radius-odin-md)] border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item}</p>
                <Button variant="ghost" size="sm" className="mt-2">Exécuter</Button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
