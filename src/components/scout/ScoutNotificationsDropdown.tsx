import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Map, Heart, FileText, Brain, Check } from "lucide-react";
import { scoutApi } from "../../lib/api/scout";
import { S } from "../../data/scoutData";

type ScoutNotifKind = "mission" | "watchlist" | "report" | "ai";

type ScoutNotif = {
  id: string;
  kind: ScoutNotifKind;
  title: string;
  body: string;
  time: string;
  path: string;
  unread: boolean;
};

const KIND_META: Record<ScoutNotifKind, { icon: typeof Bell; color: string }> = {
  mission: { icon: Map, color: S.primary },
  watchlist: { icon: Heart, color: S.danger },
  report: { icon: FileText, color: S.info },
  ai: { icon: Brain, color: S.accent },
};

const READ_KEY = "odin_scout_notif_read";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-80)));
  } catch {
    /* ignore */
  }
}

function formatTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function ScoutNotificationsDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ScoutNotif[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => n.unread).length;

  const load = useCallback(async () => {
    setLoading(true);
    const readIds = loadReadIds();
    try {
      const [missions, watchlist, reports, dashboard] = await Promise.all([
        scoutApi.getMissions().catch(() => []),
        scoutApi.getWatchlist().catch(() => []),
        scoutApi.getReports().catch(() => []),
        scoutApi.getDashboard().catch(() => null),
      ]);

      const built: ScoutNotif[] = [];

      for (const m of (missions ?? []).slice(0, 5)) {
        const id = `mission-${m.id}`;
        built.push({
          id,
          kind: "mission",
          title: m.title || "Mission terrain",
          body: [m.date, m.location, m.notes].filter(Boolean).join(" · ") || "Mission à planifier",
          time: formatTime(m.date),
          path: "/scout/missions",
          unread: !readIds.has(id),
        });
      }

      for (const p of (watchlist ?? []).slice(0, 4)) {
        const id = `watch-${p.id}`;
        built.push({
          id,
          kind: "watchlist",
          title: `${p.name} — Watchlist`,
          body: `${p.position} · ${p.club} · Pot. ${p.potential}`,
          time: formatTime(p.addedDate),
          path: `/scout/prospect/${p.id}`,
          unread: !readIds.has(id),
        });
      }

      for (const r of (reports ?? []).slice(0, 4)) {
        const id = `report-${r.id}`;
        built.push({
          id,
          kind: "report",
          title: `Rapport — ${r.prospectName}`,
          body: r.decision ? `Décision: ${r.decision}` : "Nouveau rapport scout",
          time: formatTime(r.createdAt),
          path: "/scout/reports",
          unread: !readIds.has(id),
        });
      }

      const aiRec = dashboard?.aiRecs?.[0];
      if (aiRec) {
        const id = `ai-${aiRec.id}`;
        built.push({
          id,
          kind: "ai",
          title: `ODIN AI · ${aiRec.name}`,
          body: aiRec.reasons?.[0] ?? `Score ${aiRec.score}% · ${aiRec.pos}`,
          time: "IA",
          path: aiRec.id ? `/scout/prospect/${aiRec.id}` : "/scout/ai",
          unread: !readIds.has(id),
        });
      }

      setItems(built);
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

  function markAllRead() {
    const ids = loadReadIds();
    for (const n of items) ids.add(n.id);
    saveReadIds(ids);
    setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function openItem(n: ScoutNotif) {
    const ids = loadReadIds();
    ids.add(n.id);
    saveReadIds(ids);
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    setOpen(false);
    navigate(n.path);
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
        aria-label="Notifications scout"
      >
        <Bell size={16} style={{ color: open ? S.primary : "var(--text-secondary)" }} />
        {unread > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white"
            style={{ background: S.primary }}
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
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Notifications Scout
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Missions · Watchlist · Rapports · ODIN AI
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold"
                style={{ color: S.primary }}
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
                Aucune alerte scout pour le moment
              </p>
            )}
            {!loading &&
              items.map((n) => {
                const meta = KIND_META[n.kind];
                const Icon = meta.icon;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openItem(n)}
                    className="flex w-full gap-3 border-b px-4 py-3 text-left last:border-b-0 transition-colors hover:bg-white/[0.03]"
                    style={{
                      borderColor: "var(--surface-panel-border)",
                      background: n.unread ? `${S.primary}0d` : "transparent",
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
                    {n.unread && (
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: S.primary }} />
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
