import type { ReactNode, ElementType } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { S } from "../../data/scoutData";

export function ScoutPage({ children }: { children: ReactNode }) {
  return (
    <motion.div className="space-y-5"
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

export function SCard({ children, className = "", glow = false, onClick }: {
  children: ReactNode; className?: string; glow?: boolean; onClick?: () => void;
}) {
  return (
    <motion.div className={`rounded-[20px] border p-5 ${className}`}
      style={{
        background: "rgba(12,9,30,0.85)",
        borderColor: glow ? `${S.accent}35` : "rgba(255,255,255,0.07)",
        boxShadow: glow ? `0 0 32px ${S.accent}15` : "0 6px 24px rgba(0,0,0,0.2)",
        cursor: onClick ? "pointer" : "default",
      }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { y: -2, boxShadow: `0 12px 32px rgba(0,0,0,0.3)` } : undefined}
      onClick={onClick}>
      {children}
    </motion.div>
  );
}

interface KpiProps {
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  color?: string;
  icon?: ElementType;
  sparkline?: number[];
  delay?: number;
}

export function SKpi({ label, value, trend, color = S.accent, icon: Icon, sparkline, delay = 0 }: KpiProps) {
  const sparkData = sparkline?.map((v) => ({ v }));
  const up = trend && trend.value > 0;
  return (
    <motion.div className="rounded-[20px] border p-4"
      style={{ background: "rgba(12,9,30,0.85)", borderColor: "rgba(255,255,255,0.07)" }}
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: `0 12px 30px rgba(0,0,0,0.35)` }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {Icon && (
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: `${color}15` }}>
              <Icon size={15} style={{ color }} />
            </div>
          )}
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: S.muted }}>{label}</p>
          <motion.p className="mt-1 text-2xl font-extrabold leading-none" style={{ color }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay * 0.06 + 0.15 }}>
            {value}
          </motion.p>
          {trend && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: up ? S.success : S.danger }}>
              {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {up ? "+" : ""}{trend.value} {trend.label}
            </div>
          )}
        </div>
        {sparkData && sparkData.length > 0 && (
          <div className="h-12 w-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2}
                  dot={false} animationDuration={1200} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function SBadge({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold"
      style={{ color, background: bg, border: `1px solid ${color}25` }}>
      {children}
    </span>
  );
}

export function SGauge({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
      <motion.div className="h-1.5 rounded-full" style={{ background: color }}
        initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.85, ease: "easeOut" }} />
    </div>
  );
}

export const SCOUT_TOOLTIP = {
  contentStyle: { background: "rgba(5,8,22,0.96)", border: `1px solid ${S.accent}30`, color: "white", borderRadius: 12 },
};
