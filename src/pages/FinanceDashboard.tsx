import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Wallet, DollarSign, Users, BarChart3,
  Plus, FileText, Handshake, Download, Brain, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { showToast } from "../components/scout/ScoutToast";
import { useFinanceBackendData } from "../hooks/useFinanceBackendData";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B", muted: "rgba(255,255,255,0.4)" };

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M DT` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K DT` : `${n} DT`;

const QUICK_ACTIONS = [
  { label: "+ Contrat", icon: FileText, color: F.primary, path: "/finance/contrats" },
  { label: "+ Facture", icon: Plus, color: F.info, path: "/finance/factures" },
  { label: "+ Sponsor", icon: Handshake, color: F.success, path: "/finance/sponsors" },
  { label: "Export PDF", icon: Download, color: F.warning, action: "pdf" },
];

const fade = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

function buildMonthlyData(history: { date: string; amount: number; entryType: string }[]) {
  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const map = new Map<string, { month: string; revenus: number; depenses: number; budget: number; sortKey: string }>();
  for (const h of history) {
    const parts = h.date.split("/");
    if (parts.length !== 3) continue;
    const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    const sortKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    const month = monthLabels[d.getMonth()] ?? "—";
    const prev = map.get(sortKey) ?? { month, revenus: 0, depenses: 0, budget: 0, sortKey };
    const amt = Math.abs(h.amount) / 1_000_000;
    if (h.entryType === "REVENUE") prev.revenus += amt;
    else prev.depenses += amt;
    prev.budget = prev.revenus;
    map.set(sortKey, prev);
  }
  return [...map.values()]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(-6)
    .map(({ month, revenus, depenses, budget }) => ({
      month,
      revenus: Math.round(revenus * 100) / 100,
      depenses: Math.round(depenses * 100) / 100,
      budget: Math.round(budget * 100) / 100,
    }));
}

export function FinanceDashboard() {
  const navigate = useNavigate();
  const { history, kpis, contracts, transfers, loading } = useFinanceBackendData();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const budget = kpis?.budget ?? 0;
  const revenue = kpis?.revenue ?? 0;
  const expenses = kpis?.expenses ?? 0;
  const profit = kpis?.profit ?? 0;
  const payroll = contracts?.totalMonthlySalary ?? 0;

  const monthlyData = buildMonthlyData(history);
  const budgetChart = monthlyData.map((m) => ({ month: m.month, budget: m.budget }));
  const revExpChart = monthlyData.map((m) => ({ month: m.month, revenus: m.revenus, depenses: m.depenses }));

  const sparkRevenue = monthlyData.map((m) => m.revenus);
  const sparkExpenses = monthlyData.map((m) => m.depenses);
  const sparkProfit = monthlyData.map((m) => m.revenus - m.depenses);

  const KPI_CARDS = [
    { label: "Budget Total", value: fmt(budget), trend: budget > 0 ? 1 : 0, color: F.info, sparkline: sparkRevenue.length ? sparkRevenue : [0], icon: Wallet },
    { label: "Budget Restant", value: fmt(Math.max(0, budget - expenses)), trend: budget > 0 ? Math.round(((budget - expenses) / budget) * 100) : 0, color: F.success, sparkline: sparkProfit.length ? sparkProfit : [0], icon: DollarSign },
    { label: "Revenus Saison", value: fmt(revenue), trend: revenue > 0 ? 1 : 0, color: F.success, sparkline: sparkRevenue.length ? sparkRevenue : [0], icon: TrendingUp },
    { label: "Dépenses Saison", value: fmt(expenses), trend: expenses > 0 ? -1 : 0, color: F.danger, sparkline: sparkExpenses.length ? sparkExpenses : [0], icon: TrendingDown },
    { label: "Masse Salariale", value: fmt(payroll), trend: payroll > 0 ? 1 : 0, color: F.warning, sparkline: sparkExpenses.length ? sparkExpenses : [0], icon: Users },
    { label: "Profit / Perte", value: fmt(profit), trend: profit >= 0 ? 1 : -1, color: profit >= 0 ? F.success : F.danger, sparkline: sparkProfit.length ? sparkProfit : [0], icon: BarChart3 },
  ];

  const visibleAlerts = alerts.filter((_, i) => !dismissedAlerts.has(i));

  const AI_INSIGHTS = alerts.slice(0, 3).map((a) => ({
    icon: a.icon ?? "💡",
    insight: a.message,
    rec: a.type,
    color: a.severity === "error" ? F.danger : a.severity === "warning" ? F.warning : F.info,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw size={20} className="animate-spin" style={{ color: "var(--accent)" }} />
        <span className="ml-3 text-sm" style={{ color: "var(--text-muted)" }}>Chargement du tableau de bord…</span>
      </div>
    );
  }

  return (
    <motion.div className="space-y-5" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>

      <motion.div variants={fade} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Tableau de Bord Finance</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Données en temps réel du club</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.button key={i} type="button"
                onClick={() => {
                  if (a.action === "pdf") { showToast("Export PDF en cours...", "info"); return; }
                  if (a.path) navigate(a.path);
                }}
                className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold"
                style={{ borderColor: `${a.color}35`, color: a.color, background: `${a.color}08` }}
                whileHover={{ scale: 1.06, background: `${a.color}15` }} whileTap={{ scale: 0.94 }}>
                <Icon size={12} /> {a.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={fade} className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {KPI_CARDS.map((k, i) => {
          const Icon = k.icon;
          const up = k.trend >= 0;
          const sparkData = k.sparkline.map((v) => ({ v }));
          return (
            <motion.div key={i} className="rounded-[18px] border p-4"
              style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}
              whileHover={{ y: -3, boxShadow: `0 12px 30px rgba(0,0,0,0.35), 0 0 0 1px ${k.color}20` }}>
              <div className="flex items-start justify-between gap-1 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${k.color}14` }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
                {k.trend !== 0 && (
                  <div className="flex items-center gap-0.5 text-[9px] font-bold" style={{ color: up ? F.success : F.danger }}>
                    {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  </div>
                )}
              </div>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: F.muted }}>{k.label}</p>
              <p className="text-base font-extrabold leading-none" style={{ color: k.color }}>{k.value}</p>
              {sparkData.length > 1 && (
                <div className="mt-2 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line type="monotone" dataKey="v" stroke={k.color} strokeWidth={1.5} dot={false} animationDuration={1000} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={fade} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
          <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>📈 Évolution Revenus (M DT)</p>
          {budgetChart.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={budgetChart}>
                  <defs>
                    <linearGradient id="budGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={F.primary} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={F.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: `1px solid ${F.primary}30`, color: "white", borderRadius: 12 }} formatter={(v: number) => [`${v}M DT`, "Revenus"]} />
                  <Area type="monotone" dataKey="budget" stroke={F.primary} fill="url(#budGrad)" strokeWidth={2.5} dot={{ fill: F.primary, r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center text-xs" style={{ color: F.muted }}>Aucune transaction enregistrée</div>
          )}
        </div>

        <div className="rounded-[20px] border p-5" style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
          <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>📊 Revenus vs Dépenses (M DT)</p>
          {revExpChart.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revExpChart} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--surface-panel-solid)", border: "1px solid rgba(255,255,255,0.1)", color: "white", borderRadius: 12 }} formatter={(v: number) => [`${v}M DT`]} />
                  <Legend wrapperStyle={{ fontSize: 10, color: F.muted }} />
                  <Bar dataKey="revenus" fill={F.success} radius={[4, 4, 0, 0]} name="Revenus" />
                  <Bar dataKey="depenses" fill={F.danger} radius={[4, 4, 0, 0]} name="Dépenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center text-xs" style={{ color: F.muted }}>Aucune transaction enregistrée</div>
          )}
        </div>
      </motion.div>

      {AI_INSIGHTS.length > 0 && (
        <motion.div variants={fade} className="rounded-[22px] border p-5"
          style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(99,102,241,0.2)", boxShadow: "0 0 40px rgba(99,102,241,0.06)" }}>
          <div className="flex items-center gap-3 mb-4">
            <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg,#6366F1,#FF7A00)" }}
              animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
              <Brain size={16} className="text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Alertes & Insights</p>
              <p className="text-[10px]" style={{ color: F.muted }}>Basé sur vos données réelles</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {AI_INSIGHTS.map((ins, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-[16px] border p-4"
                style={{ background: `${ins.color}06`, borderColor: `${ins.color}20` }}
                whileHover={{ borderColor: `${ins.color}40`, y: -2 }}>
                <p className="text-lg mb-1">{ins.icon}</p>
                <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{ins.insight}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: ins.color }}>{ins.rec}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {visibleAlerts.length > 0 && (
        <motion.div variants={fade}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              🔔 Alertes Financières
              <span className="ml-2 rounded-full px-2 py-0.5 text-[9px]"
                style={{ background: `${F.danger}15`, color: F.danger }}>
                {visibleAlerts.length}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              if (dismissedAlerts.has(i)) return null;
              const alertColor = alert.severity === "error" ? F.danger : alert.severity === "warning" ? F.warning : F.info;
              return (
                <motion.div key={i} layout
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-3 rounded-[16px] border px-4 py-3"
                  style={{ background: `${alertColor}06`, borderColor: `${alertColor}25`, borderLeft: `3px solid ${alertColor}` }}>
                  <span className="text-base shrink-0">{alert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{alert.message}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: F.muted }}>{alert.type}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${alertColor}15`, color: alertColor }}>
                      {alert.severity === "error" ? "Urgent" : alert.severity === "warning" ? "À surveiller" : "Info"}
                    </span>
                    <motion.button type="button"
                      onClick={(e) => { e.stopPropagation(); setDismissedAlerts((prev) => new Set([...prev, i])); showToast("Alerte ignorée", "info"); }}
                      className="rounded-lg p-1 hover:bg-white/5 text-[10px]"
                      style={{ color: F.muted }}
                      whileHover={{ scale: 1.2 }}>
                      ✕
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
