import { GlassCard } from "../ui/GlassCard";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "danger";
}

interface TimelineProps {
  title: string;
  events: TimelineEvent[];
}

const typeColors = {
  info: { bg: "var(--color-state-info-bg)", border: "var(--color-state-info)", dot: "var(--color-state-info)" },
  success: { bg: "var(--color-state-success-bg)", border: "var(--color-state-success)", dot: "var(--color-state-success)" },
  warning: { bg: "var(--color-state-warning-bg)", border: "var(--color-state-warning)", dot: "var(--color-state-warning)" },
  danger: { bg: "var(--color-state-danger-bg)", border: "var(--color-state-danger)", dot: "var(--color-state-danger)" },
};

export function Timeline({ title, events }: TimelineProps) {
  return (
    <GlassCard raised className="p-6">
      <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>
      
      <div className="mt-4 space-y-4">
        {events.map((event, idx) => {
          const colors = typeColors[event.type || "info"];
          return (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ background: colors.dot }}
                />
                {idx < events.length - 1 && (
                  <div
                    className="mt-2 h-8 w-0.5"
                    style={{ background: colors.border }}
                  />
                )}
              </div>
              
              <div className="flex-1 pb-2">
                <p className="text-xs font-medium" style={{ color: colors.border }}>
                  {event.date}
                </p>
                <p className="text-sm font-medium mt-0.5" style={{ color: "var(--text-primary)" }}>
                  {event.title}
                </p>
                {event.description && (
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
