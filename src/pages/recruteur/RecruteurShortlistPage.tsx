import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, GitCompare } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { TalentCard } from "../../components/recruteur/TalentCard";
import { PlayerProfileDrawer } from "../../components/recruteur/PlayerProfileDrawer";
import { CountUpStat } from "../../components/player/CountUpStat";
import { type ScoutPlayer } from "../../data/recruteurData";
import { useRecruteurStore, toggleCompare } from "../../data/recruteurStore";
import { useRecruteurTalents } from "../../hooks/useRecruteurTalents";

export function RecruteurShortlistPage() {
  const navigate = useNavigate();
  const store = useRecruteurStore();
  const { talents, loading, error, toggleShortlist, getById } = useRecruteurTalents();
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const players = talents.filter((p) => p.shortlisted);
  const avgScore = players.length ? Math.round(players.reduce((s, p) => s + p.aiScore, 0) / players.length) : 0;
  const totalValue = players.reduce((s, p) => s + p.valueNum, 0);
  const drawerPlayer: ScoutPlayer | null = drawerId ? getById(drawerId) : null;

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RecruteurKpiCard glow delay={0}>
          <div className="flex items-center gap-2"><Star size={16} style={{ color: "#F59E0B" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Cibles en shortlist</span></div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}><CountUpStat end={players.length} /></div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.08}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Score IA moyen</span>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#A855F7" }}><CountUpStat end={avgScore} suffix="%" /></div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.16}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Valeur cumulée</span>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#22C55E" }}><CountUpStat end={totalValue} decimals={1} suffix="M€" /></div>
        </RecruteurKpiCard>
      </div>

      {store.compare.length > 0 && (
        <button
          type="button"
          onClick={() => navigate("/recruteur/compare")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}
        >
          <GitCompare size={16} /> Comparer la sélection ({store.compare.length})
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && players.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16" style={{ borderColor: "var(--surface-panel-border)" }}>
          <Star size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Aucune cible en shortlist — ajoutez des talents depuis Talent Discovery</p>
          <button type="button" onClick={() => navigate("/recruteur/discovery")} className="mt-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}>
            Explorer les talents
          </button>
        </div>
      ) : !loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {players.map((p, i) => (
            <TalentCard key={p.id} player={p} delay={i * 0.05} onView={() => setDrawerId(p.id)} onCompare={() => toggleCompare(p.id)} onShortlist={() => toggleShortlist(p.id)} />
          ))}
        </div>
      )}

      <PlayerProfileDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />
    </RecruteurPageTransition>
  );
}
