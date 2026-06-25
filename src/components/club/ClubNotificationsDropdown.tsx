import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Check, ChevronRight, X,
  ScrollText, DollarSign, Stethoscope, Settings, Info,
} from "lucide-react";
import { clubApi } from "../../lib/api/club";

const ACCENT = "#FF6B57";

type NotifType = "Contrats" | "Finance" | "Médical" | "Système" | "Info";
type NotifLevel = "critical" | "warning" | "info" | "success";

interface ClubNotif {
  id: string;
  title: string;
  description: string;
  type: NotifType;
  level: NotifLevel;
  date: string;
  read: boolean;
}

const TYPE_ICON = {
  Contrats: ScrollText,
  Finance: DollarSign,
  Médical: Stethoscope,
  Système: Settings,
  Info: Info,
} as const;

const TYPE_COLOR = {
  Contrats: "#F59E0B",
  Finance: "#10B981",
  Médical: "#EF4444",
  Système: "#3B82F6",
  Info: "#8B5CF6",
} as const;

const LEVEL_COLOR: Record<NotifLevel, string> = {
  critical: "#EF4444",
  warning: "#FF6B57",
  info: "#3B82F6",
  success: "#22C55E",
};

function pathForType(type: NotifType) {
  switch (type) {
    case "Contrats": return "/club/contrats";
    case "Finance": return "/club/finances";
    case "Médical": return "/club/sante";
    default: return "/club/notifications";
  }
}

function normalizeNotif(raw: Record<string, unknown>): ClubNotif {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? raw.body ?? ""),
    type: (raw.type as NotifType) ?? "Info",
    level: (raw.level as NotifLevel) ?? "info",
    date: String(raw.date ?? ""),
    read: Boolean(raw.read ?? raw.isRead),
  };
}

export function ClubNotificationsDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<ClubNotif[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const raw = (await clubApi.getNotifications()) as Record<string, unknown>[];
      setNotifs(raw.map(normalizeNotif));
    } catch {
      setNotifs([]);
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

  async function markRead(id: string) {
    await clubApi.markNotificationsRead([id]);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllRead() {
    await clubApi.markNotificationsRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

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
        whileTap={{ scale: 0.95 }}
        style={{
          borderColor: open ? `${ACCENT}50` : undefined,
          background: open ? `${ACCENT}12` : undefined,
        }}
      >
        <Bell size={16} style={{ color: open ? ACCENT : "var(--text-secondary)" }} />
        {unread > 0 && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold text-white"
            style={{ background: "#EF4444" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {unread > 9 ? "9+" : unread}
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
              background: "rgba(8,12,28,0.98)",
              borderColor: "rgba(255,255,255,0.09)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.65)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3.5"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2">
                <Bell size={14} style={{ color: ACCENT }} />
                <span className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>
                  Notifications Club
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
              {loading ? (
                <p className="py-10 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Chargement…
                </p>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Bell size={28} style={{ color: "rgba(255,255,255,0.1)" }} className="mb-2" />
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    Aucune notification
                  </p>
                </div>
              ) : (
                notifs.slice(0, 8).map((n, i) => {
                  const Icon = TYPE_ICON[n.type] ?? Info;
                  const color = TYPE_COLOR[n.type] ?? ACCENT;
                  const levelColor = LEVEL_COLOR[n.level] ?? color;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="group relative flex cursor-pointer items-start gap-3 px-4 py-3"
                      style={{
                        background: n.read ? "transparent" : `${levelColor}08`,
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}
                      onClick={() => {
                        markRead(n.id);
                        navigate(pathForType(n.type));
                        setOpen(false);
                      }}
                    >
                      {!n.read && (
                        <div
                          className="absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
                          style={{ background: levelColor }}
                        />
                      )}
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: `${color}14` }}
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
                          {n.description}
                        </p>
                        <span className="mt-1 block text-[8px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                          {n.date}
                        </span>
                      </div>
                      <ChevronRight size={10} style={{ color: "rgba(255,255,255,0.2)" }} className="mt-2 shrink-0" />
                    </motion.div>
                  );
                })
              )}
            </div>

            <div
              className="flex items-center justify-between border-t px-4 py-2.5"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <button
                type="button"
                className="text-[9px] font-bold"
                style={{ color: ACCENT }}
                onClick={() => {
                  navigate("/club/notifications");
                  setOpen(false);
                }}
              >
                Voir tout →
              </button>
              <button
                type="button"
                className="rounded-lg p-1 opacity-60 hover:opacity-100"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
              >
                <X size={12} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
