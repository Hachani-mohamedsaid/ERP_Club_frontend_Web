import { motion } from "framer-motion";

interface SeasonProgressBarProps {
  current: number;
  target: number;
  label?: string;
  color?: string;
}

export function SeasonProgressBar({ current, target, label, color = "#FF6B57" }: SeasonProgressBarProps) {
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div>
      {label && (
        <div className="mb-2 flex justify-between text-sm">
          <span style={{ color: "var(--text-secondary)" }}>{label}</span>
          <span className="font-bold" style={{ color }}>
            {current} / {target}
          </span>
        </div>
      )}
      <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-input)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1 text-right text-[10px]" style={{ color: "var(--text-muted)" }}>{pct}%</p>
    </div>
  );
}
