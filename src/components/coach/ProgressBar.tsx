interface ProgressBarProps {
  label: string;
  value: number;
  suffix?: string;
  description?: string;
  color?: string;
}

export function ProgressBar({ label, value, suffix = "%", description, color = "var(--accent)" }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium" style={{ color: "var(--text-primary)" }}>
        <span>{label}</span>
        <span>{value}{suffix}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--surface-panel-border)]">
        <div className="h-2 rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      {description && <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>{description}</p>}
    </div>
  );
}
