import { GlassCard } from "../ui/GlassCard";

interface NotificationItem {
  title: string;
  subtitle: string;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  return (
    <GlassCard raised className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Notifications</p>
        <span className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Live</span>
      </div>
      <div className="mt-4 space-y-3">
        {notifications.map((note) => (
          <div key={note.title} className="rounded-[var(--radius-odin-md)] border px-4 py-3" style={{ borderColor: "var(--surface-panel-border)" }}>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{note.title}</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{note.subtitle}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
