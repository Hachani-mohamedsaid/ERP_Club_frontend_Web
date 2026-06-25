import type { ReactNode } from "react";
import { motion } from "framer-motion";

export const COACH_ACCENT = "#FF7A00";

export function CoachPageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function CCard({ children, className = "", glow = false }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <motion.div
      className={`rounded-[20px] border p-5 ${className}`}
      style={{
        background: "rgba(14,10,35,0.82)",
        borderColor: glow ? "rgba(255,122,0,0.35)" : "rgba(255,255,255,0.07)",
        boxShadow: glow ? "0 0 36px rgba(255,122,0,0.12)" : "0 8px 24px rgba(0,0,0,0.2)",
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function CKpi({ label, value, color = COACH_ACCENT, icon: Icon }: {
  label: string; value: string | number; color?: string; icon?: React.ElementType;
}) {
  return (
    <CCard>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${color}15` }}>
            <Icon size={18} style={{ color }} />
          </div>
        )}
        <div>
          <p className="text-2xl font-extrabold leading-none" style={{ color }}>{value}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
        </div>
      </div>
    </CCard>
  );
}

export function Gauge({ value, color = COACH_ACCENT }: { value: number; color?: string }) {
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
      <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.85, ease: "easeOut" }} />
    </div>
  );
}

export const TOOLTIP_STYLE = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: "1px solid rgba(255,122,0,0.3)", color: "white", borderRadius: 12 },
};
