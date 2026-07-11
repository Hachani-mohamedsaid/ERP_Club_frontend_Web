import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  CreditCard,
  LifeBuoy,
  ShieldAlert,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import { platformApi } from "../../lib/api/platform";

const ACCENT = "#FF7A00";

const TYPE_ICON: Record<string, typeof Bell> = {
  club: Building2,
  subscription: Building2,
  payment: CreditCard,
  support: LifeBuoy,
  security: ShieldAlert,
  system: Bell,
};

const SEV_COLOR: Record<string, string> = {
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
};

interface ApiNotif {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  path: string;
  severity: "error" | "warning" | "info";
}

export function SuperAdminNotificationsDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<ApiNotif[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await platformApi.getNotifications();
      setNotifs(data.items);
      setUnread(data.unread);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  };

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  };

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) load();
        }}
        className="glass-input relative flex h-10 w-10 items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
      >
        <Bell size={16} style={{ color: open ? ACCENT : "var(--text-secondary)" }} />
        {unread > 0 && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[8px] font-extrabold text-white"
            style={{ background: "#EF4444" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
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
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-[22px] border shadow-2xl"
            style={{
              background: "var(--surface-modal)",
              borderColor: "rgba(255,122,0,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.65)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3.5"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: ACCENT }} />
                <span className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>
                  Notifications Plateforme
                </span>
                {unread > 0 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[8px] font-extrabold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
                  >
                    {unread} non lues
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[9px] font-bold"
                  style={{ color: ACCENT }}
                >
                  <Check size={9} /> Tout lire
                </button>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto">
              {loading && notifs.length === 0 ? (
                <p className="py-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Chargement…
                </p>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Bell size={28} style={{ color: "var(--text-muted)" }} className="mb-2" />
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifs.map((n, i) => {
                  const Icon = TYPE_ICON[n.type] ?? Bell;
                  const color = SEV_COLOR[n.severity] ?? ACCENT;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative flex cursor-pointer items-start gap-3 px-4 py-3"
                      style={{
                        background: n.read ? "transparent" : `${color}08`,
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                      onClick={() => {
                        markRead(n.id);
                        navigate(n.path);
                        setOpen(false);
                      }}
                    >
                      {!n.read && (
                        <div
                          className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                          style={{ background: color }}
                        />
                      )}
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${color}15` }}
                      >
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-xs font-semibold leading-snug"
                          style={{ color: n.read ? "var(--text-muted)" : "var(--text-primary)" }}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-[9px] leading-snug" style={{ color: "var(--text-muted)" }}>
                          {n.body}
                        </p>
                        <span className="mt-1 inline-block text-[8px]" style={{ color: "var(--text-muted)" }}>
                          {n.time}
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg p-1 opacity-0 transition group-hover:opacity-100"
                          style={{ color: "var(--text-muted)" }}
                          onClick={(e) => dismiss(n.id, e)}
                        >
                          <X size={10} />
                        </button>
                        <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            <div
              className="flex items-center justify-between border-t px-4 py-2.5"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                ODIN ERP · Super Admin
              </span>
              <button
                type="button"
                className="text-[9px] font-bold"
                style={{ color: ACCENT }}
                onClick={() => {
                  navigate("/superadmin/dashboard");
                  setOpen(false);
                }}
              >
                Voir Dashboard →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
