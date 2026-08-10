import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HeartPulse,
  CheckCircle2,
  Plus,
  Save,
  Flag,
  Activity,
  Shield,
  Loader2,
  History,
} from "lucide-react";
import { GlassCard } from "../../components/ui/GlassCard";
import { clubApi } from "../../lib/api/club";

const C = {
  primary: {
    main: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.20)",
  },
  success: {
    main: "#22c55e",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.20)",
  },
  danger: {
    main: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.20)",
  },
  muted: {
    main: "rgba(255,255,255,0.40)",
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.08)",
  },
};

interface InjuryRow {
  id: string;
  name: string;
  injury: string;
  bodyPart: string;
  returnDate: string;
  riskIA: number;
}

interface PlayerRow {
  id: string;
  fullName: string;
  position: string;
  status: string;
}

interface TreatmentData {
  protocol: string[];
  objectives: { label: string; done: boolean }[];
  allowed: string[];
  restricted: string[];
  startDate: string;
  nextReview: string;
  notes: string;
  history: { date: string; note: string }[];
}

interface EvalStored {
  score?: number;
}

const DEFAULT_TREATMENT = (_injury: string, phase: number): TreatmentData => ({
  protocol:
    phase === 1
      ? ["Cryothérapie", "Anti-inflammatoires", "Physiothérapie", "Repos"]
      : phase === 2
        ? ["Renforcement musculaire", "Proprioception", "Reprise cardio"]
        : ["Entraînement spécifique", "Tests physiques", "Validation médicale"],
  objectives:
    phase === 1
      ? [
          { label: "Douleur < 2/10", done: false },
          { label: "Réduire l'œdème", done: false },
          { label: "Amplitude ≥ 85%", done: false },
          { label: "Marche normale", done: false },
        ]
      : phase === 2
        ? [
            { label: "Force ≥ 90% côté sain", done: false },
            { label: "Tests fonctionnels réussis", done: false },
            { label: "Course sans douleur", done: false },
            { label: "Équilibre normal", done: false },
          ]
        : [
            { label: "Entraînement complet", done: false },
            { label: "Aucune douleur", done: false },
            { label: "Performance physique atteinte", done: false },
            { label: "Confiance psychologique", done: false },
          ],
  allowed: ["Vélo stationnaire", "Musculation haut du corps"],
  restricted: ["Sprint", "Participation au match", "Contact"],
  startDate: new Date().toLocaleDateString("fr-FR"),
  nextReview: "",
  notes: "",
  history: [
    {
      date: new Date().toLocaleDateString("fr-FR"),
      note: "Traitement démarré",
    },
  ],
});

const LS_TREATMENT = "odin_treatments";

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

const getPhaseLabel = (phase: number) =>
  phase === 1
    ? "Phase 1 — Immobilisation"
    : phase === 2
      ? "Phase 2 — Renforcement"
      : "Retour terrain";

const getProgressFromPhaseAndEval = (
  phase: number,
  evalData: EvalStored | null | undefined
): number => {
  if (evalData?.score != null) return evalData.score;
  return phase === 1 ? 30 : phase === 2 ? 60 : 85;
};

export function MedicalEffectifPage() {
  const [injuries, setInjuries] = useState<InjuryRow[]>([]);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInjuryId, setSelectedInjuryId] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<Record<string, TreatmentData>>(
    () => lsGet(LS_TREATMENT, {})
  );

  const [newProtocol, setNewProtocol] = useState("");
  const [newObjective, setNewObjective] = useState("");
  const [newAllowed, setNewAllowed] = useState("");
  const [newRestricted, setNewRestricted] = useState("");
  const [newHistory, setNewHistory] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      let injData: InjuryRow[] = [];
      let playersData: PlayerRow[] = [];

      try {
        const r = (await clubApi.getInjuries()) as {
          injured?: Array<Record<string, unknown>>;
        };
        injData = (r?.injured ?? []).map((item, i) => ({
          id: String(item.id ?? `inj-${i}`),
          name: String(item.name ?? ""),
          injury: String(item.injury ?? item.injuryType ?? ""),
          bodyPart: String(item.bodyPart ?? "—"),
          returnDate: String(item.returnDate ?? "—"),
          riskIA: Number(item.riskIA ?? 0),
        }));
      } catch (e) {
        console.warn(e);
      }

      try {
        const raw = (await clubApi.getPlayers()) as Array<Record<string, unknown>>;
        playersData = raw.map((p) => ({
          id: String(p.id ?? ""),
          fullName: String(p.fullName ?? p.name ?? ""),
          position: String(p.position ?? ""),
          status: String(p.status ?? ""),
        }));
      } catch (e) {
        console.warn(e);
      }

      setInjuries(injData);
      setPlayers(playersData);

      if (injData.length > 0) {
        setSelectedInjuryId(injData[0].id);
      }
      setLoading(false);
    };
    void load();
  }, []);

  useEffect(() => {
    if (!selectedInjuryId) return;
    const existing = treatments[selectedInjuryId];
    if (!existing) {
      const inj = injuries.find((i) => i.id === selectedInjuryId);
      if (inj) {
        const phasesMap = lsGet<Record<string, number>>("odin_reeducation_phases", {});
        const phase = phasesMap[selectedInjuryId] ?? 1;
        const def = DEFAULT_TREATMENT(inj.injury, phase);
        const updated = {
          ...treatments,
          [selectedInjuryId]: def,
        };
        setTreatments(updated);
        lsSet(LS_TREATMENT, updated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per selection when missing
  }, [selectedInjuryId, injuries]);

  const phases = lsGet<Record<string, number>>("odin_reeducation_phases", {});
  const evals = lsGet<Record<string, EvalStored>>("odin_reeducation_evals", {});
  const resolvedIds: string[] = lsGet("odin_resolved_injuries", []);

  const selectedInj = injuries.find((i) => i.id === selectedInjuryId) ?? null;

  const selectedPlayer = selectedInj
    ? (players.find(
        (p) =>
          p.fullName.toLowerCase().trim() === selectedInj.name.toLowerCase().trim()
      ) ?? null)
    : null;

  const selectedTreatment = selectedInjuryId
    ? (treatments[selectedInjuryId] ?? null)
    : null;

  const updateTreatment = (id: string, update: Partial<TreatmentData>) => {
    const current = treatments[id] ?? DEFAULT_TREATMENT("", 1);
    const updated = {
      ...treatments,
      [id]: { ...current, ...update },
    };
    setTreatments(updated);
    lsSet(LS_TREATMENT, updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const activeCount = injuries.filter((i) => !resolvedIds.includes(i.id)).length;

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
          Gestion des traitements
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: 3,
          }}
        >
          Protocoles de traitement et suivi médical · {activeCount} joueur(s) en
          traitement
        </p>
      </div>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
          }}
        >
          <Loader2
            size={32}
            style={{
              color: "var(--text-muted)",
              animation: "spin 1s linear infinite",
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
            Chargement des traitements...
          </p>
        </div>
      )}

      {!loading && injuries.length === 0 && (
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
              color: C.success.main,
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
            Aucun joueur en traitement
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginTop: 4,
            }}
          >
            Les joueurs blessés apparaîtront ici
          </p>
        </div>
      )}

      {!loading && injuries.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 4,
                paddingLeft: 4,
              }}
            >
              Patients en traitement
            </p>
            {injuries
              .filter((i) => !resolvedIds.includes(i.id))
              .map((inj) => {
                const phase = phases[inj.id] ?? 1;
                const pc = C.primary;
                const evalData = evals[inj.id];
                const progress = getProgressFromPhaseAndEval(phase, evalData);
                const isSelected = selectedInjuryId === inj.id;
                const initials =
                  inj.name
                    .split(" ")
                    .map((n: string) => n[0] ?? "")
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?";

                return (
                  <motion.button
                    key={inj.id}
                    type="button"
                    onClick={() => {
                      setSelectedInjuryId(inj.id);
                      setNewProtocol("");
                      setNewObjective("");
                      setNewAllowed("");
                      setNewRestricted("");
                      setNewHistory("");
                    }}
                    whileHover={{ scale: 1.01 }}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: isSelected ? pc.bg : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        isSelected ? pc.border : "rgba(255,255,255,0.07)"
                      }`,
                      borderLeft: `3px solid ${
                        isSelected ? pc.main : "rgba(255,255,255,0.10)"
                      }`,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: isSelected
                            ? `${pc.main}20`
                            : "rgba(255,255,255,0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 800,
                          color: isSelected ? pc.main : "var(--text-muted)",
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {inj.name}
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {inj.injury}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: pc.main,
                          background: pc.bg,
                          padding: "2px 7px",
                          borderRadius: 99,
                          border: `1px solid ${pc.border}`,
                        }}
                      >
                        {getPhaseLabel(phase)}
                      </span>
                    </div>

                    <div>
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
                          Progression
                        </span>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: C.primary.main,
                          }}
                        >
                          {progress}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 3,
                          borderRadius: 99,
                          background: "rgba(255,255,255,0.08)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 99,
                            width: `${progress}%`,
                            background: C.primary.main,
                            transition: "width 0.5s",
                          }}
                        />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
          </div>

          {selectedInj && selectedTreatment && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <GlassCard raised className="p-5">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: C.primary.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 900,
                        color: C.primary.main,
                        flexShrink: 0,
                      }}
                    >
                      {selectedInj.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "var(--text-primary)",
                        }}
                      >
                        {selectedInj.name}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {selectedPlayer
                          ? translatePosition(selectedPlayer.position)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {saved && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: C.success.main,
                        background: C.success.bg,
                        border: `1px solid ${C.success.border}`,
                        padding: "4px 12px",
                        borderRadius: 99,
                      }}
                    >
                      ✓ Sauvegardé
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 10,
                  }}
                >
                  {[
                    {
                      label: "Blessure",
                      value: selectedInj.injury,
                      color: C.primary,
                    },
                    {
                      label: "Zone",
                      value: translateBodyPart(selectedInj.bodyPart),
                      color: C.primary,
                    },
                    {
                      label: "Phase actuelle",
                      value: getPhaseLabel(phases[selectedInj.id] ?? 1),
                      color: C.primary,
                    },
                    {
                      label: "Retour estimé",
                      value:
                        selectedInj.returnDate === "—"
                          ? "Non défini"
                          : selectedInj.returnDate,
                      color: C.primary,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: item.color.bg,
                        border: `1px solid ${item.color.border}`,
                        borderLeft: `3px solid ${item.color.main}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: item.color.main,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <GlassCard raised className="p-4">
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <HeartPulse size={13} style={{ color: C.primary.main }} />
                    Protocole de traitement
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      marginBottom: 10,
                    }}
                  >
                    {selectedTreatment.protocol.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: 8,
                          background: C.primary.bg,
                          border: `1px solid ${C.primary.border}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CheckCircle2 size={12} style={{ color: C.primary.main }} />
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--text-primary)",
                            }}
                          >
                            {item}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedTreatment.protocol.filter(
                              (_, j) => j !== i
                            );
                            updateTreatment(selectedInj.id, { protocol: updated });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 10,
                            color: "var(--text-muted)",
                            padding: "0 2px",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      placeholder="Ajouter un traitement..."
                      value={newProtocol}
                      onChange={(e) => setNewProtocol(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newProtocol.trim()) {
                          updateTreatment(selectedInj.id, {
                            protocol: [
                              ...selectedTreatment.protocol,
                              newProtocol.trim(),
                            ],
                          });
                          setNewProtocol("");
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "7px 10px",
                        background: "rgba(255,255,255,0.04)",
                        border: `1px solid ${C.primary.border}`,
                        borderRadius: 8,
                        fontSize: 11,
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newProtocol.trim()) return;
                        updateTreatment(selectedInj.id, {
                          protocol: [
                            ...selectedTreatment.protocol,
                            newProtocol.trim(),
                          ],
                        });
                        setNewProtocol("");
                      }}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: C.primary.bg,
                        border: `1px solid ${C.primary.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={13} style={{ color: C.primary.main }} />
                    </button>
                  </div>
                </GlassCard>

                <GlassCard raised className="p-4">
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Flag size={13} style={{ color: C.primary.main }} />
                    Objectifs thérapeutiques
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      marginBottom: 10,
                    }}
                  >
                    {selectedTreatment.objectives.map((obj, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          const updated = selectedTreatment.objectives.map(
                            (o, j) => (j === i ? { ...o, done: !o.done } : o)
                          );
                          updateTreatment(selectedInj.id, { objectives: updated });
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: obj.done
                            ? C.success.bg
                            : C.muted.bg,
                          border: `1px solid ${
                            obj.done ? C.success.border : C.muted.border
                          }`,
                          borderLeft: `2px solid ${
                            obj.done ? C.success.main : C.primary.main
                          }`,
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
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              background: obj.done
                                ? C.success.main
                                : "rgba(255,255,255,0.08)",
                              border: `1px solid ${
                                obj.done ? C.success.main : "rgba(255,255,255,0.20)"
                              }`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {obj.done && (
                              <CheckCircle2 size={9} style={{ color: "white" }} />
                            )}
                          </div>
                          <p
                            style={{
                              fontSize: 11,
                              color: "var(--text-primary)",
                              textDecoration: obj.done ? "line-through" : "none",
                            }}
                          >
                            {obj.label}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const updated = selectedTreatment.objectives.filter(
                              (_, j) => j !== i
                            );
                            updateTreatment(selectedInj.id, {
                              objectives: updated,
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 10,
                            color: "var(--text-muted)",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      placeholder="Ajouter un objectif..."
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newObjective.trim()) {
                          updateTreatment(selectedInj.id, {
                            objectives: [
                              ...selectedTreatment.objectives,
                              { label: newObjective.trim(), done: false },
                            ],
                          });
                          setNewObjective("");
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "7px 10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 8,
                        fontSize: 11,
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newObjective.trim()) return;
                        updateTreatment(selectedInj.id, {
                          objectives: [
                            ...selectedTreatment.objectives,
                            { label: newObjective.trim(), done: false },
                          ],
                        });
                        setNewObjective("");
                      }}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        background: C.primary.bg,
                        border: `1px solid ${C.primary.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={13} style={{ color: C.primary.main }} />
                    </button>
                  </div>
                </GlassCard>

                <GlassCard raised className="p-4">
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Shield size={13} style={{ color: C.primary.main }} />
                    Restrictions médicales
                  </p>

                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.success.main,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    ✅ Autorisé
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginBottom: 10,
                    }}
                  >
                    {selectedTreatment.allowed.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderRadius: 7,
                          background: C.success.bg,
                          border: `1px solid ${C.success.border}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-primary)",
                          }}
                        >
                          {item}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedTreatment.allowed.filter(
                              (_, j) => j !== i
                            );
                            updateTreatment(selectedInj.id, { allowed: updated });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 10,
                            color: "var(--text-muted)",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <input
                      placeholder="Ajouter activité autorisée..."
                      value={newAllowed}
                      onChange={(e) => setNewAllowed(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newAllowed.trim()) {
                          updateTreatment(selectedInj.id, {
                            allowed: [
                              ...selectedTreatment.allowed,
                              newAllowed.trim(),
                            ],
                          });
                          setNewAllowed("");
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 7,
                        fontSize: 11,
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAllowed.trim()) return;
                        updateTreatment(selectedInj.id, {
                          allowed: [
                            ...selectedTreatment.allowed,
                            newAllowed.trim(),
                          ],
                        });
                        setNewAllowed("");
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 7,
                        background: C.success.bg,
                        border: `1px solid ${C.success.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={12} style={{ color: C.success.main }} />
                    </button>
                  </div>

                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.danger.main,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    ❌ Interdit
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      marginBottom: 10,
                    }}
                  >
                    {selectedTreatment.restricted.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderRadius: 7,
                          background: C.danger.bg,
                          border: `1px solid ${C.danger.border}`,
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-primary)",
                          }}
                        >
                          {item}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedTreatment.restricted.filter(
                              (_, j) => j !== i
                            );
                            updateTreatment(selectedInj.id, {
                              restricted: updated,
                            });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 10,
                            color: "var(--text-muted)",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input
                      placeholder="Ajouter une restriction..."
                      value={newRestricted}
                      onChange={(e) => setNewRestricted(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newRestricted.trim()) {
                          updateTreatment(selectedInj.id, {
                            restricted: [
                              ...selectedTreatment.restricted,
                              newRestricted.trim(),
                            ],
                          });
                          setNewRestricted("");
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "6px 10px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: 7,
                        fontSize: 11,
                        color: "var(--text-primary)",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newRestricted.trim()) return;
                        updateTreatment(selectedInj.id, {
                          restricted: [
                            ...selectedTreatment.restricted,
                            newRestricted.trim(),
                          ],
                        });
                        setNewRestricted("");
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 7,
                        background: C.danger.bg,
                        border: `1px solid ${C.danger.border}`,
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={12} style={{ color: C.danger.main }} />
                    </button>
                  </div>
                </GlassCard>

                <GlassCard raised className="p-4">
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Activity size={13} style={{ color: C.primary.main }} />
                    Suivi de progression
                  </p>

                  {(() => {
                    const phase = phases[selectedInj.id] ?? 1;
                    const evalData = evals[selectedInj.id];
                    const progress = getProgressFromPhaseAndEval(phase, evalData);
                    const pc = C.primary;

                    return (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                            }}
                          >
                            Progression globale
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 900,
                              color: pc.main,
                            }}
                          >
                            {progress}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 8,
                            borderRadius: 99,
                            background: "rgba(255,255,255,0.08)",
                            overflow: "hidden",
                            marginBottom: 14,
                          }}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8 }}
                            style={{
                              height: "100%",
                              borderRadius: 99,
                              background: pc.main,
                            }}
                          />
                        </div>
                      </>
                    );
                  })()}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Date de début
                      </label>
                      <input
                        type="text"
                        value={selectedTreatment.startDate}
                        onChange={(e) =>
                          updateTreatment(selectedInj.id, {
                            startDate: e.target.value,
                          })
                        }
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.primary.border;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = C.muted.border;
                        }}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${C.muted.border}`,
                          borderRadius: 8,
                          fontSize: 11,
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        Prochain RDV
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 20/07/2026"
                        value={selectedTreatment.nextReview}
                        onChange={(e) =>
                          updateTreatment(selectedInj.id, {
                            nextReview: e.target.value,
                          })
                        }
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = C.primary.border;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = C.muted.border;
                        }}
                        style={{
                          width: "100%",
                          padding: "7px 10px",
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${C.muted.border}`,
                          borderRadius: 8,
                          fontSize: 11,
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: C.primary.bg,
                      border: `1px solid ${C.primary.border}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: C.primary.main,
                        marginBottom: 4,
                      }}
                    >
                      Objectifs atteints:{" "}
                      {selectedTreatment.objectives.filter((o) => o.done).length}/
                      {selectedTreatment.objectives.length}
                    </p>
                    <div
                      style={{
                        height: 3,
                        borderRadius: 99,
                        background: "rgba(255,255,255,0.10)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 99,
                          background: C.primary.main,
                          width:
                            selectedTreatment.objectives.length > 0
                              ? `${(
                                  (selectedTreatment.objectives.filter((o) => o.done)
                                    .length /
                                    selectedTreatment.objectives.length) *
                                  100
                                ).toFixed(0)}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </GlassCard>
              </div>

              <GlassCard raised className="p-4">
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Save size={13} style={{ color: C.primary.main }} />
                  Notes cliniques du médecin
                </p>
                <textarea
                  value={selectedTreatment.notes}
                  onChange={(e) =>
                    updateTreatment(selectedInj.id, { notes: e.target.value })
                  }
                  placeholder="Observations cliniques, évolution du traitement, décisions prises..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${C.primary.border}`,
                    borderRadius: 10,
                    fontSize: 12,
                    color: "var(--text-primary)",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <CheckCircle2 size={9} />
                  Sauvegardé automatiquement
                </p>
              </GlassCard>

              <GlassCard raised className="p-4">
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    marginBottom: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <History size={13} style={{ color: C.primary.main }} />
                  Historique du traitement
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  {selectedTreatment.history.length === 0 ? (
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      Aucun historique
                    </p>
                  ) : (
                    [...selectedTreatment.history].reverse().map((h, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "8px 10px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          borderLeft: `2px solid ${C.primary.main}`,
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: C.primary.main,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h.date}
                          </p>
                        </div>
                        <p
                          style={{
                            fontSize: 11,
                            color: "var(--text-primary)",
                            lineHeight: 1.4,
                          }}
                        >
                          {h.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    placeholder="Ajouter une note d'historique..."
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newHistory.trim()) {
                        updateTreatment(selectedInj.id, {
                          history: [
                            ...selectedTreatment.history,
                            {
                              date: new Date().toLocaleDateString("fr-FR"),
                              note: newHistory.trim(),
                            },
                          ],
                        });
                        setNewHistory("");
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      borderRadius: 8,
                      fontSize: 11,
                      color: "var(--text-primary)",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newHistory.trim()) return;
                      updateTreatment(selectedInj.id, {
                        history: [
                          ...selectedTreatment.history,
                          {
                            date: new Date().toLocaleDateString("fr-FR"),
                            note: newHistory.trim(),
                          },
                        ],
                      });
                      setNewHistory("");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: C.primary.bg,
                      border: `1px solid ${C.primary.border}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Plus size={13} style={{ color: C.primary.main }} />
                  </button>
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
