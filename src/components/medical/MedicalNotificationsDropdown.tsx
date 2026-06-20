import { useState, useRef, useEffect } from "react";
import { Bell, Calendar, FileWarning, Stethoscope } from "lucide-react";

export interface MedicalNotification {
  id: string;
  title: string;
  description: string;
  type: "session" | "irm" | "certificat";
  unread: boolean;
}

const DEFAULT_NOTIFICATIONS: MedicalNotification[] = [
  { id: "1", title: "Ahmed séance demain", description: "Rééducation genou — 09:00", type: "session", unread: true },
  { id: "2", title: "IRM prévue", description: "Ahmed Ben Salah — 20/06 à 14:30", type: "irm", unread: true },
  { id: "3", title: "Certificat expiré", description: "Ahmed Ben Salah — aptitude compétition", type: "certificat", unread: true },
];

const TYPE_ICONS = {
  session: Stethoscope,
  irm: Calendar,
  certificat: FileWarning,
};

const TYPE_COLORS = {
  session: "var(--color-state-info)",
  irm: "var(--color-state-warning)",
  certificat: "var(--color-state-danger)",
};

export function MedicalNotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-input relative flex h-10 w-10 items-center justify-center"
      >
        <Bell size={16} style={{ color: "var(--text-secondary)" }} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[var(--radius-odin-md)] border shadow-2xl"
          style={{ background: "var(--surface-canvas)", borderColor: "var(--surface-panel-border)" }}
        >
          <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertes médicales</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs" style={{ color: "var(--accent)" }}>
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.map((notif) => {
              const Icon = TYPE_ICONS[notif.type];
              const color = TYPE_COLORS[notif.type];
              return (
                <div
                  key={notif.id}
                  className="flex gap-3 border-b px-4 py-3 last:border-b-0"
                  style={{
                    borderColor: "var(--surface-panel-border)",
                    background: notif.unread ? "rgba(var(--accent-rgb), 0.05)" : "transparent",
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${color}22`, color }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{notif.title}</p>
                      {notif.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--accent)" }} />}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{notif.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
