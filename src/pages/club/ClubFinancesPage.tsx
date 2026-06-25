import { useState, useMemo } from "react";
import { Plus, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";
import { normalizeFinanceData, type FinanceChartSlice } from "../../lib/financeNormalize";

const REVENUE_CATEGORIES = ["Sponsors", "Billetterie", "Merchandising", "Transferts", "Général"];
const EXPENSE_CATEGORIES = ["Salaires", "Infrastructure", "Médical", "Transfert", "Général"];

function FinanceTransactionModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const [type, setType] = useState<"REVENUE" | "EXPENSE">("EXPENSE");
  const [form, setForm] = useState({ label: "", amount: "", category: "Général" });
  const [saving, setSaving] = useState(false);
  const categories = type === "REVENUE" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            Nouvelle transaction
          </h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Libellé
            </label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ex: Salaire, Sponsor…"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Montant (DT)
            </label>
            <input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                const next = e.target.value as "REVENUE" | "EXPENSE";
                setType(next);
                setForm((f) => ({ ...f, category: next === "REVENUE" ? "Sponsors" : "Salaires" }));
              }}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
            >
              <option value="EXPENSE">Dépense (EXPENSE)</option>
              <option value="REVENUE">Revenu (REVENUE)</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
              Catégorie
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSubmit({ ...form, type });
              onClose();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erreur");
            } finally {
              setSaving(false);
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function PieBlock({
  title,
  data,
  emptyLabel,
}: {
  title: string;
  data: FinanceChartSlice[];
  emptyLabel: string;
}) {
  const hasData = data.some((d) => d.amount > 0);
  const chartData = hasData ? data : [];

  return (
    <ClubKpiCard hover={false}>
      <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      {chartData.length === 0 ? (
        <p className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>{emptyLabel}</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ name, value }) => `${name} ${value}%`}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
              formatter={(_v: number, _n: string, props: { payload?: FinanceChartSlice }) =>
                [`${(props.payload?.amount ?? 0).toLocaleString("fr-FR")} DT`, props.payload?.name ?? ""]
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ClubKpiCard>
  );
}

export function ClubFinancesPage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getFinance());
  const [showAdd, setShowAdd] = useState(false);

  const finance = useMemo(() => normalizeFinanceData(data), [data]);
  const { kpis, history, revenueSources, expenseBreakdown, monthlyExpenses } = finance;

  const kpiCards = [
    { label: "Budget", value: kpis.budget, suffix: " DT" },
    { label: "Dépenses", value: kpis.expenses, suffix: " DT" },
    { label: "Revenus", value: kpis.revenue, suffix: " DT" },
    { label: "Profit", value: kpis.profit, suffix: " DT" },
  ];

  return (
    <ClubPageTransition>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#FF6B57" }}>Admin Club</span>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Finances Club</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Budget, dépenses et revenus.</p>
        </div>
        {can("Finances", "créer") && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
          >
            <Plus size={16} /> Ajouter transaction
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpiCards.map((kpi, i) => (
          <ClubKpiCard key={kpi.label} delay={i * 0.05}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {kpi.value.toLocaleString("fr-FR")}{kpi.suffix}
            </p>
          </ClubKpiCard>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PieBlock
          title="Sources de revenus"
          data={revenueSources}
          emptyLabel="Ajoutez des revenus pour voir le graphique."
        />
        <ClubKpiCard hover={false}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Dépenses mensuelles (K DT)
          </h3>
          {monthlyExpenses.length === 0 ? (
            <p className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Ajoutez des dépenses pour voir le graphique.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyExpenses}>
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
                  formatter={(v: number) => [`${v} K DT`, "Dépenses"]}
                />
                <Bar dataKey="amount" fill="#FF6B57" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ClubKpiCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PieBlock
          title="Répartition des dépenses"
          data={expenseBreakdown}
          emptyLabel="Ajoutez des dépenses pour voir le graphique."
        />
        <ClubKpiCard hover={false}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique</h3>
          {!loading && history.length === 0 ? (
            <ClubEmptyState title="Aucune transaction" description="Enregistrez vos revenus et dépenses ici." />
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                  style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{h.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {h.date} · {h.category}
                    </p>
                  </div>
                  <p className="font-semibold" style={{ color: h.amount < 0 ? "#EF4444" : "#22C55E" }}>
                    {h.amount > 0 ? "+" : ""}{h.amount.toLocaleString("fr-FR")} DT
                  </p>
                </div>
              ))}
            </div>
          )}
        </ClubKpiCard>
      </div>

      <AnimatePresence>
        {showAdd && (
          <FinanceTransactionModal
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              if (!v.label?.trim()) throw new Error("Le libellé est requis.");
              if (!v.amount || Number(v.amount) <= 0) throw new Error("Le montant doit être supérieur à 0.");
              await clubApi.createFinance({
                label: v.label.trim(),
                amount: Number(v.amount),
                type: v.type,
                category: v.category,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
