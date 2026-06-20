import { useState, useRef, useEffect } from "react";
import { Bell, Activity, CheckCircle, Stethoscope, ClipboardList } from "lucide-react";
import { PREP_NOTIFICATIONS, type PrepNotification } from "../../data/preparateurData";

const TYPE_ICONS = {
  fatigue: Activity,
  coach: CheckCircle,
  medical: Stethoscope,
  programme: ClipboardList,
};

const TYPE_COLORS = {
  fatigue: "#EF4444",
  coach: "#22C55E",
  medical: "#F59E0B",
  programme: "#6366F1",
};

export function PrepNotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<PrepNotification[]>(PREP_NOTIFICATIONS);
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
            style={{ background: "#6366F1" }}
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
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertes Préparateur</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs" style={{ color: "#6366F1" }}>
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
                    background: notif.unread ? "rgba(99,102,241,0.06)" : "transparent",
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: `${color}22`, color }}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{notif.title}</p>
                      <span className="shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>{notif.time}</span>
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--text-secondary)" }}>{notif.message}</p>
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
