import { useState } from "react";
import { Bell, X } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  icon: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

const NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "success",
    icon: "⭐",
    title: "Nouvel prospect validé",
    message: "Youssef Ben Ali a été validé par le directeur sportif pour recrutement",
    timestamp: "il y a 2h",
    read: false,
    action: { label: "Voir Profil", handler: () => {} },
  },
  {
    id: "2",
    type: "warning",
    icon: "🚨",
    title: "Blessure signalée",
    message: "Nader Trabelsi - Blessure musculaire présumée (à confirmer)",
    timestamp: "il y a 4h",
    read: false,
    action: { label: "Détails Médical", handler: () => {} },
  },
  {
    id: "3",
    type: "info",
    icon: "📋",
    title: "Rapport scout à signer",
    message: "3 rapports scouts en attente de validation du directeur",
    timestamp: "il y a 6h",
    read: false,
    action: { label: "Voir Rapports", handler: () => {} },
  },
  {
    id: "4",
    type: "info",
    icon: "🎯",
    title: "Match à suivre",
    message: "Mouhamed Diallo joue demain 19h00 pour AFAD Djékanou vs Stade Tunisien",
    timestamp: "il y a 1j",
    read: true,
    action: { label: "Ajouter au Calendrier", handler: () => {} },
  },
  {
    id: "5",
    type: "success",
    icon: "✅",
    title: "Analyse IA complétée",
    message: "L'analyse IA des 15 prospects recommandés est prête",
    timestamp: "il y a 2j",
    read: true,
  },
  {
    id: "6",
    type: "warning",
    icon: "⏰",
    title: "Contrat expirant",
    message: "Karim Sassi - Contrat expire dans 30 jours",
    timestamp: "il y a 3j",
    read: true,
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getTone = (type: string): "success" | "warning" | "danger" | "info" => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "danger";
      default:
        return "info";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={24} style={{ color: "var(--accent)" }} />
            <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "var(--accent)" }}
              >
                {unreadCount}
              </div>
            )}
          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Restez informé des mises à jour importantes
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            Marquer tout comme lu
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
          style={{
            background: filter === "all" ? "var(--accent)" : "transparent",
            color: filter === "all" ? "white" : "var(--text-primary)",
            borderColor: filter === "all" ? "var(--accent)" : "var(--surface-panel-border)",
          }}
        >
          Tous ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className="rounded-full border px-4 py-2 text-sm font-medium transition-all"
          style={{
            background: filter === "unread" ? "var(--accent)" : "transparent",
            color: filter === "unread" ? "white" : "var(--text-primary)",
            borderColor: filter === "unread" ? "var(--accent)" : "var(--surface-panel-border)",
          }}
        >
          Non lus ({unreadCount})
        </button>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <GlassCard raised className="p-12 text-center">
            <Bell size={32} className="mx-auto mb-4 opacity-50" />
            <p style={{ color: "var(--text-muted)" }}>
              {filter === "unread" ? "Tous les messages ont été lus!" : "Aucune notification"}
            </p>
          </GlassCard>
        ) : (
          filteredNotifications.map((notification) => (
            <GlassCard
              key={notification.id}
              className={`p-4 transition-all duration-300 ${!notification.read ? "border-l-4" : ""}`}
              style={{
                borderLeftColor: !notification.read ? "var(--accent)" : undefined,
                background: !notification.read ? "rgba(var(--accent-rgb), 0.05)" : undefined,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-2xl pt-1">{notification.icon}</div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ background: "var(--accent)" }}
                          />
                        )}
                      </div>
                      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {notification.message}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="flex-shrink-0 transition-colors hover:opacity-70"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {notification.timestamp}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge tone={getTone(notification.type)}>
                        {notification.type === "success"
                          ? "Succès"
                          : notification.type === "warning"
                          ? "Important"
                          : notification.type === "error"
                          ? "Erreur"
                          : "Info"}
                      </Badge>
                      {notification.action && (
                        <button
                          onClick={notification.action.handler}
                          className="text-xs font-medium transition-colors"
                          style={{ color: "var(--accent)" }}
                        >
                          {notification.action.label}
                        </button>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs font-medium transition-colors"
                          style={{ color: "var(--accent)" }}
                        >
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          💡 Conseils
        </h2>
        <ul className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          <li>• Activez les notifications push pour être alerté en temps réel</li>
          <li>• Personnalisez vos préférences de notifications dans les paramètres</li>
          <li>• Les notifications importantes (matchs, blessures) sont affichées en priorité</li>
        </ul>
      </GlassCard>
    </div>
  );
}
