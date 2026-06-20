import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JOUEUR_NOTIFICATIONS } from "../../data/joueurExtendedData";

const TYPE_COLORS: Record<string, string> = {
  training: "var(--color-state-info)",
  contract: "var(--color-state-warning)",
  medical: "var(--color-state-danger)",
  match: "var(--color-state-success)",
};

export function JoueurNotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(JOUEUR_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => n.unread).length;

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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-input relative flex h-10 w-10 items-center justify-center"
      >
        <Bell size={16} style={{ color: "var(--text-secondary)" }} />
        {unread > 0 && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-[var(--radius-odin-md)] border shadow-xl"
            style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }}
          >
            <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</p>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs" style={{ color: "var(--accent)" }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="border-b px-4 py-3 last:border-0"
                  style={{ borderColor: "var(--surface-panel-border)", background: n.unread ? "rgba(var(--accent-rgb),0.05)" : "transparent" }}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: TYPE_COLORS[n.type] }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{n.title}</p>
                      <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>{n.message}</p>
                      <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
