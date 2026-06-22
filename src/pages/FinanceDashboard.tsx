import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, TrendingDown, Wallet, DollarSign, Users, BarChart3,
  Plus, FileText, Handshake, Download, ChevronRight, AlertTriangle, Brain,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { showToast } from "../components/scout/ScoutToast";

const F = { primary: "#FF7A00", success: "#22C55E", danger: "#EF4444", info: "#3B82F6", warning: "#F59E0B", muted: "rgba(255,255,255,0.4)" };

const BUDGET_DATA = [
  { month: "Jan", budget: 8.0 }, { month: "Fév", budget: 8.5 }, { month: "Mar", budget: 9.0 },
  { month: "Avr", budget: 8.2 }, { month: "Mai", budget: 10.0 }, { month: "Jun", budget: 9.8 },
];
const REV_EXP = [
  { month: "Jan", revenus: 1.20, depenses: 0.95 }, { month: "Fév", revenus: 1.35, depenses: 1.10 },
  { month: "Mar", revenus: 1.50, depenses: 1.20 }, { month: "Avr", revenus: 1.40, depenses: 1.05 },
  { month: "Mai", revenus: 1.60, depenses: 1.30 }, { month: "Jun", revenus: 1.65, depenses: 1.35 },
];

const KPI_CARDS = [
  { label: "Budget Total",     value: "9.8M DT",  trend: +2.5, color: F.info,    sparkline: [8.0,8.5,9.0,8.2,10.0,9.8], icon: Wallet      },
  { label: "Budget Restant",   value: "2.1M DT",  trend: -0.8, color: F.success, sparkline: [3.2,2.9,2.7,2.5,2.2,2.1],  icon: DollarSign  },
  { label: "Revenus Saison",   value: "8.7M DT",  trend: +5.2, color: F.success, sparkline: [6.8,7.1,7.5,7.8,8.3,8.7],  icon: TrendingUp  },
  { label: "Dépenses Saison",  value: "7.8M DT",  trend: +3.1, color: F.danger,  sparkline: [6.2,6.6,7.0,7.2,7.5,7.8],  icon: TrendingDown },
  { label: "Masse Salariale",  value: "5.2M DT",  trend: +1.4, color: F.warning, sparkline: [4.8,4.9,5.0,5.1,5.1,5.2],  icon: Users       },
  { label: "Profit / Perte",   value: "0.9M DT",  trend: +8.4, color: F.success, sparkline: [0.6,0.5,0.5,0.6,0.8,0.9],  icon: BarChart3   },
];

const ALERTS = [
  { sev: "error",   icon: "📄", msg: "Contrat expire dans 15 jours",       detail: "Youssef Ben Ali — Attaquant",         link: "/finance/contrats" },
  { sev: "error",   icon: "⚠️", msg: "Dépassement budget transferts 92%",  detail: "Plafond: 3.0M DT  ·  Utilisé: 2.76M", link: "/finance/depenses" },
  { sev: "warning", icon: "🤝", msg: "Sponsor Ooredoo à renouveler",       detail: "Contrat expire le 30 juillet 2026",    link: "/finance/sponsors" },
  { sev: "warning", icon: "💸", msg: "Facture impayée — 45 000 DT",        detail: "Fournisseur équipements — 30 jours",   link: "/finance/factures" },
];

const AI_INSIGHTS = [
  { icon: "💡", insight: "Les salaires représentent 60% du budget total.", rec: "Réduire la masse salariale de 8% via renégociation de 3 contrats.", color: F.warning },
  { icon: "📈", insight: "Revenus en hausse +5.2% vs saison précédente.", rec: "Opportunité d'augmenter le budget recrutement de 400K DT.", color: F.success },
  { icon: "🔔", insight: "2 contrats sponsors expirent dans 60 jours.", rec: "Initier les négociations de renouvellement dès maintenant.", color: F.danger },
];

const QUICK_ACTIONS = [
  { label: "+ Contrat",     icon: FileText,  color: F.primary, path: "/finance/contrats" },
  { label: "+ Facture",     icon: Plus,      color: F.info,    path: "/finance/factures" },
  { label: "+ Sponsor",     icon: Handshake, color: F.success, path: "/finance/sponsors" },
  { label: "Export PDF",    icon: Download,  color: F.warning, action: "pdf" },
];

const fade = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export function FinanceDashboard() {
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const visibleAlerts = ALERTS.filter((_, i) => !dismissedAlerts.has(i));

  return (
    <motion.div className="space-y-5" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>

      {/* ── HEADER + QUICK ACTIONS ── */}
      <motion.div variants={fade} className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Tableau de Bord Finance</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Saison 2025-2026 · FC Carthage</p>
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

      {/* ── KPI CARDS WITH SPARKLINES ── */}
      <motion.div variants={fade} className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {KPI_CARDS.map((k, i) => {
          const Icon = k.icon;
          const up = k.trend > 0;
          const sparkData = k.sparkline.map(v => ({ v }));
          return (
            <motion.div key={i} className="rounded-[18px] border p-4"
              style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}
              whileHover={{ y: -3, boxShadow: `0 12px 30px rgba(0,0,0,0.35), 0 0 0 1px ${k.color}20` }}>
              <div className="flex items-start justify-between gap-1 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `${k.color}14` }}>
                  <Icon size={13} style={{ color: k.color }} />
                </div>
                <div className="flex items-center gap-0.5 text-[9px] font-bold"
                  style={{ color: up ? F.success : F.danger }}>
                  {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {up ? "+" : ""}{k.trend}%
                </div>
              </div>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: F.muted }}>{k.label}</p>
              <p className="text-base font-extrabold leading-none" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[8px] mt-0.5" style={{ color: F.muted }}>vs saison précédente</p>
              {/* Sparkline */}
              <div className="mt-2 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="v" stroke={k.color} strokeWidth={1.5} dot={false} animationDuration={1000} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── CHARTS ROW ── */}
      <motion.div variants={fade} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border p-5" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>📈 Évolution Budget (M DT)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BUDGET_DATA}>
                <defs>
                  <linearGradient id="budGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={F.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={F.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,6,24,0.97)", border: `1px solid ${F.primary}30`, color: "white", borderRadius: 12 }} formatter={(v: number) => [`${v}M DT`, "Budget"]} />
                <Area type="monotone" dataKey="budget" stroke={F.primary} fill="url(#budGrad)" strokeWidth={2.5} dot={{ fill: F.primary, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[20px] border p-5" style={{ background: "rgba(8,6,24,0.88)", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="mb-3 text-xs font-bold" style={{ color: "var(--text-primary)" }}>📊 Revenus vs Dépenses (M DT)</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REV_EXP} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: F.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(8,6,24,0.97)", border: `1px solid rgba(255,255,255,0.1)`, color: "white", borderRadius: 12 }} formatter={(v: number) => [`${v}M DT`]} />
                <Legend wrapperStyle={{ fontSize: 10, color: F.muted }} />
                <Bar dataKey="revenus"  fill={F.success} radius={[4,4,0,0]} name="Revenus" />
                <Bar dataKey="depenses" fill={F.danger}  radius={[4,4,0,0]} name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── AI INSIGHTS ── */}
      <motion.div variants={fade} className="rounded-[22px] border p-5"
        style={{ background: "rgba(8,6,24,0.92)", borderColor: "rgba(99,102,241,0.2)", boxShadow: "0 0 40px rgba(99,102,241,0.06)" }}>
        <div className="flex items-center gap-3 mb-4">
          <motion.div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg,#6366F1,#FF7A00)" }}
            animate={{ scale: [1,1.08,1] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <Brain size={16} className="text-white" />
          </motion.div>
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>ODIN AI — Insights Financiers</p>
            <p className="text-[10px]" style={{ color: F.muted }}>Analyse automatique de la situation financière</p>
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
              <p className="text-[10px] leading-relaxed" style={{ color: ins.color }}>
                💡 {ins.rec}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── NOTIFICATIONS FINANCIÈRES ── */}
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
            {ALERTS.map((alert, i) => {
              if (dismissedAlerts.has(i)) return null;
              const alertColor = alert.sev === "error" ? F.danger : F.warning;
              return (
                <motion.div key={i} layout
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-3 rounded-[16px] border px-4 py-3 cursor-pointer"
                  style={{ background: `${alertColor}06`, borderColor: `${alertColor}25`, borderLeft: `3px solid ${alertColor}` }}
                  whileHover={{ x: 3 }}
                  onClick={() => alert.path && navigate(alert.path)}>
                  <span className="text-base shrink-0">{alert.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>{alert.msg}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: F.muted }}>{alert.detail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: `${alertColor}15`, color: alertColor }}>
                      {alert.sev === "error" ? "Urgent" : "À surveiller"}
                    </span>
                    <ChevronRight size={12} style={{ color: F.muted }} />
                    <motion.button type="button"
                      onClick={e => { e.stopPropagation(); setDismissedAlerts(prev => new Set([...prev, i])); showToast("Alerte ignorée", "info"); }}
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
