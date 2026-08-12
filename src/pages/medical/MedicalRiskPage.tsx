import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  Shield,
  Brain,
  ChevronRight,
  X,
  Loader2,
  Users,
  FileText,
  TrendingUp,
  Save,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi } from "../../lib/api/club";

const C = {
  red: { main: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  amber: { main: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  green: { main: "#22c55e", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.25)" },
  blue: { main: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
  violet: { main: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.25)" },
  teal: { main: "#0d9488", bg: "rgba(13,148,136,0.12)", border: "rgba(13,148,136,0.25)" },
  orange: { main: "#ff7a00", bg: "rgba(255,122,0,0.12)", border: "rgba(255,122,0,0.25)" },
};

const getRiskColor = (score: number) =>
  score >= 75 ? C.red : score >= 50 ? C.amber : C.green;

const getRiskLabel = (score: number) =>
  score >= 75 ? "Risque élevé" : score >= 50 ? "Risque modéré" : "Risque faible";

interface InjuryRow {
  id: string;
  name: string;
  injury: string;
  bodyPart: string;
  returnDate: string;
  riskIA: number;
  createdAt?: string;
}

interface PlayerRow {
  id: string;
  fullName: string;
  position: string;
  status: string;
}

interface EvalStored {
  score?: number;
  date?: string;
  decision?: string;
  data?: Record<string, unknown>;
}

interface ClinicalPlayer {
  injuryId: string;
  playerId: string;
  name: string;
  position: string;
  injury: string;
  bodyPart: string;
  returnDate: string;
  riskScore: number;
  phase: number;
  readinessScore: number | null;
  lastEvalDate: string | null;
  lastEvalDecision: string | null;
  riskFactors: string[];
  recommendation: string;
  actionRequired: string;
  injuryCount: number;
  isOverdue: boolean;
  daysRemaining: number | null;
}

interface DoctorDecision {
  decision: string;
  note: string;
  date: string;
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

const parseDate = (d: string): Date | null => {
  if (!d || d === "—") return null;
  if (d.includes("/")) {
    const [day, month, year] = d.split("/").map(Number);
    if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
      return new Date(year, month - 1, day);
    }
  }
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const daysRemainingFn = (returnDate: string): number | null => {
  const d = parseDate(returnDate);
  if (!d) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
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
    "shoulder-left": "Épaule gauche",
    "shoulder-right": "Épaule droite",
    back: "Dos",
  };
  return map[(bp ?? "").toLowerCase()] ?? bp ?? "—";
};

const buildRiskFactors = (
  inj: InjuryRow,
  injuryCount: number,
  evalData: EvalStored | null,
  isOverdue: boolean,
  days: number | null,
): string[] => {
  const factors: string[] = [];

  if (injuryCount > 1) {
    factors.push(`Rechute (${injuryCount} blessures)`);
  }

  if (isOverdue) {
    factors.push("Retour prévu dépassé");
  }

  if (inj.riskIA >= 7) {
    factors.push(`Score de risque élevé (${inj.riskIA * 10}%)`);
  }

  if (days !== null && days <= 3 && days >= 0) {
    factors.push(`Retour imminent (${days}j)`);
  }

  if (days !== null && days > 21) {
    factors.push("Blessure longue durée");
  }

  if (evalData?.data) {
    const pain = Number(evalData.data.pain ?? -1);
    if (pain >= 5) {
      factors.push(`Douleur persistante (${pain}/10)`);
    }
    if (evalData.data.swelling === "Sévère" || evalData.data.swelling === "Modéré") {
      factors.push("Œdème important");
    }
    const romCurrent = Number(evalData.data.romCurrent ?? 0);
    const romNormal = Number(evalData.data.romNormal ?? 140);
    if (romNormal > 0) {
      const romPct = (romCurrent / romNormal) * 100;
      if (romPct < 75) {
        factors.push(`Amplitude limitée (${romPct.toFixed(0)}%)`);
      }
    }
    const strengthInj = Number(evalData.data.strengthInjured ?? 0);
    const strengthHealth = Number(evalData.data.strengthHealthy ?? 100);
    if (strengthHealth > 0) {
      const strPct = (strengthInj / strengthHealth) * 100;
      if (strPct < 85) {
        factors.push(`Déficit de force (${strPct.toFixed(0)}%)`);
      }
    }
  }

  if (evalData?.score !== undefined && evalData.score < 60) {
    factors.push(`Progression lente (score: ${evalData.score}%)`);
  }

  return factors.length > 0 ? factors : ["Surveillance standard recommandée"];
};

const buildRecommendation = (
  riskScore: number,
  phase: number,
  readiness: number | null,
  factors: string[],
  isOverdue: boolean,
): string => {
  const threshold = phase === 1 ? 85 : phase === 2 ? 90 : 95;

  if (riskScore >= 75) {
    if (factors.some((f) => f.includes("Douleur"))) {
      return "Réévaluation immédiate recommandée — douleur persistante à investiguer";
    }
    if (isOverdue) {
      return "Consultation médicale urgente — délai de retour dépassé";
    }
    return "Maintenir en phase actuelle — risque trop élevé pour progression";
  }

  if (readiness !== null && readiness >= threshold) {
    return phase === 3
      ? "Joueur prêt pour la compétition — validation médicale finale requise"
      : "Progression à la phase suivante possible — confirmation médicale requise";
  }

  if (readiness !== null && readiness >= threshold * 0.85) {
    return "Progression envisageable si critères bloquants validés";
  }

  if (phase === 1) {
    return "Continuer Phase 1 — immobilisation et réduction inflammation";
  }
  if (phase === 2) {
    return "Continuer Phase 2 — renforcement et tests fonctionnels";
  }
  return "Continuer protocole retour terrain — tests physiques complets";
};

const buildAction = (
  riskScore: number,
  readiness: number | null,
  phase: number,
  lastEvalDate: string | null,
  isOverdue: boolean,
): string => {
  if (riskScore >= 75 && isOverdue) {
    return "Consultation urgente";
  }
  if (riskScore >= 75) {
    return "Réévaluer aujourd'hui";
  }
  if (!lastEvalDate) {
    return "Première évaluation requise";
  }
  const threshold = phase === 1 ? 85 : phase === 2 ? 90 : 95;
  if (readiness !== null && readiness >= threshold) {
    return "Prêt à progresser";
  }
  return "Suivi standard";
};

export function MedicalRiskPage() {
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Record<string, DoctorDecision>>(
    () => lsGet("odin_risk_decisions", {}),
  );
  const [decisionForm, setDecisionForm] = useState({ decision: "", note: "" });
  const [savingDecision, setSavingDecision] = useState(false);

  useEffect(() => {
    const load = async () => {
      let injData: InjuryRow[] = [];
      let playersData: PlayerRow[] = [];

      try {
        const r = (await clubApi.getInjuries()) as { injured?: unknown[] };
        const raw = Array.isArray(r?.injured) ? r.injured : [];
        injData = raw.map((item, i) => {
          const row = item as Record<string, unknown>;
          return {
            id: String(row.id ?? `inj-${i}`),
            name: String(row.name ?? ""),
            injury: String(row.injury ?? row.injuryType ?? ""),
            bodyPart: String(row.bodyPart ?? "—"),
            returnDate: String(row.returnDate ?? "—"),
            riskIA: Number(row.riskIA ?? 0),
            createdAt: row.createdAt != null ? String(row.createdAt) : undefined,
          };
        });
      } catch (e) {
        console.warn(e);
      }

      try {
        const raw = (await clubApi.getPlayers()) as unknown[];
        playersData = Array.isArray(raw)
          ? raw.map((p) => {
              const row = p as Record<string, unknown>;
              return {
                id: String(row.id ?? ""),
                fullName: String(row.fullName ?? row.name ?? ""),
                position: String(row.position ?? ""),
                status: String(row.status ?? ""),
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

  const phases = useMemo(
    () => lsGet<Record<string, number>>("odin_reeducation_phases", {}),
    [],
  );
  const evals = useMemo(
    () => lsGet<Record<string, EvalStored>>("odin_reeducation_evals", {}),
    [],
  );
  const resolvedIds = useMemo(
    () => lsGet<string[]>("odin_resolved_injuries", []),
    [],
  );

  const clinicalPlayers = useMemo((): ClinicalPlayer[] => {
    return injuries
      .filter((inj) => !resolvedIds.includes(inj.id))
      .map((inj) => {
        const player = players.find(
          (p) => p.fullName.toLowerCase().trim() === inj.name.toLowerCase().trim(),
        );
        const phase = phases[inj.id] ?? 1;
        const evalData = evals[inj.id] ?? null;
        const readiness = evalData?.score ?? null;
        const days = daysRemainingFn(inj.returnDate);
        const isOverdue = days !== null && days < 0;
        const riskScore = Math.min(100, Math.round(inj.riskIA * 10));

        const injuryCount = injuries.filter(
          (i) => i.name.toLowerCase().trim() === inj.name.toLowerCase().trim(),
        ).length;

        const factors = buildRiskFactors(inj, injuryCount, evalData, isOverdue, days);

        const recommendation = buildRecommendation(
          riskScore,
          phase,
          readiness,
          factors,
          isOverdue,
        );

        const actionRequired = buildAction(
          riskScore,
          readiness,
          phase,
          evalData?.date ?? null,
          isOverdue,
        );

        return {
          injuryId: inj.id,
          playerId: player?.id ?? "",
          name: inj.name,
          position: translatePosition(player?.position ?? ""),
          injury: inj.injury,
          bodyPart: translateBodyPart(inj.bodyPart),
          returnDate: inj.returnDate,
          riskScore,
          phase,
          readinessScore: readiness,
          lastEvalDate: evalData?.date ?? null,
          lastEvalDecision: evalData?.decision ?? null,
          riskFactors: factors,
          recommendation,
          actionRequired,
          injuryCount,
          isOverdue,
          daysRemaining: days,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [injuries, players, phases, evals, resolvedIds]);

  const highRisk = clinicalPlayers.filter((p) => p.riskScore >= 75).length;
  const mediumRisk = clinicalPlayers.filter(
    (p) => p.riskScore >= 50 && p.riskScore < 75,
  ).length;
  const lowRisk = clinicalPlayers.filter((p) => p.riskScore < 50).length;
  const inRehab = clinicalPlayers.filter((p) => p.phase === 1 || p.phase === 2).length;
  const returningSoon = clinicalPlayers.filter(
    (p) => p.daysRemaining !== null && p.daysRemaining >= 0 && p.daysRemaining <= 3,
  ).length;

  const selectedPlayer =
    clinicalPlayers.find((p) => p.injuryId === selectedId) ?? null;

  const saveDecision = () => {
    if (!selectedId || !decisionForm.decision) return;
    setSavingDecision(true);
    const newDecision: DoctorDecision = {
      decision: decisionForm.decision,
      note: decisionForm.note,
      date: new Date().toLocaleDateString("fr-FR"),
    };
    const updated = {
      ...decisions,
      [selectedId]: newDecision,
    };
    setDecisions(updated);
    lsSet("odin_risk_decisions", updated);
    setDecisionForm({ decision: "", note: "" });
    setTimeout(() => setSavingDecision(false), 500);
  };

  const kpis = [
    {
      label: "Surveillés",
      value: clinicalPlayers.length,
      color: C.blue,
      icon: Users,
    },
    { label: "Risque élevé", value: highRisk, color: C.red, icon: AlertTriangle },
    { label: "Risque modéré", value: mediumRisk, color: C.amber, icon: Shield },
    { label: "Risque faible", value: lowRisk, color: C.green, icon: CheckCircle2 },
    { label: "Retour imminent", value: returningSoon, color: C.teal, icon: Clock },
    { label: "En rééducation", value: inRehab, color: C.violet, icon: Activity },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
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
            Surveillance des risques
          </h1>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 3,
            }}
          >
            Surveillance médicale temps réel · {clinicalPlayers.length} joueur(s) surveillé(s)
          </p>
        </div>
        {highRisk > 0 ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.red.main,
              background: C.red.bg,
              border: `1px solid ${C.red.border}`,
              padding: "6px 14px",
              borderRadius: 99,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <AlertTriangle size={13} />
            {highRisk} alerte(s) haute priorité
          </span>
        ) : null}
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
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 12,
            }}
          >
            Chargement des données cliniques...
          </p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6,1fr)",
              gap: 10,
            }}
          >
            {kpis.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  padding: "14px 12px",
                  borderRadius: 14,
                  background: k.color.bg,
                  border: `1px solid ${k.color.border}`,
                  borderTop: `3px solid ${k.color.main}`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: `${k.color.main}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 8px",
                  }}
                >
                  <k.icon size={14} style={{ color: k.color.main }} />
                </div>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: k.color.main,
                    lineHeight: 1,
                  }}
                >
                  {k.value}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginTop: 5,
                    lineHeight: 1.3,
                  }}
                >
                  {k.label}
                </p>
              </motion.div>
            ))}
          </div>

          {clinicalPlayers.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                borderRadius: 16,
                border: "1px dashed rgba(255,255,255,0.08)",
              }}
            >
              <CheckCircle2
                size={40}
                style={{
                  color: C.green.main,
                  margin: "0 auto 12px",
                }}
              />
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Aucun joueur sous surveillance
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  marginTop: 4,
                }}
              >
                L&apos;effectif est en bonne santé médicale
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: selectedPlayer ? "1fr 380px" : "1fr",
                gap: 16,
                alignItems: "start",
              }}
            >
              <GlassCard raised className="p-0 overflow-x-auto">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 2fr",
                    gap: 0,
                    padding: "10px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    minWidth: 900,
                  }}
                >
                  {[
                    "Joueur",
                    "Blessure",
                    "Phase",
                    "Préparation",
                    "Risque",
                    "Statut",
                    "Action requise",
                  ].map((h) => (
                    <p
                      key={h}
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {h}
                    </p>
                  ))}
                </div>

                {clinicalPlayers.map((p, i) => {
                  const rc = getRiskColor(p.riskScore);
                  const isSelected = selectedId === p.injuryId;
                  const phaseMeta =
                    (
                      {
                        1: { label: "Phase 1", color: C.blue.main },
                        2: { label: "Phase 2", color: C.violet.main },
                        3: { label: "Retour", color: C.green.main },
                      } as const
                    )[p.phase as 1 | 2 | 3] ?? {
                      label: "Phase 1",
                      color: C.blue.main,
                    };

                  return (
                    <motion.div
                      key={p.injuryId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setSelectedId(isSelected ? null : p.injuryId);
                        setDecisionForm({ decision: "", note: "" });
                      }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr 2fr",
                        gap: 0,
                        padding: "14px 16px",
                        borderBottom: "0.5px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        background: isSelected ? `${rc.main}08` : "transparent",
                        borderLeft: isSelected
                          ? `3px solid ${rc.main}`
                          : "3px solid transparent",
                        transition: "all 0.15s",
                        minWidth: 900,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 9,
                            flexShrink: 0,
                            background: rc.bg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            fontWeight: 800,
                            color: rc.main,
                          }}
                        >
                          {p.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--text-primary)",
                            }}
                          >
                            {p.name}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                            }}
                          >
                            {p.position}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--text-primary)",
                          }}
                        >
                          {p.injury}
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                          }}
                        >
                          {p.bodyPart}
                        </p>
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: phaseMeta.color,
                            background: `${phaseMeta.color}15`,
                            padding: "3px 8px",
                            borderRadius: 99,
                            border: `1px solid ${phaseMeta.color}30`,
                          }}
                        >
                          {phaseMeta.label}
                        </span>
                      </div>

                      <div>
                        {p.readinessScore !== null ? (
                          <>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 800,
                                color:
                                  p.readinessScore >= 85
                                    ? C.green.main
                                    : p.readinessScore >= 60
                                      ? C.amber.main
                                      : C.red.main,
                              }}
                            >
                              {p.readinessScore}%
                            </p>
                            <div
                              style={{
                                height: 3,
                                borderRadius: 99,
                                background: "rgba(255,255,255,0.08)",
                                marginTop: 4,
                                overflow: "hidden",
                                width: 50,
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  borderRadius: 99,
                                  width: `${p.readinessScore}%`,
                                  background:
                                    p.readinessScore >= 85
                                      ? C.green.main
                                      : p.readinessScore >= 60
                                        ? C.amber.main
                                        : C.red.main,
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <p
                            style={{
                              fontSize: 10,
                              color: "var(--text-muted)",
                              fontStyle: "italic",
                            }}
                          >
                            Non évalué
                          </p>
                        )}
                      </div>

                      <div>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 900,
                            color: rc.main,
                          }}
                        >
                          {p.riskScore}%
                        </p>
                        <p
                          style={{
                            fontSize: 9,
                            color: "var(--text-muted)",
                          }}
                        >
                          {getRiskLabel(p.riskScore)}
                        </p>
                      </div>

                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: rc.main,
                            background: rc.bg,
                            border: `1px solid ${rc.border}`,
                            padding: "3px 8px",
                            borderRadius: 99,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <motion.span
                            animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: rc.main,
                              display: "inline-block",
                            }}
                          />
                          {p.riskScore >= 75
                            ? "Élevé"
                            : p.riskScore >= 50
                              ? "Modéré"
                              : "Faible"}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color:
                              p.actionRequired === "Consultation urgente"
                                ? C.red.main
                                : p.actionRequired === "Prêt à progresser"
                                  ? C.green.main
                                  : "var(--text-muted)",
                          }}
                        >
                          {p.actionRequired}
                        </p>
                        <ChevronRight
                          size={13}
                          style={{
                            color: isSelected ? rc.main : "var(--text-muted)",
                            transform: isSelected ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </GlassCard>

              <AnimatePresence>
                {selectedPlayer ? (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <GlassCard raised className="p-4">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "var(--text-primary)",
                          }}
                        >
                          {selectedPlayer.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedId(null)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 7,
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.10)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <X size={12} style={{ color: "var(--text-muted)" }} />
                        </button>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        {[
                          { label: "Poste", value: selectedPlayer.position },
                          { label: "Blessure", value: selectedPlayer.injury },
                          { label: "Zone", value: selectedPlayer.bodyPart },
                          {
                            label: "Retour prévu",
                            value: selectedPlayer.isOverdue
                              ? `Dépassé (${selectedPlayer.returnDate})`
                              : selectedPlayer.returnDate,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 8,
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <p
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: 3,
                              }}
                            >
                              {item.label}
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color:
                                  item.label === "Retour prévu" && selectedPlayer.isOverdue
                                    ? C.red.main
                                    : "var(--text-primary)",
                              }}
                            >
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard raised className="p-4">
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <AlertTriangle size={13} style={{ color: C.amber.main }} />
                        Facteurs de risque cliniques
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 5,
                        }}
                      >
                        {selectedPlayer.riskFactors.map((f, i) => (
                          <div
                            key={`${f}-${i}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "6px 10px",
                              borderRadius: 8,
                              background: C.amber.bg,
                              border: `1px solid ${C.amber.border}`,
                              borderLeft: `2px solid ${C.amber.main}`,
                            }}
                          >
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: C.amber.main,
                                flexShrink: 0,
                              }}
                            />
                            <p
                              style={{
                                fontSize: 11,
                                color: "var(--text-primary)",
                              }}
                            >
                              {f}
                            </p>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    <GlassCard raised className="p-4">
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <TrendingUp size={13} style={{ color: C.blue.main }} />
                        Score de préparation
                      </p>

                      {selectedPlayer.readinessScore !== null ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginBottom: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: "50%",
                              border: `3px solid ${
                                selectedPlayer.readinessScore >= 85
                                  ? C.green.main
                                  : selectedPlayer.readinessScore >= 60
                                    ? C.amber.main
                                    : C.red.main
                              }`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <p
                              style={{
                                fontSize: 16,
                                fontWeight: 900,
                                color:
                                  selectedPlayer.readinessScore >= 85
                                    ? C.green.main
                                    : selectedPlayer.readinessScore >= 60
                                      ? C.amber.main
                                      : C.red.main,
                              }}
                            >
                              {selectedPlayer.readinessScore}%
                            </p>
                          </div>
                          <div>
                            <p
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                marginBottom: 2,
                              }}
                            >
                              Dernière évaluation
                            </p>
                            <p
                              style={{
                                fontSize: 10,
                                color: "var(--text-muted)",
                              }}
                            >
                              {selectedPlayer.lastEvalDate ?? "—"}
                            </p>
                            {selectedPlayer.lastEvalDecision ? (
                              <span
                                style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  color: C.blue.main,
                                  background: C.blue.bg,
                                  padding: "1px 6px",
                                  borderRadius: 99,
                                  marginTop: 4,
                                  display: "inline-block",
                                }}
                              >
                                {selectedPlayer.lastEvalDecision}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          Aucune évaluation enregistrée
                        </p>
                      )}
                    </GlassCard>

                    <GlassCard raised className="p-4">
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Brain size={13} style={{ color: C.violet.main }} />
                        Résumé clinique IA
                      </p>
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: C.violet.bg,
                          border: `1px solid ${C.violet.border}`,
                          borderLeft: `3px solid ${C.violet.main}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-primary)",
                            lineHeight: 1.6,
                          }}
                        >
                          {selectedPlayer.recommendation}
                        </p>
                      </div>
                    </GlassCard>

                    <GlassCard raised className="p-4">
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <FileText size={13} style={{ color: C.teal.main }} />
                        Décision médicale
                      </p>

                      {decisions[selectedPlayer.injuryId] ? (
                        <div
                          style={{
                            padding: "8px 10px",
                            borderRadius: 8,
                            background: C.teal.bg,
                            border: `1px solid ${C.teal.border}`,
                            marginBottom: 10,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              color: C.teal.main,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginBottom: 3,
                            }}
                          >
                            Dernière décision · {decisions[selectedPlayer.injuryId].date}
                          </p>
                          <p
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {decisions[selectedPlayer.injuryId].decision}
                          </p>
                          {decisions[selectedPlayer.injuryId].note ? (
                            <p
                              style={{
                                fontSize: 10,
                                color: "var(--text-muted)",
                                marginTop: 3,
                              }}
                            >
                              {decisions[selectedPlayer.injuryId].note}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          marginBottom: 8,
                        }}
                      >
                        {[
                          "Continuer la phase actuelle",
                          "Progresser à la phase suivante",
                          "Retour à la phase précédente",
                          "Examen supplémentaire requis",
                          "Planifier un suivi",
                          "Libéré pour la compétition",
                        ].map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setDecisionForm((prev) => ({ ...prev, decision: d }))}
                            style={{
                              padding: "7px 10px",
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              textAlign: "left",
                              border: `1px solid ${
                                decisionForm.decision === d
                                  ? C.teal.main
                                  : "rgba(255,255,255,0.08)"
                              }`,
                              background:
                                decisionForm.decision === d
                                  ? C.teal.bg
                                  : "rgba(255,255,255,0.03)",
                              color:
                                decisionForm.decision === d
                                  ? C.teal.main
                                  : "var(--text-muted)",
                            }}
                          >
                            {d}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={decisionForm.note}
                        onChange={(e) =>
                          setDecisionForm((prev) => ({ ...prev, note: e.target.value }))
                        }
                        placeholder="Notes cliniques optionnelles..."
                        rows={2}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "var(--text-primary)",
                          resize: "none",
                          outline: "none",
                          fontFamily: "inherit",
                          lineHeight: 1.5,
                          marginBottom: 8,
                        }}
                      />

                      <motion.button
                        type="button"
                        onClick={saveDecision}
                        disabled={!decisionForm.decision || savingDecision}
                        whileHover={{ scale: 1.02 }}
                        style={{
                          width: "100%",
                          padding: "9px",
                          borderRadius: 9,
                          fontSize: 12,
                          fontWeight: 700,
                          border: "none",
                          cursor: decisionForm.decision ? "pointer" : "not-allowed",
                          background: decisionForm.decision
                            ? `linear-gradient(135deg, ${C.teal.main}, #0a7a6e)`
                            : "rgba(255,255,255,0.06)",
                          color: decisionForm.decision ? "white" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          opacity: decisionForm.decision ? 1 : 0.6,
                        }}
                      >
                        <Save size={13} />
                        {savingDecision ? "Enregistrement..." : "Enregistrer la décision"}
                      </motion.button>
                    </GlassCard>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
