import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, DollarSign, Wallet, Users, TrendingDown } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BUDGET_DATA = [
  { month: "Jan", budget: 8000000 },
  { month: "Fév", budget: 8500000 },
  { month: "Mar", budget: 9000000 },
  { month: "Avr", budget: 8200000 },
  { month: "Mai", budget: 10000000 },
  { month: "Jun", budget: 9800000 },
];

const REVENUE_EXPENSE_DATA = [
  { month: "Jan", revenus: 1200000, depenses: 950000 },
  { month: "Fév", revenus: 1350000, depenses: 1100000 },
  { month: "Mar", revenus: 1500000, depenses: 1200000 },
  { month: "Avr", revenus: 1400000, depenses: 1050000 },
  { month: "Mai", revenus: 1600000, depenses: 1300000 },
  { month: "Jun", revenus: 1650000, depenses: 1350000 },
];

const ALERTS = [
  { type: "contract", message: "Contrat expire dans 30 jours", player: "Youssef Ben Ali", severity: "warning" },
  { type: "invoice", message: "Facture impayée", amount: "45,000 €", severity: "error" },
  { type: "budget", message: "Budget transfert presque dépassé", usage: "92%", severity: "error" },
];

const KPI_CARDS = [
  { label: "Budget Total Club", value: 9800000, icon: Wallet, color: "#38BDF8" },
  { label: "Budget Restant", value: 2100000, icon: DollarSign, color: "#22C55E" },
  { label: "Revenus Saison", value: 8700000, icon: TrendingUp, color: "#10B981" },
  { label: "Dépenses Saison", value: 7800000, icon: TrendingDown, color: "#FF6B57" },
  { label: "Masse Salariale", value: 5200000, icon: Users, color: "#8B5CF6" },
  { label: "Profit / Perte", value: 900000, icon: TrendingUp, color: "#34D399" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FinanceDashboard() {
  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Tableau de Bord Finance
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Gestion budgétaire et financière du club
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        variants={containerVariants}
      >
        {KPI_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <GlassCard className="p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: `${card.color}15` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: card.color }}>
                    +12%
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  {card.label}
                </p>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {(card.value).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-2" variants={containerVariants}>
        {/* Evolution Budget */}
        <motion.div variants={itemVariants}>
          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              📈 Évolution du Budget
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={BUDGET_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: any) => `${(value / 1000000).toFixed(1)}M €`}
                  />
                  <Line
                    type="monotone"
                    dataKey="budget"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ fill: "var(--accent)", r: 5 }}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Revenus vs Dépenses */}
        <motion.div variants={itemVariants}>
          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              📊 Revenus vs Dépenses
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={REVENUE_EXPENSE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: any) => `${(value / 1000000).toFixed(1)}M €`}
                  />
                  <Legend />
                  <Bar dataKey="revenus" fill="#22C55E" isAnimationActive={true} />
                  <Bar dataKey="depenses" fill="#FF6B57" isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Alerts Section */}
      <motion.div variants={itemVariants}>
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          🔔 Alertes Financières
        </h3>
        <div className="space-y-3">
          {ALERTS.map((alert, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
            >
              <GlassCard
                className="p-4 border-l-4"
                style={{
                  borderLeftColor:
                    alert.severity === "error" ? "#FF6B57" : "#F59E0B",
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    size={18}
                    style={{
                      color: alert.severity === "error" ? "#FF6B57" : "#F59E0B",
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {alert.message}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {alert.player || alert.amount || alert.usage}
                    </p>
                  </div>
                  <Badge
                    tone={alert.severity === "error" ? "warning" : "info"}
                  >
                    {alert.severity === "error" ? "Urgent" : "À surveiller"}
                  </Badge>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
