import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Loader2,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi } from "../../lib/api/club";
import { apiFetch } from "../../lib/api/authHeaders";

const RESOLVED_KEY = "odin_resolved_injuries";
const PHASES_KEY = "odin_reeducation_phases";
const NOTES_KEY = "odin_reeducation_notes";
const EVALS_KEY = "odin_reeducation_evals";

const PHASES = {
  1: {
    label: "Phase 1 — Immobilisation",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    objective:
      "Protéger le tissu lésé, réduire la douleur et l'inflammation, restaurer la fonction de base.",
    threshold: 85,
    criteria: [
      { key: "pain", label: "Douleur", weight: 0.3, target: "≤ 2/10" },
      { key: "swelling", label: "Œdème", weight: 0.2, target: "Aucun ou minimal" },
      { key: "rom", label: "Amplitude articulaire", weight: 0.25, target: "≥ 85% du normal" },
      { key: "mobility", label: "Mobilité fonctionnelle", weight: 0.15, target: "Marche normale" },
      { key: "healing", label: "Cicatrisation", weight: 0.1, target: "Progression normale" },
    ],
    mandatoryCriteria: ["pain", "swelling"],
  },
  2: {
    label: "Phase 2 — Renforcement",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    border: "rgba(139,92,246,0.25)",
    objective:
      "Restaurer la force, l'équilibre et la qualité du mouvement. Préparer aux activités sportives spécifiques.",
    threshold: 90,
    criteria: [
      { key: "strength", label: "Force musculaire", weight: 0.3, target: "≥ 90% côté sain" },
      { key: "functional", label: "Tests fonctionnels", weight: 0.25, target: "Tous réussis" },
      { key: "balance", label: "Équilibre & stabilité", weight: 0.15, target: "Normal" },
      { key: "running", label: "Progression course", weight: 0.15, target: "Sans douleur" },
      { key: "recovery", label: "Récupération", weight: 0.1, target: "Fatigue normale" },
      { key: "confidence", label: "Confiance psychologique", weight: 0.05, target: "Élevée" },
    ],
    mandatoryCriteria: ["strength", "functional"],
  },
  3: {
    label: "Retour terrain",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.25)",
    objective:
      "Confirmer que le joueur est médicalement et physiquement prêt pour la compétition sans restriction.",
    threshold: 95,
    criteria: [
      { key: "sport", label: "Performance sportive", weight: 0.3, target: "Complétée avec succès" },
      { key: "training", label: "Entraînement équipe", weight: 0.25, target: "100% participation" },
      { key: "clinical", label: "Examen clinique", weight: 0.2, target: "Normal" },
      { key: "physical", label: "Performance physique", weight: 0.15, target: "Objectifs atteints" },
      { key: "psych", label: "Préparation psychologique", weight: 0.1, target: "Confiance totale" },
    ],
    mandatoryCriteria: ["sport", "clinical"],
  },
} as const;

type PhaseNum = 1 | 2 | 3;

const PAIN_SCORES: Record<number, number> = {
  0: 100,
  1: 95,
  2: 90,
  3: 75,
  4: 60,
  5: 40,
  6: 30,
  7: 20,
  8: 10,
  9: 5,
  10: 0,
};

const SWELLING_SCORES: Record<string, number> = {
  Aucun: 100,
  Minimal: 80,
  Modéré: 50,
  Sévère: 20,
};

const OPTION_SCORES: Record<string, number> = {
  Normal: 100,
  Bon: 85,
  Acceptable: 70,
  Limité: 50,
  Faible: 40,
  Mauvais: 20,
  Absent: 0,
  Élevée: 100,
  Modérée: 70,
  "Tous réussis": 100,
  Majorité: 75,
  "Quelques-uns": 50,
  Aucun: 0,
  Complétée: 100,
  Partielle: 60,
  Non: 0,
  "100%": 100,
  "75%": 75,
  "50%": 50,
  "25%": 25,
  "Douleur légère": 70,
  "Douleur modérée": 40,
  Impossible: 0,
  "Fatigue légère": 75,
  "Fatigue modérée": 50,
  Anormal: 20,
  "Objectifs atteints": 100,
  Partiellement: 60,
  "Non atteints": 20,
  Retardé: 50,
};

interface EvalData {
  [key: string]: number | string;
}

interface InjuryEval {
  data: EvalData;
  score: number;
  date: string;
  decision?: string;
  note?: string;
}

interface ApiInjury {
  id: string;
  name: string;
  injury?: string;
  injuryType?: string;
  bodyPart?: string;
  riskIA?: number;
  returnDate?: string;
}

interface ApiPlayer {
  id: string;
  fullName?: string;
  position?: string;
  status?: string;
}

const lsGet = <T,>(key: string, def: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : def;
  } catch {
    return def;
  }
};

const lsSet = (key: string, val: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
};

const getResolvedIds = (): string[] => lsGet<string[]>(RESOLVED_KEY, []);

const markAsResolved = (id: string) => {
  const cur = getResolvedIds();
  if (!cur.includes(id)) lsSet(RESOLVED_KEY, [...cur, id]);
};

const unmarkResolved = (id: string) => {
  lsSet(
    RESOLVED_KEY,
    getResolvedIds().filter((x) => x !== id),
  );
};

const translatePosition = (pos: string) => {
  const map: Record<string, string> = {
    ST: "Attaquant",
    BU: "Buteur",
    MC: "Milieu central",
    MD: "Milieu défensif",
    DC: "Défenseur central",
    GK: "Gardien",
    LB: "Latéral gauche",
    RB: "Latéral droit",
    AG: "Ailier gauche",
    AD: "Ailier droit",
  };
  return map[pos ?? ""] ?? pos ?? "—";
};

const translateBodyPart = (bp: string) => {
  const map: Record<string, string> = {
    head: "Tête",
    tete: "Tête",
    hamstring: "Ischio-jambiers",
    "knee-left": "Genou gauche",
    "knee-right": "Genou droit",
    "ankle-left": "Cheville gauche",
    "ankle-right": "Cheville droite",
    "thigh-left": "Cuisse gauche",
    "thigh-right": "Cuisse droite",
    "shoulder-left": "Épaule gauche",
    "shoulder-right": "Épaule droite",
    back: "Dos",
    groin: "Aine",
  };
  return map[(bp ?? "").toLowerCase()] ?? bp ?? "—";
};

const OPTIONS_MAP: Record<string, string[]> = {
  mobility: ["Normal", "Limité", "Absent"],
  healing: ["Normal", "Retardé", "Mauvais"],
  functional: ["Tous réussis", "Majorité", "Quelques-uns", "Aucun"],
  balance: ["Normal", "Acceptable", "Faible"],
  running: ["Normal", "Douleur légère", "Douleur modérée", "Impossible"],
  recovery: ["Normal", "Fatigue légère", "Fatigue modérée", "Mauvais"],
  confidence: ["Élevée", "Modérée", "Faible"],
  sport: ["Complétée", "Partielle", "Non"],
  training: ["100%", "75%", "50%", "25%"],
  clinical: ["Normal", "Acceptable", "Anormal"],
  physical: ["Objectifs atteints", "Partiellement", "Non atteints"],
  psych: ["Élevée", "Modérée", "Faible"],
};

const calcScore = (
  phase: number,
  evalData: EvalData,
): {
  score: number;
  criteriaScores: Record<string, number>;
  blockers: string[];
} => {
  const phaseDef = PHASES[phase as PhaseNum];
  if (!phaseDef) return { score: 0, criteriaScores: {}, blockers: [] };

  const criteriaScores: Record<string, number> = {};
  let totalScore = 0;
  const blockers: string[] = [];

  phaseDef.criteria.forEach((c) => {
    const val = evalData[c.key];
    let score = 0;

    if (c.key === "pain") {
      const painVal = Number(val ?? 0);
      score = PAIN_SCORES[painVal] ?? 0;
      if (phase === 1 && painVal > 2) {
        blockers.push("Douleur > 2/10");
      }
    } else if (c.key === "swelling") {
      score = SWELLING_SCORES[String(val ?? "Sévère")] ?? 0;
      if (phase === 1 && (val === "Sévère" || val === "Modéré")) {
        blockers.push("Œdème trop important");
      }
    } else if (c.key === "rom") {
      const current = Number(evalData.romCurrent ?? 0);
      const normal = Number(evalData.romNormal ?? 140);
      score = normal > 0 ? Math.min(100, (current / normal) * 100) : 0;
      if (phase === 1 && score < 85) {
        blockers.push(`Amplitude insuffisante (${score.toFixed(0)}% < 85%)`);
      }
    } else if (c.key === "strength") {
      const injured = Number(evalData.strengthInjured ?? 0);
      const healthy = Number(evalData.strengthHealthy ?? 100);
      score = healthy > 0 ? Math.min(100, (injured / healthy) * 100) : 0;
      if (phase === 2 && score < 90) {
        blockers.push(`Force insuffisante (${score.toFixed(0)}% < 90%)`);
      }
    } else {
      score = OPTION_SCORES[String(val ?? "")] ?? 0;
    }

    criteriaScores[c.key] = score;
    totalScore += score * c.weight;
  });

  return {
    score: Math.round(totalScore),
    criteriaScores,
    blockers,
  };
};

const getRecommendation = (
  score: number,
  phase: number,
  blockers: string[],
): { text: string; color: string } => {
  const threshold = PHASES[phase as PhaseNum]?.threshold ?? 85;

  if (blockers.length > 0) {
    return {
      text: "Critères bloquants non satisfaits — maintien en phase",
      color: "#ef4444",
    };
  }
  if (score < 70) {
    return {
      text: "Continuer la rééducation — progression insuffisante",
      color: "#ef4444",
    };
  }
  if (score < threshold * 0.85) {
    return {
      text: "Amélioration en cours — maintien recommandé",
      color: "#f59e0b",
    };
  }
  if (score < threshold) {
    return {
      text: "Progression possible si critères bloquants validés",
      color: "#f59e0b",
    };
  }
  if (score >= threshold) {
    return {
      text:
        phase === 3
          ? "Prêt pour la compétition — approbation médicale requise"
          : "Prêt pour la phase suivante — confirmation médecin requise",
      color: "#22c55e",
    };
  }
  return { text: "—", color: "#6b7280" };
};

export function MedicalReeducationPage() {
  const [injuries, setInjuries] = useState<ApiInjury[]>([]);
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  const [playerPhases, setPlayerPhases] = useState<Record<string, number>>(() =>
    lsGet(PHASES_KEY, {}),
  );

  const [evals, setEvals] = useState<Record<string, InjuryEval>>(() => lsGet(EVALS_KEY, {}));

  const [notes, setNotes] = useState<Record<string, string>>(() => lsGet(NOTES_KEY, {}));

  const [selectedInjury, setSelectedInjury] = useState<ApiInjury | null>(null);
  const [currentEval, setCurrentEval] = useState<EvalData>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      let injData: ApiInjury[] = [];
      let playersData: ApiPlayer[] = [];

      try {
        const r = (await clubApi.getInjuries()) as { injured?: unknown[] };
        const list = Array.isArray(r?.injured) ? r.injured : [];
        injData = list.map((item, i) => {
          const row = item as Record<string, unknown>;
          return {
            id: String(row.id ?? `inj-${i}`),
            name: String(row.name ?? ""),
            injury: row.injury != null ? String(row.injury) : undefined,
            injuryType: row.injuryType != null ? String(row.injuryType) : undefined,
            bodyPart: row.bodyPart != null ? String(row.bodyPart) : undefined,
            riskIA: Number(row.riskIA ?? 0),
            returnDate: row.returnDate != null ? String(row.returnDate) : undefined,
          };
        });
      } catch (e) {
        console.warn(e);
      }

      try {
        const raw = (await clubApi.getPlayers()) as unknown[];
        playersData = Array.isArray(raw)
          ? raw.map((item, i) => {
              const row = item as Record<string, unknown>;
              return {
                id: String(row.id ?? `player-${i}`),
                fullName: String(row.fullName ?? row.name ?? ""),
                position: row.position != null ? String(row.position) : undefined,
                status: row.status != null ? String(row.status) : undefined,
              };
            })
          : [];
      } catch (e) {
        console.warn(e);
      }

      setInjuries(injData);
      setPlayers(playersData);
      setLoading(false);
    };
    load();
  }, []);

  const getPlayer = (name: string) =>
    players.find(
      (p) => (p.fullName ?? "").toLowerCase().trim() === (name ?? "").toLowerCase().trim(),
    );

  const updatePhase = (id: string, phase: number) => {
    const updated = { ...playerPhases, [id]: phase };
    setPlayerPhases(updated);
    lsSet(PHASES_KEY, updated);
    if (phase === 3) markAsResolved(id);
    else unmarkResolved(id);
  };

  const saveEval = (
    injuryId: string,
    evalData: EvalData,
    score: number,
    decision: string,
    note: string,
  ) => {
    const evalRecord: InjuryEval = {
      data: evalData,
      score,
      date: new Date().toLocaleDateString("fr-FR"),
      decision,
      note,
    };
    const updated = { ...evals, [injuryId]: evalRecord };
    setEvals(updated);
    lsSet(EVALS_KEY, updated);

    const noteUpdated = { ...notes, [injuryId]: note };
    setNotes(noteUpdated);
    lsSet(NOTES_KEY, noteUpdated);
  };

  const openEval = (inj: ApiInjury) => {
    setSelectedInjury(inj);
    const existing = evals[inj.id];
    setCurrentEval(existing?.data ?? {});
  };

  const phaseGroups = useMemo(() => {
    const groups: Record<number, ApiInjury[]> = { 1: [], 2: [], 3: [] };
    injuries.forEach((inj) => {
      const phase = playerPhases[inj.id] ?? 1;
      if (groups[phase]) groups[phase].push(inj);
    });
    return groups;
  }, [injuries, playerPhases]);

  const KanbanCard = ({ inj }: { inj: ApiInjury }) => {
    const phase = (playerPhases[inj.id] ?? 1) as PhaseNum;
    const phaseMeta = PHASES[phase];
    const player = getPlayer(inj.name);
    const evalData = evals[inj.id];
    const score = evalData?.score ?? null;
    const initials =
      (inj.name ?? "?")
        .split(" ")
        .map((n) => n[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    const { blockers } =
      score !== null ? calcScore(phase, evalData?.data ?? {}) : { blockers: [] as string[] };

    const threshold = PHASES[phase]?.threshold ?? 85;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          borderRadius: 14,
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${phaseMeta.border}`,
          borderLeft: `3px solid ${phaseMeta.color}`,
          padding: "12px 14px",
          marginBottom: 8,
          cursor: "pointer",
        }}
        onClick={() => openEval(inj)}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: phaseMeta.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              color: phaseMeta.color,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              {inj.name}
            </p>
            {player ? (
              <p
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                }}
              >
                {translatePosition(player.position ?? "")}
              </p>
            ) : null}
          </div>
          {phase === 3 ? <CheckCircle2 size={16} style={{ color: "#22c55e" }} /> : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#ef4444",
              background: "rgba(239,68,68,0.10)",
              padding: "2px 7px",
              borderRadius: 99,
              border: "1px solid rgba(239,68,68,0.20)",
            }}
          >
            {inj.injury ?? inj.injuryType}
          </span>
          <span
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
            }}
          >
            {translateBodyPart(inj.bodyPart ?? "")}
          </span>
        </div>

        {score !== null ? (
          <div style={{ marginBottom: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 3,
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  color: "var(--text-muted)",
                }}
              >
                Score de préparation
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: score >= threshold ? "#22c55e" : score >= 70 ? "#f59e0b" : "#ef4444",
                }}
              >
                {score}%
              </span>
            </div>
            <div
              style={{
                height: 4,
                borderRadius: 99,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.6 }}
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: score >= 85 ? "#22c55e" : score >= 70 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </div>
        ) : (
          <p
            style={{
              fontSize: 9,
              color: "var(--text-muted)",
              fontStyle: "italic",
              marginBottom: 8,
            }}
          >
            Aucune évaluation — cliquer pour évaluer
          </p>
        )}

        {blockers.length > 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 9,
              color: "#ef4444",
              marginBottom: 6,
            }}
          >
            <AlertTriangle size={10} />
            {blockers.length} critère(s) bloquant(s)
          </div>
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openEval(inj);
          }}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: 8,
            fontSize: 10,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            background: phaseMeta.bg,
            color: phaseMeta.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
          }}
        >
          <Activity size={11} />
          Évaluer →
        </button>
      </motion.div>
    );
  };

  const renderCriterionInput = (c: { key: string; label: string }) => {
    if (c.key === "pain") {
      return (
        <div>
          <p
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            Niveau (0 = aucune, 10 = max)
          </p>
          <div
            style={{
              display: "flex",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCurrentEval((p) => ({ ...p, pain: n }))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: "none",
                  background:
                    currentEval.pain === n
                      ? n <= 2
                        ? "#22c55e"
                        : n <= 4
                          ? "#f59e0b"
                          : "#ef4444"
                      : "rgba(255,255,255,0.06)",
                  color: currentEval.pain === n ? "white" : "var(--text-muted)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (c.key === "swelling") {
      return (
        <div style={{ display: "flex", gap: 6 }}>
          {["Aucun", "Minimal", "Modéré", "Sévère"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setCurrentEval((p) => ({ ...p, swelling: opt }))}
              style={{
                flex: 1,
                padding: "6px 8px",
                borderRadius: 8,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                background:
                  currentEval.swelling === opt
                    ? opt === "Aucun"
                      ? "#22c55e"
                      : opt === "Minimal"
                        ? "#3b82f6"
                        : opt === "Modéré"
                          ? "#f59e0b"
                          : "#ef4444"
                    : "rgba(255,255,255,0.06)",
                color: currentEval.swelling === opt ? "white" : "var(--text-muted)",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      );
    }

    if (c.key === "rom") {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Amplitude actuelle (°)
            </label>
            <input
              type="number"
              min={0}
              max={180}
              value={String(currentEval.romCurrent ?? "")}
              onChange={(e) =>
                setCurrentEval((p) => ({
                  ...p,
                  romCurrent: Number(e.target.value),
                }))
              }
              placeholder="Ex: 126"
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Amplitude normale (°)
            </label>
            <input
              type="number"
              min={0}
              max={180}
              value={String(currentEval.romNormal ?? 140)}
              onChange={(e) =>
                setCurrentEval((p) => ({
                  ...p,
                  romNormal: Number(e.target.value),
                }))
              }
              placeholder="Ex: 140"
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
        </div>
      );
    }

    if (c.key === "strength") {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Membre blessé (kg)
            </label>
            <input
              type="number"
              min={0}
              value={String(currentEval.strengthInjured ?? "")}
              onChange={(e) =>
                setCurrentEval((p) => ({
                  ...p,
                  strengthInjured: Number(e.target.value),
                }))
              }
              placeholder="Ex: 92"
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: 9,
                color: "var(--text-muted)",
                display: "block",
                marginBottom: 4,
              }}
            >
              Membre sain (kg)
            </label>
            <input
              type="number"
              min={0}
              value={String(currentEval.strengthHealthy ?? 100)}
              onChange={(e) =>
                setCurrentEval((p) => ({
                  ...p,
                  strengthHealthy: Number(e.target.value),
                }))
              }
              placeholder="Ex: 100"
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
        </div>
      );
    }

    const options = OPTIONS_MAP[c.key] ?? [];
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const isSelected = currentEval[c.key] === opt;
          const optScore = OPTION_SCORES[opt] ?? 50;
          const optColor = optScore >= 80 ? "#22c55e" : optScore >= 60 ? "#f59e0b" : "#ef4444";
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setCurrentEval((p) => ({ ...p, [c.key]: opt }))}
              style={{
                flex: 1,
                minWidth: 70,
                padding: "6px 4px",
                borderRadius: 8,
                fontSize: 9,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                textAlign: "center",
                background: isSelected ? optColor : "rgba(255,255,255,0.06)",
                color: isSelected ? "white" : "var(--text-muted)",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    );
  };

  const renderEvalModal = () => {
    if (!selectedInjury) return null;

    const phase = (playerPhases[selectedInjury.id] ?? 1) as PhaseNum;
    const phaseDef = PHASES[phase];
    const player = getPlayer(selectedInjury.name);
    const { score, criteriaScores, blockers } = calcScore(phase, currentEval);
    const recommendation = getRecommendation(score, phase, blockers);
    const noteText = notes[selectedInjury.id] ?? "";
    const canProgress = score >= phaseDef.threshold && blockers.length === 0;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.80)",
            backdropFilter: "blur(10px)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setSelectedInjury(null)}
        >
          <motion.div
            initial={{ scale: 0.93, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.93, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 900,
              maxHeight: "92vh",
              overflowY: "auto",
              background: "rgba(10,8,30,0.99)",
              border: `1px solid ${phaseDef.color}40`,
              borderTop: `4px solid ${phaseDef.color}`,
              borderRadius: 20,
              boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px ${phaseDef.color}20`,
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: phaseDef.bg,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${phaseDef.color}20`,
                    border: `1px solid ${phaseDef.color}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 900,
                    color: phaseDef.color,
                  }}
                >
                  {(selectedInjury.name ?? "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 17,
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      marginBottom: 2,
                    }}
                  >
                    {selectedInjury.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {player ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                        }}
                      >
                        {translatePosition(player.position ?? "")}
                      </span>
                    ) : null}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: phaseDef.color,
                      }}
                    >
                      {phaseDef.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#ef4444",
                        background: "rgba(239,68,68,0.10)",
                        padding: "1px 7px",
                        borderRadius: 99,
                      }}
                    >
                      {selectedInjury.injury ?? selectedInjury.injuryType}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInjury(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={15} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            <div
              style={{
                padding: "12px 24px",
                background: "rgba(255,255,255,0.02)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: phaseDef.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 4,
                }}
              >
                Objectif de la phase
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {phaseDef.objective}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 320px",
                gap: 0,
                minHeight: 400,
              }}
            >
              <div
                style={{
                  padding: "20px 24px",
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  overflowY: "auto",
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 16,
                  }}
                >
                  Évaluation quotidienne
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  {phaseDef.criteria.map((c) => {
                    const cScore = criteriaScores[c.key];
                    const isBlocking = (phaseDef.mandatoryCriteria as readonly string[]).includes(
                      c.key,
                    );
                    const scorePct = cScore !== undefined ? cScore : null;
                    const scoreColor =
                      scorePct === null
                        ? "#6b7280"
                        : scorePct >= 80
                          ? "#22c55e"
                          : scorePct >= 60
                            ? "#f59e0b"
                            : "#ef4444";

                    return (
                      <div
                        key={c.key}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 12,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderLeft: isBlocking
                            ? `3px solid ${phaseDef.color}`
                            : "3px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 10,
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "var(--text-primary)",
                              }}
                            >
                              {c.label}
                            </span>
                            {isBlocking ? (
                              <span
                                style={{
                                  fontSize: 8,
                                  fontWeight: 700,
                                  color: phaseDef.color,
                                  background: phaseDef.bg,
                                  padding: "1px 5px",
                                  borderRadius: 99,
                                  marginLeft: 6,
                                }}
                              >
                                CRITIQUE
                              </span>
                            ) : null}
                            <p
                              style={{
                                fontSize: 9,
                                color: "var(--text-muted)",
                                marginTop: 2,
                              }}
                            >
                              Poids: {(c.weight * 100).toFixed(0)}% · Cible: {c.target}
                            </p>
                          </div>
                          {scorePct !== null ? (
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{
                                  fontSize: 18,
                                  fontWeight: 900,
                                  color: scoreColor,
                                  lineHeight: 1,
                                }}
                              >
                                {scorePct.toFixed(0)}
                              </p>
                              <p
                                style={{
                                  fontSize: 9,
                                  color: "var(--text-muted)",
                                }}
                              >
                                /100
                              </p>
                            </div>
                          ) : null}
                        </div>
                        {renderCriterionInput(c)}
                        {scorePct !== null ? (
                          <div style={{ marginTop: 8 }}>
                            <div
                              style={{
                                height: 3,
                                borderRadius: 99,
                                background: "rgba(255,255,255,0.08)",
                                overflow: "hidden",
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${scorePct}%` }}
                                transition={{ duration: 0.5 }}
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  background: scoreColor,
                                }}
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 16 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 8,
                    }}
                  >
                    Notes médicales
                  </p>
                  <textarea
                    value={noteText}
                    onChange={(e) => {
                      const updated = {
                        ...notes,
                        [selectedInjury.id]: e.target.value,
                      };
                      setNotes(updated);
                      lsSet(NOTES_KEY, updated);
                    }}
                    placeholder="Observations cliniques, évolution, décisions..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "var(--text-primary)",
                      resize: "vertical",
                      outline: "none",
                      fontFamily: "inherit",
                      lineHeight: 1.6,
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: "20px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    padding: "16px",
                    borderRadius: 14,
                    background:
                      score >= phaseDef.threshold
                        ? "rgba(34,197,94,0.08)"
                        : score >= 70
                          ? "rgba(245,158,11,0.08)"
                          : "rgba(239,68,68,0.08)",
                    border: `1px solid ${
                      score >= phaseDef.threshold
                        ? "rgba(34,197,94,0.25)"
                        : score >= 70
                          ? "rgba(245,158,11,0.25)"
                          : "rgba(239,68,68,0.25)"
                    }`,
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 10,
                    }}
                  >
                    Score de préparation
                  </p>

                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      border: `4px solid ${
                        score >= phaseDef.threshold
                          ? "#22c55e"
                          : score >= 70
                            ? "#f59e0b"
                            : "#ef4444"
                      }`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 900,
                        lineHeight: 1,
                        color:
                          score >= phaseDef.threshold
                            ? "#22c55e"
                            : score >= 70
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    >
                      {score}
                    </p>
                    <p
                      style={{
                        fontSize: 9,
                        color: "var(--text-muted)",
                      }}
                    >
                      /100
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textAlign: "center",
                      color: recommendation.color,
                      lineHeight: 1.4,
                    }}
                  >
                    {recommendation.text}
                  </p>

                  <p
                    style={{
                      fontSize: 9,
                      marginTop: 6,
                      color: "var(--text-muted)",
                    }}
                  >
                    Seuil requis: {phaseDef.threshold}%
                  </p>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 8,
                    }}
                  >
                    Critères bloquants
                  </p>
                  {phaseDef.mandatoryCriteria.map((key) => {
                    const c = phaseDef.criteria.find((cr) => cr.key === key);
                    const cScore = criteriaScores[key];
                    const isOk = cScore !== undefined && cScore >= 80;
                    return (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 0",
                          borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {cScore !== undefined ? (
                          isOk ? (
                            <CheckCircle2 size={13} style={{ color: "#22c55e", flexShrink: 0 }} />
                          ) : (
                            <XCircle size={13} style={{ color: "#ef4444", flexShrink: 0 }} />
                          )
                        ) : (
                          <div
                            style={{
                              width: 13,
                              height: 13,
                              borderRadius: "50%",
                              background: "rgba(255,255,255,0.10)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--text-primary)",
                            }}
                          >
                            {c?.label}
                          </p>
                          <p
                            style={{
                              fontSize: 9,
                              color: "var(--text-muted)",
                            }}
                          >
                            {c?.target}
                          </p>
                        </div>
                        {cScore !== undefined ? (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: isOk ? "#22c55e" : "#ef4444",
                            }}
                          >
                            {cScore.toFixed(0)}%
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                {Object.keys(criteriaScores).length > 0 ? (
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: 8,
                      }}
                    >
                      Détail des scores
                    </p>
                    {phaseDef.criteria.map((c) => {
                      const s = criteriaScores[c.key];
                      if (s === undefined) return null;
                      return (
                        <div
                          key={c.key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 10,
                              flex: 1,
                              color: "var(--text-muted)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.label}
                          </p>
                          <div
                            style={{
                              width: 50,
                              height: 3,
                              borderRadius: 99,
                              background: "rgba(255,255,255,0.08)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${s}%`,
                                height: "100%",
                                borderRadius: 99,
                                background: s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444",
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: s >= 80 ? "#22c55e" : s >= 60 ? "#f59e0b" : "#ef4444",
                              minWidth: 28,
                              textAlign: "right",
                            }}
                          >
                            {s.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}

                <div>
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: 8,
                    }}
                  >
                    Décision médicale
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSaving(true);
                        saveEval(selectedInjury.id, currentEval, score, "Continuer", noteText);
                        setSaving(false);
                        setSelectedInjury(null);
                      }}
                      style={{
                        padding: "10px",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        border: "1px solid rgba(59,130,246,0.30)",
                        cursor: "pointer",
                        background: "rgba(59,130,246,0.10)",
                        color: "#3b82f6",
                      }}
                    >
                      {saving ? "Enregistrement..." : "Continuer la phase actuelle"}
                    </motion.button>

                    {phase < 3 ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        disabled={!canProgress}
                        onClick={() => {
                          if (!canProgress) return;
                          saveEval(selectedInjury.id, currentEval, score, "Progresser", noteText);
                          updatePhase(selectedInjury.id, phase + 1);
                          setSelectedInjury(null);
                        }}
                        style={{
                          padding: "10px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          border: `1px solid ${
                            canProgress ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.08)"
                          }`,
                          cursor: canProgress ? "pointer" : "not-allowed",
                          background: canProgress
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(255,255,255,0.04)",
                          color: canProgress ? "#22c55e" : "var(--text-muted)",
                          opacity: canProgress ? 1 : 0.6,
                        }}
                      >
                        {canProgress
                          ? `→ Progresser vers ${phase === 2 ? "Retour terrain" : "Phase 2"}`
                          : `→ Bloqué — Score < ${phaseDef.threshold}%`}
                      </motion.button>
                    ) : null}

                    {phase === 3 ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        disabled={!canProgress}
                        onClick={() => {
                          if (!canProgress) return;
                          saveEval(selectedInjury.id, currentEval, score, "Libéré", noteText);
                          markAsResolved(selectedInjury.id);
                          updatePhase(selectedInjury.id, 3);
                          const p = getPlayer(selectedInjury.name);
                          if (p) {
                            apiFetch(`/club/players/${p.id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ status: "DISPONIBLE" }),
                            }).catch(console.warn);
                          }
                          setSelectedInjury(null);
                        }}
                        style={{
                          padding: "10px",
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          border: `1px solid ${
                            canProgress ? "rgba(34,197,94,0.40)" : "rgba(255,255,255,0.08)"
                          }`,
                          cursor: canProgress ? "pointer" : "not-allowed",
                          background: canProgress ? "#22c55e" : "rgba(255,255,255,0.04)",
                          color: canProgress ? "white" : "var(--text-muted)",
                          opacity: canProgress ? 1 : 0.6,
                        }}
                      >
                        ✓ Libéré pour la compétition
                      </motion.button>
                    ) : null}

                    {phase > 1 ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          saveEval(
                            selectedInjury.id,
                            currentEval,
                            score,
                            "Retour phase",
                            noteText,
                          );
                          updatePhase(selectedInjury.id, phase - 1);
                          setSelectedInjury(null);
                        }}
                        style={{
                          padding: "8px",
                          borderRadius: 10,
                          fontSize: 11,
                          fontWeight: 600,
                          border: "1px solid rgba(239,68,68,0.25)",
                          cursor: "pointer",
                          background: "rgba(239,68,68,0.06)",
                          color: "#ef4444",
                        }}
                      >
                        ← Retour à la phase précédente
                      </motion.button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "var(--text-primary)",
          }}
        >
          Rééducation
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 3,
          }}
        >
          Suivi clinique des phases · {injuries.length} joueur{injuries.length !== 1 ? "s" : ""}
        </p>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
          }}
        >
          <Loader2
            size={32}
            className="animate-spin"
            style={{
              color: "var(--text-muted)",
              margin: "0 auto",
            }}
          />
        </div>
      ) : null}

      {!loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          {([1, 2, 3] as const).map((phaseNum) => {
            const phaseMeta = PHASES[phaseNum];
            const phaseInjuries = phaseGroups[phaseNum] ?? [];
            return (
              <div key={phaseNum}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: phaseMeta.bg,
                    border: `1px solid ${phaseMeta.border}`,
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: phaseMeta.color,
                    }}
                  >
                    {phaseMeta.label}
                  </p>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "white",
                      background: phaseMeta.color,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {phaseInjuries.length}
                  </span>
                </div>

                {phaseInjuries.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px 16px",
                      borderRadius: 12,
                      border: "1px dashed rgba(255,255,255,0.08)",
                      color: "var(--text-muted)",
                      fontSize: 12,
                    }}
                  >
                    Aucun joueur
                  </div>
                ) : (
                  phaseInjuries.map((inj) => <KanbanCard key={inj.id} inj={inj} />)
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      <GlassCard className="p-4">
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 10,
          }}
        >
          Légende des phases
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 10,
          }}
        >
          {([1, 2, 3] as const).map((n) => {
            const p = PHASES[n];
            return (
              <div
                key={n}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: p.bg,
                  border: `1px solid ${p.border}`,
                  borderLeft: `3px solid ${p.color}`,
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: p.color,
                    marginBottom: 4,
                  }}
                >
                  {p.label}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {p.objective.substring(0, 80)}...
                </p>
                <p
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: p.color,
                    marginTop: 6,
                  }}
                >
                  Seuil requis: {p.threshold}%
                </p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {renderEvalModal()}
    </div>
  );
}
