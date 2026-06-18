import { Clock, MapPin } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Badge } from "../components/ui/Badge";

interface TrainingSession {
  day: string;
  time: string;
  team: string;
  location: string;
  type: string;
}

const SESSIONS_BY_DAY: { day: string; sessions: TrainingSession[] }[] = [
  {
    day: "Lundi",
    sessions: [
      { day: "Lundi", time: "09:00", team: "Seniors", location: "Centre d'entraînement", type: "Récupération" },
      { day: "Lundi", time: "16:00", team: "U21", location: "Terrain B", type: "Tactique" },
    ],
  },
  {
    day: "Mardi",
    sessions: [
      { day: "Mardi", time: "10:30", team: "Seniors", location: "Salle de musculation", type: "Musculation" },
    ],
  },
  {
    day: "Mercredi",
    sessions: [
      { day: "Mercredi", time: "15:00", team: "Seniors", location: "Stade Olympique", type: "Tactique" },
      { day: "Mercredi", time: "17:00", team: "U18", location: "Terrain B", type: "Technique" },
    ],
  },
  {
    day: "Jeudi",
    sessions: [
      { day: "Jeudi", time: "11:00", team: "Seniors", location: "Centre d'entraînement", type: "Récupération" },
    ],
  },
];

export function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Entraînements
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Planning hebdomadaire — Semaine du 16 juin 2026
        </p>
      </div>

      <GlassCard className="p-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Présence moyenne
        </p>
        <p className="text-2xl font-semibold" style={{ color: "var(--color-state-success)" }}>
          92%
        </p>
      </GlassCard>

      <GlassCard raised className="p-6">
        <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Séances de la semaine
        </h2>

        <div className="space-y-6">
          {SESSIONS_BY_DAY.map(({ day, sessions }) => (
            <div key={day}>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {day}
              </p>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={`${session.day}-${session.time}-${session.team}`}
                    className="flex flex-col gap-2 rounded-[var(--radius-odin-md)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    style={{
                      background: "var(--surface-panel)",
                      border: "1px solid var(--surface-panel-border)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {session.time}
                      </span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {session.team}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {session.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {session.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge tone="info">{session.type}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
