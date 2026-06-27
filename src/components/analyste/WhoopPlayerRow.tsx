import { Wifi, WifiOff, ChevronRight } from "lucide-react";
import { recoveryColor, strainColor, type WhoopPlayerMetrics } from "../../data/whoopData";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 52;
  const h = 20;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="opacity-70" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface WhoopPlayerRowProps {
  player: WhoopPlayerMetrics;
  selected: boolean;
  onSelect: () => void;
}

export function WhoopPlayerRow({ player, selected, onSelect }: WhoopPlayerRowProps) {
  const reducedMotion = usePrefersReducedMotion();
  const rc = recoveryColor(player.recovery);
  const spark = player.weeklyStrain.map((d) => d.recovery);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-[transform,box-shadow,background] duration-300 ease-out"
      style={{
        background: selected ? "rgba(52,211,153,0.08)" : "transparent",
        transform: selected && !reducedMotion ? "translateZ(8px)" : undefined,
        boxShadow: selected ? "inset 3px 0 0 #34d399, 0 8px 24px rgba(52,211,153,0.12)" : undefined,
        perspective: "600px",
      }}
      onMouseEnter={(e) => {
        if (reducedMotion || selected) return;
        e.currentTarget.style.transform = "translateZ(6px)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        if (selected) return;
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <img
        src={player.photo}
        alt=""
        className="h-9 w-9 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ border: `2px solid ${selected ? rc : "rgba(255,255,255,0.08)"}` }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{player.name}</p>
          {player.connected ? <Wifi size={9} className="text-emerald-400" /> : <WifiOff size={9} className="text-red-400" />}
        </div>
        <p className="text-[10px] text-[var(--text-muted)]">{player.position} · {player.deviceId}</p>
      </div>
      <MiniSparkline data={spark} color={rc} />
      <div className="text-right">
        <p className="text-sm font-semibold tabular-nums" style={{ color: rc }}>{player.recovery}%</p>
        <p className="text-[10px] tabular-nums" style={{ color: strainColor(player.strain) }}>{player.strain}</p>
      </div>
      <ChevronRight size={12} className="text-white/20" />
    </button>
  );
}
