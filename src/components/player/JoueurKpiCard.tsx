import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface JoueurKpiCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function JoueurKpiCard({ children, className = "", delay = 0 }: JoueurKpiCardProps) {
  return (
    <motion.div
      className={`rounded-[24px] border p-5 backdrop-blur-sm transition-shadow hover:shadow-xl ${className}`}
      style={{
        background: "#141B2D",
        borderColor: "rgba(255,255,255,0.08)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  );
}
