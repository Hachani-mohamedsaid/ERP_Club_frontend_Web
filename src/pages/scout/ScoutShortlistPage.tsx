import { useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Star, GitCompare, FileText, Send, Eye, TrendingUp } from "lucide-react";
import { ScoutPage, SCard, SBadge, SGauge } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto } from "../../components/scout/ScoutPlayerPhoto";
import { S, PRIORITY_META } from "../../data/scoutData";
import { useScoutProspects } from "../../hooks/useScoutData";
import { showToast } from "../../components/scout/ScoutToast";

export function ScoutShortlistPage() {
  const navigate = useNavigate();
  const { prospects, loading } = useScoutProspects();

  const shortlist = useMemo(
    () => prospects
      .filter((p) => p.priority === "A" || p.status === "validation" || p.status === "signature")
      .sort((a, b) => b.aiScore - a.aiScore),
    [prospects],
  );

  const totalBudget = shortlist.reduce((a, p) => a + p.valueMK, 0);

  const sendToCommittee = () => {
    showToast(`Shortlist de ${shortlist.length} joueurs envoyée au comité ✓`, "success");
  };

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
            <Star size={20} style={{ color: S.primary }} /> Shortlist Club
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            Sélection prioritaire pour le comité recrutement · {shortlist.length} profils
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => navigate(`/scout/comparison?ids=${shortlist.slice(0, 3).map((p) => p.id).join(",")}`)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold"
            style={{ borderColor: `${S.info}40`, color: S.info }}
            whileTap={{ scale: 0.96 }}
          >
            <GitCompare size={14} /> Comparer top 3
          </motion.button>
          <motion.button
            type="button"
            onClick={sendToCommittee}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: S.success }}
            whileTap={{ scale: 0.96 }}
          >
            <Send size={14} /> Envoyer au comité
          </motion.button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Profils shortlistés", value: shortlist.length, color: S.primary },
          { label: "Budget estimé", value: `${(totalBudget / 1000).toFixed(1)}M €`, color: S.warning },
          { label: "Potentiel moy.", value: shortlist.length ? Math.round(shortlist.reduce((a, p) => a + p.potential, 0) / shortlist.length) : 0, color: S.success },
          { label: "Score IA moy.", value: shortlist.length ? Math.round(shortlist.reduce((a, p) => a + p.aiScore, 0) / shortlist.length) : 0, color: S.accent },
        ].map((k) => (
          <SCard key={k.label} className="!p-3 text-center">
            <p className="text-xl font-extrabold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
          </SCard>
        ))}
      </div>

      {shortlist.length === 0 ? (
        <SCard className="!p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucun joueur en shortlist. Marquez des prospects en priorité A ou en validation.
          </p>
        </SCard>
      ) : (
        <div className="space-y-3">
          {shortlist.map((p, rank) => {
            const priority = PRIORITY_META[p.priority];
            return (
              <motion.div
                key={p.id}
                className="rounded-[20px] border p-4"
                style={{
                  background: rank === 0 ? `${S.primary}06` : "rgba(12,9,30,0.85)",
                  borderColor: rank === 0 ? `${S.primary}35` : "rgba(255,255,255,0.07)",
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rank * 0.05 }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black"
                    style={{
                      background: rank === 0 ? S.primary : "rgba(255,255,255,0.08)",
                      color: rank === 0 ? "white" : "var(--text-muted)",
                    }}>
                    #{rank + 1}
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                    style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}99)` }}>
                    {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>
                        {p.flag} {p.name}
                      </p>
                      <SBadge color={priority.color} bg={priority.bg}>P.{p.priority}</SBadge>
                      {rank === 0 && (
                        <SBadge color={S.success} bg={`${S.success}15`}>
                          <TrendingUp size={9} className="inline mr-1" />Recommandé
                        </SBadge>
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {p.position} · {p.age} ans · {p.club} · {p.league}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-4">
                      <div className="min-w-[100px]">
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span style={{ color: "var(--text-muted)" }}>Potentiel</span>
                          <span className="font-bold" style={{ color: S.primary }}>{p.potential}</span>
                        </div>
                        <SGauge value={p.potential} color={S.primary} />
                      </div>
                      <div className="min-w-[100px]">
                        <div className="flex justify-between text-[9px] mb-0.5">
                          <span style={{ color: "var(--text-muted)" }}>Score IA</span>
                          <span className="font-bold" style={{ color: S.accent }}>{p.aiScore}</span>
                        </div>
                        <SGauge value={p.aiScore} color={S.accent} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold" style={{ color: S.primary }}>{p.marketValue}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Valeur marché</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <motion.button type="button" onClick={() => navigate(`/scout/prospect/${p.id}`)}
                      className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold text-white"
                      style={{ background: S.primary }}
                      whileTap={{ scale: 0.95 }}>
                      <Eye size={11} /> Profil
                    </motion.button>
                    <motion.button type="button" onClick={() => navigate("/scout/report")}
                      className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] font-bold"
                      style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}
                      whileTap={{ scale: 0.95 }}>
                      <FileText size={11} /> Rapport
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </ScoutPage>
  );
}
