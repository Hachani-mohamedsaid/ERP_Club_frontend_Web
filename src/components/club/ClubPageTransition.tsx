import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ClubPageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function ClubPageTransition({ children, className = "space-y-6" }: ClubPageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
