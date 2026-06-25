import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ClubSlideDrawer } from "./ClubSlideDrawer";
import { PlayerAvatar } from "../player/PlayerAvatar";
import type { SquadPlayer } from "../../data/joueurMockData";

const STATUS_COLORS: Record<string, string> = {
  Disponible: "#22C55E", Blessé: "#EF4444", "Fin contrat": "#F59E0B", Limité: "#6366F1",
};

interface PlayerDetailDrawerProps {
  player: SquadPlayer | null;
  open: boolean;
  onClose: () => void;
}

export function PlayerDetailDrawer({ player, open, onClose }: PlayerDetailDrawerProps) {
  if (!player) return null;

  const stats = player.stats ?? { goals: 0, assists: 0, minutes: 0, passAccuracy: 0, distance: 0 };
  const contract = {
    salary: player.contract?.salary ?? "—",
    bonus: player.contract?.bonus ?? "—",
    clause: player.contract?.clause ?? "—",
    expiration: player.contract?.expiration ?? "—",
  };
  const injuries = player.injuries ?? [];
  const performanceHistory = player.performanceHistory ?? [];
  const matches = player.matches ?? [];
  const riskScore = player.riskScore ?? 0;
  const availability = player.availability ?? "Disponible";

  const ovrEvolution = performanceHistory.map((p) => ({ month: p.month, ovr: p.score }));
  const matchesPlayed = matches.length;

  return (
    <ClubSlideDrawer
      open={open}
      onClose={onClose}
      title={player.name}
      subtitle={`${player.positionFull ?? player.position} • OVR ${player.ovr}`}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-5">
          <PlayerAvatar name={player.name} size={80} />
          <div>
            <p className="text-3xl font-bold" style={{ color: "#FF6B57" }}>{player.ovr}</p>
            <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>OVR</p>
            <span
              className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium"
              style={{ background: `${STATUS_COLORS[availability] ?? STATUS_COLORS.Disponible}20`, color: STATUS_COLORS[availability] ?? STATUS_COLORS.Disponible }}
            >
              {availability}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Matchs joués", value: matchesPlayed },
            { label: "Buts", value: stats.goals },
            { label: "Passes D.", value: stats.assists },
            { label: "Valeur", value: player.marketValue },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border p-3" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              <p className="mt-1 text-lg font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Contrat</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Salaire</span><span style={{ color: "var(--text-primary)" }}>{contract.salary}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Bonus</span><span style={{ color: "var(--text-primary)" }}>{contract.bonus}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Clause</span><span style={{ color: "var(--text-primary)" }}>{contract.clause}</span></div>
            <div className="flex justify-between"><span style={{ color: "var(--text-muted)" }}>Expiration</span><span style={{ color: "#F59E0B" }}>{contract.expiration}</span></div>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Statut médical</h4>
          {injuries.length > 0 ? (
            injuries.slice(0, 2).map((inj) => (
              <div key={inj.injury} className="flex justify-between text-sm">
                <span style={{ color: "var(--text-secondary)" }}>{inj.injury}</span>
                <span style={{ color: inj.status === "Récupéré" ? "#22C55E" : "#EF4444" }}>{inj.status}</span>
              </div>
            ))
          ) : (
            <p className="text-sm" style={{ color: "#22C55E" }}>Aucune blessure active</p>
          )}
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>Risk score : {riskScore}%</p>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Évolution OVR</h4>
        {ovrEvolution.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={ovrEvolution}>
              <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="ovr" stroke="#FF6B57" strokeWidth={2} dot={{ r: 3 }} animationDuration={1000} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune donnée d&apos;évolution disponible</p>
        )}
        </div>
      </div>
    </ClubSlideDrawer>
  );
}
