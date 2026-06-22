import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, BarChart3, Download, Crown } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

interface Employee {
  id: string; nom: string; poste: string; categorie: "Joueur" | "Coach" | "Staff";
  salaireMensuel: number; salaireAnnuel: number; statut: "Payé" | "En attente" | "Retard";
}

const EMPLOYEES: Employee[] = [
  { id: "1", nom: "Mohamed Diallo",   poste: "Défenseur",           categorie: "Joueur", salaireMensuel: 95000, salaireAnnuel: 1140000, statut: "Payé"       },
  { id: "2", nom: "Youssef Ben Ali",  poste: "Attaquant",           categorie: "Joueur", salaireMensuel: 85000, salaireAnnuel: 1020000, statut: "Payé"       },
  { id: "3", nom: "Nader Trabelsi",   poste: "Milieu",              categorie: "Joueur", salaireMensuel: 78000, salaireAnnuel:  936000, statut: "Payé"       },
  { id: "4", nom: "Ibrahim Touré",    poste: "Milieu Offensif",     categorie: "Joueur", salaireMensuel: 72000, salaireAnnuel:  864000, statut: "En attente" },
  { id: "5", nom: "Karim Sassi",      poste: "Défenseur Central",   categorie: "Joueur", salaireMensuel: 68000, salaireAnnuel:  816000, statut: "Payé"       },
  { id: "6", nom: "Coach Principal",  poste: "Directeur Technique", categorie: "Coach",  salaireMensuel: 65000, salaireAnnuel:  780000, statut: "Payé"       },
  { id: "7", nom: "Assistant Coach",  poste: "Préparateur Physique",categorie: "Coach",  salaireMensuel: 42000, salaireAnnuel:  504000, statut: "Payé"       },
  { id: "8", nom: "Dr. Amira Ben M.", poste: "Médecin du Club",     categorie: "Staff",  salaireMensuel: 38000, salaireAnnuel:  456000, statut: "En attente" },
];

const CAT_COLORS: Record<string, string> = { Joueur: F.primary, Coach: F.info, Staff: F.success };
const STATUS_META: Record<string, { color: string; bg: string }> = {
  "Payé":        { color: F.success, bg: "rgba(34,197,94,0.1)"  },
  "En attente":  { color: F.warning, bg: "rgba(245,158,11,0.1)" },
  "Retard":      { color: F.danger,  bg: "rgba(239,68,68,0.1)"  },
};

const KPI_CARDS = [
  { label: "Masse Salariale", value: "1.2M DT/mois", trend: "+3%",  color: F.info,    icon: DollarSign  },
  { label: "Joueurs",         value: "900K DT",       trend: "+2%",  color: F.primary, icon: Users       },
  { label: "Staff & Coachs",  value: "300K DT",       trend: "+1%",  color: F.success, icon: BarChart3   },
  { label: "Évolution YOY",   value: "+6.2%",         trend: "annuel",color: F.warning,icon: TrendingUp  },
];

const DISTRIBUTION = [
  { name: "Joueurs", value: 75 }, { name: "Coachs", value: 15 }, { name: "Staff", value: 10 },
];
const DIST_COLORS = [F.primary, F.info, F.success];

export function SalairesFinance() {
  const [activeTab, setActiveTab] = useState<"ranking" | "table">("ranking");

  const sorted = [...EMPLOYEES].sort((a, b) => b.salaireAnnuel - a.salaireAnnuel);
  const max = sorted[0].salaireAnnuel;

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des Salaires</h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Masse salariale &amp; rémunérations · Saison 2025-2026</p>
        </div>
        <div className="flex gap-2">
          {[
            { icon: Download, label: "Export PDF", color: F.warning },
            { icon: Download, label: "Export Excel", color: F.success },
          ].map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.button key={i} type="button"
                className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
                style={{ borderColor: `${a.color}30`, color: a.color, background: `${a.color}08` }}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}>
                <Icon size={11} /> {a.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KPI_CARDS.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div key={i} className="rounded-[18px] border p-4"
              style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${k.color}14` }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
                <span className="text-[9px] font-bold" style={{ color: k.color }}>{k.trend}</span>
              </div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>{k.label}</p>
              <p className="text-sm font-extrabold mt-0.5" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["ranking", "table"] as const).map(tab => (
          <motion.button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className="rounded-xl px-4 py-2 text-xs font-bold capitalize"
            style={{
              background: activeTab === tab ? `${F.primary}14` : "rgba(255,255,255,0.04)",
              color: activeTab === tab ? F.primary : "rgba(255,255,255,0.4)",
              border: `1px solid ${activeTab === tab ? F.primary + "35" : "transparent"}`,
            }}
            whileHover={{ scale: 1.05 }}>
            {tab === "ranking" ? "🏆 Classement Salaires" : "📋 Tableau détaillé"}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-[20px] border p-5" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>

          {activeTab === "ranking" && (
            <>
              <p className="text-xs font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                <Crown size={13} className="inline mr-1.5" style={{ color: F.warning }} />
                Classement salarial — Top {sorted.length}
              </p>
              <div className="space-y-3">
                {sorted.map((emp, i) => {
                  const pct = (emp.salaireAnnuel / max) * 100;
                  const catColor = CAT_COLORS[emp.categorie];
                  const stMeta = STATUS_META[emp.statut];
                  return (
                    <motion.div key={emp.id}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <div className="flex items-center gap-3 mb-1">
                        {/* Rank */}
                        <span className="text-sm font-extrabold w-5 text-right shrink-0"
                          style={{ color: i === 0 ? "#F59E0B" : i === 1 ? "rgba(255,255,255,0.6)" : i === 2 ? "#CD7F32" : "rgba(255,255,255,0.3)" }}>
                          {i + 1}
                        </span>
                        {/* Avatar */}
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold text-white"
                          style={{ background: `linear-gradient(135deg,${catColor},${catColor}88)` }}>
                          {emp.nom.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        {/* Name + role */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{emp.nom}</p>
                          <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>{emp.poste}</p>
                        </div>
                        {/* Category chip */}
                        <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0"
                          style={{ background: `${catColor}15`, color: catColor }}>{emp.categorie}</span>
                        {/* Salary */}
                        <div className="text-right shrink-0">
                          <p className="text-xs font-extrabold" style={{ color: catColor }}>
                            {(emp.salaireMensuel / 1000).toFixed(0)}K DT
                          </p>
                          <p className="text-[8px]" style={{ color: "rgba(255,255,255,0.3)" }}>/ mois</p>
                        </div>
                        {/* Status */}
                        <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0"
                          style={{ background: stMeta.bg, color: stMeta.color }}>{emp.statut}</span>
                      </div>
                      {/* Horizontal bar */}
                      <div className="ml-16 flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <motion.div className="h-2 rounded-full"
                            style={{ background: `linear-gradient(90deg,${catColor},${catColor}88)` }}
                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.85, ease: "easeOut", delay: i * 0.06 }} />
                        </div>
                        <span className="text-[8px] w-8 text-right shrink-0" style={{ color: "rgba(255,255,255,0.3)" }}>
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === "table" && (
            <>
              <p className="text-xs font-bold mb-4" style={{ color: "var(--text-primary)" }}>Détail des rémunérations</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                      {["Nom","Poste","Catégorie","Mensuel","Annuel","Statut"].map(h => (
                        <th key={h} className="pb-2 pr-4 text-left font-bold" style={{ color: "rgba(255,255,255,0.4)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EMPLOYEES.map((emp, i) => {
                      const catColor = CAT_COLORS[emp.categorie];
                      const stMeta = STATUS_META[emp.statut];
                      return (
                        <motion.tr key={emp.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                          className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-2.5 pr-4 font-semibold" style={{ color: "var(--text-primary)" }}>{emp.nom}</td>
                          <td className="py-2.5 pr-4" style={{ color: "rgba(255,255,255,0.5)" }}>{emp.poste}</td>
                          <td className="py-2.5 pr-4">
                            <span className="rounded-full px-2 py-0.5 font-bold"
                              style={{ background: `${catColor}12`, color: catColor }}>{emp.categorie}</span>
                          </td>
                          <td className="py-2.5 pr-4 font-bold text-right" style={{ color: catColor }}>
                            {(emp.salaireMensuel / 1000).toFixed(0)}K DT
                          </td>
                          <td className="py-2.5 pr-4 font-bold text-right" style={{ color: "var(--text-primary)" }}>
                            {(emp.salaireAnnuel / 1000).toFixed(0)}K DT
                          </td>
                          <td className="py-2.5">
                            <span className="rounded-full px-2 py-0.5 font-bold"
                              style={{ background: stMeta.bg, color: stMeta.color }}>{emp.statut}</span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right panel: distribution pie */}
        <div className="space-y-3">
          <div className="rounded-[20px] border p-5" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
            <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Répartition par catégorie</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={DISTRIBUTION} dataKey="value" innerRadius={38} outerRadius={68} paddingAngle={4}>
                    {DISTRIBUTION.map((_, i) => <Cell key={i} fill={DIST_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(8,6,24,0.97)", border: "none", color: "white", borderRadius: 10 }} formatter={(v: number) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-1">
              {DISTRIBUTION.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-[10px]">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ background: DIST_COLORS[i] }} />
                  <span className="flex-1" style={{ color: "rgba(255,255,255,0.5)" }}>{d.name}</span>
                  <span className="font-extrabold" style={{ color: DIST_COLORS[i] }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending payments */}
          <div className="rounded-[20px] border p-4" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(245,158,11,0.2)" }}>
            <p className="text-[10px] font-bold mb-2" style={{ color: F.warning }}>⏳ En attente de paiement</p>
            <div className="space-y-1.5">
              {EMPLOYEES.filter(e => e.statut !== "Payé").map(e => (
                <div key={e.id} className="flex items-center justify-between text-[10px]">
                  <span style={{ color: "var(--text-primary)" }}>{e.nom}</span>
                  <span className="font-bold" style={{ color: F.warning }}>{(e.salaireMensuel / 1000).toFixed(0)}K DT</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
