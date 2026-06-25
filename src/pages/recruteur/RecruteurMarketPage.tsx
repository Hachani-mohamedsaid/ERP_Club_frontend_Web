import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { CountUpStat } from "../../components/player/CountUpStat";
import { SCOUT_PLAYERS } from "../../data/recruteurData";

export function RecruteurMarketPage() {
  const [selectedId, setSelectedId] = useState(SCOUT_PLAYERS[0].id);
  const player = SCOUT_PLAYERS.find((p) => p.id === selectedId)!;

  const current = player.valueHistory.filter((d) => !d.predicted);
  const lastReal = current[current.length - 1].value;
  const in6 = player.valueHistory[player.valueHistory.length - 1].value;
  const growth = Math.round(((in6 - lastReal) / lastReal) * 100);

  return (
    <RecruteurPageTransition>
      <div className="flex flex-wrap gap-2">
        {SCOUT_PLAYERS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelectedId(p.id)}
            className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background: selectedId === p.id ? "linear-gradient(135deg,#8B5CF6,#6366F1)" : "rgba(255,255,255,0.04)",
              borderColor: selectedId === p.id ? "transparent" : "rgba(255,255,255,0.1)",
              color: selectedId === p.id ? "#fff" : "var(--text-muted)",
            }}
          >
            {p.countryFlag} {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <RecruteurKpiCard glow hover={false}>
            <div className="flex items-center gap-3">
              <PlayerAvatar name={player.name} size={56} ring={false} className="!rounded-xl" />
              <div>
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{player.name}</h3>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{player.positionFull} • {player.age} ans</p>
              </div>
            </div>
          </RecruteurKpiCard>

          <RecruteurKpiCard hover={false}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Valeur actuelle</span>
            <div className="mt-1 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}><CountUpStat end={lastReal} decimals={1} suffix="M€" /></div>
          </RecruteurKpiCard>

          <RecruteurKpiCard glow hover={false}>
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} style={{ color: "#A855F7" }} />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Prévision IA — 6 mois</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold" style={{ color: "#22C55E" }}><CountUpStat end={in6} decimals={1} suffix="M€" /></span>
              <span className="flex items-center gap-0.5 text-sm font-bold" style={{ color: "#22C55E" }}><ArrowUpRight size={14} />+{growth}%</span>
            </div>
            <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(168,85,247,0.08)" }}>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Trajectoire haussière soutenue par l'âge ({player.age} ans), un potentiel de {player.potential}% et des performances en hausse. Fenêtre d'achat optimale recommandée maintenant.
              </p>
            </div>
          </RecruteurKpiCard>
        </div>

        <RecruteurKpiCard hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "#8B5CF6" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Historique & prévision IA (M€)</h3>
            <div className="ml-auto flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full" style={{ background: "#8B5CF6" }} /> Historique</span>
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full" style={{ background: "#22C55E", backgroundImage: "repeating-linear-gradient(90deg,#22C55E,#22C55E 4px,transparent 4px,transparent 7px)" }} /> Prévision</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={player.valueHistory}>
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <ReferenceLine x="Juin" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: "Aujourd'hui", fill: "#94A3B8", fontSize: 10, position: "top" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload, index } = props as { cx: number; cy: number; payload: { predicted?: boolean }; index: number };
                  return <circle key={index} cx={cx} cy={cy} r={4} fill={payload.predicted ? "#22C55E" : "#8B5CF6"} />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
          <motion.div className="mt-2 grid grid-cols-3 gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            {[
              { l: "Aujourd'hui", v: lastReal, c: "#8B5CF6" },
              { l: "Dans 3 mois", v: player.valueHistory.find((d) => d.predicted)?.value ?? lastReal, c: "#3B82F6" },
              { l: "Dans 6 mois", v: in6, c: "#22C55E" },
            ].map((x) => (
              <div key={x.l} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="text-lg font-extrabold" style={{ color: x.c }}>{x.v.toFixed(1)}M€</div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{x.l}</div>
              </div>
            ))}
          </motion.div>
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
