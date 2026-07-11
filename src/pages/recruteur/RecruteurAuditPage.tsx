import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download, Filter, Clock, User, FileText, DollarSign, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { recruteurApi } from "../../lib/api/recruteur";
import { useRecruteurResource } from "../../hooks/useRecruteurResource";

type AuditAction =
  | "validation" | "offre" | "contrat" | "transfert"
  | "modification" | "creation" | "suppression" | "connexion";

interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: AuditAction;
  description: string;
  player?: string | null;
  datetime: string;
  ip: string;
  severity: "info" | "success" | "warning" | "critical";
}

const ACTION_META: Record<AuditAction, { icon: React.ElementType; color: string; label: string }> = {
  validation:   { icon: CheckCircle2,   color: "#22C55E", label: "Validation"  },
  offre:        { icon: Send,           color: "#8B5CF6", label: "Offre"       },
  contrat:      { icon: FileText,       color: "#3B82F6", label: "Contrat"     },
  transfert:    { icon: DollarSign,     color: "#22C55E", label: "Transfert"   },
  modification: { icon: FileText,       color: "#F59E0B", label: "Modification"},
  creation:     { icon: User,           color: "#06B6D4", label: "Création"    },
  suppression:  { icon: AlertTriangle,  color: "#EF4444", label: "Suppression" },
  connexion:    { icon: Clock,          color: "#6B7280", label: "Connexion"   },
};

const SEVERITY_COLORS = {
  info: "#6B7280", success: "#22C55E", warning: "#F59E0B", critical: "#EF4444",
};

export function RecruteurAuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | AuditLog["severity"]>("all");

  const { data, loading, error } = useRecruteurResource(
    () => recruteurApi.getAuditLogs({
      action: actionFilter !== "all" ? actionFilter : undefined,
      severity: severityFilter !== "all" ? severityFilter : undefined,
      search: search || undefined,
    }) as Promise<AuditLog[]>,
    [actionFilter, severityFilter, search],
  );

  const logs = useMemo(() => data ?? [], [data]);

  function exportCSV() {
    const rows = [
      ["ID", "Utilisateur", "Rôle", "Action", "Description", "Joueur", "Date & heure", "IP", "Sévérité"],
      ...logs.map((l) => [l.id, l.user, l.role, l.action, l.description, l.player ?? "", l.datetime, l.ip, l.severity]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "audit-logs-recruteur.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Journal d'Audit</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Traçabilité complète des actions recrutement</p>
        </div>
        <motion.button type="button" onClick={exportCSV}
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold"
          style={{ borderColor: "rgba(139,92,246,0.3)", color: "#8B5CF6", background: "rgba(139,92,246,0.08)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Download size={13} /> Export CSV
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total actions",   value: logs.length,                                          color: "#8B5CF6" },
          { label: "Validations",     value: logs.filter(l => l.action === "validation").length,    color: "#22C55E" },
          { label: "Modifications",   value: logs.filter(l => l.action === "modification").length,  color: "#F59E0B" },
          { label: "Incidents",       value: logs.filter(l => l.severity === "critical").length,    color: "#EF4444" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="rounded-[20px] border p-4" style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
          <Search size={13} style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="bg-transparent text-sm outline-none w-44" style={{ color: "var(--text-primary)" }} />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
          <Filter size={11} style={{ color: "var(--text-muted)" }} />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value as AuditAction | "all")}
            className="bg-transparent text-xs outline-none" style={{ color: "var(--text-muted)" }}>
            <option value="all">Toutes actions</option>
            {Object.entries(ACTION_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div className="flex gap-1.5">
          {(["all","info","success","warning","critical"] as const).map(s => (
            <motion.button key={s} type="button" onClick={() => setSeverityFilter(s)}
              className="rounded-full px-3 py-1 text-[10px] font-semibold"
              style={{
                background: severityFilter === s ? (s === "all" ? "rgba(255,255,255,0.12)" : `${SEVERITY_COLORS[s as AuditLog["severity"]]}20`) : "rgba(255,255,255,0.04)",
                color: s === "all" ? "var(--text-muted)" : SEVERITY_COLORS[s as AuditLog["severity"]],
              }}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              {s === "all" ? "Tout" : s}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Log table */}
      <div className="rounded-[20px] border overflow-hidden" style={{ background: "rgba(14,10,35,0.8)", borderColor: "var(--surface-panel-border)" }}>
        {/* Head */}
        <div className="grid grid-cols-[1fr_2.5fr_1fr_1fr] gap-3 border-b px-5 py-3 text-[10px] font-semibold uppercase"
          style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}>
          <span>Utilisateur</span>
          <span>Description</span>
          <span>Date & Heure</span>
          <span>Sévérité</span>
        </div>

        {loading && (
          <div className="py-14 text-center" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm">Chargement…</p>
          </div>
        )}

        {error && !loading && (
          <div className="py-14 text-center text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Rows */}
        {!loading && !error && logs.map((log, i) => {
          const meta = ACTION_META[log.action];
          const Icon = meta?.icon ?? FileText;
          const color = meta?.color ?? "#6B7280";
          return (
            <motion.div key={log.id} layout
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="grid grid-cols-[1fr_2.5fr_1fr_1fr] gap-3 items-center border-b px-5 py-3 transition-colors"
              style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {/* User */}
              <div>
                <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{log.user}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{log.role}</p>
              </div>
              {/* Description */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${color}15` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{log.user}</strong> {log.description}
                  </p>
                  {log.player && (
                    <p className="text-[10px]" style={{ color }}>→ {log.player}</p>
                  )}
                </div>
              </div>
              {/* Datetime */}
              <div>
                <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{new Date(log.datetime).toLocaleString("fr-FR")}</p>
                <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>IP: {log.ip}</p>
              </div>
              {/* Severity */}
              <div>
                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                  style={{ background: `${SEVERITY_COLORS[log.severity]}18`, color: SEVERITY_COLORS[log.severity] }}>
                  {log.severity}
                </span>
              </div>
            </motion.div>
          );
        })}

        {!loading && !error && logs.length === 0 && (
          <div className="py-14 text-center" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm">Aucun résultat</p>
          </div>
        )}
      </div>
    </RecruteurPageTransition>
  );
}
