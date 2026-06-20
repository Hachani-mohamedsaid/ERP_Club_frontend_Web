import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Bell, ShieldAlert, CreditCard, AlertCircle, Sparkles } from "lucide-react";

const NOTIFICATIONS = [
  { id: "n1", title: "Nouveau club ajouté", description: "FC Carthage a rejoint la plateforme.", type: "success" },
  { id: "n2", title: "Abonnement expiré", description: "ES Sahel doit renouveler son plan Pro.", type: "warning" },
  { id: "n3", title: "Paiement échoué", description: "Facture FAC-009 non réglée.", type: "danger" },
  { id: "n4", title: "Alerte sécurité", description: "Tentative de connexion suspecte détectée.", type: "danger" },
];

const ICONS = {
  success: Sparkles,
  warning: CreditCard,
  danger: ShieldAlert,
};

export function SuperAdminNotifications() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Notification Center
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Suivi des alertes critiques et des événements SaaS.
          </p>
        </div>
        <Button variant="ghost">Marquer tout comme lu</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <Bell size={18} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>New Club</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>24</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <CreditCard size={18} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Subscription Expired</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>8</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Payment Failed</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>5</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard raised className="p-5">
          <div className="flex items-center gap-3">
            <ShieldAlert size={18} />
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Security Alert</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>12</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        {NOTIFICATIONS.map((notification) => {
          const Icon = ICONS[notification.type as keyof typeof ICONS];
          return (
            <GlassCard raised key={notification.id} className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{notification.title}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{notification.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Voir</Button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
