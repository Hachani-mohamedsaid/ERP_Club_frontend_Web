import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function AnalystePageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
