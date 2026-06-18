import { ChartColumn, DollarSign, ShieldAlert, Users, TrendingUp, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

const EXEC_KPIS = [
  { label: "Classement championnat", value: "2ème", trend: "+1 place", icon: Trophy, tone: "info" as const, bar: 86 },
  { label: "Budget restant", value: "184 000 DT", trend: "-6% ce mois", icon: DollarSign, tone: "success" as const, bar: 72 },
  { label: "Valeur effectif", value: "2.8 M DT", trend: "+11% saison", icon: TrendingUp, tone: "success" as const, bar: 64 },
  { label: "Disponibilité effectif", value: "89%", trend: "3 indisponibles", icon: Users, tone: "info" as const, bar: 89 },
  { label: "Cash Flow", value: "+125 600 DT", trend: "Stable", icon: ChartColumn, tone: "warning" as const, bar: 58 },
  { label: "Score ODIN", value: "87/100", trend: "Risque bas", icon: ShieldAlert, tone: "danger" as const, bar: 87 },
];

export function KpiFormation() {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard raised className="p-6">
        <motion.div 
          className="mb-1 flex items-baseline justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Executive KPIs
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Mis à jour il y a 12 min
          </span>
        </motion.div>

        <motion.div 
          className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {EXEC_KPIS.map(({ label, value, trend, icon: Icon, tone, bar }, index) => (
            <motion.div 
              key={label} 
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="rounded-[var(--radius-odin-lg)] border px-4 py-4" 
              style={{ borderColor: "var(--surface-panel-border)", background: "var(--surface-panel)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{label}</p>
                  <motion.p 
                    className="mt-2 text-2xl font-semibold" 
                    style={{ color: "var(--text-primary)" }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  >
                    {value}
                  </motion.p>
                </div>
                <motion.div 
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-odin-md)]" 
                  style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Icon size={16} />
                </motion.div>
              </div>

              <motion.p 
                className="mt-2 text-xs" 
                style={{ color: "var(--text-muted)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
              >
                {trend}
              </motion.p>

              <div className="mt-4 h-2 rounded-full" style={{ background: "var(--surface-canvas-2)" }}>
                <motion.div 
                  className="h-2 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${bar}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 + index * 0.1 }}
                  style={{ background: tone === "danger" ? "var(--color-state-danger)" : tone === "warning" ? "var(--color-state-warning)" : tone === "success" ? "var(--color-state-success)" : "var(--accent)" }} 
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}
