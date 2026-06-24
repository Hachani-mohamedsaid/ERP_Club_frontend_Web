import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ClubPageTransition } from "../../components/club/ClubPageTransition";
import { ClubKpiCard } from "../../components/club/ClubKpiCard";
import { ClubEmptyState } from "../../components/club/ClubEmptyState";
import { ClubFormModal } from "../../components/club/ClubFormModal";
import { ClubHeatInjuryMap } from "../../components/club/ClubHeatInjuryMap";
import { CountUpStat } from "../../components/player/CountUpStat";
import { PlayerAvatar } from "../../components/player/PlayerAvatar";
import { clubApi } from "../../lib/api/club";
import { useClubResource } from "../../hooks/useClubResource";
import { usePermissions } from "../../hooks/usePermissions";

interface InjuryData {
  kpis: { injured: number; available: number; avgRisk: number };
  injured: { name: string; injury: string; returnDate: string; riskIA: number }[];
}

export function ClubSantePage() {
  const { can } = usePermissions();
  const { data, loading, error, reload } = useClubResource(() => clubApi.getInjuries() as Promise<InjuryData>);
  const [showAdd, setShowAdd] = useState(false);
  const kpis = data?.kpis ?? { injured: 0, available: 0, avgRisk: 0 };
  const injured = data?.injured ?? [];

  const kpiCards = [
    { label: "Blessés", value: kpis.injured, color: "#EF4444" },
    { label: "Disponibles", value: kpis.available, color: "#22C55E" },
    { label: "Risque moyen IA", value: kpis.avgRisk, color: "#F59E0B", suffix: "/10" },
  ];

  return (
    <ClubPageTransition>
      <div className="mb-4 flex justify-end">
        {can("Sante", "créer") && (
          <button type="button" onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}>
            <Plus size={16} /> Ajouter blessure
          </button>
        )}
      </div>

      {loading && <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid grid-cols-3 gap-4">
        {kpiCards.map((kpi, i) => (
          <ClubKpiCard key={kpi.label} delay={i * 0.05}>
            <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{kpi.label}</p>
            <p className="mt-2 text-2xl font-bold" style={{ color: kpi.color }}>
              <CountUpStat end={kpi.value} suffix={kpi.suffix ?? ""} />
            </p>
          </ClubKpiCard>
        ))}
      </div>

      <ClubKpiCard delay={0.08} hover={false}>
        <ClubHeatInjuryMap />
      </ClubKpiCard>

      <ClubKpiCard delay={0.1} hover={false}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Liste Blessés</h3>
        {injured.length === 0 ? (
          <ClubEmptyState title="Aucune blessure" description="L'effectif est au complet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Joueur", "Blessure", "Retour prévu", "Risk IA"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {injured.map((p, i) => (
                  <motion.tr key={p.name + i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <PlayerAvatar name={p.name} size={32} />
                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#EF4444" }}>{p.injury}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>{p.returnDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={12} style={{ color: "#F59E0B" }} />
                        <span className="font-semibold" style={{ color: p.riskIA >= 7 ? "#EF4444" : "#F59E0B" }}>{p.riskIA}/10</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ClubKpiCard>

      <AnimatePresence>
        {showAdd && (
          <ClubFormModal
            title="Enregistrer une blessure"
            fields={[
              { key: "playerName", label: "Joueur" },
              { key: "injuryType", label: "Type de blessure" },
              { key: "bodyPart", label: "Zone" },
              { key: "returnDate", label: "Retour prévu", type: "date" },
              { key: "riskScore", label: "Score risque IA (0-10)", type: "number" },
            ]}
            onClose={() => setShowAdd(false)}
            onSubmit={async (v) => {
              await clubApi.createInjury({
                playerName: v.playerName,
                injuryType: v.injuryType,
                bodyPart: v.bodyPart,
                returnDate: v.returnDate,
                riskScore: Number(v.riskScore) || 0,
              });
              await reload();
            }}
          />
        )}
      </AnimatePresence>
    </ClubPageTransition>
  );
}
