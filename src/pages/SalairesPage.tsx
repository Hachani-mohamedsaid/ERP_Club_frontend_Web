import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { GlassCard } from "../components/ui/GlassCard";
import { Users, TrendingUp, DollarSign } from "lucide-react";

const SALARY_DATA_PIE = [
  { name: "Joueurs", value: 3640000, percentage: 70 },
  { name: "Coachs", value: 1040000, percentage: 20 },
  { name: "Staff", value: 520000, percentage: 10 },
];

const COLORS_PIE = ["#FF6B57", "#22C55E", "#38BDF8"];

const SALARIES_TABLE = [
  { name: "Youssef Ben Ali", post: "Attaquant", salary: 85000, category: "Joueurs" },
  { name: "Mohamed Diallo", post: "Défenseur", salary: 95000, category: "Joueurs" },
  { name: "Nader Trabelsi", post: "Milieu", salary: 78000, category: "Joueurs" },
  { name: "Ali Ben Amor", post: "Gardien", salary: 120000, category: "Joueurs" },
  { name: "Rami Makhlouf", post: "Attaquant", salary: 45000, category: "Joueurs" },
  { name: "Coach Principal", post: "Directeur Technique", salary: 65000, category: "Coachs" },
  { name: "Assistant Coach", post: "Préparateur Physique", salary: 42000, category: "Coachs" },
  { name: "Médecin", post: "Médecin du Club", salary: 38000, category: "Staff" },
  { name: "Masseur", post: "Kinésithérapeute", salary: 28000, category: "Staff" },
];

const KPI_SALAIRES = [
  {
    label: "Total Joueurs",
    value: "423K €",
    subtext: "5 joueurs",
    icon: Users,
    color: "#FF6B57",
  },
  {
    label: "Total Staff",
    value: "173K €",
    subtext: "4 personnes",
    icon: Users,
    color: "#38BDF8",
  },
  {
    label: "Salaire Moyen",
    value: "65.2K €",
    subtext: "Tous postes",
    icon: TrendingUp,
    color: "#22C55E",
  },
  {
    label: "Masse Salariale",
    value: "432K €/mois",
    subtext: "5.18M €/an",
    icon: DollarSign,
    color: "#8B5CF6",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function SalairesPage() {
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
          Gestion des Salaires
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Suivi de la masse salariale et des rémunérations
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {KPI_SALAIRES.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div key={idx} variants={itemVariants}>
              <GlassCard className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: `${card.color}15` }}
                  >
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                  {card.label}
                </p>
                <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {card.value}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {card.subtext}
                </p>
              </GlassCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts and Table */}
      <motion.div className="grid grid-cols-1 gap-6 lg:grid-cols-2" variants={containerVariants}>
        {/* Pie Chart */}
        <motion.div variants={itemVariants}>
          <GlassCard raised className="p-6">
            <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              📊 Répartition de la Masse Salariale
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SALARY_DATA_PIE}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {SALARY_DATA_PIE.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                      color: "var(--text-primary)",
                    }}
                    formatter={(value: any) => `${(value / 1000).toFixed(0)}K €`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Distribution Stats */}
        <motion.div variants={itemVariants}>
          <GlassCard raised className="p-6 space-y-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              📈 Détails de la Répartition
            </h2>
            <div className="space-y-4">
              {SALARY_DATA_PIE.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: COLORS_PIE[idx] }}
                    >
                      {item.percentage}%
                    </span>
                  </div>
                  <div
                    className="h-2.5 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-panel-border)" }}
                  >
                    <motion.div
                      className="h-full"
                      style={{ background: COLORS_PIE[idx] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 1, delay: idx * 0.2 }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {(item.value / 1000).toFixed(0)}K € / mois
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>

      {/* Salaries Table */}
      <motion.div variants={itemVariants}>
        <GlassCard raised className="p-6">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Détail des Salaires
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--surface-panel-border)" }}>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Nom
                  </th>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Poste
                  </th>
                  <th className="py-3 text-left text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Catégorie
                  </th>
                  <th className="py-3 text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Salaire Mensuel
                  </th>
                  <th className="py-3 text-right text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                    Salaire Annuel
                  </th>
                </tr>
              </thead>
              <tbody>
                {SALARIES_TABLE.map((item, idx) => (
                  <motion.tr
                    key={idx}
                    variants={itemVariants}
                    style={{ borderBottom: "1px solid var(--surface-panel-border)" }}
                  >
                    <td className="py-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {item.name}
                    </td>
                    <td className="py-4 text-sm" style={{ color: "var(--text-primary)" }}>
                      {item.post}
                    </td>
                    <td className="py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                      {item.category}
                    </td>
                    <td className="py-4 text-right text-sm font-semibold" style={{ color: "var(--accent)" }}>
                      {item.salary.toLocaleString("fr-FR")} €
                    </td>
                    <td className="py-4 text-right text-sm font-semibold" style={{ color: "var(--accent)" }}>
                      {(item.salary * 12).toLocaleString("fr-FR")} €
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
