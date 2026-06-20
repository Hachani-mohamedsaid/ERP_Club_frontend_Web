import { PlayerAvatar } from "../player/PlayerAvatar";
import { fifaOvrColor, type PitchPlayer } from "../../data/analysteData";

function fatigueColor(f: number) {
  if (f >= 70) return "#EF4444";
  if (f >= 45) return "#F59E0B";
  return "#22C55E";
}

interface PlayerCardProps {
  player: PitchPlayer;
  size?: number;
  selected?: boolean;
  dragging?: boolean;
}

export function PlayerCard({ player, size = 52, selected = false, dragging = false }: PlayerCardProps) {
  const fifa = fifaOvrColor(player.ovr);
  const ring = size + 10;
  const stroke = 3.5;
  const r = (ring - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fatCol = fatigueColor(player.fatigue);
  const offset = circ - (player.fatigue / 100) * circ;

  return (
    <div className="flex flex-col items-center" style={{ pointerEvents: "none" }}>
      <div className="relative" style={{ width: ring, height: ring }}>
        {/* Fatigue ring (Apple Watch style) */}
        <svg width={ring} height={ring} className="absolute inset-0 -rotate-90">
          <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={stroke} />
          <circle
            cx={ring / 2}
            cy={ring / 2}
            r={r}
            fill="none"
            stroke={fatCol}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
          />
        </svg>

        {/* Avatar */}
        <div
          className="absolute overflow-hidden rounded-full"
          style={{
            inset: stroke + 1,
            border: `2px solid ${fifa.color}`,
            boxShadow: dragging
              ? `0 0 28px ${fifa.color}, 0 0 14px ${fatCol}`
              : selected
              ? `0 0 20px ${fifa.color}aa`
              : `0 0 14px ${fifa.color}44`,
          }}
        >
          <PlayerAvatar name={player.name} size={size} ring={false} className="!rounded-full" />
        </div>

        {/* OVR badge */}
        <div
          className="absolute -right-1 -top-1 flex items-center justify-center rounded-md text-[10px] font-black text-white"
          style={{
            width: 22,
            height: 18,
            background: fifa.bg,
            border: "1.5px solid rgba(255,255,255,0.7)",
            boxShadow: `0 2px 6px rgba(0,0,0,0.4)`,
          }}
        >
          {player.ovr}
        </div>

        {/* Fatigue % chip */}
        {player.fatigue >= 70 && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[8px] font-bold text-white"
            style={{ background: fatCol }}
          >
            {player.fatigue}%
          </div>
        )}
      </div>

      {/* Name + position */}
      <div className="mt-1 flex flex-col items-center">
        <span className="text-[10px] font-bold leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
          {player.name.split(" ")[0]}
        </span>
        <span
          className="rounded px-1 text-[7px] font-bold uppercase tracking-wide"
          style={{ background: `${fifa.color}33`, color: "#fff" }}
        >
          {player.position}
        </span>
      </div>
    </div>
  );
}
