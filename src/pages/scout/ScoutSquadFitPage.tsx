import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Crosshair, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { ScoutPage, SCard, SGauge, SBadge } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { useScoutProspects } from "../../hooks/useScoutData";

const CLUB_NEEDS = [
  { poste: "BU", priorité: "Haute", profil: "Buteur mobile ≤22 ans", budget: "1.5M €" },
  { poste: "MC", priorité: "Moyenne", profil: "Milieu créateur / relayeur", budget: "900K €" },
  { poste: "DC", priorité: "Basse", profil: "Défenseur central grand", budget: "650K €" },
];

function fitScore(p: {
  position: string; age: number; potential: number; aiScore: number;
  valueMK: number; speed: number; passing: number;
}, needPoste: string): { score: number; reasons: string[]; warnings: string[] } {
  let score = 50;
  const reasons: string[] = [];
  const warnings: string[] = [];

  if (p.position === needPoste || (needPoste === "BU" && p.position.includes("BU"))) {
    score += 25;
    reasons.push(`Poste correspondant (${p.position})`);
  } else if (p.position.includes(needPoste.slice(0, 2))) {
    score += 12;
    reasons.push("Poste proche du besoin");
  } else {
    warnings.push(`Poste ${p.position} ≠ besoin ${needPoste}`);
  }

  if (p.age <= 22) { score += 10; reasons.push(`Profil jeune (${p.age} ans)`); }
  if (p.potential >= 85) { score += 10; reasons.push(`Potentiel élite (${p.potential})`); }
  if (p.aiScore >= 85) { score += 8; reasons.push(`Score IA élevé (${p.aiScore})`); }
  if (p.valueMK <= 1500) { score += 5; reasons.push("Dans le budget club"); }
  else warnings.push(`Budget élevé: ${p.valueMK}K €`);

  if (needPoste === "BU" && p.speed >= 85) reasons.push(`Vitesse adaptée (${p.speed})`);
  if (needPoste === "MC" && p.passing >= 85) reasons.push(`Passes (${p.passing})`);

  return { score: Math.min(100, score), reasons, warnings };
}

export function ScoutSquadFitPage() {
  const navigate = useNavigate();
  const { prospects, loading } = useScoutProspects();
  const [selectedNeed, setSelectedNeed] = useState(0);

  const need = CLUB_NEEDS[selectedNeed];

  const matches = useMemo(() => {
    return prospects
      .map((p) => ({ ...p, fit: fitScore(p, need.poste) }))
      .sort((a, b) => b.fit.score - a.fit.score);
  }, [prospects, need.poste]);

  const radarNeed = [
    { subject: "Potentiel", need: 85, best: matches[0]?.potential ?? 0 },
    { subject: "Vitesse", need: need.poste === "BU" ? 88 : 70, best: matches[0]?.speed ?? 0 },
    { subject: "Technique", need: 75, best: matches[0]?.dribble ?? 0 },
    { subject: "Physique", need: 78, best: matches[0]?.physical ?? 0 },
    { subject: "Mental", need: 80, best: matches[0]?.mental ?? 0 },
  ];

  if (loading) {
    return (
      <ScoutPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement...</p>
      </ScoutPage>
    );
  }

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Crosshair size={20} style={{ color: S.primary }} /> Compatibilité Effectif
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Matching automatique prospects ↔ besoins du club
        </p>
      </div>

      {/* Club needs */}
      <div className="flex flex-wrap gap-2">
        {CLUB_NEEDS.map((n, i) => (
          <motion.button key={n.poste} type="button" onClick={() => setSelectedNeed(i)}
            className="rounded-xl border px-4 py-3 text-left"
            style={{
              background: selectedNeed === i ? `${S.primary}10` : "rgba(12,9,30,0.85)",
              borderColor: selectedNeed === i ? `${S.primary}50` : "rgba(255,255,255,0.07)",
            }}
            whileTap={{ scale: 0.98 }}>
            <p className="text-sm font-extrabold" style={{ color: selectedNeed === i ? S.primary : "var(--text-primary)" }}>
              {n.poste}
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{n.profil}</p>
            <p className="text-[10px] font-bold mt-1" style={{ color: S.warning }}>{n.budget}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          {matches.map((p, rank) => {
            const fitColor = p.fit.score >= 80 ? S.success : p.fit.score >= 65 ? S.primary : S.warning;
            return (
              <motion.div key={p.id}
                className="rounded-[18px] border p-4 cursor-pointer"
                style={{
                  background: rank === 0 ? `${fitColor}06` : "rgba(12,9,30,0.85)",
                  borderColor: rank === 0 ? `${fitColor}35` : "rgba(255,255,255,0.07)",
                }}
                whileHover={{ y: -2 }}
                onClick={() => navigate(`/scout/prospect/${p.id}`)}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-2xl font-black w-10 text-center" style={{ color: fitColor }}>
                    {p.fit.score}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {p.flag} {p.name}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {p.position} · {p.age} ans · {p.marketValue}
                    </p>
                    <div className="mt-2">
                      <SGauge value={p.fit.score} color={fitColor} />
                    </div>
                  </div>
                  {rank === 0 && (
                    <SBadge color={S.success} bg={`${S.success}15`}>Meilleur fit</SBadge>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.fit.reasons.slice(0, 3).map((r) => (
                    <span key={r} className="flex items-center gap-1 text-[9px] rounded-full px-2 py-0.5"
                      style={{ background: `${S.success}10`, color: S.success }}>
                      <CheckCircle2 size={9} /> {r}
                    </span>
                  ))}
                  {p.fit.warnings.slice(0, 1).map((w) => (
                    <span key={w} className="flex items-center gap-1 text-[9px] rounded-full px-2 py-0.5"
                      style={{ background: `${S.warning}10`, color: S.warning }}>
                      <AlertTriangle size={9} /> {w}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <SCard className="!p-4 h-fit sticky top-4">
          <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Besoin: {need.poste}
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarNeed}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 8 }} />
                <Radar name="Besoin club" dataKey="need" stroke={S.warning} fill={S.warning} fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
                <Radar name="Meilleur match" dataKey="best" stroke={S.success} fill={S.success} fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: "var(--text-muted)" }}>
            — — Besoin club · — Meilleur candidat
          </p>
        </SCard>
      </div>
    </ScoutPage>
  );
}
