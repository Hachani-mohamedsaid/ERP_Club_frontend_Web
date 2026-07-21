import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, User } from "lucide-react";
import { RecruteurPageTransition } from "../../components/recruteur/RecruteurPageTransition";
import { RecruteurKpiCard } from "../../components/recruteur/RecruteurKpiCard";
import { CountUpStat } from "../../components/player/CountUpStat";
import { recruteurApi } from "../../lib/api/recruteur";

type ShortItem = {
  id: string;
  name: string;
  age: number;
  position: string;
  club: string;
  nationality: string;
  potential: number;
  score: number;
  status: string;
  scoutName?: string | null;
  pendingValidation: boolean;
};

const STATUS_LABEL: Record<string, string> = {
  SHORTLISTE: "Shortlisté",
  CONTACTE: "Contacté",
};

export function RecruteurShortlistPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await recruteurApi.getShortlist();
        if (!cancelled) setPlayers(rows ?? []);
      } catch {
        if (!cancelled) setPlayers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const avgScore = players.length ? Math.round(players.reduce((s, p) => s + p.score, 0) / players.length) : 0;
  const pending = players.filter((p) => p.pendingValidation).length;

  return (
    <RecruteurPageTransition>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RecruteurKpiCard glow delay={0}>
          <div className="flex items-center gap-2">
            <Star size={16} style={{ color: "#F59E0B" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Cibles club (scout)
            </span>
          </div>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
            <CountUpStat end={players.length} />
          </div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.08}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Score moyen
          </span>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#A855F7" }}>
            <CountUpStat end={avgScore} />
          </div>
        </RecruteurKpiCard>
        <RecruteurKpiCard delay={0.16}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            En attente comité
          </span>
          <div className="mt-2 text-3xl font-extrabold" style={{ color: "#F59E0B" }}>
            <CountUpStat end={pending} />
          </div>
        </RecruteurKpiCard>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Chargement shortlist club…
        </p>
      ) : players.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16"
          style={{ borderColor: "var(--surface-panel-border)" }}
        >
          <Star size={28} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucune cible shortlistée — le scout doit envoyer la shortlist au comité
          </p>
          <button
            type="button"
            onClick={() => navigate("/recruteur/requests")}
            className="mt-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#8B5CF6,#6366F1)" }}
          >
            Voir demandes validation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {players.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border p-4"
              style={{ background: "rgba(15,29,58,0.7)", borderColor: "var(--surface-panel-border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {p.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {p.position} · {p.club} · {p.age} ans
                  </p>
                  {p.scoutName && (
                    <p className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: "var(--text-secondary)" }}>
                      <User size={11} /> Scout: {p.scoutName}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold" style={{ color: "#A855F7" }}>
                    {p.potential}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Potentiel
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
                >
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
                {p.pendingValidation && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
                  >
                    <Clock size={10} /> En attente responsable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </RecruteurPageTransition>
  );
}
