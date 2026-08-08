import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, FileText, Handshake, AlertTriangle, Users, ChevronRight, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { financeApi, type FinanceNotificationItem } from "../../lib/api/finance";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

const ICON_MAP = {
  contract: FileText,
  sponsor: Handshake,
  invoice: AlertTriangle,
  salary: Users,
  budget: AlertTriangle,
} as const;

const COLOR_MAP = {
  error: F.danger,
  warning: F.warning,
  info: F.info,
} as const;

export function FinanceNotificationsDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<FinanceNotificationItem[]>([]);
  const [meta, setMeta] = useState({ clubName: "", season: "" });
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const unread = notifs.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await financeApi.getNotifications();
      setNotifs(data.items);
      setMeta({ clubName: data.clubName, season: data.season });
    } catch (e) {
      setNotifs([]);
      setLoadError(
        e instanceof Error ? e.message : "Impossible de charger les notifications.",
      );
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markRead = async (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await financeApi.markNotificationRead(id);
    } catch {
      void load();
    }
  };

  const markAllRead = async () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await financeApi.markAllNotificationsRead();
    } catch {
      void load();
    }
  };

  const dismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    try {
      await financeApi.dismissNotification(id);
    } catch {
      void load();
    }
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glass-input relative flex h-10 w-10 items-center justify-center"
        style={{
          borderColor: open ? `${F.primary}50` : undefined,
          background: open ? `${F.primary}12` : undefined,
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell size={16} style={{ color: open ? F.primary : "var(--text-secondary)" }} />
        {unread > 0 && (
          <motion.span
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-extrabold text-white"
            style={{ background: F.danger }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-[22px] border shadow-2xl"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: "var(--surface-panel-border)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,122,0,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3.5 border-b"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: F.primary }} />
                <span className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>
                  Notifications Finance
                </span>
                {unread > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[8px] font-extrabold"
                    style={{ background: `${F.danger}15`, color: F.danger }}
                  >
                    {unread} non lues
                  </span>
                )}
              </div>
              {unread > 0 && (
                <motion.button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="flex items-center gap-1 text-[9px] font-bold"
                  style={{ color: F.primary }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Check size={9} /> Tout lire
                </motion.button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading && notifs.length === 0 ? (
                <p className="px-4 py-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Chargement des notifications...
                </p>
              ) : loadError && notifs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                  <p className="text-xs font-medium" style={{ color: F.danger }}>{loadError}</p>
                  <motion.button
                    type="button"
                    onClick={() => void load()}
                    className="text-[10px] font-bold"
                    style={{ color: F.primary }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Réessayer
                  </motion.button>
                </div>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Bell size={28} style={{ color: "var(--text-muted)" }} className="mb-2" />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifs.map((n, i) => {
                  const Icon = ICON_MAP[n.iconKey] ?? AlertTriangle;
                  const color = COLOR_MAP[n.sev];
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group flex items-start gap-3 px-4 py-3 cursor-pointer relative"
                      style={{
                        background: n.read ? "transparent" : `${color}08`,
                        borderBottom: "1px solid var(--divider)",
                      }}
                      whileHover={{ background: "var(--surface-hover)" }}
                      onClick={() => {
                        void markRead(n.id);
                        navigate(n.path);
                        setOpen(false);
                      }}
                    >
                      {!n.read && (
                        <div
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
                          style={{ background: color }}
                        />
                      )}

                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
                        style={{ background: `${color}12` }}
                      >
                        <Icon size={13} style={{ color }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-xs font-semibold leading-snug"
                          style={{ color: n.read ? "var(--text-muted)" : "var(--text-primary)" }}
                        >
                          {n.title}
                        </p>
                        <p className="text-[9px] mt-0.5 leading-snug" style={{ color: "var(--text-muted)" }}>
                          {n.body}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>
                            {n.time}
                          </span>
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[7px] font-bold"
                            style={{ background: `${color}12`, color }}
                          >
                            {n.sev === "error" ? "Urgent" : n.sev === "warning" ? "Attention" : "Info"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <motion.button
                          type="button"
                          className="opacity-0 group-hover:opacity-100 rounded-lg p-1"
                          style={{ color: "var(--text-muted)" }}
                          onClick={(e) => void dismiss(n.id, e)}
                          whileHover={{ scale: 1.2, color: F.danger }}
                        >
                          <X size={10} />
                        </motion.button>
                        <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div
              className="border-t px-4 py-2.5 flex items-center justify-between"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                Finance · {meta.clubName || "Club"} · {meta.season || "Saison en cours"}
              </span>
              <motion.button
                type="button"
                className="text-[9px] font-bold"
                style={{ color: F.primary }}
                onClick={() => {
                  navigate("/comptabilite");
                  setOpen(false);
                }}
                whileHover={{ scale: 1.05 }}
              >
                Voir Dashboard →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
