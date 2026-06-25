import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { itemVariants } from "./SuperAdminPageTransition";

/* ── Base animated card ─────────────────────────────────────────── */
export function SuperAdminCard({
  children,
  className = "",
  glow = false,
  hover = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delay: _delay,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  hover?: boolean;
  /** @deprecated - stagger is now handled by variants container */
  delay?: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className={`rounded-[20px] border p-5 backdrop-blur-[10px] ${className}`}
      style={{
        background: "rgba(15,29,58,0.85)",
        borderColor: glow ? "rgba(255,122,0,0.35)" : "rgba(255,255,255,0.05)",
        boxShadow: glow
          ? "0 0 40px rgba(255,122,0,0.15), 0 10px 30px rgba(0,0,0,0.25)"
          : "0 10px 30px rgba(0,0,0,0.25)",
      }}
      whileHover={
        hover
          ? {
              scale: 1.03,
              y: -5,
              borderColor: "rgba(255,122,0,0.4)",
              boxShadow: "0 0 50px rgba(255,122,0,0.2), 0 16px 40px rgba(0,0,0,0.3)",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

/* ── KPI card with animated icon glow + value ───────────────────── */
interface SuperAdminKpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  /** @deprecated - stagger is now handled by variants container */
  delay?: number;
  glow?: boolean;
  trend?: string;
}

export function SuperAdminKpiCard({
  label,
  value,
  icon: Icon,
  color = "#FF7A00",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  delay: _delay,
  glow = true,
  trend,
}: SuperAdminKpiCardProps) {
  return (
    <SuperAdminCard glow={glow}>
      <div className="flex items-start justify-between">
        {/* pulsing icon container */}
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}1f`, color }}
          animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 18px ${color}60`, `0 0 0px ${color}00`] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={18} />
        </motion.div>

        {/* animated upright arrow */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowUpRight size={16} style={{ color: "#22C55E" }} />
        </motion.div>
      </div>

      {/* value — pas de re-animation au refresh */}
      <div
        className="mt-3 text-3xl font-extrabold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>

      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>

      {trend && (
        <motion.div
          className="mt-1 text-[11px] font-medium"
          style={{ color }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {trend}
        </motion.div>
      )}
    </SuperAdminCard>
  );
}

/* ── Responsive grid ────────────────────────────────────────────── */
export function SuperAdminKpiGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 | 7 }) {
  const gridClass =
    cols === 7
      ? "grid grid-cols-2 gap-4 xl:grid-cols-7"
      : cols === 3
        ? "grid grid-cols-1 gap-4 sm:grid-cols-3"
        : cols === 2
          ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";

  return <div className={gridClass}>{children}</div>;
}
