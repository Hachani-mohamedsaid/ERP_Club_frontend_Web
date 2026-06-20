import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type?: "info" | "success" | "warning" | "danger";
}

interface MedicalTimelineProps {
  title: string;
  events: TimelineEvent[];
}

const typeColors = {
  info: { border: "var(--color-state-info)", dot: "var(--color-state-info)" },
  success: { border: "var(--color-state-success)", dot: "var(--color-state-success)" },
  warning: { border: "var(--color-state-warning)", dot: "var(--color-state-warning)" },
  danger: { border: "var(--color-state-danger)", dot: "var(--color-state-danger)" },
};

export function MedicalTimeline({ title, events }: MedicalTimelineProps) {
  return (
    <GlassCard raised className="p-6">
      <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h2>

      <div className="mt-4 space-y-0">
        {events.map((event, idx) => {
          const colors = typeColors[event.type || "info"];
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.35, duration: 0.45, ease: "easeOut" }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  className="h-3 w-3 rounded-full"
                  style={{ background: colors.dot }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.35 + 0.1, type: "spring", stiffness: 300 }}
                />
                {idx < events.length - 1 && (
                  <motion.div
                    className="mt-2 w-0.5"
                    style={{ background: colors.border, originY: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 48, opacity: 1 }}
                    transition={{ delay: idx * 0.35 + 0.25, duration: 0.3 }}
                  />
                )}
              </div>

              <div className="flex-1 pb-6">
                <p className="text-xs font-medium" style={{ color: colors.border }}>{event.date}</p>
                <p className="mt-0.5 text-sm font-medium" style={{ color: "var(--text-primary)" }}>{event.title}</p>
                {event.description && (
                  <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>{event.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
