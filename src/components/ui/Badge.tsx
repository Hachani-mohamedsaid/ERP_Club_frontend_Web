import type { ReactNode } from "react";

type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_STYLES: Record<BadgeTone, { bg: string; color: string }> = {
  success: { bg: "var(--color-state-success-bg)", color: "var(--color-state-success)" },
  warning: { bg: "var(--color-state-warning-bg)", color: "var(--color-state-warning)" },
  danger: { bg: "var(--color-state-danger-bg)", color: "var(--color-state-danger)" },
  info: { bg: "var(--color-state-info-bg)", color: "var(--color-state-info)" },
  neutral: { bg: "var(--surface-panel-border)", color: "var(--text-secondary)" },
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = "neutral", children }: BadgeProps) {
  const style = TONE_STYLES[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ background: style.bg, color: style.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: style.color }}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
