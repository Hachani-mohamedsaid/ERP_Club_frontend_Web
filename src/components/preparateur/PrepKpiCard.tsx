import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PrepKpiCard({ children, delay = 0, className = "", hover = true }: { children: ReactNode; delay?: number; className?: string; hover?: boolean }) {
  return (
    <motion.div
      className={`rounded-[20px] border p-5 backdrop-blur-[10px] ${className}`}
      style={{ background: "rgba(15,29,58,0.8)", borderColor: "rgba(255,255,255,0.05)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -5 } : undefined}
    >
      {children}
    </motion.div>
  );
}
