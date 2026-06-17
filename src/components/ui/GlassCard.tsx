import type { HTMLAttributes, ReactNode } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  raised?: boolean;
}

export function GlassCard({
  children,
  raised = false,
  className = "",
  ...rest
}: GlassCardProps) {
  return (
    <div
      className={`glass-panel ${raised ? "glass-panel--raised" : ""} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
