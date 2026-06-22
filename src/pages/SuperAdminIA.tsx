import { Button } from "../components/ui/Button";
import { MessageCircle, Sparkles, Cpu, Bolt } from "lucide-react";
import { SuperAdminPageTransition, SuperAdminPageHeader, SuperAdminGhostButton, SuperAdminKpiCard, SuperAdminKpiGrid, SuperAdminSection, SuperAdminListRow } from "../components/superadmin";

export function SuperAdminIA() {
  return (
    <SuperAdminPageTransition>
      <SuperAdminPageHeader
        title="IA Admin"
        subtitle="Contrôle des services AI et performance automatisée."
        action={<SuperAdminGhostButton>Voir logs IA</SuperAdminGhostButton>}
      />

      <SuperAdminKpiGrid>
        <SuperAdminKpiCard label="Assistant IA" value="Disponible" icon={Sparkles} color="#FF7A00" />
        <SuperAdminKpiCard label="Demandes traitées" value="1 240" icon={MessageCircle} color="#3B82F6" />
        <SuperAdminKpiCard label="Temps moyen" value="1.2s" icon={Bolt} color="#10B981" />
        <SuperAdminKpiCard label="Alertes IA" value="4" icon={Cpu} color="#EF4444" />
      </SuperAdminKpiGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SuperAdminSection title="Pipeline IA" subtitle="Traitement des demandes et optimisation." icon={Bolt}>
          <div className="space-y-3">
            <SuperAdminListRow>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>4 demandes critiques en cours</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Analyse de risque, export automatisé, veille.</p>
            </SuperAdminListRow>
            <SuperAdminListRow>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>Temps de réponse moyen</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>1.2 seconde / requête</p>
            </SuperAdminListRow>
          </div>
        </SuperAdminSection>

        <SuperAdminSection title="Actions IA" subtitle="Rapports, automatisations et supervision.">
          <div className="space-y-3">
            {["Analyse de performance", "Rapport mensuel", "Surveillance des anomalies"].map((item) => (
              <SuperAdminListRow key={item}>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item}</p>
                <SuperAdminGhostButton className="mt-2 px-3 py-1.5 text-xs">Exécuter</SuperAdminGhostButton>
              </SuperAdminListRow>
            ))}
          </div>
        </SuperAdminSection>
      </div>
    </SuperAdminPageTransition>
  );
}
