import type { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedGlassCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'ref'> {
  children: ReactNode;
  raised?: boolean;
  animated?: boolean;
  delay?: number;
}

export function AnimatedGlassCard({
  children,
  raised = false,
  animated = true,
  delay = 0,
  className = "",
  ...rest
}: AnimatedGlassCardProps) {
  const cardClass = `glass-panel ${raised ? "glass-panel--raised" : ""} ${className}`;

  if (!animated) {
    return (
      <div className={cardClass} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cardClass}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      transition={{
        duration: 0.4,
        delay: delay,
        ease: "easeOut",
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
