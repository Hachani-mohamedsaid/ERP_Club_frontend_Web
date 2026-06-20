import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { Button } from "../../components/ui/Button";
import { APPOINTMENTS, type Appointment } from "../../data/medicalMockData";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const WEEK_DATES = [16, 17, 18, 19, 20, 21, 22];

const TYPE_COLORS: Record<Appointment["type"], string> = {
  IRM: "#3a7bd5",
  Consultation: "#2e9e5b",
  Radio: "#d99a1f",
  Scanner: "#8b5cf6",
  Rééducation: "#06b6d4",
  Urgence: "#c0392b",
};

export function MedicalRendezVousPage() {
  const [selectedDay, setSelectedDay] = useState(3);

  const dayAppointments = APPOINTMENTS.filter((a) => a.day === selectedDay);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button" className="glass-input flex h-9 w-9 items-center justify-center">
            <ChevronLeft size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Juin 2026</h2>
          <button type="button" className="glass-input flex h-9 w-9 items-center justify-center">
            <ChevronRight size={16} style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>
        <Button><Plus size={16} /> Nouveau rendez-vous</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
            <span className="h-3 w-3 rounded-full" style={{ background: color }} />
            {type}
          </div>
        ))}
      </div>

      <GlassCard raised className="overflow-hidden p-0">
        <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--surface-panel-border)" }}>
          {DAYS.map((day, i) => {
            const isSelected = i === selectedDay;
            const isToday = i === 2;
            const dayAppts = APPOINTMENTS.filter((a) => a.day === i);
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(i)}
                className="border-r p-4 text-center transition-colors last:border-r-0"
                style={{
                  borderColor: "var(--surface-panel-border)",
                  background: isSelected ? "rgba(var(--accent-rgb), 0.1)" : "transparent",
                }}
              >
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{day}</p>
                <p
                  className="mt-1 text-xl font-bold"
                  style={{ color: isToday ? "var(--accent)" : "var(--text-primary)" }}
                >
                  {WEEK_DATES[i]}
                </p>
                <div className="mt-2 flex justify-center gap-0.5">
                  {dayAppts.slice(0, 3).map((a) => (
                    <span key={a.id} className="h-1.5 w-1.5 rounded-full" style={{ background: TYPE_COLORS[a.type] }} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-7 min-h-[400px]">
          {DAYS.map((_, i) => (
            <div
              key={DAYS[i]}
              className="border-r p-2 last:border-r-0"
              style={{ borderColor: "var(--surface-panel-border)" }}
            >
              {APPOINTMENTS.filter((a) => a.day === i).map((appt) => (
                <div
                  key={appt.id}
                  className="mb-2 cursor-pointer rounded-[var(--radius-odin-md)] p-2 text-xs transition-opacity hover:opacity-90"
                  style={{ background: `${TYPE_COLORS[appt.type]}22`, borderLeft: `3px solid ${TYPE_COLORS[appt.type]}` }}
                >
                  <p className="font-semibold" style={{ color: TYPE_COLORS[appt.type] }}>{appt.time}</p>
                  <p className="mt-0.5 font-medium" style={{ color: "var(--text-primary)" }}>{appt.title}</p>
                  <p style={{ color: "var(--text-muted)" }}>{appt.player}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Rendez-vous — {DAYS[selectedDay]} {WEEK_DATES[selectedDay]} Juin
        </h3>
        {dayAppointments.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun rendez-vous ce jour.</p>
        ) : (
          <div className="space-y-2">
            {dayAppointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-[var(--radius-odin-md)] border px-4 py-3"
                style={{ borderColor: "var(--surface-panel-border)", borderLeft: `4px solid ${TYPE_COLORS[a.type]}` }}
              >
                <span className="w-14 text-sm font-semibold" style={{ color: TYPE_COLORS[a.type] }}>{a.time}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.title}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{a.player} — {a.type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
