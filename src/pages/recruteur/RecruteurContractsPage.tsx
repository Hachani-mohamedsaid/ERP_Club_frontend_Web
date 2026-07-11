import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, ShieldCheck, Coins, CalendarClock, Award, Check } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { getContractAdvice } from "../../data/recruteurData";
import { useRecruteurTalents } from "../../hooks/useRecruteurTalents";

export function RecruteurContractsPage() {
  const { talents, loading, error } = useRecruteurTalents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [salary, setSalary] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bonus, setBonus] = useState(true);
  const [generated, setGenerated] = useState(false);

  const player = talents.find((p) => p.id === selectedId) ?? talents[0] ?? null;

  useEffect(() => {
    if (!player) return;
    if (!selectedId) setSelectedId(player.id);
    const a = getContractAdvice(player);
    setSalary(parseInt(a.recommendedSalary, 10));
    setDuration(parseInt(a.recommendedDuration, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.id]);

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

  const advice = getContractAdvice(player);
  const riskColor = advice.riskLevel === "Faible" ? "#22C55E" : advice.riskLevel === "Moyen" ? "#F59E0B" : "#EF4444";

  const pick = (id: string) => {
    setSelectedId(id);
    setGenerated(false);
  };

  return (
    <RecruteurPageTransition>
      <div className="flex flex-wrap gap-2">
        {talents.slice(0, 6).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => pick(p.id)}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
            style={{
              background: selectedId === p.id ? "linear-gradient(135deg,#8B5CF6,#6366F1)" : "rgba(255,255,255,0.04)",
              borderColor: selectedId === p.id ? "transparent" : "rgba(255,255,255,0.1)",
              color: selectedId === p.id ? "#fff" : "var(--text-muted)",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <RecruteurKpiCard hover={false}>
          <div className="mb-4 flex items-center gap-3 border-b pb-4" style={{ borderColor: "var(--surface-panel-border)" }}>
            <PlayerAvatar name={player.name} size={56} ring={false} className="!rounded-xl" />
            <div className="flex-1">
              <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Contrat — {player.name}</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{player.positionFull} • {player.club} • {player.age} ans</p>
            </div>
            <FileText size={20} style={{ color: "#8B5CF6" }} />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><Coins size={14} style={{ color: "#F59E0B" }} /> Salaire mensuel</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{salary}k€/mois</span>
              </div>
              <input type="range" min={4} max={40} value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="w-full accent-[#8B5CF6]" />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}><CalendarClock size={14} style={{ color: "#3B82F6" }} /> Durée du contrat</span>
                <span className="font-bold" style={{ color: "var(--text-primary)" }}>{duration} ans</span>
              </div>
              <input type="range" min={1} max={6} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-[#8B5CF6]" />
            </div>
            <button
              type="button"
              onClick={() => setBonus(!bonus)}
              className="flex w-full items-center justify-between rounded-xl border p-3"
              style={{ background: bonus ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)", borderColor: bonus ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)" }}
            >
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}><Award size={14} style={{ color: "#22C55E" }} /> Primes de performance ({advice.suggestedBonus})</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: bonus ? "#22C55E" : "rgba(255,255,255,0.1)" }}>{bonus && <Check size={14} className="text-white" />}</span>
            </button>
            <div className="rounded-xl border p-3" style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)" }}>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>Clause libératoire suggérée</div>
              <div className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{advice.releaseClause}</div>
            </div>

            <button
              type="button"
              onClick={() => setGenerated(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)", boxShadow: "0 0 24px rgba(139,92,246,0.4)" }}
            >
              <FileText size={16} /> {generated ? "Contrat généré ✓" : "Générer le contrat"}
            </button>
          </div>
        </RecruteurKpiCard>

        <div className="space-y-4">
          <RecruteurKpiCard glow hover={false}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={15} style={{ color: "#A855F7" }} />
              <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Conseil IA</h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl p-3" style={{ background: "rgba(139,92,246,0.1)" }}>
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Salaire conseillé</div>
                <div className="text-2xl font-extrabold" style={{ color: "#A855F7" }}>{advice.recommendedSalary}</div>
              </div>
              <div className="flex items-center justify-between rounded-xl p-3" style={{ background: `${riskColor}14` }}>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}><ShieldCheck size={14} style={{ color: riskColor }} /> Risque contrat</span>
                <span className="text-sm font-bold" style={{ color: riskColor }}>{advice.riskLevel}</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Pour un joueur de {player.age} ans à fort potentiel ({player.potential}%), une durée de {advice.recommendedDuration} sécurise la valeur de revente. Les primes incitatives sont recommandées pour aligner les intérêts.
              </p>
            </div>
          </RecruteurKpiCard>

          {generated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border p-4"
              style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)" }}
            >
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "#22C55E" }}><Check size={16} /> Récapitulatif</div>
              <ul className="mt-2 space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <li>Salaire: <b style={{ color: "var(--text-primary)" }}>{salary}k€/mois</b></li>
                <li>Durée: <b style={{ color: "var(--text-primary)" }}>{duration} ans</b></li>
                <li>Primes: <b style={{ color: "var(--text-primary)" }}>{bonus ? advice.suggestedBonus : "Aucune"}</b></li>
                <li>Clause: <b style={{ color: "var(--text-primary)" }}>{advice.releaseClause}</b></li>
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </RecruteurPageTransition>
  );
}
