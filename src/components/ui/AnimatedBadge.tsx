import { Badge } from "./Badge";
import type { ReactNode } from "react";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const ANIMATION_CLASS: Record<BadgeTone, string> = {
  success: "animate-pulse",
  warning: "animate-glow-warning",
  danger: "animate-glow-danger",
  info: "animate-pulse",
  neutral: "",
};

interface AnimatedBadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  animated?: boolean;
}

export function AnimatedBadge({ 
  tone = "neutral", 
  children, 
  animated = true 
}: AnimatedBadgeProps) {
  if (!animated) {
    return <Badge tone={tone}>{children}</Badge>;
  }

  const animationClass = ANIMATION_CLASS[tone];

  return (
    <div className={animationClass}>
      <Badge tone={tone}>{children}</Badge>
    </div>
  );
}
