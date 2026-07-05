import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, BarChart3, Crown, Download, RefreshCw } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useFinanceBackendData } from "../hooks/useFinanceBackendData";
import type { BackendContract } from "../hooks/useFinanceBackendData";
import jsPDF from "jspdf";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B" };

const STATUS_META: Record<string, { color: string; bg: string }> = {
  Payé: { color: F.success, bg: "rgba(34,197,94,0.1)" },
  "En attente": { color: F.warning, bg: "rgba(245,158,11,0.1)" },
  Retard: { color: F.danger, bg: "rgba(239,68,68,0.1)" },
};

// Payment status from related invoices
function paymentStatus(
  c: BackendContract,
  invoices: { fournisseur: string; status: string; description: string | null }[],
): "Payé" | "En attente" | "Retard" {
  const name = c.holderName.toLowerCase();
  const related = invoices.filter(
    (inv) =>
      inv.fournisseur.toLowerCase().includes(name) ||
      name.includes(inv.fournisseur.toLowerCase()) ||
      (inv.description?.toLowerCase().includes(name) ?? false),
  );
  if (related.some((i) => i.status === "Retard")) return "Retard";
  if (related.some((i) => i.status === "En attente")) return "En attente";
  const daysLeft = Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000);
  if (daysLeft < 0) return "Retard";
  return "Payé";
}

export function SalairesFinance() {
  const { contracts, invoices, loading, error, refetch } = useFinanceBackendData();
  const [activeTab, setActiveTab] = useState<"ranking" | "table">("ranking");

  const contractList = contracts?.list ?? [];
  const invoiceList = invoices?.list ?? [];
  const totalMonthlySalary = contracts?.totalMonthlySalary ?? 0;

  const employees = contractList.map((c) => ({
    ...c,
    statut: paymentStatus(c, invoiceList),
    salaireAnnuel: c.salaryMonthly * 12,
  }));

  const sorted = [...employees].sort((a, b) => b.salaryMonthly - a.salaryMonthly);
  const max = sorted.length > 0 ? sorted[0].salaryMonthly : 1;

  const isCoach = (name: string) => /coach|entraîneur|entraineur/i.test(name);
  const players = contractList.filter((c) => c.salaryMonthly >= 50000 && !isCoach(c.holderName));
  const coaches = contractList.filter((c) => isCoach(c.holderName));
  const staff = contractList.filter((c) => !players.includes(c) && !coaches.includes(c));
  const payrollTotal = contractList.reduce((s, c) => s + c.salaryMonthly, 0) || 1;

  const distData = [
    { name: "Joueurs", value: Math.round((players.reduce((s, c) => s + c.salaryMonthly, 0) / payrollTotal) * 100) },
    { name: "Coachs", value: Math.round((coaches.reduce((s, c) => s + c.salaryMonthly, 0) / payrollTotal) * 100) },
    { name: "Staff", value: Math.round((staff.reduce((s, c) => s + c.salaryMonthly, 0) / payrollTotal) * 100) },
  ].filter((d) => d.value > 0);
  const DIST_COLORS = [F.primary, F.info, F.success];

  const kpiCards = [
    { label: "Masse Salariale", value: `${(totalMonthlySalary / 1000).toFixed(0)}K DT/mois`, trend: "+actif", color: F.info, icon: DollarSign },
    { label: "Contrats actifs", value: String(contractList.length), trend: "+actif", color: F.primary, icon: Users },
    { label: "Salaire max", value: `${(max / 1000).toFixed(0)}K DT`, trend: "top", color: F.success, icon: BarChart3 },
    { label: "Masse annuelle", value: `${(totalMonthlySalary * 12 / 1_000_000).toFixed(2)}M DT`, trend: "annuel", color: F.warning, icon: TrendingUp },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rapport Salaires", 20, 20);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 20, 30);
    doc.text(`Masse salariale mensuelle: ${(totalMonthlySalary / 1000).toFixed(0)}K DT`, 20, 40);
    doc.text(`Nombre de contrats: ${contractList.length}`, 20, 50);
    let y = 65;
    doc.setFontSize(9);
    sorted.forEach((emp, i) => {
      doc.text(`${i + 1}. ${emp.holderName} — ${(emp.salaryMonthly / 1000).toFixed(0)}K DT/mois — ${emp.statut}`, 20, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save("salaires.pdf");
  };

  const handleExportExcel = () => {
    const rows = [
      ["Nom", "Salaire Mensuel (DT)", "Salaire Annuel (DT)", "Statut"],
      ...sorted.map(e => [e.holderName, e.salaryMonthly, e.salaireAnnuel, e.statut]),
    ];
    const content = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "salaires.csv";
    a.click();
  };

  if (loading && !contracts) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement des salaires…</span>
      </div>
    );
  }

  if (error && !contracts) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-sm font-medium" style={{ color: F.danger }}>{error}</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Vérifiez que le backend est démarré (Render peut prendre ~30 s au réveil).
        </p>
        <motion.button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold"
          style={{ borderColor: `${F.primary}40`, color: F.primary }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <RefreshCw size={12} /> Réessayer
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Gestion des Salaires</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Masse salariale & rémunérations · Saison en cours</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            type="button" onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: `${F.warning}30`, color: F.warning, background: `${F.warning}08` }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          >
            <Download size={11} /> Export PDF
          </motion.button>
          <motion.button
            type="button" onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
            style={{ borderColor: `${F.success}30`, color: F.success, background: `${F.success}08` }}
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.95 }}
          >
            <Download size={11} /> Export Excel (CSV)
          </motion.button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kpiCards.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={i} className="rounded-[18px] border p-4"
              style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${k.color}14` }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
                <span className="text-[9px] font-bold" style={{ color: k.color }}>{k.trend}</span>
              </div>
              <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{k.label}</p>
              <p className="text-sm font-extrabold mt-0.5" style={{ color: k.color }}>{k.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["ranking", "table"] as const).map(tab => (
          <motion.button
            key={tab} type="button" onClick={() => setActiveTab(tab)}
            className="rounded-xl px-4 py-2 text-xs font-bold capitalize"
            style={{
              background: activeTab === tab ? `${F.primary}14` : "rgba(255,255,255,0.04)",
              color: activeTab === tab ? F.primary : "rgba(255,255,255,0.4)",
              border: "1px solid var(--surface-panel-border)",
            }}
            whileHover={{ scale: 1.05 }}
          >
            {tab === "ranking" ? "🏆 Classement Salaires" : "📋 Tableau détaillé"}
          </motion.button>
        ))}
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-[20px] border"
          style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
          <DollarSign size={40} style={{ color: "var(--text-muted)" }} className="mb-3" />
          <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>Aucun contrat enregistré</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Ajoutez des contrats dans la page Contrats pour voir les salaires
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_260px]">
          <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
            {activeTab === "ranking" && (
              <>
                <p className="text-xs font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                  <Crown size={13} className="inline mr-1.5" style={{ color: F.warning }} />
                  Classement salarial — Top {sorted.length}
                </p>
                <div className="space-y-3">
                  {sorted.map((emp, i) => {
                    const pct = (emp.salaryMonthly / max) * 100;
                    const stMeta = STATUS_META[emp.statut];
                    return (
                      <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-extrabold w-5 text-right shrink-0"
                            style={{ color: i === 0 ? "#F59E0B" : i === 1 ? "rgba(255,255,255,0.6)" : i === 2 ? "#CD7F32" : "rgba(255,255,255,0.3)" }}>
                            {i + 1}
                          </span>
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-extrabold text-white"
                            style={{ background: `linear-gradient(135deg,${F.primary},${F.primary}88)` }}>
                            {emp.holderName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>{emp.holderName}</p>
                            <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                              Fin: {new Date(emp.endDate).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-extrabold" style={{ color: F.primary }}>
                              {(emp.salaryMonthly / 1000).toFixed(0)}K DT
                            </p>
                            <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>/ mois</p>
                          </div>
                          <span className="rounded-full px-2 py-0.5 text-[8px] font-bold shrink-0"
                            style={{ background: stMeta.bg, color: stMeta.color }}>
                            {emp.statut}
                          </span>
                        </div>
                        <div className="ml-16 flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <motion.div
                              className="h-2 rounded-full"
                              style={{ background: `linear-gradient(90deg,${F.primary},${F.primary}88)` }}
                              initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.85, ease: "easeOut", delay: i * 0.06 }}
                            />
                          </div>
                          <span className="text-[8px] w-8 text-right shrink-0" style={{ color: "var(--text-muted)" }}>
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
                        {["Titulaire", "Mensuel", "Annuel", "Fin contrat", "Statut"].map(h => (
                          <th key={h} className="pb-2 pr-4 text-left font-bold" style={{ color: "var(--text-muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((emp, i) => {
                        const stMeta = STATUS_META[emp.statut];
                        return (
                          <motion.tr
                            key={emp.id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-2.5 pr-4 font-semibold" style={{ color: "var(--text-primary)" }}>{emp.holderName}</td>
                            <td className="py-2.5 pr-4 font-bold text-right" style={{ color: F.primary }}>
                              {(emp.salaryMonthly / 1000).toFixed(0)}K DT
                            </td>
                            <td className="py-2.5 pr-4 font-bold text-right" style={{ color: "var(--text-primary)" }}>
                              {(emp.salaireAnnuel / 1000).toFixed(0)}K DT
                            </td>
                            <td className="py-2.5 pr-4" style={{ color: "var(--text-muted)" }}>
                              {new Date(emp.endDate).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="py-2.5">
                              <span className="rounded-full px-2 py-0.5 font-bold" style={{ background: stMeta.bg, color: stMeta.color }}>
                                {emp.statut}
                              </span>
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

          {/* Right panel */}
          <div className="space-y-3">
            <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
              <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Répartition estimée</p>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distData} dataKey="value" innerRadius={38} outerRadius={68} paddingAngle={4}>
                      {distData.map((_, i) => <Cell key={i} fill={DIST_COLORS[i]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--surface-panel-solid)", border: "none", color: "white", borderRadius: 10 }}
                      formatter={(v: number) => [`${v}%`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-1">
                {distData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-[10px]">
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ background: DIST_COLORS[i] }} />
                    <span className="flex-1" style={{ color: "var(--text-muted)" }}>{d.name}</span>
                    <span className="font-extrabold" style={{ color: DIST_COLORS[i] }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending payments */}
            {employees.filter(e => e.statut !== "Payé").length > 0 && (
              <div className="rounded-[20px] border p-4" style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(245,158,11,0.2)" }}>
                <p className="text-[10px] font-bold mb-2" style={{ color: F.warning }}>⏳ En attente de paiement</p>
                <div className="space-y-1.5">
                  {employees.filter(e => e.statut !== "Payé").map(e => (
                    <div key={e.id} className="flex items-center justify-between text-[10px]">
                      <span style={{ color: "var(--text-primary)" }}>{e.holderName}</span>
                      <span className="font-bold" style={{ color: F.warning }}>{(e.salaryMonthly / 1000).toFixed(0)}K DT</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
