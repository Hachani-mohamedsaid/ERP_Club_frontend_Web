import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Download, Pencil, Plus, Trash2, LogIn, Shield, FileText,
  Users, AlertTriangle, Activity, Search,
} from "lucide-react";
import { RPage, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, RSearch, pageVariants, cardVariants } from "../../components/responsable";

type AuditAction = "Modification" | "Création" | "Suppression" | "Connexion" | "Validation" | "Alerte";

interface AuditLog {
  id: string; time: string; user: string; role: string;
  action: AuditAction; description: string; ip: string;
}

const ACTION_ICON: Record<AuditAction, typeof Clock> = {
  Modification: Pencil,
  Création:     Plus,
  Suppression:  Trash2,
  Connexion:    LogIn,
  Validation:   Shield,
  Alerte:       AlertTriangle,
};
const ACTION_COLOR: Record<AuditAction, string> = {
  Modification: "#FF7A00",
  Création:     "#22C55E",
  Suppression:  "#EF4444",
  Connexion:    "#3B82F6",
  Validation:   "#8B5CF6",
  Alerte:       "#F59E0B",
};

const LOGS: AuditLog[] = [
  { id: "l1",  time: "Auj. 10:30", user: "Mohamed Hachani", role: "Responsable", action: "Validation",   description: "Validation recrutement Youssef Ben Ali",        ip: "196.203.1.1" },
  { id: "l2",  time: "Auj. 09:45", user: "Sonia Baccouche", role: "Coach",       action: "Modification", description: "Modification séance entraînement du 22/06",      ip: "196.203.1.2" },
  { id: "l3",  time: "Auj. 09:15", user: "Ines Mejri",      role: "Médecin",     action: "Création",     description: "Ajout blessure Karim Gharbi — genou droit",      ip: "196.203.1.3" },
  { id: "l4",  time: "Auj. 08:30", user: "Mohamed Hachani", role: "Responsable", action: "Connexion",    description: "Connexion au tableau de bord",                   ip: "196.203.1.1" },
  { id: "l5",  time: "Hier 16:20", user: "Tarek Bouzid",    role: "Scout",       action: "Création",     description: "Ajout prospect Nader Trabelsi",                  ip: "196.203.1.4" },
  { id: "l6",  time: "Hier 14:00", user: "Mohamed Hachani", role: "Responsable", action: "Suppression",  description: "Suppression dépense #D-009 — doublon",           ip: "196.203.1.1" },
  { id: "l7",  time: "Hier 11:30", user: "Rami Ben Slimane",role: "Analyste",    action: "Modification", description: "Mise à jour rapport analytique Ligue 1 J28",    ip: "196.203.1.5" },
  { id: "l8",  time: "Hier 09:00", user: "Sonia Baccouche", role: "Coach",       action: "Connexion",    description: "Connexion depuis nouvel appareil",               ip: "196.203.2.1" },
  { id: "l9",  time: "18/06 15:40",user: "Ines Mejri",      role: "Médecin",     action: "Modification", description: "Modification fiche médicale — Joueur #47",      ip: "196.203.1.3" },
  { id: "l10", time: "18/06 10:00",user: "Mohamed Hachani", role: "Responsable", action: "Alerte",       description: "Tentative d'accès non autorisé détectée",       ip: "185.10.0.99" },
];

const FILTER_OPTIONS = ["Tous", "Modification", "Création", "Suppression", "Connexion", "Validation", "Alerte"];

export function AuditPage() {
  const [filter, setFilter] = useState("Tous");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => LOGS.filter(l => {
      const matchAction = filter === "Tous" || l.action === filter;
      const matchSearch = l.description.toLowerCase().includes(search.toLowerCase()) ||
        l.user.toLowerCase().includes(search.toLowerCase());
      return matchAction && matchSearch;
    }),
    [filter, search]
  );

  function exportCsv() {
    const rows = ["Date,Utilisateur,Rôle,Action,Description,IP",
      ...LOGS.map(l => `${l.time},${l.user},${l.role},${l.action},${l.description},${l.ip}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-logs.csv"; a.click();
  }

  return (
    <RPage>
      <RHeader
        title="Journal d'Activité"
        subtitle="Toutes les actions effectuées dans le système."
        badge="AUDIT_VIEW"
        action={<RBtn onClick={exportCsv} variant="ghost"><Download size={14} /> Exporter CSV</RBtn>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard label="Total actions"  value={String(LOGS.length)}                                          icon={Activity}      color="#3B82F6" />
        <RKpiCard label="Aujourd'hui"    value={String(LOGS.filter(l => l.time.startsWith("Auj.")).length)}   icon={Clock}         color="#FF7A00" />
        <RKpiCard label="Modifications"  value={String(LOGS.filter(l => l.action === "Modification").length)} icon={Pencil}        color="#F59E0B" />
        <RKpiCard label="Alertes"        value={String(LOGS.filter(l => l.action === "Alerte").length)}       icon={AlertTriangle} color="#EF4444" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <RSearch value={search} onChange={setSearch} placeholder="Rechercher action, utilisateur..." />
        </div>
      </div>
      <RPills options={FILTER_OPTIONS} value={filter} onChange={setFilter} />

      <RSection title="Activité" subtitle={`${filtered.length} entrée${filtered.length > 1 ? "s" : ""}`}>
        <AnimatePresence mode="wait">
          <motion.div key={filter + search} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-0">
            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-[22px] top-0 bottom-0 w-[1px]" style={{ background: "rgba(255,255,255,0.06)" }} />
              {filtered.map((l, i) => {
                const Icon = ACTION_ICON[l.action];
                const color = ACTION_COLOR[l.action];
                return (
                  <motion.div key={l.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="relative flex gap-4 pb-5">
                    {/* Timeline dot + icon */}
                    <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `${color}15`, border: `2px solid ${color}35` }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{l.user}</span>
                          <span className="ml-2 text-xs" style={{ color: "var(--text-muted)" }}>— {l.role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: `${color}18`, color }}>
                            {l.action}
                          </span>
                          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>{l.time}</span>
                        </div>
                      </div>
                      <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>{l.description}</p>
                      <p className="mt-0.5 text-[11px]" style={{ color: "var(--text-muted)" }}>IP: {l.ip}</p>
                    </div>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucune entrée trouvée</div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </RSection>
    </RPage>
  );
}
