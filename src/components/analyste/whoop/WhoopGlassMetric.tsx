import { motion } from "framer-motion";
import { CountUpStat } from "../../player/CountUpStat";
import { recoveryColor } from "./whoopTheme";

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
  const c = color ?? (typeof value === "number" ? recoveryColor(value) : "#34d399");
  const isNum = typeof value === "number";

  return (
    <motion.div
      className="rounded-2xl border p-4 backdrop-blur-xl"
      style={{
        background: "rgba(17,24,39,0.5)",
        borderColor: "rgba(255,255,255,0.08)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${c}15`,
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.04, boxShadow: `0 12px 40px ${c}25` }}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
        {isNum ? <CountUpStat end={value} suffix={suffix} decimals={Number.isInteger(value) ? 0 : 1} /> : value}
        {!isNum && suffix}
      </p>
      {delta && <p className="mt-0.5 text-[10px] font-medium" style={{ color: c }}>{delta}</p>}
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/8">
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
