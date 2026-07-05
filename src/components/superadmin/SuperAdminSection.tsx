import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SuperAdminCard } from "./SuperAdminKpiCard";
import { itemVariants } from "./SuperAdminPageTransition";

interface SuperAdminSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** @deprecated */
  delay?: number;
}

export function SuperAdminSection({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delay: _delay,
}: SuperAdminSectionProps) {
  return (
    <SuperAdminCard className={className} hover={false}>
      {/* Section header */}
      <motion.div
        className="mb-4 flex items-center justify-between gap-3"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div>
          <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {Icon && (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            >
              <Icon size={18} style={{ color: "#FF7A00" }} />
            </motion.div>
          )}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </SuperAdminCard>
  );
}

/* ── List row with stagger entrance ────────────────────────────── */
export function SuperAdminListRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-xl border p-4 ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "var(--surface-panel-border)",
      }}
      whileHover={{
        borderColor: "rgba(255,122,0,0.3)",
        background: "rgba(255,122,0,0.04)",
        x: 3,
      }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Staggered list container ───────────────────────────────────── */
export function SuperAdminStaggerList({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {children}
    </motion.div>
  );
}
