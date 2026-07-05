import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, Plus, CheckCircle2, XCircle, TrendingUp, TrendingDown,
  Clock, Wallet, Save, X,
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  RPage, RHeader, RSection, RRow, RPills, RBtn, RKpiCard, pageVariants, cardVariants,
} from "../../components/responsable";
import { responsableApi } from "../../lib/api/responsable";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { normalizeFinanceData, type FinanceChartSlice } from "../../lib/financeNormalize";

type DepenseStatus = "En attente" | "Approuvée" | "Refusée";

interface BudgetCategory {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface Depense {
  id: string;
  label: string;
  category: string;
  amount: number;
  requestedBy: string;
  date: string;
  status: DepenseStatus;
  note?: string | null;
}

interface BudgetPayload {
  summary: {
    totalAllocated: number;
    totalSpent: number;
    remaining: number;
    pending: number;
  };
  categories: BudgetCategory[];
  expenses: Depense[];
}

const STATUS_COLOR: Record<DepenseStatus, string> = {
  "En attente": "#FF7A00",
  "Approuvée": "#22C55E",
  "Refusée": "#EF4444",
};

const FILTERS = ["Tous", "En attente", "Approuvée", "Refusée"] as const;

function BudgetBar({ pct, color = "var(--accent)" }: { pct: number; color?: string }) {
  return (
    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </div>
  );
}

function PieBlock({ title, data, emptyLabel }: { title: string; data: FinanceChartSlice[]; emptyLabel: string }) {
  const chartData = data.filter((d) => d.amount > 0);
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ borderColor: "var(--surface-panel-border)", background: "rgba(255,255,255,0.02)" }}
    >
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
              contentStyle={{ background: "#0F1D3A", border: "1px solid var(--surface-panel-border)", borderRadius: 12 }}
              formatter={(_v: number, _n: string, props: { payload?: FinanceChartSlice }) =>
                [`${(props.payload?.amount ?? 0).toLocaleString("fr-FR")} DT`, props.payload?.name ?? ""]
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function ExpenseModal({
  categories,
  onClose,
  onSubmit,
}: {
  categories: BudgetCategory[];
  onClose: () => void;
  onSubmit: (values: { label: string; amount: string; categoryId: string; note: string }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    label: "",
    amount: "",
    categoryId: categories[0]?.id ?? "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "var(--surface-modal)", borderColor: "rgba(255,122,0,0.3)" }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Créer une demande de dépense</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Libellé</label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="Ex: Achat équipement"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Montant (DT)</label>
            <input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Catégorie</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            >
              {categories.map((b) => (
                <option key={b.id} value={b.id}>{b.category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Note</label>
            <input
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              placeholder="Optionnel"
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <RBtn
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSubmit(form);
                onClose();
              } catch (err) {
                alert(err instanceof Error ? err.message : "Erreur");
              } finally {
                setSaving(false);
              }
            }}
          >
            <CheckCircle2 size={14} /> {saving ? "En cours…" : "Créer"}
          </RBtn>
          <RBtn onClick={onClose} variant="ghost">Annuler</RBtn>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FinanceModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}) {
  const REVENUE_CATEGORIES = ["Sponsors", "Billetterie", "Merchandising", "Transferts", "Général"];
  const EXPENSE_CATEGORIES = ["Salaires", "Infrastructure", "Médical", "Transfert", "Général"];
  const [type, setType] = useState<"REVENUE" | "EXPENSE">("EXPENSE");
  const [form, setForm] = useState({ label: "", amount: "", category: "Général" });
  const [saving, setSaving] = useState(false);
  const categories = type === "REVENUE" ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "var(--surface-modal)", borderColor: "rgba(255,122,0,0.3)" }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Nouvelle transaction</h3>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Libellé</label>
            <input
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Montant (DT)</label>
            <input
              type="number"
              min={1}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Type</label>
            <select
              value={type}
              onChange={(e) => {
                const next = e.target.value as "REVENUE" | "EXPENSE";
                setType(next);
                setForm((f) => ({ ...f, category: next === "REVENUE" ? "Sponsors" : "Salaires" }));
              }}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            >
              <option value="EXPENSE">Dépense</option>
              <option value="REVENUE">Revenu</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Catégorie</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
              style={{ background: "rgba(30,35,50,0.97)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <button
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
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#FF7A00,#E65240)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </motion.div>
    </motion.div>
  );
}

export function BudgetPage() {
  const { data, loading, error, reload } = useClubResource(async () => {
    const [finance, budget] = await Promise.all([
      clubApi.getFinance(),
      responsableApi.getBudget() as Promise<BudgetPayload>,
    ]);
    return { finance, budget };
  });

  const finance = useMemo(() => normalizeFinanceData(data?.finance), [data?.finance]);
  const budget = data?.budget;
  const categories = budget?.categories ?? [];
  const depenses = budget?.expenses ?? [];
  const summary = budget?.summary;

  const [filter, setFilter] = useState<string>("En attente");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showFinanceModal, setShowFinanceModal] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = filter === "Tous" ? depenses : depenses.filter((d) => d.status === filter);

  async function decideExpense(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      await responsableApi.decideExpense(id, action);
      await reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    } finally {
      setBusyId(null);
    }
  }

  const financeKpis = [
    { label: "Budget", value: finance.kpis.budget, suffix: " DT" },
    { label: "Dépenses", value: finance.kpis.expenses, suffix: " DT" },
    { label: "Revenus", value: finance.kpis.revenue, suffix: " DT" },
    { label: "Profit", value: finance.kpis.profit, suffix: " DT" },
  ];

  return (
    <RPage>
      <RHeader
        title="Gestion Budget"
        subtitle="Budgets par catégorie, finances et approbation des dépenses."
        action={
          <div className="flex flex-wrap gap-2">
            <RBtn onClick={() => setShowFinanceModal(true)} variant="ghost">
              <Plus size={14} /> Transaction
            </RBtn>
            <RBtn onClick={() => setShowExpenseModal(true)}>
              <Plus size={14} /> Nouvelle dépense
            </RBtn>
          </div>
        }
      />

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Finances — KPIs dynamiques */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {financeKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border p-4"
            style={{ borderColor: "var(--surface-panel-border)", background: "rgba(255,255,255,0.02)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {kpi.value.toLocaleString("fr-FR")}{kpi.suffix}
            </p>
          </div>
        ))}
      </div>

      {/* Graphiques finances */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PieBlock title="Sources de revenus" data={finance.revenueSources} emptyLabel="Aucun revenu enregistré." />
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--surface-panel-border)", background: "rgba(255,255,255,0.02)" }}
        >
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Dépenses mensuelles (K DT)
          </h3>
          {finance.monthlyExpenses.length === 0 ? (
            <p className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucune dépense enregistrée.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={finance.monthlyExpenses}>
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#0F1D3A", border: "1px solid var(--surface-panel-border)", borderRadius: 12 }}
                  formatter={(v: number) => [`${v} K DT`, "Dépenses"]}
                />
                <Bar dataKey="amount" fill="#FF7A00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PieBlock title="Répartition des dépenses" data={finance.expenseBreakdown} emptyLabel="Aucune dépense enregistrée." />
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--surface-panel-border)", background: "rgba(255,255,255,0.02)" }}
        >
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Historique</h3>
          {finance.history.length === 0 ? (
            <p className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>Aucune transaction.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {finance.history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border px-4 py-3"
                  style={{ borderColor: "var(--surface-panel-border)", background: "rgba(255,255,255,0.02)" }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{h.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{h.date} · {h.category}</p>
                  </div>
                  <p className="font-semibold" style={{ color: h.amount < 0 ? "#EF4444" : "#22C55E" }}>
                    {h.amount > 0 ? "+" : ""}{h.amount.toLocaleString("fr-FR")} DT
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Budget par catégorie — API responsable */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RKpiCard
          label="Total alloué"
          value={`${((summary?.totalAllocated ?? 0) / 1000).toFixed(0)} kDT`}
          icon={Wallet}
          color="#3B82F6"
        />
        <RKpiCard
          label="Dépensé"
          value={`${((summary?.totalSpent ?? 0) / 1000).toFixed(0)} kDT`}
          icon={TrendingUp}
          color="#FF7A00"
        />
        <RKpiCard
          label="Restant"
          value={`${((summary?.remaining ?? 0) / 1000).toFixed(0)} kDT`}
          icon={TrendingDown}
          color="#22C55E"
        />
        <RKpiCard
          label="En attente"
          value={String(summary?.pending ?? 0)}
          icon={Clock}
          color="#F59E0B"
        />
      </div>

      <RSection title="Répartition budgétaire" subtitle="Par catégorie (plafonds alloués)">
        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune catégorie budgétaire configurée.
          </p>
        ) : (
          <motion.div className="space-y-4" variants={pageVariants} initial="hidden" animate="visible">
            {categories.map((b) => {
              const pct = b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0;
              const color = pct > 85 ? "#EF4444" : pct > 65 ? "#FF7A00" : "#22C55E";
              return (
                <motion.div key={b.id} variants={cardVariants} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium" style={{ color: "var(--text-primary)" }}>{b.category}</span>
                    <div className="flex flex-wrap gap-3 text-[11px]">
                      <span style={{ color: "var(--text-muted)" }}>
                        Alloué: <strong style={{ color: "var(--text-primary)" }}>{b.allocated.toLocaleString("fr-FR")} DT</strong>
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>
                        Dépensé: <strong style={{ color }}>{b.spent.toLocaleString("fr-FR")} DT</strong>
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>
                        Restant: <strong style={{ color: "#22C55E" }}>{b.remaining.toLocaleString("fr-FR")} DT</strong>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BudgetBar pct={pct} color={color} />
                    <span className="shrink-0 text-xs font-bold" style={{ color }}>{pct}%</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </RSection>

      {/* Demandes de dépense */}
      <div>
        <div className="mb-3">
          <RPills options={[...FILTERS]} value={filter} onChange={setFilter} />
        </div>
        <RSection title="Demandes de dépense" subtitle={`${filtered.length} dépense${filtered.length !== 1 ? "s" : ""}`}>
          <div className="space-y-3">
            {filtered.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <RRow>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: "rgba(255,122,0,0.12)" }}
                      >
                        <DollarSign size={14} style={{ color: "var(--accent)" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{d.label}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {d.category} · {d.requestedBy} · {d.date}
                        </p>
                        {d.note && (
                          <p className="mt-0.5 text-[11px] italic" style={{ color: "#EF4444" }}>{d.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <p className="text-base font-extrabold" style={{ color: "var(--accent)" }}>
                          {d.amount.toLocaleString("fr-FR")} DT
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: `${STATUS_COLOR[d.status]}18`, color: STATUS_COLOR[d.status] }}
                        >
                          {d.status}
                        </span>
                      </div>
                      {d.status === "En attente" && (
                        <div className="flex gap-1.5">
                          <RBtn
                            disabled={busyId === d.id}
                            onClick={() => decideExpense(d.id, "approve")}
                            variant="success"
                          >
                            <CheckCircle2 size={12} />
                          </RBtn>
                          <RBtn
                            disabled={busyId === d.id}
                            onClick={() => decideExpense(d.id, "reject")}
                            variant="danger"
                          >
                            <XCircle size={12} />
                          </RBtn>
                        </div>
                      )}
                    </div>
                  </div>
                </RRow>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                Aucune dépense{filter !== "Tous" ? ` (${filter.toLowerCase()})` : ""}.
              </div>
            )}
          </div>
        </RSection>
      </div>

      <AnimatePresence>
        {showExpenseModal && categories.length > 0 && (
          <ExpenseModal
            categories={categories}
            onClose={() => setShowExpenseModal(false)}
            onSubmit={async (v) => {
              if (!v.label.trim()) throw new Error("Le libellé est requis.");
              if (!v.amount || Number(v.amount) <= 0) throw new Error("Montant invalide.");
              await responsableApi.createExpense({
                label: v.label.trim(),
                amount: Number(v.amount),
                categoryId: v.categoryId || undefined,
                notes: v.note || undefined,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFinanceModal && (
          <FinanceModal
            onClose={() => setShowFinanceModal(false)}
            onSubmit={async (v) => {
              if (!v.label?.trim()) throw new Error("Le libellé est requis.");
              if (!v.amount || Number(v.amount) <= 0) throw new Error("Montant invalide.");
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
    </RPage>
  );
}
