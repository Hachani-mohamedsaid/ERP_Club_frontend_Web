import { useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import type { SquadPlayer } from "../../data/joueurMockData";

interface ContractRow {
  id: string;
  holderName: string;
  startDate: string;
  endDate: string;
  salaryMonthly: number;
  consumedPct: number;
}

interface InjuryRow {
  id: string;
  name: string;
  injury: string;
  bodyPart?: string;
  returnDate?: string;
  riskIA?: number;
}

const STATUS_COLORS: Record<string, string> = {
  Disponible: "#22C55E",
  Blessé: "#EF4444",
  "Fin contrat": "#F59E0B",
  Limité: "#6366F1",
};

export function ResponsablePlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const listPath = location.pathname.startsWith("/club") ? "/club/joueurs" : "/players";

  const { data: player, loading, error } = useClubResource(
    () => clubApi.getPlayer(id!) as Promise<SquadPlayer>,
    [id],
  );
  const { data: contracts } = useClubResource(() => clubApi.getContracts() as Promise<ContractRow[]>, [id]);
  const { data: injuries } = useClubResource(() => clubApi.getInjuries() as Promise<{ injured: InjuryRow[] }>, [id]);

  const contract = useMemo(
    () => (contracts ?? []).find((c) => c.holderName === player?.name),
    [contracts, player?.name],
  );

  const playerInjuries = useMemo(
    () => (injuries?.injured ?? []).filter((i) => i.name === player?.name),
    [injuries, player?.name],
  );

  const radarData = player
    ? Object.entries(player.radar ?? {}).map(([key, val]) => ({
        stat: key.charAt(0).toUpperCase() + key.slice(1),
        value: val,
      }))
    : [];

  const ovrEvolution = (player?.performanceHistory ?? []).map((p) => ({
    month: p.month,
    ovr: p.score,
  }));

  if (loading) {
    return (
      <ClubPageTransition>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement du profil…</p>
      </ClubPageTransition>
    );
  }

  if (error || !player) {
    return (
      <ClubPageTransition>
        <button type="button" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <p className="text-sm text-red-400">{error ?? "Joueur introuvable."}</p>
      </ClubPageTransition>
    );
  }

  const availability = player.availability ?? "Disponible";
  const stats = player.stats ?? { goals: player.goals ?? 0, assists: 0, minutes: 0, passAccuracy: 0, distance: 0 };

  return (
    <ClubPageTransition>
      <button
        type="button"
        onClick={() => navigate(listPath)}
        className="mb-4 flex items-center gap-2 text-sm transition-colors hover:opacity-80"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft size={16} /> Retour à la liste
      </button>

      <div className="mb-6 flex flex-wrap items-start gap-6">
        <PlayerAvatar name={player.name} size={96} />
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Fiche joueur
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {player.positionFull ?? player.position} · {player.age} ans
          </p>
          <span
            className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: `${STATUS_COLORS[availability] ?? STATUS_COLORS.Disponible}20`,
              color: STATUS_COLORS[availability] ?? STATUS_COLORS.Disponible,
            }}
          >
            {availability}
          </span>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold" style={{ color: "#FF6B57" }}>{player.ovr}</p>
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>ODIN Score</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Valeur marchande", value: player.marketValue ?? "—" },
          { label: "Salaire", value: player.contract?.salary ?? "—" },
          { label: "Buts (saison)", value: String(stats.goals) },
          { label: "Blessures actives", value: String(playerInjuries.length) },
        ].map((kpi) => (
          <ClubKpiCard key={kpi.label}>
            <p className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
            <p className="mt-2 text-xl font-bold" style={{ color: "var(--text-primary)" }}>{kpi.value}</p>
          </ClubKpiCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ClubKpiCard hover={false} className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Radar performance</h2>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <Radar dataKey="value" stroke="#FF6B57" fill="#FF6B57" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Données radar non disponibles.</p>
          )}
        </ClubKpiCard>

        <ClubKpiCard hover={false} className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Évolution OVR</h2>
          {ovrEvolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={ovrEvolution}>
                <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "rgba(10,16,30,0.95)", border: "1px solid rgba(255,107,87,0.2)" }} />
                <Line type="monotone" dataKey="ovr" stroke="#FF6B57" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Historique en cours de collecte.</p>
          )}
        </ClubKpiCard>

        <ClubKpiCard hover={false} className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Contrat</h2>
          {contract ? (
            <div className="space-y-2 text-sm">
              <p style={{ color: "var(--text-secondary)" }}>
                Période : {new Date(contract.startDate).toLocaleDateString("fr-FR")} → {new Date(contract.endDate).toLocaleDateString("fr-FR")}
              </p>
              <p style={{ color: "var(--text-secondary)" }}>
                Salaire : {contract.salaryMonthly.toLocaleString("fr-FR")} DT/mois
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full rounded-full" style={{ width: `${contract.consumedPct}%`, background: "#22C55E" }} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{contract.consumedPct}% consommé</p>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun contrat enregistré.</p>
          )}
        </ClubKpiCard>

        <ClubKpiCard hover={false} className="p-5">
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Médical</h2>
          {playerInjuries.length > 0 ? (
            <ul className="space-y-2">
              {playerInjuries.map((inj) => (
                <li key={inj.id} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{inj.injury}</p>
                  <p style={{ color: "var(--text-muted)" }}>
                    {inj.bodyPart ?? "—"} · retour {inj.returnDate ?? "—"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune blessure active.</p>
          )}
        </ClubKpiCard>
      </div>
    </ClubPageTransition>
  );
}
