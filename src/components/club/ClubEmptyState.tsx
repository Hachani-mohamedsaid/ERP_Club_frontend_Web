export function ClubEmptyState({
  title,
  description,
  message,
  action,
}: {
  title?: string;
  description?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  const text = message ?? [title, description].filter(Boolean).join(" — ");
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border px-6 py-12 text-center"
      style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-muted)" }}
    >
      {title && <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>}
      {description && <p className="text-sm">{description}</p>}
      {!title && !description && message && <p className="text-sm">{text}</p>}
      {action}
    </div>
  );
}
