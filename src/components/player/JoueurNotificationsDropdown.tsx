import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  fetchJoueurNotifications,
  markAllJoueurNotificationsRead,
  markJoueurNotificationRead,
  type JoueurNotificationItem,
} from "../../lib/api/joueur/notifications";

const TYPE_COLORS: Record<string, string> = {
  training: "var(--color-state-info)",
  contract: "var(--color-state-warning)",
  medical: "var(--color-state-danger)",
  match: "var(--color-state-success)",
  injury: "var(--color-state-danger)",
};

export function JoueurNotificationsDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userKey = user?.id ?? user?.email ?? "joueur";
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<JoueurNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const unread = notifications.filter((n) => n.unread).length;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchJoueurNotifications(userKey);
      setNotifications(items);
    } catch (e) {
      setNotifications([]);
      setError(e instanceof Error ? e.message : "Impossible de charger les notifications.");
    } finally {
      setLoading(false);
    }
  }, [userKey]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function markAllRead() {
    markAllJoueurNotificationsRead(
      userKey,
      notifications.map((n) => n.id),
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function openNotif(n: JoueurNotificationItem) {
    markJoueurNotificationRead(userKey, n.id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item)),
    );
    navigate(n.path);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="glass-input relative flex h-10 w-10 items-center justify-center"
        style={{
          borderColor: open ? "rgba(255,122,0,0.45)" : undefined,
          background: open ? "rgba(255,122,0,0.12)" : undefined,
        }}
      >
        <Bell size={16} style={{ color: open ? "var(--accent)" : "var(--text-secondary)" }} />
        {unread > 0 && (
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            {unread > 9 ? "9+" : unread}
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
            style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Notifications
              </p>
              {unread > 0 && (
                <button type="button" onClick={markAllRead} className="text-xs" style={{ color: "var(--accent)" }}>
                  Tout marquer lu
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <p className="px-4 py-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Chargement des notifications…
                </p>
              ) : error && notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <p className="text-xs font-medium" style={{ color: "var(--color-state-danger)" }}>
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => void load()}
                    className="flex items-center gap-1 text-[10px] font-bold"
                    style={{ color: "var(--accent)" }}
                  >
                    <RefreshCw size={10} /> Réessayer
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Bell size={28} style={{ color: "var(--text-muted)" }} className="mb-2" />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Aucune notification
                  </p>
                  <p className="mt-1 px-6 text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Les alertes apparaissent depuis votre planning, dossiers médicaux et contrat.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openNotif(n)}
                    className="w-full border-b px-4 py-3 text-left last:border-0"
                    style={{
                      borderColor: "var(--surface-panel-border)",
                      background: n.unread ? "rgba(var(--accent-rgb),0.05)" : "transparent",
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: TYPE_COLORS[n.type] ?? "var(--accent)" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                          {n.message}
                        </p>
                        <p className="mt-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {n.time}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
