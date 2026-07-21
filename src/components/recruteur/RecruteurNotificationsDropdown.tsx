import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, CheckCheck, Star, AlertTriangle, DollarSign, FileCheck } from "lucide-react";
import { recruteurApi } from "../../lib/api/recruteur";

const ACCENT = "#8B5CF6";

type NType = "offre" | "contrat" | "talent" | "validation" | "budget" | "blessure" | "shortlist";

type RNotif = {
  id: string;
  type: NType;
  title: string;
  body: string;
  time: string;
  priority: string;
  read: boolean;
  player?: string | null;
};

const TYPE_META: Record<string, { icon: typeof Bell; color: string }> = {
  offre: { icon: FileCheck, color: "#22C55E" },
  contrat: { icon: AlertTriangle, color: "#FF7A00" },
  talent: { icon: Star, color: "#8B5CF6" },
  validation: { icon: CheckCheck, color: "#F59E0B" },
  shortlist: { icon: Star, color: "#A855F7" },
  budget: { icon: DollarSign, color: "#EF4444" },
  blessure: { icon: AlertTriangle, color: "#EF4444" },
};

function mapType(raw: string): NType {
  const t = raw.toLowerCase();
  if (t === "shortlist") return "shortlist";
  if (t in TYPE_META) return t as NType;
  return "validation";
}

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function RecruteurNotificationsDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RNotif[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await recruteurApi.getNotifications();
      setItems(
        (rows ?? []).map((n) => ({
          id: n.id,
          type: mapType(n.type),
          title: n.title,
          body: n.body,
          time: formatTime(n.time),
          priority: n.priority,
          read: n.read,
          player: n.player,
        })),
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function markAll() {
    await recruteurApi.markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) void load();
        }}
        className="glass-input relative flex h-10 w-10 items-center justify-center"
        aria-label="Notifications recruteur"
      >
        <Bell size={16} style={{ color: open ? ACCENT : "var(--text-secondary)" }} />
        {unread > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
            style={{ background: ACCENT }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-[22rem] overflow-hidden rounded-[14px] border shadow-2xl"
          style={{ background: "var(--surface-canvas)", borderColor: "var(--surface-panel-border)" }}
        >
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: "var(--surface-panel-border)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Notifications Recruteur
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => void markAll()}
                className="inline-flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: ACCENT }}
              >
                <Check size={12} /> Tout lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <p className="px-4 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Chargement…
              </p>
            )}
            {!loading && items.length === 0 && (
              <p className="px-4 py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                Aucune alerte recrutement
              </p>
            )}
            {!loading &&
              items.slice(0, 10).map((n) => {
                const meta = TYPE_META[n.type] ?? TYPE_META.validation;
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={async () => {
                      if (!n.read) await recruteurApi.markNotificationRead(n.id);
                      setOpen(false);
                      navigate(
                        n.type === "shortlist" || n.type === "validation"
                          ? "/recruteur/requests"
                          : "/recruteur/notifications",
                      );
                    }}
                    className="flex w-full gap-3 border-b px-4 py-3 text-left last:border-b-0"
                    style={{
                      borderColor: "var(--surface-panel-border)",
                      background: n.read ? "transparent" : `${ACCENT}12`,
                    }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${meta.color}22`, color: meta.color }}
                    >
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[10px]" style={{ color: "var(--text-muted)" }}>
                          {n.time}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                        {n.body}
                      </p>
                    </div>
                  </button>
                );
              })}
          </div>
          <button
            type="button"
            className="w-full border-t px-4 py-2.5 text-left text-[11px] font-bold"
            style={{ borderColor: "var(--surface-panel-border)", color: ACCENT }}
            onClick={() => {
              setOpen(false);
              navigate("/recruteur/notifications");
            }}
          >
            Voir tout →
          </button>
        </div>
      )}
    </div>
  );
}
