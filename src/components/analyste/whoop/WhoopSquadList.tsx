import { motion } from "framer-motion";
import { Wifi, WifiOff, Battery, ChevronRight } from "lucide-react";
import type { WhoopPlayerMetrics } from "../../../data/whoopData";
import { recoveryColor } from "./whoopTheme";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 64},${22 - ((v - min) / range) * 22}`).join(" ");
  return (
    <svg width={64} height={22} className="opacity-80">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  players: WhoopPlayerMetrics[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenProfile?: (id: string) => void;
}

export function WhoopSquadList({ players, selectedId, onSelect, onOpenProfile }: Props) {
  return (
    <div className="space-y-2">
      {players.map((p, i) => {
        const sel = p.id === selectedId;
        const rc = recoveryColor(p.recovery);
        const spark = p.weeklyStrain.map((d) => d.recovery);
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className="flex w-full items-center gap-3 rounded-2xl border p-3 text-left backdrop-blur-md transition-colors"
            style={{
              background: sel ? "rgba(52,211,153,0.1)" : "rgba(17,24,39,0.45)",
              borderColor: sel ? "rgba(52,211,153,0.45)" : "rgba(255,255,255,0.06)",
              boxShadow: sel ? `0 8px 32px ${rc}20` : undefined,
            }}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.02, boxShadow: `0 12px 36px ${rc}25` }}
          >
            <motion.img
              src={p.photo}
              alt=""
              className="h-11 w-11 rounded-xl object-cover"
              style={{ border: `2px solid ${sel ? rc : "transparent"}` }}
              whileHover={{ scale: 1.08 }}
              onClick={(e) => { e.stopPropagation(); onOpenProfile?.(p.id); }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                {p.connected ? <Wifi size={10} className="text-emerald-400" /> : <WifiOff size={10} className="text-red-400" />}
              </div>
              <p className="text-[10px] text-slate-500">{p.position} · {p.lastSync}</p>
              <div className="mt-1 flex items-center gap-2 text-[9px] text-slate-500">
                <Battery size={9} /> {p.battery}%
              </div>
            </div>
            <Sparkline data={spark} color={rc} />
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums" style={{ color: rc }}>{p.recovery}%</p>
              <p className="text-[10px] text-orange-400">S {p.strain}</p>
              <p className="text-[9px] text-slate-500">{p.hrv} ms</p>
            </div>
            <ChevronRight size={14} className="text-white/20" />
          </motion.button>
        );
      })}
    </div>
  );
}
