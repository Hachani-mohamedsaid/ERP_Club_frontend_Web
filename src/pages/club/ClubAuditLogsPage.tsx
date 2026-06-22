import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
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
const LOGS: AuditLog[] = [
  { id: "AL-001", user: "Mohamed Hachani",  role: "Club Admin",  action: "Modification contrat", entity: "Ahmed Ben Salah",   details: "Salaire modifié 2500→3000 DT",      type: "Modification", date: "19/06/2026", time: "10:45", ip: "197.0.22.14" },
  { id: "AL-002", user: "Sonia Khelil",     role: "Coach",       action: "Ajout joueur",          entity: "Youssef Maatoug",   details: "Ajouté à l'équipe B",               type: "Création",     date: "19/06/2026", time: "09:30", ip: "197.0.22.20" },
  { id: "AL-003", user: "Khaled Trabelsi",  role: "Fin.",        action: "Export rapport",        entity: "Rapport Q2 2026",   details: "Export PDF finances trimestriel",   type: "Export",       date: "18/06/2026", time: "17:15", ip: "197.0.22.8"  },
  { id: "AL-004", user: "Tarek Bouzid",     role: "Scout",       action: "Connexion",             entity: "—",                 details: "Connexion réussie depuis Chrome",   type: "Connexion",    date: "18/06/2026", time: "14:00", ip: "197.0.55.1"  },
  { id: "AL-005", user: "Mohamed Hachani",  role: "Club Admin",  action: "Suppression",           entity: "Ines Makni",        details: "Compte utilisateur désactivé",      type: "Suppression",  date: "18/06/2026", time: "11:20", ip: "197.0.22.14" },
  { id: "AL-006", user: "Amal Gharbi",      role: "Analyste",    action: "Modification permission","entity": "Rôle Scout",     details: "Accès Analytics retiré",            type: "Permission",   date: "17/06/2026", time: "16:50", ip: "197.0.22.33" },
  { id: "AL-007", user: "Sonia Khelil",     role: "Coach",       action: "Modification",          entity: "Séance entraîn.",   details: "Séance du 20/06 annulée",           type: "Modification", date: "17/06/2026", time: "08:30", ip: "197.0.22.20" },
  { id: "AL-008", user: "Khaled Trabelsi",  role: "Fin.",        action: "Création",              entity: "Facture F-2026-06", details: "Nouvelle facture 20 400 DT",        type: "Création",     date: "16/06/2026", time: "15:00", ip: "197.0.22.8"  },
  { id: "AL-009", user: "Mohamed Hachani",  role: "Club Admin",  action: "Connexion",             entity: "—",                 details: "Connexion depuis Safari / iPhone",  type: "Connexion",    date: "16/06/2026", time: "07:45", ip: "197.0.22.14" },
  { id: "AL-010", user: "Tarek Bouzid",     role: "Scout",       action: "Création",              entity: "Dossier prospect",  details: "Nouveau prospect : Mehdi Kacem",    type: "Création",     date: "15/06/2026", time: "13:10", ip: "197.0.55.1"  },
];

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

  const filtered = useMemo(() => LOGS.filter((l) => {
    const q = search.toLowerCase();
    const matchQ = l.user.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.entity.toLowerCase().includes(q);
    const matchType = typeFilter === "Tous" || l.type === typeFilter;
    const matchDate = !dateFilter || l.date.includes(dateFilter);
    return matchQ && matchType && matchDate;
  }), [search, typeFilter, dateFilter]);

  const kpis = useMemo(() => ({
    total: LOGS.length,
    today: LOGS.filter((l) => l.date === "19/06/2026").length,
    modifications: LOGS.filter((l) => l.type === "Modification").length,
    suppressions: LOGS.filter((l) => l.type === "Suppression").length,
  }), []);

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
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}
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
                border: `1px solid ${typeFilter === t ? (ACTION_COLOR[t as ActionType] ?? "#FF6B57") + "50" : "rgba(255,255,255,0.08)"}`,
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
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)", width: 180 }}
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-muted)" }}
          />
        </div>
      </div>

      {/* Timeline */}
      <ClubKpiCard hover={false}>
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
