import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Download, TrendingUp, Calendar, RefreshCw, Plus } from "lucide-react";
import { useFinanceBackendData } from "../hooks/useFinanceBackendData";
import jsPDF from "jspdf";

const CHART_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444"];

export function RapportsFinance() {
  const { report, history, revenueSources, loading } = useFinanceBackendData();

  // Build monthly data from history
  const monthlyData = (() => {
    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const map = new Map<string, { month: string; revenus: number; depenses: number; sortKey: string }>();
    for (const h of history) {
      const parts = h.date.split("/");
      if (parts.length !== 3) continue;
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const month = monthLabels[d.getMonth()] ?? "—";
      const prev = map.get(sortKey) ?? { month, revenus: 0, depenses: 0, sortKey };
      if (h.entryType === "REVENUE") prev.revenus += Math.abs(h.amount);
      else prev.depenses += Math.abs(h.amount);
      map.set(sortKey, prev);
    }
    return [...map.values()]
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
      .map(({ month, revenus, depenses }) => ({ month, revenus, depenses, benefice: revenus - depenses }));
  })();

  const totalRevenus = monthlyData.reduce((s, m) => s + m.revenus, 0);
  const totalDepenses = monthlyData.reduce((s, m) => s + m.depenses, 0);
  const totalBenefice = totalRevenus - totalDepenses;

  // Revenue sources from backend only
  const revenueDistribution = revenueSources.map((s, i) => ({
    name: s.name,
    value: s.amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Dynamic report list based on current date
  const now = new Date();
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const REPORTS = [
    { id: "1", periode: `${monthNames[now.getMonth()]} ${now.getFullYear()}`, type: "Mensuel" as const, status: "Généré" as const, date: new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString("fr-FR") },
    { id: "2", periode: `${monthNames[now.getMonth() - 1] ?? monthNames[11]} ${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}`, type: "Mensuel" as const, status: "Généré" as const, date: new Date(now.getFullYear(), now.getMonth(), 0).toLocaleDateString("fr-FR") },
    { id: "3", periode: `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`, type: "Trimestriel" as const, status: totalBenefice > 0 ? "Généré" as const : "En cours" as const, date: now.toLocaleDateString("fr-FR") },
    { id: "4", periode: `${now.getFullYear() - 1}`, type: "Annuel" as const, status: "Généré" as const, date: `31/12/${now.getFullYear() - 1}` },
  ];

  const handleDownloadReport = (report: typeof REPORTS[0]) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Rapport Financier — ${report.periode}`, 20, 20);
    doc.setFontSize(11);
    doc.text(`Type: ${report.type} | Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 20, 32);
    doc.setFontSize(13);
    doc.text("Résumé financier", 20, 46);
    doc.setFontSize(10);
    doc.text(`Total Revenus: ${(totalRevenus / 1000).toFixed(0)} K DT`, 20, 58);
    doc.text(`Total Dépenses: ${(totalDepenses / 1000).toFixed(0)} K DT`, 20, 68);
    doc.text(`Bénéfice Net: ${(totalBenefice / 1000).toFixed(0)} K DT`, 20, 78);
    doc.setFontSize(12);
    doc.text("Détail mensuel (6 derniers mois)", 20, 94);
    let y = 106;
    doc.setFontSize(9);
    for (const m of monthlyData) {
      doc.text(`${m.month}: Revenus ${(m.revenus / 1000).toFixed(0)}K | Dépenses ${(m.depenses / 1000).toFixed(0)}K | Bénéfice ${(m.benefice / 1000).toFixed(0)}K`, 20, y);
      y += 9;
    }
    doc.setFontSize(12);
    doc.text("Sources de revenus", 20, y + 6);
    y += 18;
    doc.setFontSize(9);
    for (const s of revenueDistribution) {
      doc.text(`${s.name}: ${(s.value / 1000).toFixed(0)} K DT (${((s.value / (totalRevenus || 1)) * 100).toFixed(0)}%)`, 20, y);
      y += 9;
    }
    doc.save(`rapport-${report.type.toLowerCase()}-${report.periode.replace(" ", "-")}.pdf`);
  };

  const handleGenerateNew = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Rapport Financier Complet`, 20, 20);
    doc.setFontSize(11);
    doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`, 20, 32);
    doc.setFontSize(12);
    doc.text("Indicateurs Clés", 20, 46);
    doc.setFontSize(10);
    doc.text(`Budget Total: ${((report?.kpis?.budget ?? 0) / 1000).toFixed(0)} K DT`, 20, 58);
    doc.text(`Revenus Saison: ${(totalRevenus / 1000).toFixed(0)} K DT`, 20, 68);
    doc.text(`Dépenses Saison: ${(totalDepenses / 1000).toFixed(0)} K DT`, 20, 78);
    doc.text(`Bénéfice Net: ${(totalBenefice / 1000).toFixed(0)} K DT`, 20, 88);
    doc.text(`Sponsors actifs: ${report?.sponsors?.active ?? 0} — Total annuel: ${((report?.sponsors?.totalAnnual ?? 0) / 1000).toFixed(0)} K DT`, 20, 98);
    doc.text(`Contrats actifs: ${report?.contracts?.active ?? 0} — Masse salariale: ${((report?.contracts?.totalMonthlySalary ?? 0) / 1000).toFixed(0)} K DT/mois`, 20, 108);
    doc.text(`Factures: ${report?.invoices?.total ?? 0} total — ${report?.invoices?.overdue ?? 0} en retard`, 20, 118);
    doc.save(`rapport-complet-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement des rapports…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Rapports Financiers</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Analyse détaillée des périodes comptables</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Total Revenus</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-success)" }}>
                {(totalRevenus / 1_000_000).toFixed(2)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--color-state-success)" }}>6 derniers mois</p>
            </div>
            <TrendingUp size={24} style={{ color: "var(--color-state-success)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Total Dépenses</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: "var(--color-state-danger)" }}>
                {(totalDepenses / 1_000_000).toFixed(2)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>6 mois analysés</p>
            </div>
            <Calendar size={24} style={{ color: "var(--color-state-danger)" }} />
          </div>
        </GlassCard>

        <GlassCard raised className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Bénéfice Net</p>
              <p className="mt-2 text-2xl font-semibold" style={{ color: totalBenefice >= 0 ? "var(--accent)" : "var(--color-state-danger)" }}>
                {totalBenefice >= 0 ? "+" : ""}{(totalBenefice / 1_000_000).toFixed(2)} M DT
              </p>
              <p className="mt-1 text-xs" style={{ color: totalBenefice >= 0 ? "var(--color-state-success)" : "var(--color-state-danger)" }}>
                {totalBenefice >= 0 ? "↑ positif" : "↓ déficit"}
              </p>
            </div>
            <TrendingUp size={24} style={{ color: totalBenefice >= 0 ? "var(--accent)" : "var(--color-state-danger)" }} />
          </div>
        </GlassCard>
      </div>

      {/* Charts */}
      {monthlyData.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              📈 Revenus vs Dépenses (6 mois)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
                  labelStyle={{ color: "var(--text-primary)" }}
                  formatter={(v: number) => [`${(v / 1000).toFixed(0)} K DT`]}
                />
                <Legend />
                <Bar dataKey="revenus" fill="#10B981" name="Revenus" />
                <Bar dataKey="depenses" fill="#EF4444" name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>💰 Sources de Revenus</h2>
            {revenueDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueDistribution}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                      paddingAngle={2} dataKey="value"
                    >
                      {revenueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
                      formatter={(value: number) => `${(value / 1000).toFixed(0)} K DT`}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {revenueDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                        <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                      </div>
                      <span style={{ color: "var(--text-primary)" }} className="font-semibold">
                        {((item.value / (totalRevenus || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                Aucune source de revenus enregistrée
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune donnée mensuelle disponible — ajoutez des transactions dans le Dashboard.</p>
        </GlassCard>
      )}

      {/* Bénéfice mensuel line */}
      {monthlyData.length > 0 && (
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📊 Évolution Bénéfice Mensuel</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" />
              <YAxis stroke="var(--text-muted)" tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)" }}
                labelStyle={{ color: "var(--text-primary)" }}
                formatter={(v: number) => [`${(v / 1000).toFixed(0)} K DT`]}
              />
              <Line
                type="monotone" dataKey="benefice" stroke="var(--accent)" strokeWidth={2}
                dot={{ fill: "var(--accent)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Rapports disponibles */}
      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>📋 Rapports Disponibles</h2>
          <Button variant="ghost" size="sm" onClick={handleGenerateNew}>
            <Plus size={14} className="mr-1" /> Générer rapport complet
          </Button>
        </div>
        <div className="space-y-3">
          {REPORTS.map((report) => (
            <div
              key={report.id}
              className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] border px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{report.periode}</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{report.type} • {report.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={report.status === "Généré" ? "success" : "warning"}>{report.status}</Badge>
                <Button variant="ghost" className="flex items-center gap-1" onClick={() => handleDownloadReport(report)}>
                  <Download size={16} /> Télécharger PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
