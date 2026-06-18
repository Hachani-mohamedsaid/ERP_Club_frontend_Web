import { GlassCard } from "../ui/GlassCard";
import type { ReactNode } from "react";

interface AICardProps {
  title: string;
  message: string;
  accent?: "success" | "warning" | "info";
  icon?: ReactNode;
}

const accentColors: Record<NonNullable<AICardProps["accent"]>, string> = {
  success: "var(--color-state-success)",
  warning: "var(--color-state-warning)",
  info: "var(--accent)",
};

export function AICard({ title, message, accent = "info", icon }: AICardProps) {
  return (
    <GlassCard raised className="p-5">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-9 w-9 rounded-2xl bg-[color:var(--surface-panel)] flex items-center justify-center" style={{ color: accentColors[accent] }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{message}</p>
        </div>
      </div>
    </GlassCard>
  );
}
