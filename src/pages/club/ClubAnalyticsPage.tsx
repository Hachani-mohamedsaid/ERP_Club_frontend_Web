import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import type { SquadPlayer } from "../../data/joueurMockData";

export function ClubAnalyticsPage() {
  const { data: players, loading } = useClubResource(() => clubApi.getPlayers() as Promise<SquadPlayer[]>);
  const squad = players ?? [];

  const positionDist = squad.reduce<Record<string, number>>((acc, p) => {
    acc[p.position] = (acc[p.position] ?? 0) + 1;
    return acc;
  }, {});
  const positionData = Object.entries(positionDist).map(([name, value]) => ({ name, value }));
  const ovrEvolution = squad.slice(0, 6).map((p) => ({ name: p.name.split(" ").pop(), ovr: p.ovr }));

  if (!loading && squad.length === 0) {
    return (
      <ClubPageTransition>
        <ClubEmptyState title="Pas assez de données" description="Ajoutez des joueurs pour générer les analytics." />
      </ClubPageTransition>
    );
  }

  return (
    <ClubPageTransition>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClubKpiCard delay={0.05}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Répartition par poste</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={positionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#FF6B57" strokeWidth={2} dot={{ fill: "#FF6B57" }} />
            </LineChart>
          </ResponsiveContainer>
        </ClubKpiCard>

        <ClubKpiCard delay={0.1}>
          <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>OVR par joueur</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ovrEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="ovr" stroke="#6366F1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ClubKpiCard>
      </div>
    </ClubPageTransition>
  );
}
