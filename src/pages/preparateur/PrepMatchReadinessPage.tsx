import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, Users, ShieldCheck, ShieldAlert,
  Activity, Zap, TrendingUp, Search, Download, Filter,
  ThumbsUp, ThumbsDown,
} from "lucide-react";
import { PrepPageTransition } from "../../components/preparateur/PrepPageTransition";
import { getRiskColor } from "../../data/preparateurData";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { downloadCsv } from "../../components/preparateur/PrepToolbar";
import { clubApi } from "../../lib/api/club";

type ReadyStatus = "accepted" | "declined" | "pending";

interface PlayerReadiness {
  id: string;
  name: string;
  position: string;
  photoUrl: string | null;
  fitness: number;
  fatigue: number;
  risk: number;
  readinessStatus: ReadyStatus;
}

function MiniBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function KpiCard({ label, value, color, icon: Icon, delay = 0 }: {
  label: string; value: string | number; color: string; icon: typeof Users; delay?: number;
}) {
  return (
    <motion.div
      className="rounded-[20px] border p-5"
      style={{ background: "rgba(15,29,58,0.8)", borderColor: `${color}20`, boxShadow: `0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px ${color}10` }}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
          <Icon size={15} />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span>
      </div>
      <motion.p className="text-3xl font-black" style={{ color }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.15 }}>
        {value}
      </motion.p>
    </motion.div>
  );
}

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-52 animate-pulse rounded-[20px]" style={{ background: "rgba(255,255,255,0.04)" }} />
      ))}
    </div>
  );
}

const STATUS_CONFIG = {
  accepted: { label: "Accepté",    color: "#22C55E", icon: CheckCircle2, bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)" },
  declined: { label: "Décliné",    color: "#EF4444", icon: XCircle,      bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.2)" },
  pending:  { label: "En attente", color: "#F59E0B", icon: Activity,     bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.15)" },
} as const;

const FILTERS = [
  { value: "all",      label: "Tous",       color: "var(--text-muted)" },
  { value: "accepted", label: "Acceptés",   color: "#22C55E" },
  { value: "declined", label: "Déclinés",   color: "#EF4444" },
  { value: "pending",  label: "En attente", color: "#F59E0B" },
] as const;

export function PrepMatchReadinessPage() {
  const [players, setPlayers] = useState<PlayerReadiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState<"all" | ReadyStatus>("all");
  const [toast,   setToast]   = useState<{ msg: string; color: string } | null>(null);

  function showToast(msg: string, color: string) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  }

  const fetchAll = useCallback(() => {
    setLoading(true);
    (clubApi.getMatchReadiness() as Promise<PlayerReadiness[]>)
      .then(setPlayers)
      .catch(() => showToast("Erreur de chargement", "#EF4444"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const acceptedCount = players.filter(p => p.readinessStatus === "accepted").length;
  const declinedCount = players.filter(p => p.readinessStatus === "declined").length;
  const pendingCount  = players.filter(p => p.readinessStatus === "pending").length;
  const rate = players.length ? Math.round((acceptedCount / players.length) * 100) : 0;

  const filtered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.readinessStatus === filter;
    return matchSearch && matchFilter;
  });

  async function updateStatus(id: string, status: ReadyStatus) {
    const prev = players.find(p => p.id === id);
    // optimistic
    setPlayers(ps => ps.map(p => p.id === id ? { ...p, readinessStatus: status } : p));
    try {
      await clubApi.updateMatchReadiness(id, status);
      const name = prev?.name ?? "";
      const label = STATUS_CONFIG[status].label;
      showToast(`${name} — ${label}`, STATUS_CONFIG[status].color);
    } catch {
      // revert
      setPlayers(ps => ps.map(p => p.id === id ? { ...p, readinessStatus: prev?.readinessStatus ?? "pending" } : p));
      showToast("Erreur mise à jour", "#EF4444");
    }
  }

  function exportCsv() {
    downloadCsv(
      "disponibilite-match.csv",
      ["Joueur", "Position", "Fitness", "Fatigue", "Risque", "Statut"],
      filtered.map(p => [p.name, p.position, String(p.fitness), String(p.fatigue), String(p.risk), p.readinessStatus])
    );
  }

  return (
    <PrepPageTransition>
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Effectif analysé"   value={players.length} color="#6366F1" icon={Users}       delay={0} />
        <KpiCard label="Prêts match"        value={acceptedCount}  color="#22C55E" icon={ShieldCheck} delay={0.05} />
        <KpiCard label="Non disponibles"    value={declinedCount}  color="#EF4444" icon={ShieldAlert} delay={0.1} />
        <KpiCard label="Taux disponibilité" value={`${rate}%`}     color="#6366F1" icon={TrendingUp}  delay={0.15} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher joueur..." className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }} />
        </div>
        <div className="flex items-center gap-1.5 rounded-xl border p-1"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <Filter size={12} className="ml-1.5 shrink-0" style={{ color: "var(--text-muted)" }} />
          {FILTERS.map(f => (
            <motion.button key={f.value} type="button" onClick={() => setFilter(f.value)}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all"
              style={{
                background: filter === f.value ? `${f.color}18` : "transparent",
                color: filter === f.value ? f.color : "var(--text-muted)",
                boxShadow: filter === f.value ? `0 0 0 1px ${f.color}30` : "none",
              }}>
              {f.label}
            </motion.button>
          ))}
        </div>
        <motion.button type="button" onClick={exportCsv} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
          style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}>
          <Download size={13} /> Excel
        </motion.button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 rounded-2xl border px-5 py-3"
        style={{ background: "rgba(15,29,58,0.6)", borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span>Taux de disponibilité</span>
            <span className="font-bold" style={{ color: rate >= 70 ? "#22C55E" : "#F59E0B" }}>{rate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg, #22C55E, #6366F1)" }}
              initial={{ width: 0 }} animate={{ width: `${rate}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} />
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          {[
            { label: "Acceptés",   count: acceptedCount, color: "#22C55E" },
            { label: "Déclinés",   count: declinedCount, color: "#EF4444" },
            { label: "En attente", count: pendingCount,  color: "#F59E0B" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: color }} />
              <span style={{ color: "var(--text-muted)" }}>{label}</span>
              <span className="font-bold" style={{ color }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? <PageSkeleton /> : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              const riskColor    = getRiskColor(p.risk);
              const fitnessColor = p.fitness >= 80 ? "#22C55E" : p.fitness >= 60 ? "#F59E0B" : "#EF4444";
              const fatigueColor = p.fatigue >= 70 ? "#EF4444" : p.fatigue >= 40 ? "#F59E0B" : "#22C55E";
              const cfg          = STATUS_CONFIG[p.readinessStatus];
              const StatusIcon   = cfg.icon;

              return (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                  className="rounded-[20px] border p-4"
                  style={{ background: cfg.bg, borderColor: cfg.border, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <PlayerAvatar name={p.name} size={44} ring={false} />
                      <div>
                        <p className="font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <StatusIcon size={11} style={{ color: cfg.color }} />
                          <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center rounded-xl border px-2.5 py-1.5 shrink-0"
                      style={{ background: `${riskColor}12`, borderColor: `${riskColor}30` }}>
                      <span className="text-lg font-black tabular-nums leading-none" style={{ color: riskColor }}>{p.risk}</span>
                      <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: riskColor }}>Risque</span>
                    </div>
                  </div>

                  {/* Bars */}
                  <div className="mb-4 space-y-2.5">
                    <MiniBar value={p.fitness} color={fitnessColor} label="Fitness" />
                    <MiniBar value={p.fatigue} color={fatigueColor} label="Fatigue" />
                    <MiniBar value={p.risk}    color={riskColor}    label="Risque blessure" />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button type="button" onClick={() => void updateStatus(p.id, "accepted")}
                      disabled={p.readinessStatus === "accepted"}
                      whileHover={p.readinessStatus !== "accepted" ? { scale: 1.03, boxShadow: "0 4px 16px rgba(34,197,94,0.4)" } : undefined}
                      whileTap={p.readinessStatus !== "accepted" ? { scale: 0.97 } : undefined}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all"
                      style={{
                        background: p.readinessStatus === "accepted" ? "rgba(34,197,94,0.2)" : "rgba(34,197,94,0.12)",
                        color: "#22C55E",
                        border: `1px solid ${p.readinessStatus === "accepted" ? "rgba(34,197,94,0.5)" : "rgba(34,197,94,0.2)"}`,
                        opacity: p.readinessStatus === "declined" ? 0.5 : 1,
                      }}>
                      <ThumbsUp size={12} />
                      {p.readinessStatus === "accepted" ? "Accepté ✓" : "Accepter"}
                    </motion.button>

                    <motion.button type="button" onClick={() => void updateStatus(p.id, "declined")}
                      disabled={p.readinessStatus === "declined"}
                      whileHover={p.readinessStatus !== "declined" ? { scale: 1.03, boxShadow: "0 4px 16px rgba(239,68,68,0.35)" } : undefined}
                      whileTap={p.readinessStatus !== "declined" ? { scale: 0.97 } : undefined}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all"
                      style={{
                        background: p.readinessStatus === "declined" ? "rgba(239,68,68,0.2)" : "rgba(239,68,68,0.08)",
                        color: "#EF4444",
                        border: `1px solid ${p.readinessStatus === "declined" ? "rgba(239,68,68,0.5)" : "rgba(239,68,68,0.18)"}`,
                        opacity: p.readinessStatus === "accepted" ? 0.5 : 1,
                      }}>
                      <ThumbsDown size={12} />
                      {p.readinessStatus === "declined" ? "Décliné ✗" : "Décliner"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Zap size={22} style={{ color: "var(--text-muted)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            {players.length === 0 ? "Aucun joueur en base" : "Aucun joueur trouvé"}
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold"
            style={{ background: "rgba(8,14,32,0.97)", borderColor: `${toast.color}40`, color: toast.color, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${toast.color}20` }}>
            <motion.div className="h-2 w-2 rounded-full shrink-0" style={{ background: toast.color }}
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 0.4 }} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </PrepPageTransition>
  );
}
