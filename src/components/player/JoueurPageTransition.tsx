import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface JoueurPageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function JoueurPageTransition({ children, className = "space-y-6" }: JoueurPageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
