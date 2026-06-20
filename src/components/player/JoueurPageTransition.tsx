import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { JoueurLangToggle } from "./JoueurLangToggle";

interface JoueurPageTransitionProps {
  children: ReactNode;
  className?: string;
  showLangToggle?: boolean;
}

export function JoueurPageTransition({ children, className = "space-y-6", showLangToggle = true }: JoueurPageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {showLangToggle && (
        <div className="flex justify-end">
          <JoueurLangToggle />
        </div>
      )}
      {children}
    </motion.div>
  );
}
