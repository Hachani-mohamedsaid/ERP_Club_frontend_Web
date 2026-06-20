import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function RecruteurKpiCard({
  children,
  delay = 0,
  className = "",
  glow = false,
  hover = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  glow?: boolean;
  hover?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-[20px] border p-5 backdrop-blur-[10px] ${className}`}
      style={{
        background: "rgba(15,29,58,0.85)",
        borderColor: glow ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.05)",
        boxShadow: glow
          ? "0 0 40px rgba(139,92,246,0.15), 0 10px 30px rgba(0,0,0,0.25)"
          : "0 10px 30px rgba(0,0,0,0.25)",
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      whileHover={hover ? { scale: 1.03, y: -4 } : undefined}
    >
      {children}
    </motion.div>
  );
}
