import { motion } from "framer-motion";
import type { CareerStep } from "../../data/joueurExtendedData";

interface CareerTimelineProps {
  steps: CareerStep[];
}

export function CareerTimeline({ steps }: CareerTimelineProps) {
  return (
    <div className="relative pl-6">
      <div className="absolute bottom-0 left-[7px] top-0 w-0.5" style={{ background: "var(--surface-panel-border)" }} />
      {steps.map((step, i) => (
        <motion.div
          key={`${step.year}-${step.club}`}
          className="relative mb-6 last:mb-0"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.4 }}
        >
          <motion.div
            className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2"
            style={{ borderColor: "var(--accent)", background: "var(--surface-canvas)" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.15 + 0.1, type: "spring" }}
          />
          <p className="text-xs font-bold" style={{ color: "var(--accent)" }}>{step.year}</p>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{step.club}</p>
          {step.event && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{step.event}</p>}
        </motion.div>
      ))}
    </div>
  );
}
