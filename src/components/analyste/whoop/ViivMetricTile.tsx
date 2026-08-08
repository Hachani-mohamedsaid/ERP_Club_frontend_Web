import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { VIIV_THEME } from "./whoopTheme";

interface ViivMetricTileProps {
  icon: LucideIcon;
  color: string;
  label: string;
  value: string | number;
  unit?: string;
  live?: boolean;
  delay?: number;
}

/** Mobile `_MetricTile` equivalent — glass card, icon + muted label, w900 value */
export function ViivMetricTile({
  icon: Icon,
  color,
  label,
  value,
  unit = "",
  live = false,
  delay = 0,
}: ViivMetricTileProps) {
  return (
    <motion.div
      className="flex flex-col justify-between p-3.5"
      style={{
        borderRadius: VIIV_THEME.radiusCard,
        background: `linear-gradient(145deg, ${VIIV_THEME.glass}, rgba(22,22,42,0.9))`,
        border: `1px solid ${VIIV_THEME.glassBorder}`,
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
        backdropFilter: `blur(${VIIV_THEME.blur}px)`,
        minHeight: 108,
      }}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, boxShadow: `0 12px 28px ${color}22` }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-[14px]"
          style={{ background: `${color}22`, color }}
        >
          <Icon size={16} strokeWidth={2.25} />
        </span>
        <span className="text-xs font-medium" style={{ color: VIIV_THEME.muted }}>
          {label}
        </span>
        {live && (
          <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: VIIV_THEME.hr }} />
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span
          className="text-[26px] font-black tabular-nums leading-none"
          style={{ color: VIIV_THEME.text, letterSpacing: "-0.5px" }}
        >
          {value}
        </span>
        {unit ? (
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            {unit}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
