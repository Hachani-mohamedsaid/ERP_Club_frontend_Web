import { motion } from "framer-motion";

export function PulseRiskBadge({ label, severity = "high" }: { label: string; severity?: "high" | "medium" | "low" }) {
  const color = severity === "high" ? "#EF4444" : severity === "medium" ? "#F59E0B" : "#22C55E";
  return (
    <motion.span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
      animate={{ boxShadow: [`0 0 0 0 ${color}00`, `0 0 0 8px ${color}00`] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    >
      <motion.span
        className="h-2 w-2 rounded-full"
        style={{ background: color }}
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      {label}
    </motion.span>
  );
}
