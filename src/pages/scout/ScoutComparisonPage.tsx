import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GitCompare, Plus, X, Eye, Trophy, Zap } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import { ScoutPage, SCard, SGauge, SBadge } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto } from "../../components/scout/ScoutPlayerPhoto";
import { S } from "../../data/scoutData";
import { useScoutProspects, type ScoutProspect } from "../../hooks/useScoutData";

const STAT_KEYS = [
  { key: "speed", label: "Vitesse" },
  { key: "dribble", label: "Dribble" },
  { key: "passing", label: "Passes" },
  { key: "defense", label: "Défense" },
  { key: "physical", label: "Physique" },
  { key: "mental", label: "Mental" },
] as const;

const COLORS = [S.primary, S.info, S.success, "#8B5CF6"];

function statVal(p: ScoutProspect, key: string) {
  return (p as unknown as Record<string, number>)[key] ?? 0;
}

export function ScoutComparisonPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { prospects, loading } = useScoutProspects();
  const initial = params.get("ids")?.split(",").filter(Boolean) ?? [];

  const [selected, setSelected] = useState<string[]>(() => {
    if (initial.length >= 2) return initial.slice(0, 4);
    return prospects.slice(0, 2).map((p) => p.id);
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const players = useMemo(
    () => selected.map((id) => prospects.find((p) => p.id === id)).filter(Boolean) as ScoutProspect[],
    [selected, prospects],
  );

  const radarData = STAT_KEYS.map(({ key, label }) => {
    const row: Record<string, string | number> = { subject: label };
    players.forEach((p, i) => {
      row[`p${i}`] = statVal(p, key);
    });
    return row;
  });

  const barCompare = STAT_KEYS.map(({ key, label }) => ({
    name: label,
    ...Object.fromEntries(players.map((p, i) => [`p${i}`, statVal(p, key)])),
  }));

  const togglePlayer = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const winner = useMemo(() => {
    if (players.length < 2) return null;
    const scores = players.map((p) => ({
      id: p.id,
      name: p.name,
      score: Math.round(
        (p.potential * 0.35 + p.aiScore * 0.35 + p.currentRating * 0.3),
      ),
    }));
    return scores.sort((a, b) => b.score - a.score)[0];
  }, [players]);

  if (loading) {
    return (
      <ScoutPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement...</p>
      </ScoutPage>
    );
  }

  return (
    <ScoutPage>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <GitCompare size={20} style={{ color: S.primary }} /> Comparateur de profils
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Comparez jusqu&apos;à 4 joueurs · radar, attributs et recommandation ODIN
          </p>
        </div>
        <motion.button
          type="button"
          onClick={() => setPickerOpen(!pickerOpen)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
          style={{ background: S.primary }}
          whileTap={{ scale: 0.96 }}
        >
          <Plus size={14} /> {pickerOpen ? "Fermer" : "Ajouter joueur"}
        </motion.button>
      </div>

      {pickerOpen && (
        <SCard className="!p-4">
          <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Sélection ({selected.length}/4)
          </p>
          <div className="flex flex-wrap gap-2">
            {prospects.map((p) => {
              const active = selected.includes(p.id);
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => togglePlayer(p.id)}
                  className="rounded-xl border px-3 py-2 text-xs font-bold"
                  style={{
                    background: active ? `${S.primary}15` : "rgba(255,255,255,0.03)",
                    borderColor: active ? `${S.primary}50` : "rgba(255,255,255,0.08)",
                    color: active ? S.primary : "var(--text-muted)",
                  }}
                  whileHover={{ scale: 1.03 }}
                >
                  {p.flag} {p.name}
                </motion.button>
              );
            })}
          </div>
        </SCard>
      )}

      {players.length < 2 ? (
        <SCard className="!p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Sélectionnez au moins 2 joueurs pour comparer
          </p>
        </SCard>
      ) : (
        <>
          {/* Player cards row */}
          <div className={`grid gap-3 grid-cols-1 sm:grid-cols-${Math.min(players.length, 4)}`}
            style={{ gridTemplateColumns: `repeat(${Math.min(players.length, 4)}, minmax(0, 1fr))` }}>
            {players.map((p, i) => {
              const color = COLORS[i % COLORS.length];
              const isWinner = winner?.id === p.id;
              return (
                <SCard key={p.id} className="!p-4 relative" glow={isWinner}>
                  <button
                    type="button"
                    onClick={() => setSelected((s) => s.filter((x) => x !== p.id))}
                    className="absolute top-3 right-3 opacity-40 hover:opacity-100"
                  >
                    <X size={12} style={{ color: "var(--text-muted)" }} />
                  </button>
                  {isWinner && (
                    <div className="absolute top-3 left-3">
                      <SBadge color={S.success} bg={`${S.success}15`}>
                        <Trophy size={10} className="inline mr-1" />Top pick
                      </SBadge>
                    </div>
                  )}
                  <ScoutPlayerPhoto name={p.name} photoUrl={p.photoUrl} size={56} accent={color} className="mx-auto mt-4" />
                  <p className="text-center text-sm font-bold mt-2" style={{ color: "var(--text-primary)" }}>
                    {p.flag} {p.name}
                  </p>
                  <p className="text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {p.position} · {p.age} ans · {p.club}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl p-2" style={{ background: `${color}10` }}>
                      <p className="text-lg font-extrabold" style={{ color }}>{p.potential}</p>
                      <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Potentiel</p>
                    </div>
                    <div className="rounded-xl p-2" style={{ background: `${S.accent}10` }}>
                      <p className="text-lg font-extrabold" style={{ color: S.accent }}>{p.aiScore}</p>
                      <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Score IA</p>
                    </div>
                  </div>
                  <p className="text-center text-[10px] font-bold mt-2" style={{ color: S.primary }}>
                    {p.marketValue}
                  </p>
                  <motion.button
                    type="button"
                    onClick={() => navigate(`/scout/prospect/${p.id}`)}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold"
                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
                    whileHover={{ background: `${color}15`, color }}
                  >
                    <Eye size={11} /> Profil complet
                  </motion.button>
                </SCard>
              );
            })}
          </div>

          {/* Overlay radar */}
          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Radar comparatif</p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                  {players.map((p, i) => (
                    <Radar
                      key={p.id}
                      name={p.name.split(" ").pop()}
                      dataKey={`p${i}`}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.12}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </SCard>

          {/* Bar chart per attribute */}
          <SCard className="!p-5">
            <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Attributs détaillés</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barCompare} barGap={2}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "var(--text-muted)", fontSize: 9 }} />
                  {players.map((p, i) => (
                    <Bar key={p.id} dataKey={`p${i}`} name={p.name.split(" ").pop()} radius={[4, 4, 0, 0]}>
                      {barCompare.map((_, j) => (
                        <Cell key={j} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  ))}
                  <Tooltip contentStyle={{ background: "rgba(5,8,22,0.96)", borderRadius: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SCard>

          {/* Side-by-side table */}
          <SCard className="!p-5 overflow-x-auto">
            <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Fiche comparative</p>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <th className="py-2 text-left font-bold" style={{ color: "var(--text-muted)" }}>Critère</th>
                  {players.map((p, i) => (
                    <th key={p.id} className="py-2 text-center font-bold" style={{ color: COLORS[i] }}>
                      {p.name.split(" ").pop()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Potentiel", (p: ScoutProspect) => p.potential],
                  ["Note actuelle", (p: ScoutProspect) => p.currentRating],
                  ["Score IA", (p: ScoutProspect) => p.aiScore],
                  ["Buts", (p: ScoutProspect) => p.goals],
                  ["Assists", (p: ScoutProspect) => p.assists],
                  ["Matchs", (p: ScoutProspect) => p.matches],
                  ["Risque blessure", (p: ScoutProspect) => `${p.injuryRisk}%`],
                  ["Taille", (p: ScoutProspect) => `${p.height} cm`],
                  ["Pied fort", (p: ScoutProspect) => p.foot],
                  ["Contrat fin", (p: ScoutProspect) => p.contractEnd],
                  ["Priorité", (p: ScoutProspect) => p.priority],
                ].map(([label, fn]) => (
                  <tr key={String(label)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="py-2 font-semibold" style={{ color: "var(--text-muted)" }}>{label as string}</td>
                    {players.map((p) => (
                      <td key={p.id} className="py-2 text-center font-bold" style={{ color: "var(--text-primary)" }}>
                        {(fn as (p: ScoutProspect) => string | number)(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </SCard>

          {winner && (
            <motion.div
              className="rounded-[20px] border p-5 flex items-center gap-4"
              style={{ background: `${S.success}08`, borderColor: `${S.success}30` }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${S.success}20` }}>
                <Zap size={22} style={{ color: S.success }} />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: S.success }}>Recommandation ODIN</p>
                <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>
                  {winner.name} — score composite {winner.score}/100
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  Meilleur rapport potentiel / valeur / compatibilité parmi la sélection
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </ScoutPage>
  );
}
