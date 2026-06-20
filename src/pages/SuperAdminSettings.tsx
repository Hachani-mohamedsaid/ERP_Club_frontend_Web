import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { SlidersHorizontal, Bell, Users, Lock } from "lucide-react";

const SETTINGS = [
  { title: "App Config", description: "Paramètres de l'application", action: "Modifier" },
  { title: "Notifications", description: "Gestion des alertes et emails", action: "Configurer" },
  { title: "Utilisateurs", description: "Contrôles d'accès et rôles", action: "Voir" },
  { title: "Audit", description: "Journalisation et sécurité", action: "Accéder" },
];

export function SuperAdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Paramètres Plateforme
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Administration système, notifications et accès.
          </p>
        </div>
        <Button variant="ghost">Mettre à jour</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <SlidersHorizontal size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Système</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>API et accès</p>
            </div>
          </div>
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>Configurations réseau, authentification et intégrations.</p>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <Bell size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Alertes</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</p>
            </div>
          </div>
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>Configurer les règles d'alerte et les canaux.</p>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <Users size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Accès</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Utilisateurs</p>
            </div>
          </div>
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>Rôles, permissions et cycles de révision.</p>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <Lock size={20} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Protection</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Sécurité</p>
            </div>
          </div>
          <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>Paramètres des mots de passe, validations et normes.</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {SETTINGS.map((setting) => (
          <GlassCard key={setting.title} raised className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{setting.title}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{setting.description}</p>
              </div>
              <Button variant="ghost" size="sm">{setting.action}</Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
