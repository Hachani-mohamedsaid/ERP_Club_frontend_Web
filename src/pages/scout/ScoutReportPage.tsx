import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Send, CheckCircle2, Brain, Star, TrendingUp, AlertTriangle, ChevronDown, Search, MapPin,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from "recharts";
import { ScoutPage, SCard, SGauge } from "../../components/scout/ScoutUI";
import { ScoutPlayerPhoto, resolveScoutPhotoUrl } from "../../components/scout/ScoutPlayerPhoto";
import { S } from "../../data/scoutData";
import { showToast } from "../../components/scout/ScoutToast";
import { scoutApi, type ScoutProspectDto } from "../../lib/api/scout";

const DECISIONS = [
  { value: "recruit", label: "Recruter", emoji: "✅", color: S.success },
  { value: "observe", label: "Observer encore", emoji: "👀", color: "#F59E0B" },
  { value: "shortlist", label: "Shortlist", emoji: "📋", color: S.info },
  { value: "refuse", label: "Refuser", emoji: "❌", color: S.danger },
] as const;

type DecisionValue = (typeof DECISIONS)[number]["value"];

type ProspectOption = {
  id: string;
  name: string;
  pos: string;
  flag: string;
  club: string;
  league: string;
  age: number;
  base: number;
  aiScore: number;
  photoUrl?: string;
  technique: number;
  physique: number;
  mental: number;
  tactique: number;
  vitesse: number;
};

const SKILL_COLORS: Record<string, string> = {
  technique: S.primary,
  physique: S.danger,
  mental: S.info,
  tactique: S.success,
  vitesse: "#F59E0B",
};

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function toOption(p: ScoutProspectDto): ProspectOption {
  return {
    id: p.id,
    name: p.name,
    pos: p.position,
    flag: p.flag,
    club: p.club,
    league: p.league,
    age: p.age,
    base: p.potential,
    aiScore: p.aiScore,
    photoUrl: p.photoUrl,
    technique: clampScore((p.dribble + p.passing) / 2),
    physique: clampScore(p.physical),
    mental: clampScore(p.mental),
    tactique: clampScore((p.defense + p.passing) / 2),
    vitesse: clampScore(p.speed),
  };
}

function suggestMatch(club: string) {
  const rivals: Record<string, string> = {
    "real madrid": "Barcelona",
    barcelona: "Real Madrid",
    arsenal: "Chelsea",
    chelsea: "Arsenal",
    liverpool: "Manchester City",
    "manchester city": "Liverpool",
    "manchester united": "Liverpool",
    "ajax amsterdam": "Feyenoord",
    "as monaco": "PSG",
    "crystal palace": "Brighton",
    brighton: "Crystal Palace",
    "ipswich town": "Norwich",
    "rb salzburg": "Sturm Graz",
    "us lecce": "Napoli",
    "paris fc": "PSG",
    burnley: "Sheffield United",
    "leeds united": "Sheffield Wednesday",
    palmeiras: "Flamengo",
  };
  const key = club.toLowerCase().trim();
  const opponent =
    rivals[key] ??
    Object.entries(rivals).find(([k]) => key.includes(k) || k.includes(key))?.[1] ??
    "Adversaire";
  return {
    match: `${club} vs ${opponent}`,
    opponent,
  };
}

function decisionFromLabel(label: string): DecisionValue {
  if (label === "Recruter") return "recruit";
  if (label === "Shortlist") return "shortlist";
  if (label === "Refuser") return "refuse";
  return "observe";
}

function computeScore(
  skills: Record<string, number>,
  prospect: ProspectOption,
): {
  score: number;
  decision: string;
  decisionValue: DecisionValue;
  decisionColor: string;
  stars: number;
  reasoning: string[];
} {
  const values = Object.values(skills);
  const sessionAvg = values.reduce((a, b) => a + b, 0) / values.length;
  const profileBase = (prospect.base * 0.55 + prospect.aiScore * 0.45);
  const score = clampScore(sessionAvg * 0.55 + profileBase * 0.45);

  let decision = "Observer encore";
  let decisionColor = "#F59E0B";
  if (score >= 82) {
    decision = "Recruter";
    decisionColor = S.success;
  } else if (score >= 76) {
    decision = "Shortlist";
    decisionColor = S.info;
  } else if (score >= 68) {
    decision = "Observer encore";
    decisionColor = "#F59E0B";
  } else {
    decision = "Refuser";
    decisionColor = S.danger;
  }

  const stars = score >= 88 ? 5 : score >= 82 ? 4 : score >= 76 ? 3 : score >= 68 ? 2 : 1;

  const reasoning: string[] = [];
  reasoning.push(`Profil ${prospect.name} · ${prospect.club} · pot. ${prospect.base}`);
  if (skills.technique >= 75) reasoning.push(`Technique solide (${skills.technique}/100)`);
  if (skills.vitesse >= 80) reasoning.push(`Vitesse explosive (${skills.vitesse}/100)`);
  if (skills.physique >= 75) reasoning.push(`Physique au-dessus de la moyenne (${skills.physique}/100)`);
  if (skills.mental >= 70) reasoning.push(`Maturité mentale notée (${skills.mental}/100)`);
  if (skills.tactique >= 70) reasoning.push(`Bonne lecture tactique (${skills.tactique}/100)`);
  if (sessionAvg < 60) reasoning.push("Performance session en dessous du potentiel catalogue");
  if (values.some((v) => v < 50)) reasoning.push("Certains attributs nécessitent travail");
  if (reasoning.length < 2) reasoning.push(`Score IA catalogue ${prospect.aiScore}/100 pris en compte`);

  return {
    score,
    decision,
    decisionValue: decisionFromLabel(decision),
    decisionColor,
    stars,
    reasoning: reasoning.slice(0, 5),
  };
}

function applyProspectToForm(p: ProspectOption) {
  const suggested = suggestMatch(p.club);
  return {
    date: new Date().toISOString().split("T")[0],
    match: suggested.match,
    opponent: suggested.opponent,
    technique: p.technique,
    physique: p.physique,
    mental: p.mental,
    tactique: p.tactique,
    vitesse: p.vitesse,
    strengths: "",
    weaknesses: "",
    recommendation: "",
    decision: "observe" as DecisionValue,
  };
}

export function ScoutReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [prospectOptions, setProspectOptions] = useState<ProspectOption[]>([]);
  const [selectedProspect, setSelectedProspect] = useState<ProspectOption | null>(null);
  const [showProspectList, setShowProspectList] = useState(false);
  const [playerQuery, setPlayerQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(applyProspectToForm({
    id: "",
    name: "",
    pos: "MC",
    flag: "🏳️",
    club: "Club",
    league: "",
    age: 0,
    base: 70,
    aiScore: 70,
    technique: 65,
    physique: 60,
    mental: 60,
    tactique: 55,
    vitesse: 70,
  }));
  const [aiResult, setAiResult] = useState<null | ReturnType<typeof computeScore>>(null);
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectProspect = useCallback((p: ProspectOption) => {
    setSelectedProspect(p);
    setReport(applyProspectToForm(p));
    setAiResult(null);
    setShowProspectList(false);
    setPlayerQuery("");
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    scoutApi
      .getProspects()
      .then((list: ScoutProspectDto[]) => {
        if (cancelled) return;
        const opts = list.map(toOption);
        setProspectOptions(opts);
        const wanted =
          searchParams.get("prospectId") ||
          searchParams.get("id") ||
          searchParams.get("prospect");
        const fromUrl = wanted ? opts.find((o) => o.id === wanted) : null;
        if (opts.length > 0) selectProspect(fromUrl ?? opts[0]);
        else setSelectedProspect(null);
      })
      .catch(() => {
        if (!cancelled) showToast("Impossible de charger les prospects", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams, selectProspect]);

  const filteredOptions = useMemo(() => {
    const q = playerQuery.trim().toLowerCase();
    if (!q) return prospectOptions;
    return prospectOptions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        p.pos.toLowerCase().includes(q),
    );
  }, [prospectOptions, playerQuery]);

  const skillValues = {
    technique: report.technique,
    physique: report.physique,
    mental: report.mental,
    tactique: report.tactique,
    vitesse: report.vitesse,
  };
  const sessionAvg = Math.round(
    Object.values(skillValues).reduce((a, b) => a + b, 0) / 5,
  );
  const radarData = Object.entries(skillValues).map(([k, v]) => ({
    subject: k.charAt(0).toUpperCase() + k.slice(1),
    A: v,
  }));

  const generateScore = () => {
    if (!selectedProspect) {
      showToast("Sélectionnez un joueur", "error");
      return;
    }
    setGenerating(true);
    setAiResult(null);
    window.setTimeout(() => {
      const result = computeScore(skillValues, selectedProspect);
      setAiResult(result);
      setReport((prev) => ({ ...prev, decision: result.decisionValue }));
      setGenerating(false);
      showToast(`Score IA: ${result.score}/100 — ${result.decision}`, "success");
    }, 900);
  };

  const handleSubmit = async () => {
    if (!selectedProspect) {
      showToast("Sélectionnez un joueur", "error");
      return;
    }
    if (!report.match.trim() || !report.opponent.trim()) {
      showToast("Renseignez le match et l'adversaire", "error");
      return;
    }
    if (!report.recommendation.trim() && !aiResult) {
      showToast("Ajoutez une recommandation ou générez le Score IA", "info");
      return;
    }

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
        recommendation:
          report.recommendation ||
          (aiResult ? `ODIN: ${aiResult.decision} (${aiResult.score}/100)` : ""),
        decision: report.decision,
        aiScore: aiResult?.score ?? sessionAvg,
      });
      setSubmitted(true);
      showToast(`Rapport ${selectedProspect.name} envoyé ✓`, "success");
      window.setTimeout(() => navigate("/scout/reports"), 1200);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur envoi du rapport", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScoutPage>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Chargement des prospects…</p>
      </ScoutPage>
    );
  }

  if (!selectedProspect) {
    return (
      <ScoutPage>
        <SCard className="!p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aucun prospect dans l&apos;annuaire. Importez un joueur depuis la Recherche.
          </p>
        </SCard>
      </ScoutPage>
    );
  }

  return (
    <ScoutPage>
      <div>
        <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Rapport Scout</h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          Évaluation live · attributs du profil · score IA dynamique · saison 2026-2027
        </p>
      </div>

      <SCard className="!p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
          Joueur évalué
        </p>
        <div className="relative">
          <motion.button
            type="button"
            onClick={() => setShowProspectList(!showProspectList)}
            className="flex w-full items-center gap-3 rounded-xl border p-3"
            style={{ background: "rgba(255,255,255,0.03)", borderColor: `${S.primary}30` }}
            whileHover={{ borderColor: `${S.primary}55` }}
          >
            <ScoutPlayerPhoto
              name={selectedProspect.name}
              photoUrl={resolveScoutPhotoUrl(selectedProspect.name, selectedProspect.photoUrl, prospectOptions)}
              size={48}
              accent={S.primary}
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {selectedProspect.flag} {selectedProspect.name}
              </p>
              <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                <MapPin size={10} />
                {selectedProspect.pos} · {selectedProspect.age} ans · {selectedProspect.club}
                {selectedProspect.league ? ` · ${selectedProspect.league}` : ""}
              </p>
            </div>
            <div className="text-right shrink-0 mr-1">
              <p className="text-lg font-extrabold" style={{ color: S.primary }}>{selectedProspect.base}</p>
              <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>Potentiel</p>
            </div>
            <ChevronDown
              size={14}
              style={{
                color: "var(--text-muted)",
                transform: showProspectList ? "rotate(180deg)" : undefined,
                transition: "transform 0.2s",
              }}
            />
          </motion.button>

          <AnimatePresence>
            {showProspectList && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute z-20 w-full mt-1 rounded-xl border overflow-hidden shadow-xl"
                style={{ background: "var(--surface-panel-solid)", borderColor: "var(--surface-panel-border)" }}
              >
                <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "var(--surface-panel-border)" }}>
                  <Search size={12} style={{ color: "var(--text-muted)" }} />
                  <input
                    autoFocus
                    value={playerQuery}
                    onChange={(e) => setPlayerQuery(e.target.value)}
                    placeholder="Filtrer nom, club, poste…"
                    className="flex-1 bg-transparent text-xs outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <p className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>Aucun résultat</p>
                  ) : (
                    filteredOptions.map((p) => (
                      <motion.button
                        key={p.id}
                        type="button"
                        onClick={() => selectProspect(p)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                          background: p.id === selectedProspect.id ? `${S.primary}12` : undefined,
                        }}
                        whileHover={{ background: `${S.primary}10` }}
                      >
                        <ScoutPlayerPhoto
                          name={p.name}
                          photoUrl={resolveScoutPhotoUrl(p.name, p.photoUrl, prospectOptions)}
                          size={32}
                          accent={S.primary}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {p.flag} {p.name}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                            {p.pos} · {p.club}
                          </p>
                        </div>
                        <span className="text-xs font-bold" style={{ color: S.primary }}>{p.base}</span>
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SCard>

      <SCard className="!p-5">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Informations du match</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Date", key: "date" as const, type: "date", placeholder: "" },
            {
              label: "Match observé",
              key: "match" as const,
              type: "text",
              placeholder: `${selectedProspect.club} vs …`,
            },
            {
              label: "Adversaire",
              key: "opponent" as const,
              type: "text",
              placeholder: "Club adverse",
            },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={report[f.key]}
                onChange={(e) => {
                  setReport({ ...report, [f.key]: e.target.value });
                  setAiResult(null);
                }}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          ))}
        </div>
      </SCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
        <SCard className="!p-5">
          <p className="text-xs font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Évaluation des attributs (0–100) — préremplie depuis le profil
          </p>
          <div className="space-y-4">
            {(["technique", "physique", "mental", "tactique", "vitesse"] as const).map((skill) => {
              const color = SKILL_COLORS[skill];
              const val = report[skill];
              return (
                <div key={skill}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold capitalize" style={{ color: "var(--text-muted)" }}>
                      {skill}
                    </label>
                    <motion.span
                      className="text-lg font-extrabold"
                      style={{ color }}
                      key={val}
                      initial={{ scale: 1.35 }}
                      animate={{ scale: 1 }}
                    >
                      {val}
                    </motion.span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={val}
                    onChange={(e) => {
                      setReport({ ...report, [skill]: +e.target.value });
                      setAiResult(null);
                    }}
                    className="w-full cursor-pointer h-2 rounded-full appearance-none"
                    style={{ accentColor: color }}
                  />
                  <div className="mt-1">
                    <SGauge value={val} color={color} />
                  </div>
                </div>
              );
            })}
          </div>
        </SCard>

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
            <p className="text-2xl font-extrabold" style={{ color: S.primary }}>{sessionAvg}</p>
            <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>Moyenne session</p>
          </div>
        </SCard>
      </div>

      <SCard className="!p-5">
        <p className="text-xs font-bold mb-4" style={{ color: "var(--text-primary)" }}>Commentaires</p>
        <div className="space-y-3">
          {[
            { key: "strengths" as const, label: "Points forts", placeholder: "Accélération, pressing, 1v1…" },
            { key: "weaknesses" as const, label: "Points faibles", placeholder: "Défense, constance, pied faible…" },
            { key: "recommendation" as const, label: "Recommandation", placeholder: `Recommandation pour ${selectedProspect.name}…` },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold uppercase tracking-wide block mb-1.5" style={{ color: "var(--text-muted)" }}>
                {f.label}
              </label>
              <textarea
                value={report[f.key]}
                onChange={(e) => setReport({ ...report, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                rows={2}
                className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          ))}
        </div>
      </SCard>

      <SCard className="!p-5">
        <p className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Décision préliminaire</p>
        <div className="flex flex-wrap gap-2">
          {DECISIONS.map((d) => (
            <motion.button
              key={d.value}
              type="button"
              onClick={() => setReport({ ...report, decision: d.value })}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold"
              style={{
                background: report.decision === d.value ? `${d.color}15` : "rgba(255,255,255,0.03)",
                borderColor: report.decision === d.value ? `${d.color}50` : "rgba(255,255,255,0.1)",
                color: report.decision === d.value ? d.color : "var(--text-muted)",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
            >
              {d.emoji} {d.label}
            </motion.button>
          ))}
        </div>
      </SCard>

      <motion.button
        type="button"
        onClick={generateScore}
        disabled={generating}
        className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-extrabold text-white"
        style={{
          background: `linear-gradient(135deg,${S.accent ?? "#6366F1"},${S.primary})`,
          boxShadow: `0 0 24px ${S.primary}40`,
          opacity: generating ? 0.7 : 1,
        }}
        whileHover={{ scale: generating ? 1 : 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.div
          animate={generating ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Brain size={20} />
        </motion.div>
        {generating ? "ODIN analyse le joueur…" : "Générer le Score IA"}
      </motion.button>

      <AnimatePresence>
        {aiResult && !generating && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-[24px] border overflow-hidden"
            style={{
              background: "var(--surface-panel-solid)",
              borderColor: `${aiResult.decisionColor}35`,
              boxShadow: `0 0 48px ${aiResult.decisionColor}12`,
            }}
          >
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${aiResult.decisionColor},${S.primary})` }} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: `linear-gradient(135deg,${S.accent ?? "#6366F1"},${S.primary})` }}
                >
                  <Brain size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold" style={{ color: "var(--text-primary)" }}>Résultat ODIN AI</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Session {sessionAvg} + potentiel {selectedProspect.base} + IA catalogue {selectedProspect.aiScore}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mb-5">
                <div className="text-center">
                  <motion.p
                    className="text-6xl font-black leading-none"
                    style={{ color: aiResult.decisionColor }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 10 }}
                  >
                    {aiResult.score}
                  </motion.p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Score sur 100</p>
                  <div className="flex justify-center gap-0.5 mt-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= aiResult.stars ? aiResult.decisionColor : "none"}
                        style={{ color: aiResult.decisionColor, opacity: s <= aiResult.stars ? 1 : 0.2 }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Recommandation ODIN</p>
                  <div
                    className="flex items-center gap-3 rounded-2xl border px-5 py-3"
                    style={{ background: `${aiResult.decisionColor}10`, borderColor: `${aiResult.decisionColor}35` }}
                  >
                    <p className="text-xl font-extrabold" style={{ color: aiResult.decisionColor }}>
                      {aiResult.decision}
                    </p>
                    {aiResult.decision === "Recruter" && <TrendingUp size={20} style={{ color: aiResult.decisionColor }} />}
                    {aiResult.decision === "Refuser" && <AlertTriangle size={20} style={{ color: aiResult.decisionColor }} />}
                    {aiResult.decision === "Shortlist" && <Star size={20} style={{ color: aiResult.decisionColor }} />}
                  </div>
                  <div className="mt-2">
                    <SGauge value={aiResult.score} color={aiResult.decisionColor} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                {aiResult.reasoning.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2"
                    style={{ background: "rgba(34,197,94,0.04)", borderColor: "rgba(34,197,94,0.15)" }}
                  >
                    <CheckCircle2 size={12} style={{ color: S.success }} />
                    <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={submitting || submitted}
        className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white"
        style={{
          background: `linear-gradient(135deg,${S.success},${S.success}cc)`,
          boxShadow: `0 0 20px ${S.success}40`,
          opacity: submitting || submitted ? 0.75 : 1,
        }}
        whileHover={{ scale: submitting || submitted ? 1 : 1.02 }}
        whileTap={{ scale: 0.97 }}
      >
        <Send size={16} />
        {submitted ? "Rapport envoyé ✓" : submitting ? "Envoi…" : "Envoyer le rapport"}
      </motion.button>
    </ScoutPage>
  );
}
