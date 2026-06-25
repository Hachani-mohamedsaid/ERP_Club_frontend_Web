import { useMemo } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubBestXIPitch } from "../../components/club/ClubBestXIPitch";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { useClubProfile } from "../../hooks/useClubProfile";
import { normalizeAnalytics } from "../../lib/analyticsNormalize";

const ACCENT = "#FF6B57";

export function ClubAnalyticsPage() {
  const { clubName, season } = useClubProfile();
  const { data, loading, error } = useClubResource(async () => {
    const raw = (await clubApi.getAnalytics()) as Record<string, unknown>;
    return normalizeAnalytics(raw);
  });

  const analytics = data;
  const hasData = (analytics?.playersCount ?? 0) > 0;

  const radarData = useMemo(() => analytics?.teamRadar ?? [], [analytics]);
  const evolutionData = useMemo(() => analytics?.teamEvolution ?? [], [analytics]);
  const topScorers = useMemo(() => analytics?.topScorers ?? [], [analytics]);
  const bestXi = analytics?.bestXi;

  if (!loading && !hasData) {
    return (
      <ClubPageTransition>
        <ClubEmptyState
          title="Pas assez de données"
          description="Ajoutez des joueurs pour générer les analytics."
        />
      </ClubPageTransition>
    );
  }

  return (
    <ClubPageTransition>
      <p className="mb-5 text-sm" style={{ color: "var(--text-muted)" }}>
        {clubName} · Saison {season}
      </p>

      {loading && (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
      )}
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      {hasData && analytics && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ClubKpiCard delay={0.05}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Team Radar
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Radar
                  dataKey="value"
                  stroke={ACCENT}
                  fill={ACCENT}
                  fillOpacity={0.28}
                  animationDuration={900}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F1D3A",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ClubKpiCard>

          <ClubKpiCard delay={0.1}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Best XI
              </h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ background: `${ACCENT}22`, color: ACCENT }}
              >
                {bestXi?.formation ?? "4-3-3"}
              </span>
            </div>
            <ClubBestXIPitch
              formation={bestXi?.formation ?? "4-3-3"}
              players={bestXi?.players ?? []}
            />
          </ClubKpiCard>

          <ClubKpiCard delay={0.15}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Évolution équipe
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0F1D3A",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke={ACCENT}
                  strokeWidth={2.5}
                  dot={{ fill: ACCENT, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ClubKpiCard>

          <ClubKpiCard delay={0.2}>
            <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Top Buteurs — Podium
            </h3>
            {topScorers.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Aucun buteur enregistré pour le moment.
              </p>
            ) : (
              <ul className="space-y-3">
                {topScorers.map((scorer) => (
                  <li
                    key={scorer.rank}
                    className="flex items-center justify-between rounded-xl border px-4 py-3"
                    style={{
                      borderColor: "rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{scorer.medal}</span>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {scorer.name}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold" style={{ color: ACCENT }}>
                      {scorer.goals} buts
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </ClubKpiCard>
        </div>
      )}
    </ClubPageTransition>
  );
}
