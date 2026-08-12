import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Target, TrendingUp,
  Brain, Plus, Loader2,
  Trophy, Calendar, MapPin,
  CheckCircle2, Users, Activity,
} from "lucide-react";
import {
  CoachPageTransition, CCard,
  COACH_ACCENT,
} from "../../components/coach2/CoachPageTransition";
import { apiFetch } from "../../lib/api/authHeaders";

interface Opponent {
  id: string;
  name: string;
  competition: string;
  matchDate: string;
  homeAway: string;
  formation: string | null;
  strengths: string | null;
  weaknesses: string | null;
  notes: string | null;
  result: string | null;
  score: string | null;
  isPast: boolean;
}

interface OpponentNote {
  keyPlayers: {
    name: string;
    position: string;
    danger: "Très élevé" | "Élevé" | "Modéré";
    note: string;
  }[];
  tacticalNote: string;
  recentForm: string[];
}

type DangerLevel = "Très élevé" | "Élevé" | "Modéré";

function EmptySection({
  color, msg, sub, editMode,
}: {
  color: string;
  msg: string;
  sub: string;
  editMode: boolean;
}) {
  return (
    <div style={{
      textAlign: "center", padding: "20px 0",
      borderRadius: 10,
      border: `1px dashed ${color}30`,
    }}>
      <p style={{ fontSize: 12, color }}>
        {msg}
      </p>
      {editMode && (
        <p style={{
          fontSize: 10, color: "var(--text-muted)",
          marginTop: 4, opacity: 0.7,
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function CoachOpponentPage() {
  const [opponents, setOpponents] =
    useState<Opponent[]>([]);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [notes, setNotes] =
    useState<Record<string, OpponentNote>>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const [editKeyPlayer, setEditKeyPlayer] =
    useState<{
      name: string;
      position: string;
      danger: DangerLevel;
      note: string;
    }>({
      name: "", position: "",
      danger: "Élevé", note: "",
    });

  useEffect(() => {
    const load = async () => {
      let matchData: any = null;

      try {
        const r = await apiFetch("/club/matches");
        if (r.ok) matchData = await r.json();
      } catch (e) { console.warn(e); }

      const upcoming = matchData?.upcoming ?? [];
      const past = matchData?.past ?? [];
      const pastIds = new Set(
        past.map((m: any) => m.id)
      );

      const allMatches = [
        ...upcoming,
        ...past,
      ];

      const uniqueOpponents: Opponent[] = [];
      const seen = new Set<string>();

      allMatches.forEach((m: any) => {
        const key = m.opponent?.toLowerCase().trim();
        if (!key || seen.has(key)) return;
        seen.add(key);
        const isPastFromList = pastIds.has(m.id);
        const isPastFromDate = m.matchDateISO
          ? new Date(m.matchDateISO) < new Date()
          : false;
        uniqueOpponents.push({
          id: m.id,
          name: m.opponent,
          competition: m.competition ?? "Ligue 1",
          matchDate: m.matchDate ?? "—",
          homeAway: m.homeAwayLabel ?? "—",
          formation: m.opponentFormation ?? null,
          strengths: m.opponentStrengths ?? null,
          weaknesses: m.opponentWeaknesses ?? null,
          notes: m.notes ?? null,
          result: m.result ?? null,
          score: m.score ?? null,
          isPast: isPastFromList || isPastFromDate,
        });
      });

      setOpponents(uniqueOpponents);
      if (uniqueOpponents.length > 0) {
        setSelectedId(uniqueOpponents[0].id);
      }

      try {
        const savedNotes = localStorage.getItem(
          "odin_opponent_notes"
        );
        if (savedNotes) {
          setNotes(JSON.parse(savedNotes));
        }
      } catch {}

      setLoading(false);
    };
    load();
  }, []);

  const selectedOpp = opponents.find(
    o => o.id === selectedId
  ) ?? null;

  const selectedNote = selectedId
    ? notes[selectedId] ?? {
        keyPlayers: [],
        tacticalNote: "",
        recentForm: [],
      }
    : null;

  const saveNote = (
    oppId: string,
    note: Partial<OpponentNote>
  ) => {
    const updated = {
      ...notes,
      [oppId]: {
        ...notes[oppId],
        keyPlayers: notes[oppId]?.keyPlayers ?? [],
        tacticalNote: notes[oppId]?.tacticalNote ?? "",
        recentForm: notes[oppId]?.recentForm ?? [],
        ...note,
      },
    };
    setNotes(updated);
    try {
      localStorage.setItem(
        "odin_opponent_notes",
        JSON.stringify(updated)
      );
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addKeyPlayer = () => {
    if (!selectedId || !editKeyPlayer.name) return;
    const current = notes[selectedId]
      ?.keyPlayers ?? [];
    saveNote(selectedId, {
      keyPlayers: [...current, { ...editKeyPlayer }],
    });
    setEditKeyPlayer({
      name: "", position: "",
      danger: "Élevé", note: "",
    });
  };

  const removeKeyPlayer = (idx: number) => {
    if (!selectedId) return;
    const current = notes[selectedId]
      ?.keyPlayers ?? [];
    saveNote(selectedId, {
      keyPlayers: current.filter(
        (_: { name: string }, i: number) => i !== idx
      ),
    });
  };

  const getAIRecommendation = (
    opp: Opponent
  ): string => {
    const parts: string[] = [];

    if (opp.formation) {
      parts.push(
        `L'adversaire joue en ${opp.formation}.`
      );
    }

    if (opp.weaknesses) {
      parts.push(
        `Exploitez: ${opp.weaknesses}.`
      );
    }

    if (opp.strengths) {
      parts.push(
        `Attention à: ${opp.strengths}.`
      );
    }

    if (opp.homeAway === "Extérieur") {
      parts.push(
        "Match à l'extérieur — bloc bas recommandé " +
        "en première mi-temps."
      );
    } else {
      parts.push(
        "Match à domicile — pressing haut " +
        "dès le début."
      );
    }

    if (parts.length === 0) {
      return "Complétez les informations adversaire " +
             "pour recevoir des recommandations " +
             "tactiques personnalisées.";
    }

    return parts.join(" ");
  };

  return (
    <CoachPageTransition>
      <div style={{
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {/* HEADER */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
        }}>
          <div>
            <h1 style={{
              fontSize: 20, fontWeight: 800,
              color: "var(--text-primary)",
            }}>
              Analyse Adversaire
            </h1>
            <p style={{
              fontSize: 12, color: "var(--text-muted)",
              marginTop: 3,
            }}>
              Forces, faiblesses, joueurs clés,
              note tactique
            </p>
          </div>
          {selectedOpp && (
            <motion.button
              type="button"
              onClick={() => setEditMode(!editMode)}
              whileHover={{ scale: 1.04 }}
              style={{
                display: "flex", alignItems: "center",
                gap: 6, padding: "8px 16px",
                borderRadius: 10,
                background: editMode
                  ? "rgba(34,197,94,0.15)"
                  : "rgba(255,122,0,0.12)",
                border: editMode
                  ? "1px solid rgba(34,197,94,0.30)"
                  : "1px solid rgba(255,122,0,0.25)",
                color: editMode ? "#22c55e" : "#ff7a00",
                fontSize: 12, fontWeight: 700,
                cursor: "pointer",
              }}>
              {editMode
                ? <><CheckCircle2 size={13} /> Terminer</>
                : <><Plus size={13} /> Compléter l'analyse</>
              }
            </motion.button>
          )}
        </div>

        {loading && (
          <div style={{
            textAlign: "center", padding: "60px 0",
          }}>
            <Loader2 size={32} style={{
              color: "var(--text-muted)",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }} />
          </div>
        )}

        {!loading && opponents.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 0",
            borderRadius: 16,
            border: "1px dashed rgba(255,255,255,0.08)",
          }}>
            <Shield size={40} style={{
              color: "var(--text-muted)",
              margin: "0 auto 12px",
            }} />
            <p style={{
              fontSize: 15, fontWeight: 700,
              color: "var(--text-muted)",
            }}>
              Aucun adversaire enregistré
            </p>
            <p style={{
              fontSize: 12, color: "var(--text-muted)",
              marginTop: 4, opacity: 0.7,
            }}>
              Ajoutez des matchs depuis la page Matchs
              pour voir les adversaires ici
            </p>
          </div>
        )}

        {!loading && opponents.length > 0 && (
          <>
            {/* OPPONENT SELECTOR */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8,
            }}>
              {opponents.map(o => (
                <motion.button
                  key={o.id} type="button"
                  onClick={() => setSelectedId(o.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: 10, padding: "10px 16px",
                    borderRadius: 14,
                    background: selectedId === o.id
                      ? "rgba(255,122,0,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedId === o.id
                      ? "rgba(255,122,0,0.35)"
                      : "rgba(255,255,255,0.08)"}`,
                    boxShadow: selectedId === o.id
                      ? "0 0 16px rgba(255,122,0,0.15)"
                      : "none",
                    cursor: "pointer",
                  }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: selectedId === o.id
                      ? "rgba(255,122,0,0.15)"
                      : "rgba(255,255,255,0.06)",
                    display: "flex", alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14, fontWeight: 800,
                    color: selectedId === o.id
                      ? COACH_ACCENT : "var(--text-muted)",
                    flexShrink: 0,
                  }}>
                    {o.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{
                      fontSize: 13, fontWeight: 700,
                      color: selectedId === o.id
                        ? COACH_ACCENT : "var(--text-primary)",
                    }}>
                      {o.name}
                    </p>
                    <p style={{
                      fontSize: 10, color: "var(--text-muted)",
                      marginTop: 2,
                    }}>
                      {o.competition} · {o.matchDate}
                      {o.isPast && o.score && (
                        <span style={{
                          marginLeft: 6, fontWeight: 700,
                          color: o.result === "V"
                            ? "#22c55e"
                            : o.result === "N"
                            ? "#f59e0b" : "#ef4444",
                        }}>
                          {o.score}
                        </span>
                      )}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {selectedOpp && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedOpp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex", flexDirection: "column",
                    gap: 14,
                  }}>

                  {/* Hero banner */}
                  <motion.div style={{
                    padding: "18px 22px",
                    borderRadius: 16,
                    background: `linear-gradient(135deg,
                      rgba(255,122,0,0.10),
                      rgba(139,92,246,0.08))`,
                    border: "1px solid rgba(255,122,0,0.25)",
                    borderLeft: "4px solid #ff7a00",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap", gap: 16,
                  }}>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: 16,
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: "rgba(255,122,0,0.15)",
                        border: "1px solid rgba(255,122,0,0.25)",
                        display: "flex", alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18, fontWeight: 900,
                        color: COACH_ACCENT, flexShrink: 0,
                      }}>
                        {selectedOpp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{
                          fontSize: 18, fontWeight: 900,
                          color: "var(--text-primary)",
                          marginBottom: 4,
                        }}>
                          {selectedOpp.name}
                        </p>
                        <div style={{
                          display: "flex", gap: 12,
                          flexWrap: "wrap",
                        }}>
                          <span style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.55)",
                            display: "flex", alignItems: "center",
                            gap: 5,
                          }}>
                            <Trophy size={11}
                              style={{ color: COACH_ACCENT }} />
                            {selectedOpp.competition}
                          </span>
                          <span style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.55)",
                            display: "flex", alignItems: "center",
                            gap: 5,
                          }}>
                            <Calendar size={11}
                              style={{ color: "#3b82f6" }} />
                            {selectedOpp.matchDate}
                          </span>
                          <span style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.55)",
                            display: "flex", alignItems: "center",
                            gap: 5,
                          }}>
                            <MapPin size={11}
                              style={{ color: "#8b5cf6" }} />
                            {selectedOpp.homeAway}
                          </span>
                          {selectedOpp.formation && (
                            <span style={{
                              fontSize: 12, fontWeight: 700,
                              color: COACH_ACCENT,
                              background: "rgba(255,122,0,0.12)",
                              border: "1px solid rgba(255,122,0,0.25)",
                              padding: "2px 10px", borderRadius: 99,
                            }}>
                              {selectedOpp.formation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {selectedOpp.isPast && selectedOpp.score && (
                      <div style={{ textAlign: "center" }}>
                        <p style={{
                          fontSize: 28, fontWeight: 900,
                          color: selectedOpp.result === "V"
                            ? "#22c55e"
                            : selectedOpp.result === "N"
                            ? "#f59e0b" : "#ef4444",
                          lineHeight: 1,
                        }}>
                          {selectedOpp.score}
                        </p>
                        <p style={{
                          fontSize: 11, fontWeight: 700,
                          color: selectedOpp.result === "V"
                            ? "#22c55e"
                            : selectedOpp.result === "N"
                            ? "#f59e0b" : "#ef4444",
                          marginTop: 4,
                        }}>
                          {selectedOpp.result === "V" ? "Victoire"
                           : selectedOpp.result === "N" ? "Nul"
                           : "Défaite"}
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* Strengths + Weaknesses */}
                  <div
                    className="opp-two-col"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}>
                    <style>{`
                      @media (max-width: 800px) {
                        .opp-two-col { grid-template-columns: 1fr !important; }
                      }
                    `}</style>

                    <CCard>
                      <p style={{
                        fontSize: 13, fontWeight: 700,
                        color: "#22c55e", marginBottom: 10,
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <TrendingUp size={13} /> Points forts
                      </p>

                      {selectedOpp.strengths ? (
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(34,197,94,0.06)",
                          border: "1px solid rgba(34,197,94,0.20)",
                          borderLeft: "3px solid #22c55e",
                        }}>
                          <p style={{
                            fontSize: 12, color: "var(--text-primary)",
                            lineHeight: 1.6,
                          }}>
                            {selectedOpp.strengths}
                          </p>
                        </div>
                      ) : (
                        <EmptySection
                          color="#22c55e"
                          msg="Aucun point fort renseigné"
                          sub="Modifiez le match pour ajouter"
                          editMode={editMode}
                        />
                      )}
                    </CCard>

                    <CCard>
                      <p style={{
                        fontSize: 13, fontWeight: 700,
                        color: "#ef4444", marginBottom: 10,
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <Target size={13} /> Points faibles
                      </p>

                      {selectedOpp.weaknesses ? (
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(239,68,68,0.06)",
                          border: "1px solid rgba(239,68,68,0.20)",
                          borderLeft: "3px solid #ef4444",
                        }}>
                          <p style={{
                            fontSize: 12, color: "var(--text-primary)",
                            lineHeight: 1.6,
                          }}>
                            {selectedOpp.weaknesses}
                          </p>
                        </div>
                      ) : (
                        <EmptySection
                          color="#ef4444"
                          msg="Aucun point faible renseigné"
                          sub="Modifiez le match pour ajouter"
                          editMode={editMode}
                        />
                      )}
                    </CCard>
                  </div>

                  {/* Key Players */}
                  <CCard>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: 8, marginBottom: 12,
                    }}>
                      <Users size={13}
                        style={{ color: "#f59e0b" }} />
                      <p style={{
                        fontSize: 13, fontWeight: 700,
                        color: "var(--text-primary)",
                      }}>
                        Joueurs clés à surveiller
                      </p>
                    </div>

                    {selectedNote &&
                     selectedNote.keyPlayers.length > 0 ? (
                      <div
                        className="opp-two-col"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8, marginBottom: 12,
                        }}>
                        {selectedNote.keyPlayers.map(
                          (kp, i) => {
                            const c = kp.danger === "Très élevé"
                              ? "#ef4444"
                              : kp.danger === "Élevé"
                              ? "#f59e0b" : "#22c55e";
                            return (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10, padding: "10px 12px",
                                  borderRadius: 12,
                                  background: `${c}08`,
                                  border: `1px solid ${c}25`,
                                  position: "relative",
                                }}>
                                <div style={{
                                  width: 36, height: 36,
                                  borderRadius: 10, flexShrink: 0,
                                  background: `${c}18`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 10, fontWeight: 800,
                                  color: c,
                                }}>
                                  {kp.position || "?"}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{
                                    fontSize: 12, fontWeight: 700,
                                    color: "var(--text-primary)",
                                  }}>
                                    {kp.name}
                                  </p>
                                  <span style={{
                                    fontSize: 9, fontWeight: 700,
                                    color: c,
                                    background: `${c}18`,
                                    padding: "1px 6px",
                                    borderRadius: 99,
                                  }}>
                                    Danger {kp.danger}
                                  </span>
                                </div>
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={() => removeKeyPlayer(i)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "var(--text-muted)",
                                      fontSize: 12, padding: "2px",
                                    }}>
                                    ✕
                                  </button>
                                )}
                              </motion.div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div style={{
                        textAlign: "center", padding: "20px 0",
                        marginBottom: 12,
                        borderRadius: 10,
                        border: "1px dashed rgba(255,255,255,0.08)",
                      }}>
                        <p style={{
                          fontSize: 12, color: "var(--text-muted)",
                        }}>
                          Aucun joueur clé renseigné
                        </p>
                      </div>
                    )}

                    {editMode && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 12,
                          background: "rgba(255,122,0,0.06)",
                          border: "1px solid rgba(255,122,0,0.20)",
                          display: "flex", flexDirection: "column",
                          gap: 8,
                        }}>
                        <p style={{
                          fontSize: 10, fontWeight: 700,
                          color: COACH_ACCENT,
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                        }}>
                          Ajouter un joueur clé
                        </p>
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}>
                          {[
                            { label: "Nom", key: "name" as const,
                              placeholder: "Ex: Ben Ali Mohamed" },
                            { label: "Poste", key: "position" as const,
                              placeholder: "Ex: MC, BU, GK" },
                          ].map(f => (
                            <div key={f.key}>
                              <label style={{
                                fontSize: 9, fontWeight: 700,
                                color: "rgba(255,255,255,0.40)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                display: "block", marginBottom: 4,
                              }}>
                                {f.label}
                              </label>
                              <input
                                placeholder={f.placeholder}
                                value={editKeyPlayer[f.key]}
                                onChange={e =>
                                  setEditKeyPlayer(p =>
                                    ({ ...p, [f.key]: e.target.value })
                                  )
                                }
                                style={{
                                  width: "100%", padding: "7px 10px",
                                  background: "rgba(255,255,255,0.05)",
                                  border:
                                    "1px solid rgba(255,255,255,0.10)",
                                  borderRadius: 8, fontSize: 11,
                                  color: "var(--text-primary)",
                                  outline: "none",
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        <div>
                          <label style={{
                            fontSize: 9, fontWeight: 700,
                            color: "rgba(255,255,255,0.40)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            display: "block", marginBottom: 4,
                          }}>
                            Niveau de danger
                          </label>
                          <div style={{ display: "flex", gap: 6 }}>
                            {(["Modéré", "Élevé", "Très élevé"] as const).map(d => (
                              <button
                                key={d} type="button"
                                onClick={() =>
                                  setEditKeyPlayer(p =>
                                    ({ ...p, danger: d })
                                  )
                                }
                                style={{
                                  flex: 1, padding: "6px 8px",
                                  borderRadius: 8, fontSize: 10,
                                  fontWeight: 700, cursor: "pointer",
                                  border: "none",
                                  background:
                                    editKeyPlayer.danger === d
                                      ? d === "Très élevé"
                                        ? "rgba(239,68,68,0.25)"
                                        : d === "Élevé"
                                        ? "rgba(245,158,11,0.25)"
                                        : "rgba(34,197,94,0.25)"
                                      : "rgba(255,255,255,0.06)",
                                  color:
                                    editKeyPlayer.danger === d
                                      ? d === "Très élevé" ? "#ef4444"
                                        : d === "Élevé" ? "#f59e0b"
                                        : "#22c55e"
                                      : "var(--text-muted)",
                                }}>
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          onClick={addKeyPlayer}
                          disabled={!editKeyPlayer.name}
                          whileHover={{ scale: 1.02 }}
                          style={{
                            padding: "8px",
                            borderRadius: 9, fontSize: 12,
                            fontWeight: 700, border: "none",
                            cursor: "pointer",
                            background: editKeyPlayer.name
                              ? `linear-gradient(135deg,
                                  #ff7a00,#e66000)`
                              : "rgba(255,255,255,0.06)",
                            color: editKeyPlayer.name
                              ? "white" : "var(--text-muted)",
                          }}>
                          + Ajouter ce joueur
                        </motion.button>
                      </motion.div>
                    )}
                  </CCard>

                  {/* Tactical Note + AI Reco */}
                  <div
                    className="opp-two-col"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 14,
                    }}>

                    <CCard>
                      <p style={{
                        fontSize: 13, fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 10,
                        display: "flex", alignItems: "center",
                        gap: 6,
                      }}>
                        <Shield size={13}
                          style={{ color: "#3b82f6" }} />
                        Note tactique
                      </p>

                      {editMode ? (
                        <div style={{
                          display: "flex", flexDirection: "column",
                          gap: 8,
                        }}>
                          <textarea
                            value={
                              selectedNote?.tacticalNote ?? ""
                            }
                            onChange={e => {
                              if (!selectedId) return;
                              const updated = {
                                ...notes,
                                [selectedId]: {
                                  ...notes[selectedId],
                                  keyPlayers:
                                    notes[selectedId]
                                      ?.keyPlayers ?? [],
                                  recentForm:
                                    notes[selectedId]
                                      ?.recentForm ?? [],
                                  tacticalNote: e.target.value,
                                },
                              };
                              setNotes(updated);
                            }}
                            placeholder="Analyse tactique de l'adversaire..."
                            rows={5}
                            style={{
                              width: "100%", padding: "10px 12px",
                              background: "rgba(255,255,255,0.04)",
                              border:
                                "1px solid rgba(255,255,255,0.10)",
                              borderRadius: 10, fontSize: 12,
                              color: "var(--text-primary)",
                              resize: "vertical", outline: "none",
                              fontFamily: "inherit", lineHeight: 1.6,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedId || !selectedNote)
                                return;
                              saveNote(selectedId, {
                                tacticalNote:
                                  selectedNote.tacticalNote,
                              });
                            }}
                            style={{
                              padding: "7px",
                              borderRadius: 8, fontSize: 11,
                              fontWeight: 700, border: "none",
                              cursor: "pointer",
                              background: saved
                                ? "rgba(34,197,94,0.15)"
                                : "rgba(59,130,246,0.15)",
                              color: saved ? "#22c55e" : "#3b82f6",
                            }}>
                            {saved
                              ? "✓ Sauvegardé"
                              : "Sauvegarder la note"}
                          </button>
                        </div>
                      ) : selectedNote?.tacticalNote ? (
                        <div style={{
                          padding: "10px 14px",
                          borderRadius: 10,
                          background: "rgba(59,130,246,0.06)",
                          border: "1px solid rgba(59,130,246,0.20)",
                          borderLeft: "3px solid #3b82f6",
                        }}>
                          <p style={{
                            fontSize: 12, color: "var(--text-primary)",
                            lineHeight: 1.6,
                          }}>
                            {selectedNote.tacticalNote}
                          </p>
                        </div>
                      ) : (
                        <div style={{
                          textAlign: "center", padding: "24px 0",
                          borderRadius: 10,
                          border:
                            "1px dashed rgba(255,255,255,0.08)",
                        }}>
                          <p style={{
                            fontSize: 12, color: "var(--text-muted)",
                          }}>
                            Aucune note tactique
                          </p>
                          <p style={{
                            fontSize: 10,
                            color: "var(--text-muted)",
                            marginTop: 4, opacity: 0.7,
                          }}>
                            Cliquez sur "Compléter l'analyse"
                            pour ajouter
                          </p>
                        </div>
                      )}
                    </CCard>

                    <CCard>
                      <p style={{
                        fontSize: 13, fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 10,
                        display: "flex", alignItems: "center",
                        gap: 6,
                      }}>
                        <Brain size={13}
                          style={{ color: "#8b5cf6" }} />
                        Recommandation IA
                      </p>
                      <div style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        background: "rgba(139,92,246,0.08)",
                        border: "1px solid rgba(139,92,246,0.20)",
                        borderLeft: "3px solid #8b5cf6",
                      }}>
                        <p style={{
                          fontSize: 12, color: "var(--text-primary)",
                          lineHeight: 1.7,
                        }}>
                          {getAIRecommendation(selectedOpp)}
                        </p>
                      </div>
                    </CCard>
                  </div>

                  {/* Radar chart */}
                  <CCard>
                    <p style={{
                      fontSize: 13, fontWeight: 700,
                      color: "var(--text-primary)", marginBottom: 12,
                    }}>
                      Comparaison globale — Notre club vs{" "}
                      {selectedOpp?.name ?? "Adversaire"}
                    </p>
                    <div style={{
                      textAlign: "center", padding: "32px 0",
                      borderRadius: 12,
                      border: "1px dashed rgba(255,255,255,0.08)",
                    }}>
                      <Activity size={28} style={{
                        color: "var(--text-muted)",
                        margin: "0 auto 10px", display: "block",
                      }} />
                      <p style={{
                        fontSize: 13, fontWeight: 600,
                        color: "var(--text-muted)",
                      }}>
                        Données comparatives non disponibles
                      </p>
                      <p style={{
                        fontSize: 11, color: "var(--text-muted)",
                        marginTop: 4, opacity: 0.7,
                      }}>
                        Les statistiques adversaire apparaîtront
                        après analyse vidéo et saisie manuelle
                      </p>
                    </div>
                  </CCard>

                </motion.div>
              </AnimatePresence>
            )}
          </>
        )}
      </div>
    </CoachPageTransition>
  );
}
