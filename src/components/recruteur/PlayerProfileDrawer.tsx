import { motion } from "framer-motion";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Sparkles, TrendingUp, ShieldAlert, Users, Target, Repeat } from "lucide-react";
import { ClubSlideDrawer } from "../club/ClubSlideDrawer";
import { PlayerAvatar } from "../player/PlayerAvatar";
import type { ScoutPlayer } from "../../data/recruteurData";

export function PlayerProfileDrawer({ player, open, onClose }: { player: ScoutPlayer | null; open: boolean; onClose: () => void }) {
  if (!player) return null;

  const radar = [
    { axis: "Vitesse", v: player.speed },
    { axis: "Technique", v: player.technique },
    { axis: "Physique", v: player.physical },
    { axis: "Vision", v: player.vision },
    { axis: "Mental", v: player.mental },
  ];

  const aiStats = [
    { label: "Potentiel", value: player.potential, color: "#A855F7", icon: TrendingUp, suffix: "%" },
    { label: "Risque blessure", value: player.injuryRisk, color: "#EF4444", icon: ShieldAlert, suffix: "%" },
    { label: "Compatibilité équipe", value: player.teamCompat, color: "#22C55E", icon: Users, suffix: "%" },
    { label: "Réussite transfert", value: player.transferSuccess, color: "#3B82F6", icon: Target, suffix: "%" },
  ];

  return (
    <ClubSlideDrawer open={open} onClose={onClose} title={player.name} subtitle={`${player.positionFull} • ${player.countryFlag} ${player.club}`} width="max-w-md">
      <div className="space-y-5">
        <div
          className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.12))", border: "1px solid rgba(139,92,246,0.3)" }}
        >
          <div className="flex items-center gap-4">
            <PlayerAvatar name={player.name} size={88} ring={false} className="!rounded-2xl" />
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold" style={{ color: "#A855F7" }}>{player.aiScore}</span>
                <span className="text-xs uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Score IA</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>Âge: <b style={{ color: "var(--text-primary)" }}>{player.age}</b></span>
                <span>Taille: <b style={{ color: "var(--text-primary)" }}>{player.height}</b></span>
                <span>Valeur: <b style={{ color: "#22C55E" }}>{player.value}</b></span>
                <span>Salaire: <b style={{ color: "var(--text-primary)" }}>{player.salary}</b></span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Radar de performance</h4>
          <div className="rounded-2xl p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radar} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "#94A3B8", fontSize: 11 }} />
                <Radar dataKey="v" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.45} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {aiStats.map((s, i) => (
            <motion.div
              key={s.label}
              className="rounded-xl border p-3"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: `${s.color}30` }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-center gap-1.5">
                <s.icon size={13} style={{ color: s.color }} />
                <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{s.label}</span>
              </div>
              <div className="mt-1 text-2xl font-extrabold" style={{ color: s.color }}>{s.value}{s.suffix}</div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                <motion.div className="h-full rounded-full" style={{ background: s.color }} initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 1, delay: i * 0.06 }} />
              </div>
            </motion.div>
          ))}
        </div>

        <div>
          <h4 className="mb-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Valeur marché — projection IA</h4>
          <div className="rounded-2xl p-2" style={{ background: "rgba(255,255,255,0.03)" }}>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={player.valueHistory}>
                <defs>
                  <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10 }} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} fill="url(#pvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border p-4" style={{ background: "rgba(139,92,246,0.08)", borderColor: "rgba(139,92,246,0.25)" }}>
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: "#A855F7" }} />
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Analyse IA</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Profil à fort potentiel ({player.potential}%). Peut remplacer <b style={{ color: "#A855F7" }}>{player.replaces}</b> avec une compatibilité tactique de {player.teamCompat}%.
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <Repeat size={13} style={{ color: "var(--text-muted)" }} />
            <span className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Joueurs similaires</span>
          </div>
          <div className="mt-2 space-y-1.5">
            {player.similarTo.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-28 text-xs" style={{ color: "var(--text-secondary)" }}>{s.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: "#A855F7" }} initial={{ width: 0 }} animate={{ width: `${s.pct}%` }} transition={{ duration: 1 }} />
                </div>
                <span className="w-9 text-right text-xs font-bold" style={{ color: "#A855F7" }}>{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ClubSlideDrawer>
  );
}
