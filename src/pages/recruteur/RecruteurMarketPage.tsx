import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { TrendingUp, Sparkles, ArrowUpRight } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { CountUpStat } from "../../components/player/CountUpStat";
import { useRecruteurTalents } from "../../hooks/useRecruteurTalents";
import { estimateValueTrajectory } from "../../lib/recruteurTalent";

export function RecruteurMarketPage() {
  const { talents, loading, error } = useRecruteurTalents();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId && talents.length > 0) setSelectedId(talents[0].id);
  }, [talents, selectedId]);

  const player = talents.find((p) => p.id === selectedId) ?? null;

  const valueHistory = useMemo(() => player ? estimateValueTrajectory(player) : [], [player]);

  if (loading) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  if (error || !player) {
    return (
      <RecruteurPageTransition>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: error ? "rgba(239,68,68,0.3)" : "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: error ? "#EF4444" : "var(--text-muted)" }}>{error ?? "Aucun talent disponible"}</p>
        </div>
      </RecruteurPageTransition>
    );
  }

  const current = valueHistory.filter((d) => !d.predicted);
  const lastReal = current[current.length - 1]?.value ?? player.valueNum;
  const in6 = valueHistory[valueHistory.length - 1]?.value ?? player.valueNum;
  const growth = lastReal ? Math.round(((in6 - lastReal) / lastReal) * 100) : 0;
  const todayMonth = current[current.length - 1]?.month ?? "";

  return (
    <RecruteurPageTransition>
      <div className="flex flex-wrap gap-2">
        {talents.map((p) => (
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
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Estimation IA — 6 mois</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold" style={{ color: "#22C55E" }}><CountUpStat end={in6} decimals={1} suffix="M€" /></span>
              <span className="flex items-center gap-0.5 text-sm font-bold" style={{ color: growth >= 0 ? "#22C55E" : "#EF4444" }}>
                <ArrowUpRight size={14} />{growth >= 0 ? "+" : ""}{growth}%
              </span>
            </div>
            <div className="mt-3 rounded-xl p-3" style={{ background: "rgba(168,85,247,0.08)" }}>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Trajectoire estimée à partir de l'âge ({player.age} ans) et du potentiel ({player.potential}%). Indicatif — pas une prévision de marché garantie.
              </p>
            </div>
          </RecruteurKpiCard>
        </div>

        <RecruteurKpiCard hover={false}>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp size={16} style={{ color: "#8B5CF6" }} />
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Historique & estimation IA (M€)</h3>
            <div className="ml-auto flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full" style={{ background: "#8B5CF6" }} /> Actuel</span>
              <span className="flex items-center gap-1"><span className="h-2 w-4 rounded-full" style={{ background: "#22C55E", backgroundImage: "repeating-linear-gradient(90deg,#22C55E,#22C55E 4px,transparent 4px,transparent 7px)" }} /> Estimation</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={valueHistory}>
              <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0F1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
              <ReferenceLine x={todayMonth} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" label={{ value: "Aujourd'hui", fill: "#94A3B8", fontSize: 10, position: "top" }} />
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
        </RecruteurKpiCard>
      </div>
    </RecruteurPageTransition>
  );
}
