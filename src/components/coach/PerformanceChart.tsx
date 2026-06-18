import { GlassCard } from "../ui/GlassCard";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}

interface PerformanceChartProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type?: "line" | "area" | "bar";
  height?: number;
  dataKey?: string;
  secondaryKey?: string;
  className?: string;
}

export function PerformanceChart({
  title,
  subtitle,
  data,
  type = "line",
  height = 300,
  dataKey = "value",
  secondaryKey,
  className,
}: PerformanceChartProps) {
  const chartProps = {
    data,
    margin: { top: 5, right: 30, left: 0, bottom: 5 },
  };

  let ChartComponent;
  let LineComponent;

  switch (type) {
    case "area":
      ChartComponent = AreaChart;
      LineComponent = Area;
      break;
    case "bar":
      ChartComponent = BarChart;
      LineComponent = Bar;
      break;
    default:
      ChartComponent = LineChart;
      LineComponent = Line;
  }

  return (
    <GlassCard raised className={className ? `p-6 ${className}` : "p-6"}>
      <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      {subtitle && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
      
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={height}>
          <ChartComponent {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-panel-border)" />
            <XAxis dataKey="name" stroke="var(--text-muted)" />
            <YAxis stroke="var(--text-muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--surface-panel)",
                border: "1px solid var(--surface-panel-border)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
            />
            <LineComponent
              type="monotone"
              dataKey={dataKey}
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
              fill="var(--accent)"
            />
            {secondaryKey && (
              <LineComponent
                type="monotone"
                dataKey={secondaryKey}
                stroke="var(--color-state-warning)"
                strokeWidth={2}
                dot={false}
                fill="var(--color-state-warning)"
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
