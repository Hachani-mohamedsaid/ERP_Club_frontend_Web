export interface FinanceHistoryItem {
  id: string;
  date: string;
  amount: number;
  label: string;
  category: string;
  entryType: "REVENUE" | "EXPENSE";
}

export interface FinanceChartSlice {
  name: string;
  value: number;
  amount: number;
  color: string;
}

export interface FinanceView {
  kpis: { budget: number; expenses: number; revenue: number; profit: number };
  revenueSources: FinanceChartSlice[];
  expenseBreakdown: FinanceChartSlice[];
  monthlyExpenses: { month: string; amount: number }[];
  history: FinanceHistoryItem[];
}

const CHART_COLORS = ["#FF6B57", "#6366F1", "#22C55E", "#F59E0B", "#EC4899", "#06B6D4"];
const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function parseFrDate(date: string): Date | null {
  const parts = date.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function normalizeCategory(category: string | undefined, entryType: "REVENUE" | "EXPENSE") {
  if (!category || category === "in" || category === "out") {
    return entryType === "REVENUE" ? "Revenu" : "Dépense";
  }
  return category;
}

function normalizeHistory(raw: unknown[]): FinanceHistoryItem[] {
  return raw.map((item, index) => {
    const h = item as Record<string, unknown>;
    const amount = Number(h.amount ?? 0);
    const entryType: "REVENUE" | "EXPENSE" =
      h.entryType === "REVENUE" || h.entryType === "EXPENSE"
        ? h.entryType
        : amount >= 0
          ? "REVENUE"
          : "EXPENSE";
    const label = String(h.label ?? h.type ?? (entryType === "REVENUE" ? "Revenu" : "Dépense"));
    return {
      id: String(h.id ?? `hist-${index}`),
      date: String(h.date ?? ""),
      amount,
      label,
      category: normalizeCategory(h.category as string | undefined, entryType),
      entryType,
    };
  });
}

function computeKpis(history: FinanceHistoryItem[]) {
  const revenue = history.filter((h) => h.amount > 0).reduce((s, h) => s + h.amount, 0);
  const expenses = history.filter((h) => h.amount < 0).reduce((s, h) => s + Math.abs(h.amount), 0);
  const profit = revenue - expenses;
  const budget = revenue > 0 || expenses > 0 ? revenue + Math.max(0, profit) : 0;
  return { budget, expenses, revenue, profit };
}

function buildBreakdown(history: FinanceHistoryItem[], kind: "REVENUE" | "EXPENSE"): FinanceChartSlice[] {
  const filtered = history.filter((h) => h.entryType === kind);
  const total = filtered.reduce((s, h) => s + Math.abs(h.amount), 0);
  if (total === 0) return [];

  const map = new Map<string, number>();
  for (const h of filtered) {
    map.set(h.category, (map.get(h.category) ?? 0) + Math.abs(h.amount));
  }

  return [...map.entries()].map(([name, amount], i) => ({
    name,
    value: Math.round((amount / total) * 100),
    amount,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

function buildMonthlyExpenses(history: FinanceHistoryItem[]) {
  const map = new Map<string, { month: string; amount: number; sortKey: string }>();
  for (const h of history.filter((x) => x.entryType === "EXPENSE")) {
    const d = parseFrDate(h.date);
    if (!d) continue;
    const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const month = MONTH_LABELS[d.getMonth()] ?? "—";
    const prev = map.get(sortKey);
    map.set(sortKey, {
      month,
      amount: (prev?.amount ?? 0) + Math.abs(h.amount),
      sortKey,
    });
  }
  return [...map.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-6)
    .map(({ month, amount }) => ({ month, amount: Math.round(amount / 1000) }));
}

function hasKpis(raw: Record<string, unknown> | undefined) {
  const k = raw?.kpis as Record<string, number> | undefined;
  if (!k) return false;
  return (k.revenue ?? 0) > 0 || (k.expenses ?? 0) > 0 || (k.budget ?? 0) > 0;
}

/** Unifie ancien + nouveau format API et recalcule KPIs/graphiques depuis l'historique. */
export function normalizeFinanceData(raw: unknown): FinanceView {
  const data = (raw ?? {}) as Record<string, unknown>;
  const history = normalizeHistory(Array.isArray(data.history) ? data.history : []);

  const kpisFromApi = data.kpis as FinanceView["kpis"] | undefined;
  const kpis = hasKpis(data) && kpisFromApi ? kpisFromApi : computeKpis(history);

  const revenueSources =
    Array.isArray(data.revenueSources) && (data.revenueSources as FinanceChartSlice[]).length > 0
      ? (data.revenueSources as FinanceChartSlice[])
      : buildBreakdown(history, "REVENUE");

  const expenseBreakdown =
    Array.isArray(data.expenseBreakdown) && (data.expenseBreakdown as FinanceChartSlice[]).length > 0
      ? (data.expenseBreakdown as FinanceChartSlice[])
      : buildBreakdown(history, "EXPENSE");

  const monthlyExpenses =
    Array.isArray(data.monthlyExpenses) && (data.monthlyExpenses as FinanceView["monthlyExpenses"]).length > 0
      ? (data.monthlyExpenses as FinanceView["monthlyExpenses"])
      : buildMonthlyExpenses(history);

  return { kpis, revenueSources, expenseBreakdown, monthlyExpenses, history };
}
