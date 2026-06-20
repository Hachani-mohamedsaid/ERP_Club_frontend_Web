import { useState } from "react";
import { motion } from "framer-motion";
import type { CalendarSession, WeekDay } from "../../data/preparateurData";
import { SESSION_COLORS } from "../../data/preparateurData";

const WEEK_DAYS: WeekDay[] = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

interface DragPayload {
  sessionId: string;
  fromDay: WeekDay | "palette";
}

interface ProgramCalendarDnDProps {
  schedule: Record<WeekDay, CalendarSession[]>;
  palette: CalendarSession[];
  onScheduleChange: (schedule: Record<WeekDay, CalendarSession[]>) => void;
}

export function ProgramCalendarDnD({ schedule, palette, onScheduleChange }: ProgramCalendarDnDProps) {
  const [dragOver, setDragOver] = useState<WeekDay | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  function handleDragStart(e: React.DragEvent, session: CalendarSession, fromDay: WeekDay | "palette") {
    const payload: DragPayload = { sessionId: session.id, fromDay };
    e.dataTransfer.setData("application/json", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(session.id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOver(null);
  }

  function findSession(id: string): { session: CalendarSession; day: WeekDay | "palette" } | null {
    for (const day of WEEK_DAYS) {
      const s = schedule[day].find((x) => x.id === id);
      if (s) return { session: s, day };
    }
    const p = palette.find((x) => x.id === id);
    if (p) return { session: p, day: "palette" };
    return null;
  }

  function handleDrop(e: React.DragEvent, targetDay: WeekDay) {
    e.preventDefault();
    setDragOver(null);
    try {
      const payload: DragPayload = JSON.parse(e.dataTransfer.getData("application/json"));
      const found = findSession(payload.sessionId);
      if (!found) return;

      const newSchedule = { ...schedule };
      WEEK_DAYS.forEach((d) => {
        newSchedule[d] = newSchedule[d].filter((s) => s.id !== payload.sessionId);
      });

      if (payload.fromDay !== "palette" && payload.fromDay !== targetDay) {
        // moved between days — session already removed above
      }

      const sessionToAdd = found.session;
      const newId = payload.fromDay === "palette" ? `s-${Date.now()}` : sessionToAdd.id;
      newSchedule[targetDay] = [...newSchedule[targetDay], { ...sessionToAdd, id: newId }];
      onScheduleChange(newSchedule);
    } catch {
      /* ignore invalid drop */
    }
  }

  function SessionCard({ session, day }: { session: CalendarSession; day: WeekDay | "palette" }) {
    const color = SESSION_COLORS[session.type];
    return (
      <motion.div
        draggable
        onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, session, day)}
        onDragEnd={handleDragEnd}
        layout
        className="cursor-grab rounded-xl border px-3 py-2 text-xs font-medium active:cursor-grabbing"
        style={{
          borderColor: `${color}50`,
          background: `${color}18`,
          color,
          opacity: draggingId === session.id ? 0.5 : 1,
          boxShadow: draggingId === session.id ? `0 0 12px ${color}40` : "none",
        }}
        whileHover={{ scale: 1.02 }}
      >
        {session.title}
        <span className="ml-1 opacity-70">· {session.intensity}</span>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Glisser une séance →
        </p>
        <div className="flex flex-wrap gap-2">
          {palette.map((s) => (
            <SessionCard key={s.id} session={s} day="palette" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            onDragOver={(e) => { e.preventDefault(); setDragOver(day); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, day)}
            className="min-h-[120px] rounded-xl border p-3 transition-all"
            style={{
              borderColor: dragOver === day ? "rgba(255,107,87,0.5)" : "rgba(255,255,255,0.06)",
              background: dragOver === day ? "rgba(255,107,87,0.08)" : "rgba(255,255,255,0.02)",
            }}
          >
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>{day}</p>
            <div className="space-y-2">
              {schedule[day].map((s) => (
                <SessionCard key={s.id} session={s} day={day} />
              ))}
              {schedule[day].length === 0 && (
                <p className="py-4 text-center text-[10px]" style={{ color: "var(--text-muted)" }}>Déposer ici</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
