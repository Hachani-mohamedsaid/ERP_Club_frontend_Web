import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, Plus, X, RefreshCw } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useFinanceBackendData } from "../hooks/useFinanceBackendData";
import { clubApi } from "../lib/api/club";

const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(2)} M DT`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)} K DT`
    : `${n.toLocaleString("fr-TN")} DT`;

const CHART_COLORS = ["#8B5CF6", "#EF4444", "#3B82F6", "#F59E0B", "#6B7280"];

export function FinanceComptabilite() {
  const { report, loading, error, refetch, history, alerts, kpis, monthlyExpenses, expenseBreakdown } =
    useFinanceBackendData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "", type: "REVENUE", category: "Sponsoring", entryDate: "" });
  const [saving, setSaving] = useState(false);

  // Build bar chart: last 6 months revenue vs expense
  const barData = (() => {
    if (!history.length) return [];
    const monthMap = new Map<string, { month: string; revenus: number; depenses: number; sortKey: string }>();
    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    for (const h of history) {
      const parts = h.date.split("/");
      if (parts.length !== 3) continue;
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
      const month = monthLabels[d.getMonth()] ?? "—";
      const prev = monthMap.get(sortKey) ?? { month, revenus: 0, depenses: 0, sortKey };
      if (h.entryType === "REVENUE") prev.revenus += Math.abs(h.amount) / 1_000_000;
      else prev.depenses += Math.abs(h.amount) / 1_000_000;
      monthMap.set(sortKey, prev);
    }
    return [...monthMap.values()]
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
      .map(({ month, revenus, depenses }) => ({
        month,
        revenus: Math.round(revenus * 100) / 100,
        depenses: Math.round(depenses * 100) / 100,
      }));
  })();

  // Budget distribution pie from expense breakdown or fallback
  const pieData =
    expenseBreakdown.length > 0
      ? expenseBreakdown.map((s, i) => ({ name: s.name, value: s.value, color: CHART_COLORS[i % CHART_COLORS.length] }))
      : [];

  const handleAddEntry = async () => {
    if (!form.label || !form.amount) return;
    setSaving(true);
    try {
      await clubApi.createFinance({
        label: form.label,
        amount: Number(form.amount),
        type: form.type,
        category: form.category,
        entryDate: form.entryDate || undefined,
      });
      setShowAddModal(false);
      setForm({ label: "", amount: "", type: "REVENUE", category: "Sponsoring", entryDate: "" });
      refetch();
    } catch (_) {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement des données financières…</span>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-red-400">Impossible de charger les données: {error}</p>
        <button onClick={refetch} className="mt-3 text-xs underline" style={{ color: "var(--accent)" }}>Réessayer</button>
      </div>
    );
  }

  const revenue = kpis?.revenue ?? 0;
  const expenses = kpis?.expenses ?? 0;
  const profit = kpis?.profit ?? 0;
  const budget = kpis?.budget ?? 0;

  const kpiCards = [
    { label: "Budget Total", value: fmt(budget), icon: Wallet, color: "#3B82F6", change: budget > 0 ? "+actif" : "—" },
    { label: "Budget Restant", value: fmt(Math.max(0, budget - expenses)), icon: TrendingUp, color: "#10B981", change: expenses > 0 ? `${Math.round(((budget - expenses) / budget) * 100)}%` : "—" },
    { label: "Revenus Saison", value: fmt(revenue), icon: TrendingUp, color: "#22C55E", change: revenue > 0 ? "+actif" : "—" },
    { label: "Dépenses Saison", value: fmt(expenses), icon: TrendingDown, color: "#EF4444", change: expenses > 0 ? "-actif" : "—" },
    { label: "Cash Flow", value: `${profit >= 0 ? "+" : "−"}${fmt(Math.abs(profit))}`, icon: Wallet, color: profit >= 0 ? "#10B981" : "#EF4444", change: profit >= 0 ? "positif" : "déficit" },
  ];

  const recentHistory = history.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Comptabilité & Finance
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Tableau de bord financier du club
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white"
          style={{ background: "linear-gradient(135deg,var(--accent),#ff9d00)" }}
        >
          <Plus size={13} /> Nouvelle transaction
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlassCard key={kpi.label} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
                  <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
                  <p className="mt-1 text-xs font-medium" style={{ color: kpi.color }}>{kpi.change}</p>
                </div>
                <Icon size={20} style={{ color: kpi.color, opacity: 0.6 }} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard raised className="col-span-1 p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            📈 Revenus vs Dépenses
          </h2>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" unit="M" />
                <Tooltip
                  contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", color: "var(--text-primary)", borderRadius: "8px" }}
                  formatter={(v: number) => [`${v.toFixed(2)} M DT`]}
                />
                <Legend />
                <Bar dataKey="revenus" fill="#10B981" name="Revenus (M DT)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="depenses" fill="#EF4444" name="Dépenses (M DT)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
              Aucune donnée de transaction disponible
            </div>
          )}
        </GlassCard>

        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            🥧 Répartition Budget
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "var(--surface-panel)", border: "1px solid var(--surface-panel-border)", borderRadius: "8px" }}
                formatter={(v: number) => [`${v}%`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1.5 text-xs">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Prévision IA — données réelles uniquement */}
      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Prévision IA</h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Données consolidées du club — projections avancées via l&apos;assistant IA
            </p>
          </div>
          <a href="/finance/ia" className="text-sm font-medium" style={{ color: "var(--accent)" }}>Ouvrir IA Finance</a>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <GlassCard className="p-4" style={{ borderColor: "#3B82F6" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Budget actuel</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(budget)}</p>
          </GlassCard>
          <GlassCard className="p-4" style={{ borderColor: "#10B981" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Revenus saison</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(revenue)}</p>
          </GlassCard>
          <GlassCard className="p-4" style={{ borderColor: "#EF4444" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Dépenses saison</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{fmt(expenses)}</p>
          </GlassCard>
        </div>
      </GlassCard>

      {/* Transactions récentes */}
      <GlassCard raised className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Dernières transactions</h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{history.length} entrées au total</span>
        </div>
        {recentHistory.length > 0 ? (
          <div className="space-y-3">
            {recentHistory.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                style={{ border: "1px solid var(--surface-panel-border)" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{tx.label}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{tx.date} · {tx.category}</p>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: tx.amount >= 0 ? "var(--color-state-success)" : "var(--color-state-danger)" }}
                >
                  {tx.amount >= 0 ? "+" : "−"}{Math.abs(tx.amount).toLocaleString("fr-TN")} DT
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
            Aucune transaction enregistrée — ajoutez votre première transaction.
          </p>
        )}
      </GlassCard>

      {/* Alertes dynamiques */}
      {alerts.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>⚠️ Alertes Financières</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {alerts.map((alert, idx) => (
              <GlassCard key={idx} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{alert.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{alert.message}</p>
                    <Badge tone={alert.severity === "error" ? "danger" : alert.severity === "warning" ? "warning" : "info"}>
                      {alert.severity === "error" ? "Urgent" : alert.severity === "warning" ? "À surveiller" : "Info"}
                    </Badge>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border p-6" style={{ background: "var(--surface-panel)", borderColor: "var(--surface-panel-border)" }}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nouvelle transaction</h3>
              <button onClick={() => setShowAddModal(false)}><X size={16} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Libellé *</label>
                <input
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Ex: Sponsor Q3"
                  className="w-full rounded-xl border px-3 py-2 text-xs"
                  style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Montant (DT) *</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  >
                    <option value="REVENUE">Revenu</option>
                    <option value="EXPENSE">Dépense</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Catégorie</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  >
                    {["Sponsoring", "Billetterie", "Médias", "Salaires", "Transferts", "Équipements", "Infrastructure", "Transport", "Primes", "Autre"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Date</label>
                  <input
                    type="date"
                    value={form.entryDate}
                    onChange={e => setForm(f => ({ ...f, entryDate: e.target.value }))}
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                    style={{ background: "var(--surface-input)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 rounded-xl border py-2 text-xs font-bold"
                style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
              >
                Annuler
              </button>
              <button
                onClick={handleAddEntry}
                disabled={saving || !form.label || !form.amount}
                className="flex-1 rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,var(--accent),#ff9d00)" }}
              >
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
