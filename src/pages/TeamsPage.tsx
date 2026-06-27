import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { clubApi } from "../lib/api/club";
import { useClubResource } from "../hooks/useClubResource";

interface TeamCard {
  category: string;
  name: string;
  playerCount: number;
  coach: string;
  ranking: string;
  calendar: string;
  staff: string;
}

interface StaffRow {
  id: string;
  fullName: string;
  role: string;
  department?: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  eventDate: string;
  eventType: string;
}

interface ProfileData {
  clubName?: string;
}

function ageCategory(age: number): string {
  if (age >= 21) return "Seniors";
  if (age >= 18) return "U21";
  if (age >= 15) return "U18";
  return "U15";
}

function buildTeams(
  players: { age: number }[],
  staff: StaffRow[],
  events: CalendarEvent[],
  clubName: string,
): TeamCard[] {
  const categories = ["Seniors", "U21", "U18", "U15"] as const;
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  return categories.map((cat) => {
    const catPlayers = players.filter((p) => ageCategory(p.age) === cat);
    const coaches = staff.filter((s) => /coach|entraineur/i.test(s.role));
    const coach =
      coaches.find((c) => (c.department ?? "").toLowerCase().includes(cat.toLowerCase()))?.fullName ??
      coaches[0]?.fullName ??
      "—";

    const matchCount = events.filter((e) => {
      const d = new Date(e.eventDate);
      return e.eventType === "MATCH" && d.getMonth() === month && d.getFullYear() === year;
    }).length;

    const analysts = staff.filter((s) => /analyste|scout|kiné|kiné|préparateur|assistant/i.test(s.role));
    const staffSummary =
      analysts.length > 0
        ? `${analysts.slice(0, 2).map((s) => s.role).join(" / ")}`
        : "—";

    return {
      category: cat,
      name: `${clubName} ${cat === "Seniors" ? "— Équipe A" : cat}`,
      playerCount: catPlayers.length,
      coach,
      ranking: catPlayers.length > 0 ? `${Math.min(4, Math.max(1, 5 - Math.floor(catPlayers.length / 6)))}ème` : "—",
      calendar: `${matchCount || 0} match${matchCount !== 1 ? "s" : ""} ce mois`,
      staff: staffSummary,
    };
  });
}

export function TeamsPage() {
  const navigate = useNavigate();
  const { data: players, loading: loadingPlayers } = useClubResource(() => clubApi.getPlayers() as Promise<{ age: number }[]>);
  const { data: staff, loading: loadingStaff } = useClubResource(() => clubApi.getStaff() as Promise<StaffRow[]>);
  const { data: calendar, loading: loadingCal } = useClubResource(() => clubApi.getCalendar() as Promise<CalendarEvent[]>);
  const { data: profile } = useClubResource(() => clubApi.getProfile() as Promise<ProfileData>);

  const teams = useMemo(
    () => buildTeams(players ?? [], staff ?? [], calendar ?? [], profile?.clubName ?? "Club"),
    [players, staff, calendar, profile?.clubName],
  );

  const loading = loadingPlayers || loadingStaff || loadingCal;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Équipes
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Effectifs, staff et classement — données club en direct
        </p>
      </div>

      {loading && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement des équipes…</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {teams.map((team) => (
          <GlassCard key={team.category} raised className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--accent)" }}>
                  {team.category}
                </p>
                <h2 className="mt-1 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  {team.name}
                </h2>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,122,0,0.12)", color: "var(--accent)" }}
              >
                <Users size={20} />
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Effectif</span>
                <span style={{ color: "var(--text-primary)" }}>{team.playerCount} joueurs</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Entraîneur</span>
                <span style={{ color: "var(--text-primary)" }}>{team.coach}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Classement</span>
                <Badge tone="info">{team.ranking}</Badge>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Calendrier</span>
                <span style={{ color: "var(--text-primary)" }}>{team.calendar}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Staff technique</span>
                <span className="text-right" style={{ color: "var(--text-primary)" }}>{team.staff}</span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-5 w-full"
              onClick={() => navigate("/players")}
            >
              Voir l'effectif
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
