import type { ReactNode, LucideIcon } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

/* ── Variants ──────────────────────────────────────────────────── */
export const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ── Page wrapper ───────────────────────────────────────────────── */
export function RPage({ children }: { children: ReactNode }) {
  return (
    <motion.div className="space-y-6" variants={pageVariants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

/* ── Base card ─────────────────────────────────────────────────── */
export function RCard({
  children, className = "", hover = true, glow = false,
}: { children: ReactNode; className?: string; hover?: boolean; glow?: boolean }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-[20px] border p-5 backdrop-blur-[12px] ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: glow ? "rgba(255,122,0,0.3)" : "rgba(255,255,255,0.06)",
        boxShadow: glow ? "0 0 40px rgba(255,122,0,0.1), 0 10px 30px rgba(0,0,0,0.2)" : "0 8px 24px rgba(0,0,0,0.18)",
      }}
      whileHover={hover ? { y: -4, borderColor: "rgba(255,122,0,0.25)", boxShadow: "0 0 30px rgba(255,122,0,0.12), 0 16px 40px rgba(0,0,0,0.25)" } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────── */
export function RKpiCard({ label, value, icon: Icon, color = "var(--accent)", trend }: {
  label: string; value: string; icon: LucideIcon; color?: string; trend?: string;
}) {
  return (
    <RCard>
      <div className="flex items-start justify-between">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}1a`, color }}
          animate={{ boxShadow: [`0 0 0px ${color}00`, `0 0 16px ${color}50`, `0 0 0px ${color}00`] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={18} />
        </motion.div>
        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ArrowUpRight size={15} style={{ color: "#22C55E" }} />
        </motion.div>
      </div>
      <motion.div
        className="mt-3 text-2xl font-extrabold"
        style={{ color: "var(--text-primary)" }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "backOut" }}
      >
        {value}
      </motion.div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
      {trend && (
        <motion.p className="mt-1 text-[11px] font-medium" style={{ color }}
          animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }}>
          {trend}
        </motion.p>
      )}
    </RCard>
  );
}

/* ── Section header card ────────────────────────────────────────── */
export function RHeader({ title, subtitle, action, badge = "Responsable Club" }: {
  title: string; subtitle: string; action?: ReactNode; badge?: string;
}) {
  return (
    <RCard hover={false} glow>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="relative inline-flex items-center overflow-hidden rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
            style={{ background: "rgba(255,122,0,0.15)", color: "var(--accent)", border: "1px solid rgba(255,122,0,0.3)" }}>
            <motion.span className="absolute inset-0 rounded-full"
              style={{ background: "linear-gradient(90deg,transparent,rgba(255,122,0,0.25),transparent)" }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            />
            <span className="relative">{badge}</span>
          </div>
          <motion.h1 className="mt-2 text-xl font-extrabold" style={{ color: "var(--text-primary)" }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {title}
          </motion.h1>
          <motion.p className="text-sm" style={{ color: "var(--text-muted)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {subtitle}
          </motion.p>
        </div>
        {action && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }}>
            {action}
          </motion.div>
        )}
      </div>
    </RCard>
  );
}

/* ── Section block ──────────────────────────────────────────────── */
export function RSection({ title, subtitle, icon: Icon, action, children, className = "", hover = false }: {
  title: string; subtitle?: string; icon?: LucideIcon; action?: ReactNode; children?: ReactNode; className?: string; hover?: boolean;
}) {
  return (
    <RCard hover={hover} className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          {subtitle && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {action}
          {Icon && (
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}>
              <Icon size={16} style={{ color: "var(--accent)" }} />
            </motion.div>
          )}
        </div>
      </div>
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </RCard>
  );
}

/* ── List row ───────────────────────────────────────────────────── */
export function RRow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`rounded-xl border p-4 ${className}`}
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}
      whileHover={{ borderColor: "rgba(255,122,0,0.3)", background: "rgba(255,122,0,0.04)", x: 3 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.div>
  );
}

/* ── Filter pills ───────────────────────────────────────────────── */
export function RPills({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt, i) => {
        const active = opt === value;
        return (
          <motion.button key={opt} type="button" onClick={() => onChange(opt)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: active ? "linear-gradient(135deg,var(--accent),#E66000)" : "rgba(255,255,255,0.04)",
              color: active ? "white" : "var(--text-muted)",
              border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: active ? "0 0 20px rgba(255,122,0,0.35)" : "none",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 280, damping: 22 }}
            whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
          >
            {opt}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Action button ──────────────────────────────────────────────── */
export function RBtn({ children, onClick, variant = "primary" }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger" | "success";
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: "linear-gradient(135deg,var(--accent),#E66000)", color: "white", boxShadow: "0 0 20px rgba(255,122,0,0.35)" },
    ghost:   { background: "transparent", color: "var(--text-secondary)", border: "1px solid rgba(255,255,255,0.1)" },
    danger:  { background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)" },
    success: { background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" },
  };
  return (
    <motion.button type="button" onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
      style={styles[variant]}
      whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

/* ── Search input ───────────────────────────────────────────────── */
export function RSearch({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <motion.input
      className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)", color: "var(--text-primary)" }}
      placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      whileFocus={{ borderColor: "rgba(255,122,0,0.5)", boxShadow: "0 0 0 2px rgba(255,122,0,0.1)" }}
    />
  );
}

/* ── Toggle ─────────────────────────────────────────────────────── */
export function RToggle({ label, description, defaultOn = true }: {
  label: string; description?: string; defaultOn?: boolean;
}) {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border p-4"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
        {description && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>}
      </div>
      <button type="button" onClick={() => setOn(!on)}
        className="relative h-6 w-11 shrink-0 rounded-full"
        style={{ background: on ? "linear-gradient(135deg,var(--accent),#E66000)" : "rgba(255,255,255,0.1)" }}>
        <motion.div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          animate={{ left: on ? "calc(100% - 22px)" : "2px" }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }} />
      </button>
    </div>
  );
}

import React from "react";
