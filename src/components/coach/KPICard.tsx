import { GlassCard } from "../ui/GlassCard";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  label: string;
  value: number | string;
  suffix?: string;
  description?: string;
  trend?: { value: number; direction: "up" | "down" };
  icon?: React.ReactNode;
}

export function KPICard({ label, value, suffix = "", description, trend, icon }: KPICardProps) {
  const trendColor = trend?.direction === "up" ? "var(--color-state-success)" : "var(--color-state-danger)";
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown;

  return (
    <GlassCard className="p-4 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {value}{suffix}
          </p>
          {description && (
            <p className="mt-2 text-xs" style={{ color: "var(--text-secondary)" }}>{description}</p>
          )}
        </div>
        {icon && (
          <div style={{ color: "var(--accent)" }}>
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-3 flex items-center gap-1" style={{ color: trendColor }}>
          <TrendIcon size={14} />
          <span className="text-xs font-medium">
            {trend.direction === "up" ? "+" : "-"}{trend.value}%
          </span>
        </div>
      )}
    </GlassCard>
  );
}
