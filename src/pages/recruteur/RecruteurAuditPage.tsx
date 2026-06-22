import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download, Filter, Clock, User, FileText, DollarSign, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";

type AuditAction =
  | "validation" | "offre" | "contrat" | "transfert"
  | "modification" | "creation" | "suppression" | "connexion";

interface AuditLog {
  id: string;
  user: string;
  role: string;
  action: AuditAction;
  description: string;
  player?: string;
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

const LOGS: AuditLog[] = [
  { id: "l1",  user: "Karim Belaïd",    role: "Directeur Recrutement", action: "validation",   description: "a validé le dossier de recrutement de Ahmed Ali",           player: "Ahmed Ali",       datetime: "2026-06-20 14:30", ip: "192.168.1.10", severity: "success"  },
  { id: "l2",  user: "Karim Belaïd",    role: "Directeur Recrutement", action: "offre",        description: "a envoyé une offre de transfert à l'agent de Ibrahim Touré",player: "Ibrahim Touré",   datetime: "2026-06-20 12:05", ip: "192.168.1.10", severity: "info"     },
  { id: "l3",  user: "Ahmed Trabelsi",  role: "Scout",                  action: "creation",     description: "a ajouté Khalil Maatoug à la shortlist",                    player: "Khalil Maatoug", datetime: "2026-06-20 10:22", ip: "192.168.1.15", severity: "info"     },
  { id: "l4",  user: "Karim Belaïd",    role: "Directeur Recrutement", action: "contrat",      description: "a signé le contrat de transfert de Sofiane Bellal",          player: "Sofiane Bellal", datetime: "2026-06-19 16:45", ip: "192.168.1.10", severity: "success"  },
  { id: "l5",  user: "Omar Hadjadj",    role: "Scout",                  action: "creation",     description: "a soumis le rapport de scouting pour la Ligue Pro 1 DZ",     player: undefined,         datetime: "2026-06-19 11:00", ip: "10.0.0.42",    severity: "info"     },
  { id: "l6",  user: "Mourad Belhaj",   role: "Agent",                  action: "modification", description: "a modifié les conditions de l'offre pour Ryad Bouassem",    player: "Ryad Bouassem",  datetime: "2026-06-18 15:30", ip: "External",     severity: "warning"  },
  { id: "l7",  user: "Sofiane Mellah",  role: "Scout",                  action: "creation",     description: "a identifié un gardien (23 ans, FR) dans la Ligue 2",        player: "Gardien FR-23",  datetime: "2026-06-18 09:15", ip: "10.0.0.55",    severity: "info"     },
  { id: "l8",  user: "Karim Belaïd",    role: "Directeur Recrutement", action: "suppression",  description: "a retiré Nizar Ben Amor de la shortlist — incompatibilité",   player: "Nizar Ben Amor", datetime: "2026-06-17 14:00", ip: "192.168.1.10", severity: "warning"  },
  { id: "l9",  user: "Ali Benali",      role: "Scout",                  action: "offre",        description: "a transmis une proposition informelle à l'agent de Camara",  player: "M. Camara",      datetime: "2026-06-17 10:30", ip: "10.0.0.22",    severity: "info"     },
  { id: "l10", user: "Karim Belaïd",    role: "Directeur Recrutement", action: "transfert",    description: "a finalisé le transfert de Mohamed Camara — 2.0M€",          player: "M. Camara",      datetime: "2026-06-16 17:00", ip: "192.168.1.10", severity: "success"  },
  { id: "l11", user: "Karim Belaïd",    role: "Directeur Recrutement", action: "connexion",    description: "s'est connecté au système depuis le bureau",                  player: undefined,         datetime: "2026-06-16 08:00", ip: "192.168.1.10", severity: "info"     },
  { id: "l12", user: "Inconnu",         role: "—",                      action: "connexion",    description: "Tentative de connexion échouée (3 fois) — compte bloqué",    player: undefined,         datetime: "2026-06-15 22:47", ip: "94.12.33.210", severity: "critical" },
];

export function RecruteurAuditPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | AuditLog["severity"]>("all");

  const filtered = useMemo(() => LOGS.filter(l => {
    const q = search.toLowerCase();
    if (q && !l.user.toLowerCase().includes(q) && !l.description.toLowerCase().includes(q) && !(l.player ?? "").toLowerCase().includes(q)) return false;
    if (actionFilter !== "all" && l.action !== actionFilter) return false;
    if (severityFilter !== "all" && l.severity !== severityFilter) return false;
    return true;
  }), [search, actionFilter, severityFilter]);

  return (
    <RecruteurPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Journal d'Audit</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Traçabilité complète des actions recrutement</p>
        </div>
        <motion.button type="button"
          className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold"
          style={{ borderColor: "rgba(139,92,246,0.3)", color: "#8B5CF6", background: "rgba(139,92,246,0.08)" }}
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          <Download size={13} /> Export CSV
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total actions",   value: LOGS.length,                                     color: "#8B5CF6" },
          { label: "Validations",     value: LOGS.filter(l => l.action === "validation").length, color: "#22C55E" },
          { label: "Modifications",   value: LOGS.filter(l => l.action === "modification").length, color: "#F59E0B" },
          { label: "Incidents",       value: LOGS.filter(l => l.severity === "critical").length,   color: "#EF4444" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="rounded-[20px] border p-4" style={{ background: "rgba(14,10,35,0.8)", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-2xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
          <Search size={13} style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
            className="bg-transparent text-sm outline-none w-44" style={{ color: "var(--text-primary)" }} />
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5"
          style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
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
      <div className="rounded-[20px] border overflow-hidden" style={{ background: "rgba(14,10,35,0.8)", borderColor: "rgba(255,255,255,0.07)" }}>
        {/* Head */}
        <div className="grid grid-cols-[1fr_2.5fr_1fr_1fr] gap-3 border-b px-5 py-3 text-[10px] font-semibold uppercase"
          style={{ borderColor: "rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
          <span>Utilisateur</span>
          <span>Description</span>
          <span>Date & Heure</span>
          <span>Sévérité</span>
        </div>
        {/* Rows */}
        {filtered.map((log, i) => {
          const meta = ACTION_META[log.action];
          const Icon = meta.icon;
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
                  style={{ background: `${meta.color}15` }}>
                  <Icon size={12} style={{ color: meta.color }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{log.user}</strong> {log.description}
                  </p>
                  {log.player && (
                    <p className="text-[10px]" style={{ color: meta.color }}>→ {log.player}</p>
                  )}
                </div>
              </div>
              {/* Datetime */}
              <div>
                <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{log.datetime}</p>
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

        {filtered.length === 0 && (
          <div className="py-14 text-center" style={{ color: "var(--text-muted)" }}>
            <p className="text-sm">Aucun résultat</p>
          </div>
        )}
      </div>
    </RecruteurPageTransition>
  );
}
