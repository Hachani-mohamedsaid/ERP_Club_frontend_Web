import { motion } from "framer-motion";
import { CountUpStat } from "../../player/CountUpStat";
import { recoveryColor, VIIV_THEME } from "./whoopTheme";

interface WhoopGlassMetricProps {
  label: string;
  value: number | string;
  suffix?: string;
  delta?: string;
  progress?: number;
  color?: string;
  delay?: number;
}

export function WhoopGlassMetric({ label, value, suffix = "", delta, progress, color, delay = 0 }: WhoopGlassMetricProps) {
  const c = color ?? (typeof value === "number" ? recoveryColor(value) : VIIV_THEME.emerald);
  const isNum = typeof value === "number";

  return (
    <motion.div
      className="p-4"
      style={{
        borderRadius: VIIV_THEME.radiusCard,
        background: `linear-gradient(145deg, ${VIIV_THEME.glass}, rgba(22,22,42,0.9))`,
        border: `1px solid ${VIIV_THEME.glassBorder}`,
        boxShadow: `0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px ${c}15`,
        backdropFilter: `blur(${VIIV_THEME.blur}px)`,
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03, boxShadow: `0 12px 36px ${c}25` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
        {label}
      </p>
      <p className="mt-1 text-[26px] font-black tabular-nums text-white" style={{ letterSpacing: "-0.5px" }}>
        {isNum ? <CountUpStat end={value} suffix={suffix} decimals={Number.isInteger(value) ? 0 : 1} /> : value}
        {!isNum && suffix}
      </p>
      {delta && (
        <p className="mt-0.5 text-[10px] font-medium" style={{ color: c }}>
          {delta}
        </p>
      )}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${c}, ${c}88)` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
          />
        </div>
      )}
    </motion.div>
  );
}
