import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import {
  History, Search, Download, Filter, Edit, Plus, Trash2,
  LogIn, Shield, Settings, FileText, UserCheck,
} from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────── */
type ActionType = "Connexion" | "Création" | "Modification" | "Suppression" | "Export" | "Permission";

interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  details: string;
  type: ActionType;
  date: string;
  time: string;
  ip: string;
}

/* ── Mock data ──────────────────────────────────────────────────── */
const ACTION_COLOR: Record<ActionType, string> = {
  Connexion:   "#3B82F6",
  Création:    "#22C55E",
  Modification:"#FF6B57",
  Suppression: "#EF4444",
  Export:      "#8B5CF6",
  Permission:  "#F59E0B",
};

const ACTION_ICON: Record<ActionType, typeof LogIn> = {
  Connexion:   LogIn,
  Création:    Plus,
  Modification:Edit,
  Suppression: Trash2,
  Export:      FileText,
  Permission:  Shield,
};

const ALL_TYPES: ActionType[] = ["Connexion", "Création", "Modification", "Suppression", "Export", "Permission"];

/* ── Main page ──────────────────────────────────────────────────── */
export function ClubAuditLogsPage() {
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState<"Tous" | ActionType>("Tous");
  const [dateFilter, setDateFilter] = useState("");

  const { data: logs, loading, error } = useClubResource(
    () => clubApi.getAuditLogs({
      type: typeFilter !== "Tous" ? typeFilter : undefined,
      search: search || undefined,
    }) as Promise<AuditLog[]>,
    [typeFilter, search],
  );

  const allLogs = logs ?? [];

  const filtered = useMemo(() => allLogs.filter((l) => {
    const matchDate = !dateFilter || l.date.includes(dateFilter);
    return matchDate;
  }), [allLogs, dateFilter]);

  const kpis = useMemo(() => ({
    total: allLogs.length,
    today: allLogs.filter((l) => l.date === new Date().toLocaleDateString("fr-FR")).length,
    modifications: allLogs.filter((l) => l.type === "Modification").length,
    suppressions: allLogs.filter((l) => l.type === "Suppression").length,
  }), [allLogs]);

  function exportCSV() {
    const rows = [
      ["ID", "Utilisateur", "Rôle", "Action", "Entité", "Détails", "Date", "Heure", "IP"],
      ...LOGS.map((l) => [l.id, l.user, l.role, l.action, l.entity, l.details, l.date, l.time, l.ip]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-logs.csv"; a.click();
  }

  return (
    <ClubPageTransition>
      {/* Header */}
      <ClubKpiCard hover={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
            <h1 className="mt-1 text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Audit Logs</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Historique complet des actions sur la plateforme.</p>
          </div>
          <motion.button
            type="button" onClick={exportCSV}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium"
            style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
            whileHover={{ borderColor: "#FF6B57", color: "#FF6B57", background: "rgba(255,107,87,0.08)" }}
            whileTap={{ scale: 0.96 }}
          >
            <Download size={14} /> Exporter CSV
          </motion.button>
        </div>
      </ClubKpiCard>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total logs", value: kpis.total,         icon: History,    color: "#FF6B57" },
          { label: "Aujourd'hui", value: kpis.today,        icon: UserCheck,  color: "#22C55E" },
          { label: "Modifications", value: kpis.modifications, icon: Edit,    color: "#3B82F6" },
          { label: "Suppressions", value: kpis.suppressions, icon: Trash2,    color: "#EF4444" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <ClubKpiCard key={label} delay={i * 0.07}>
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${color}1f` }}>
                <Icon size={16} style={{ color }} />
              </div>
            </div>
            <div className="mt-3 text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>{value}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
          </ClubKpiCard>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["Tous", ...ALL_TYPES] as const).map((t) => (
            <motion.button
              key={t} type="button" onClick={() => setTypeFilter(t as "Tous" | ActionType)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold"
              style={{
                background: typeFilter === t ? `${ACTION_COLOR[t as ActionType] ?? "#FF6B57"}20` : "rgba(255,255,255,0.04)",
                color: typeFilter === t ? (ACTION_COLOR[t as ActionType] ?? "#FF6B57") : "var(--text-muted)",
                border: "1px solid var(--surface-panel-border)",
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              {t}
            </motion.button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Utilisateur, action..."
              className="rounded-xl border py-2.5 pl-9 pr-3 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)", width: 180 }}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
          />
        </div>
      </div>

      {/* Timeline */}
      <ClubKpiCard hover={false}>
        {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <ClubEmptyState title="Aucun journal" description="Les actions du club seront enregistrées ici." />
        )}
        <div className="relative">
          {/* timeline rail */}
          <div className="absolute left-[22px] top-4 h-[calc(100%-32px)] w-px" style={{ background: "rgba(255,107,87,0.15)" }} />

          <div className="space-y-1">
            <AnimatePresence>
              {filtered.map((log, i) => {
                const Icon = ACTION_ICON[log.type];
                const color = ACTION_COLOR[log.type];
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-4 rounded-2xl p-4 transition-all"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                    whileHover={{ background: "rgba(255,107,87,0.04)" }}
                  >
                    {/* Icon node */}
                    <div className="relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                      style={{ background: `${color}12`, borderColor: `${color}30` }}>
                      <Icon size={14} style={{ color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{log.action}</span>
                          <span className="mx-1 text-sm" style={{ color: "var(--text-muted)" }}>·</span>
                          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{log.entity}</span>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${color}18`, color, flexShrink: 0 }}>
                          {log.type}
                        </span>
                      </div>
                      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>{log.details}</p>
                      <div className="mt-1.5 flex flex-wrap gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                        <span className="font-medium" style={{ color: "#FF6B57" }}>{log.user}</span>
                        <span>{log.role}</span>
                        <span>{log.date} {log.time}</span>
                        <span className="font-mono">{log.ip}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filtered.length === 0 && (
              <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
                <History size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun log trouvé</p>
              </div>
            )}
          </div>
        </div>
      </ClubKpiCard>
    </ClubPageTransition>
  );
}
