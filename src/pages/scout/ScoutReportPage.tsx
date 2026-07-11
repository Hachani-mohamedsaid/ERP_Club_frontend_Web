import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, Brain, Star, TrendingUp, AlertTriangle, ChevronDown } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { ScoutPage, SCard, SGauge } from "../../components/scout/ScoutUI";
import { S } from "../../data/scoutData";
import { showToast } from "../../components/scout/ScoutToast";
import { scoutApi, type ScoutProspectDto } from "../../lib/api/scout";

const DECISIONS = [
  { value: "recruit",  label: "Recruter",       emoji: "✅", color: S.success },
  { value: "observe",  label: "Observer encore", emoji: "👀", color: "#F59E0B" },
  { value: "shortlist",label: "Shortlist",       emoji: "📋", color: S.info    },
  { value: "refuse",   label: "Refuser",         emoji: "❌", color: S.danger  },
];

const PROSPECTS_LIST_FALLBACK = [
  { id: "pr1", name: "Youssef Ben Ali",  pos: "BU",      flag: "🇹🇳", base: 89 },
  { id: "pr2", name: "Nader Trabelsi",   pos: "MC",      flag: "🇹🇳", base: 84 },
  { id: "pr3", name: "Mouhamed Diallo",  pos: "Ailier G",flag: "🇨🇮", base: 81 },
  { id: "pr4", name: "Karim Sassi",      pos: "DC",      flag: "🇹🇳", base: 78 },
  { id: "pr6", name: "Ibrahim Touré",    pos: "MC",      flag: "🇸🇳", base: 86 },
];

function computeScore(skills: Record<string, number>, base: number): { score: number; decision: string; decisionColor: string; stars: number; reasoning: string[] } {
  const avg = Object.values(skills).reduce((a, b) => a + b, 0) / Object.values(skills).length;
  const score = Math.round(avg * 0.5 + base * 0.5);

  let decision = "observer";
  let decisionColor = "#F59E0B";
  if (score >= 82) { decision = "Recruter";           decisionColor = S.success; }
  else if (score >= 76) { decision = "Shortlist";     decisionColor = S.info;    }
  else if (score >= 68) { decision = "Observer encore"; decisionColor = "#F59E0B"; }
  else                  { decision = "Refuser";       decisionColor = S.danger;  }

  const stars = score >= 88 ? 5 : score >= 82 ? 4 : score >= 76 ? 3 : score >= 68 ? 2 : 1;

  const reasoning: string[] = [];
  if (skills.technique >= 75) reasoning.push(`Technique solide (${skills.technique}/100)`);
  if (skills.vitesse >= 80)   reasoning.push(`Vitesse explosive (${skills.vitesse}/100)`);
  if (skills.physique >= 75)  reasoning.push(`Physique au-dessus de la moyenne (${skills.physique}/100)`);
  if (skills.mental >= 70)    reasoning.push(`Maturité mentale notée (${skills.mental}/100)`);
  if (skills.tactique >= 70)  reasoning.push(`Bonne lecture tactique (${skills.tactique}/100)`);
  if (Object.values(skills).some(v => v < 50)) reasoning.push("Certains attributs nécessitent travail");

  return { score, decision, decisionColor, stars, reasoning };
}

export function ScoutReportPage() {
  const [prospectOptions, setProspectOptions] = useState(PROSPECTS_LIST_FALLBACK);
  const [selectedProspect, setSelectedProspect] = useState(PROSPECTS_LIST_FALLBACK[0]);
  const [showProspectList, setShowProspectList] = useState(false);
  const [report, setReport] = useState({
    date: new Date().toISOString().split("T")[0],
    match: "",
    opponent: "",
    technique: 65,
    physique: 60,
    mental: 60,
    tactique: 55,
    vitesse: 70,
    strengths: "",
    weaknesses: "",
    recommendation: "",
    decision: "observe",
  });

  const [aiResult, setAiResult] = useState<null | ReturnType<typeof computeScore>>(null);
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    scoutApi.getProspects().then((list: ScoutProspectDto[]) => {
      if (list.length === 0) return;
      const opts = list.map((p) => ({
        id: p.id,
        name: p.name,
        pos: p.position,
        flag: p.flag,
        base: p.potential,
      }));
      setProspectOptions(opts);
      setSelectedProspect(opts[0]);
    }).catch(() => {});
  }, []);

  const skillValues = { technique: report.technique, physique: report.physique, mental: report.mental, tactique: report.tactique, vitesse: report.vitesse };
  const radarData = Object.entries(skillValues).map(([k, v]) => ({ subject: k.charAt(0).toUpperCase() + k.slice(1), A: v }));

  const generateScore = () => {
    setGenerating(true);
    setAiResult(null);
    setTimeout(() => {
      const result = computeScore(skillValues, selectedProspect.base);
      setAiResult(result);
      setGenerating(false);
      showToast(`Score IA généré: ${result.score}/100 — ${result.decision}`, "success");
    }, 1400);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await scoutApi.createReport({
        prospectId: selectedProspect.id,
        prospectName: selectedProspect.name,
        matchDate: report.date,
        matchObserved: report.match,
        opponent: report.opponent,
        technique: report.technique,
        physique: report.physique,
        mental: report.mental,
        tactique: report.tactique,
        vitesse: report.vitesse,
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        recommendation: report.recommendation,
        decision: report.decision,
        aiScore: aiResult?.score ?? null,
      });
      setSubmitted(true);
      showToast("Rapport envoyé avec succès ✓", "success");
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      showToast("Erreur lors de l'envoi du rapport", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const SKILL_COLORS: Record<string, string> = {
    technique: S.primary, physique: S.danger, mental: S.info, tactique: S.success, vitesse: "#F59E0B",
  };

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Rapport Scout</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Évaluation détaillée · Score IA généré automatiquement</p>
      </div>

      {/* Prospect selector */}
      <SCard className="!p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Joueur évalué</p>
        <div className="relative">
          <motion.button type="button" onClick={() => setShowProspectList(!showProspectList)}
            className="flex w-full items-center gap-3 rounded-xl border p-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: `${S.primary}30` }}
            whileHover={{ borderColor: `${S.primary}55` }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
              style={{ background: `linear-gradient(135deg,${S.primary},${S.primary}99)` }}>
              {selectedProspect.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{selectedProspect.flag} {selectedProspect.name}</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{selectedProspect.pos}</p>
            </div>
            <ChevronDown size={14} style={{ color: "var(--text-muted)", transform: showProspectList ? "rotate(180deg)" : "" }} />
          </motion.button>
          <AnimatePresence>
            {showProspectList && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute z-10 w-full mt-1 rounded-xl border overflow-hidden"
                style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}>
                {prospectOptions.map(p => (
                  <motion.button key={p.id} type="button" onClick={() => { setSelectedProspect(p); setShowProspectList(false); setAiResult(null); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                    whileHover={{ background: `${S.primary}10` }}>
                    <span>{p.flag}</span>
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                    <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>{p.pos}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SCard>

      {/* Match info */}
      <SCard className="!p-5">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Informations du match</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Date",          key: "date",     type: "date",  placeholder: "" },
            { label: "Match observé", key: "match",    type: "text",  placeholder: "AS Ariana vs ES Sahel" },
            { label: "Adversaire",    key: "opponent", type: "text",  placeholder: "ES Sahel" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <input type={f.type} placeholder={f.placeholder}
                value={report[f.key as keyof typeof report] as string}
                onChange={e => setReport({ ...report, [f.key]: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
            </div>
          ))}
        </div>
      </SCard>

      {/* Skills evaluation + live radar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
        <SCard className="!p-5">
          <p className="text-xs font-bold mb-4" style={{ color: "var(--text-primary)" }}>Évaluation des attributs (0–100)</p>
          <div className="space-y-4">
            {(["technique","physique","mental","tactique","vitesse"] as const).map(skill => {
              const color = SKILL_COLORS[skill];
              const val = report[skill] as number;
              return (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold capitalize" style={{ color: "var(--text-muted)" }}>{skill}</label>
                    <motion.span className="text-lg font-extrabold" style={{ color }}
                      key={val} initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
                      {val}
                    </motion.span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="range" min={0} max={100} value={val}
                      onChange={e => setReport({ ...report, [skill]: +e.target.value })}
                      className="flex-1 cursor-pointer h-2 rounded-full appearance-none"
                      style={{ accentColor: color }} />
                  </div>
                  <div className="mt-1">
                    <SGauge value={val} color={color} />
                  </div>
                </div>
              );
            })}
          </div>
        </SCard>

        {/* Live radar */}
        <SCard className="!p-5">
          <p className="text-[10px] font-bold mb-2" style={{ color: "var(--text-muted)" }}>Profil temps réel</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--text-muted)", fontSize: 8 }} />
                <Radar dataKey="A" stroke={S.primary} fill={S.primary} fillOpacity={0.2} strokeWidth={2} isAnimationActive />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <p className="text-2xl font-extrabold" style={{ color: S.primary }}>
              {Math.round(Object.values(skillValues).reduce((a, b) => a + b, 0) / 5)}
            </p>
            <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Moyenne session</p>
          </div>
        </SCard>
      </div>

      {/* Comments */}
      <SCard className="!p-5">
        <p className="text-xs font-bold mb-4" style={{ color: "var(--text-primary)" }}>Commentaires</p>
        <div className="space-y-3">
          {[
            { key: "strengths",      label: "Points forts",     placeholder: "Accélération, jeu de tête, pressing..." },
            { key: "weaknesses",     label: "Points faibles",   placeholder: "Positionnement défensif, pied gauche..." },
            { key: "recommendation", label: "Recommandation",   placeholder: "Recommandation globale du scout..." },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>{f.label}</label>
              <textarea value={report[f.key as keyof typeof report] as string}
                onChange={e => setReport({ ...report, [f.key]: e.target.value })}
                placeholder={f.placeholder} rows={2}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "var(--surface-panel-border)", color: "var(--text-primary)" }} />
            </div>
          ))}
        </div>
      </SCard>

      {/* Decision */}
      <SCard className="!p-5">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Décision préliminaire</p>
        <div className="flex flex-wrap gap-2">
          {DECISIONS.map(d => (
            <motion.button key={d.value} type="button" onClick={() => setReport({ ...report, decision: d.value })}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold"
              style={{
                background: report.decision === d.value ? `${d.color}15` : "rgba(255,255,255,0.03)",
                borderColor: report.decision === d.value ? `${d.color}50` : "rgba(255,255,255,0.1)",
                color: report.decision === d.value ? d.color : "var(--text-muted)",
              }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}>
              {d.emoji} {d.label}
            </motion.button>
          ))}
        </div>
      </SCard>

      {/* Generate AI Score button */}
      <motion.button type="button" onClick={generateScore} disabled={generating}
        className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-extrabold text-white"
        style={{
          background: `linear-gradient(135deg,${S.accent ?? "#6366F1"},${S.primary})`,
          boxShadow: `0 0 24px ${S.primary}40`,
          opacity: generating ? 0.7 : 1,
        }}
        whileHover={{ scale: generating ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}>
        <motion.div animate={generating ? { rotate: 360 } : { rotate: 0 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Brain size={20} />
        </motion.div>
        {generating ? "ODIN analyse le joueur..." : "Générer le Score IA"}
      </motion.button>

      {/* ── AI RESULT ── */}
      <AnimatePresence>
        {aiResult && !generating && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-[24px] border overflow-hidden"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: `${aiResult.decisionColor}35`,
              boxShadow: `0 0 48px ${aiResult.decisionColor}12`,
            }}>
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${aiResult.decisionColor},${S.primary})` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <motion.div className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: `linear-gradient(135deg,${S.accent ?? "#6366F1"},${S.primary})` }}
                  animate={{ scale: [1,1.1,1] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Brain size={22} className="text-white" />
                </motion.div>
                <div>
                  <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Résultat ODIN AI</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Analyse basée sur les critères fournis + données historiques
                  </p>
                </div>
              </div>

              {/* Big score + decision */}
              <div className="flex flex-wrap items-center gap-6 mb-5">
                <div className="text-center">
                  <motion.p className="text-6xl font-black leading-none" style={{ color: aiResult.decisionColor }}
                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 10 }}>
                    {aiResult.score}
                  </motion.p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Score sur 100</p>
                  <div className="flex justify-center gap-0.5 mt-1.5">
                    {[1,2,3,4,5].map(s => (
                      <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: s * 0.08 }}>
                        <Star size={14} fill={s <= aiResult.stars ? aiResult.decisionColor : "none"}
                          style={{ color: aiResult.decisionColor, opacity: s <= aiResult.stars ? 1 : 0.2 }} />
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Recommandation ODIN</p>
                  <motion.div className="flex items-center gap-3 rounded-2xl border px-5 py-3"
                    style={{ background: `${aiResult.decisionColor}10`, borderColor: `${aiResult.decisionColor}35` }}
                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <p className="text-xl font-extrabold" style={{ color: aiResult.decisionColor }}>
                      {aiResult.decision}
                    </p>
                    {aiResult.decision === "Recruter" && <TrendingUp size={20} style={{ color: aiResult.decisionColor }} />}
                    {aiResult.decision === "Refuser"  && <AlertTriangle size={20} style={{ color: aiResult.decisionColor }} />}
                    {aiResult.decision === "Shortlist" && <Star size={20} style={{ color: aiResult.decisionColor }} />}
                  </motion.div>
                  <div className="mt-2">
                    <SGauge value={aiResult.score} color={aiResult.decisionColor} />
                  </div>
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-1.5">
                {aiResult.reasoning.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2"
                    style={{ background: "rgba(34,197,94,0.04)", borderColor: "rgba(34,197,94,0.15)" }}>
                    <CheckCircle2 size={12} style={{ color: S.success }} />
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{r}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button type="button" onClick={() => void handleSubmit()} disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
        style={{ background: `linear-gradient(135deg,${S.success},${S.success}cc)`, boxShadow: `0 0 20px ${S.success}40`, opacity: submitting ? 0.7 : 1 }}
        whileHover={{ scale: submitting ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}>
        <Send size={16} />
        {submitted ? "Rapport envoyé ✓" : submitting ? "Envoi..." : "Envoyer le rapport"}
      </motion.button>
    </ScoutPage>
  );
}
