import { Activity, Bandage, Calendar, Dumbbell, Trophy } from "lucide-react";
import { ClubSlideDrawer } from "../club/ClubSlideDrawer";
import { PlayerAvatar } from "../player/PlayerAvatar";
import type { PlayerDetail } from "../../data/preparateurData";
import { getStatusBadge } from "../../data/preparateurData";

const AVAIL_COLORS: Record<string, string> = {
  Disponible: "#22C55E",
  Limité: "#F59E0B",
  Blessé: "#EF4444",
};

interface PrepPlayerDrawerProps {
  player: PlayerDetail | null;
  open: boolean;
  onClose: () => void;
}

export function PrepPlayerDrawer({ player, open, onClose }: PrepPlayerDrawerProps) {
  if (!player) return null;

  const chargeStatus = player.charge >= 85 ? "critical" : player.charge >= 70 ? "warning" : "normal";
  const badge = getStatusBadge(chargeStatus);
  const availColor = AVAIL_COLORS[player.availability] ?? "#6366F1";

  return (
    <ClubSlideDrawer
      open={open}
      onClose={onClose}
      title={player.name}
      subtitle={`${player.position} • ${player.age} ans`}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <PlayerAvatar name={player.name} size={72} />
          <div className="grid grid-cols-3 gap-3 flex-1">
            {[
              { label: "Poids", value: player.weight },
              { label: "Taille", value: player.height },
              { label: "Poste", value: player.position },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border p-2.5 text-center" style={{ borderColor: "var(--surface-panel-border)" }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                <p className="mt-0.5 text-sm font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Charge sem.", value: `${player.weekCharge}%`, color: badge.color, icon: Activity },
            { label: "Fatigue", value: `${player.fatigue}%`, color: player.fatigue >= 70 ? "#EF4444" : "#F59E0B", icon: Activity },
            { label: "Récup.", value: `${player.recovery}%`, color: "#22C55E", icon: Activity },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="rounded-xl border p-3" style={{ borderColor: `${color}30`, background: `${color}08` }}>
              <Icon size={14} style={{ color }} />
              <p className="mt-1 text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <div className="mb-2 flex items-center gap-2">
            <Trophy size={14} style={{ color: "#6366F1" }} />
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Dernier match</h4>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--text-secondary)" }}>vs {player.lastMatch.opponent}</span>
            <span style={{ color: "var(--text-muted)" }}>{player.lastMatch.date}</span>
            <span className="font-bold" style={{ color: "#FF6B57" }}>Note {player.lastMatch.rating}</span>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: availColor }} />
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Disponibilité</h4>
            </div>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: `${availColor}20`, color: availColor }}>
              {player.availability}
            </span>
          </div>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <div className="mb-3 flex items-center gap-2">
            <Bandage size={14} style={{ color: "#EF4444" }} />
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Historique blessures</h4>
          </div>
          {player.injuryHistory.length > 0 ? (
            <div className="space-y-2">
              {player.injuryHistory.map((inj) => (
                <div key={`${inj.date}-${inj.injury}`} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div>
                    <p style={{ color: "var(--text-primary)" }}>{inj.injury}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{inj.date}</p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: inj.status === "Récupéré" ? "#22C55E" : "#F59E0B" }}>{inj.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#22C55E" }}>Aucune blessure enregistrée</p>
          )}
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor: "var(--surface-panel-border)" }}>
          <div className="mb-3 flex items-center gap-2">
            <Dumbbell size={14} style={{ color: "#6366F1" }} />
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Programmes actifs</h4>
          </div>
          {player.activePrograms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {player.activePrograms.map((prog) => (
                <span key={prog} className="rounded-lg px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(99,102,241,0.15)", color: "#6366F1" }}>
                  {prog}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucun programme actif</p>
          )}
        </div>
      </div>
    </ClubSlideDrawer>
  );
}
