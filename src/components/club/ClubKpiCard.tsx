import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ClubKpiCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function ClubKpiCard({ children, className = "", delay = 0, hover = true }: ClubKpiCardProps) {
  return (
    <motion.div
      className={`rounded-[20px] border p-5 backdrop-blur-[10px] transition-shadow duration-200 ${className}`}
      style={{
        background: "rgba(15, 29, 58, 0.8)",
        borderColor: "rgba(255,255,255,0.05)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={hover ? { y: -5, boxShadow: "0 16px 40px rgba(0,0,0,0.35)" } : undefined}
    >
      {children}
    </motion.div>
  );
}
