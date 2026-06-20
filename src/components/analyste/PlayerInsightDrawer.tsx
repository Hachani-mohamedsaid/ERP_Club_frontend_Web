import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, Zap, Target, ShieldAlert, TrendingUp, Sparkles } from "lucide-react";
import { ClubSlideDrawer } from "../club/ClubSlideDrawer";
import { PlayerCard } from "./PlayerCard";
import { fifaOvrColor, type PitchPlayer } from "../../data/analysteData";

interface PlayerInsightDrawerProps {
  player: PitchPlayer | null;
  open: boolean;
  onClose: () => void;
}

// Deterministic pseudo-heatmap from player position
function buildHeatmap(p: PitchPlayer): number[] {
  const cells: number[] = [];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = (col + 0.5) / 4 * 100;
      const cy = (row + 0.5) / 6 * 100;
      const dist = Math.hypot(cx - p.x, cy - p.y);
      const intensity = Math.max(0, 100 - dist * 1.6);
      cells.push(Math.round(intensity));
    }
  }
  return cells;
}

export function PlayerInsightDrawer({ player, open, onClose }: PlayerInsightDrawerProps) {
  if (!player) return null;
  const fifa = fifaOvrColor(player.ovr);
  const speed = player.speed ?? 80;
  const xg = player.xg ?? 0.2;
  const injury = player.injuryRisk ?? 20;

  const radarData = [
    { stat: "Vitesse", value: speed },
    { stat: "OVR", value: player.ovr },
    { stat: "Endurance", value: 100 - player.fatigue },
    { stat: "Finition", value: Math.round(xg * 90 + 20) },
    { stat: "Forme", value: Math.max(20, 100 - injury) },
    { stat: "Récup.", value: 100 - player.fatigue },
  ];

  const evolution = [
    { m: "Jan", v: player.ovr - 4 }, { m: "Fév", v: player.ovr - 3 },
    { m: "Mar", v: player.ovr - 3 }, { m: "Avr", v: player.ovr - 2 },
    { m: "Mai", v: player.ovr - 1 }, { m: "Juin", v: player.ovr },
  ];

  const heatmap = buildHeatmap(player);
  const maxHeat = Math.max(...heatmap, 1);

  const stats = [
    { icon: Zap, label: "Vitesse", value: `${speed}`, color: "#3B82F6" },
    { icon: Target, label: "xG / match", value: xg.toFixed(1), color: "#22C55E" },
    { icon: Activity, label: "Fatigue", value: `${player.fatigue}%`, color: player.fatigue >= 70 ? "#EF4444" : "#F59E0B" },
    { icon: ShieldAlert, label: "Risque blessure", value: `${injury}%`, color: injury >= 60 ? "#EF4444" : injury >= 30 ? "#F59E0B" : "#22C55E" },
  ];

  const aiInsight = injury >= 60
    ? `Risque blessure élevé (${injury}%). Réduire le temps de jeu et prévoir récupération active 48h.`
    : player.fatigue >= 70
    ? `Fatigue critique (${player.fatigue}%). Candidat idéal à une rotation ce week-end.`
    : `Forme optimale. ${player.name.split(" ")[0]} peut enchaîner 90 minutes sans risque majeur.`;

  return (
    <ClubSlideDrawer open={open} onClose={onClose} title={player.name} subtitle={`${player.position} · OVR ${player.ovr} · ${fifa.label}`} width="max-w-md">
      <div className="space-y-5">
        {/* Hero card */}
        <div className="flex items-center justify-center rounded-2xl border py-6" style={{ borderColor: `${fifa.color}30`, background: `${fifa.color}08` }}>
          <PlayerCard player={player} size={72} selected />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border p-3"
                style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
              >
                <Icon size={14} style={{ color: s.color }} />
                <p className="mt-1.5 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Radar */}
        <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Radar performance</h4>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <Radar dataKey="value" stroke={fifa.color} fill={fifa.color} fillOpacity={0.3} animationDuration={900} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Mini heatmap */}
        <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Heatmap positionnelle</h4>
          <div
            className="relative mx-auto grid overflow-hidden rounded-lg"
            style={{ gridTemplateColumns: "repeat(4,1fr)", aspectRatio: "4/6", maxWidth: 160, background: "linear-gradient(180deg,#0f4a24,#0a3d1e)" }}
          >
            {heatmap.map((h, i) => {
              const t = h / maxHeat;
              return (
                <div
                  key={i}
                  style={{
                    background: t > 0.05
                      ? `rgba(${Math.round(255 * Math.min(1, t * 1.5))},${Math.round(180 * (1 - t))},0,${0.15 + t * 0.7})`
                      : "transparent",
                  }}
                />
              );
            })}
            <div className="pointer-events-none absolute inset-0 border" style={{ borderColor: "rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        {/* Evolution */}
        <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            <TrendingUp size={12} /> Évolution OVR
          </h4>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={evolution}>
              <XAxis dataKey="m" tick={{ fill: "var(--text-muted)", fontSize: 10 }} />
              <YAxis domain={[player.ovr - 6, player.ovr + 2]} hide />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="v" stroke={fifa.color} strokeWidth={2.5} dot={{ r: 3 }} animationDuration={900} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI insight */}
        <div className="rounded-2xl border p-4" style={{ borderColor: "rgba(139,92,246,0.25)", background: "rgba(139,92,246,0.06)" }}>
          <div className="mb-1.5 flex items-center gap-1.5">
            <Sparkles size={14} style={{ color: "#8B5CF6" }} />
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8B5CF6" }}>AI Insight</h4>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{aiInsight}</p>
        </div>
      </div>
    </ClubSlideDrawer>
  );
}
