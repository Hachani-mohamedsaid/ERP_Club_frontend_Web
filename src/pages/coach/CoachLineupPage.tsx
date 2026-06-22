import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Save, Star } from "lucide-react";
import { CoachPageTransition, CCard, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";
import { SQUAD, FORMATIONS, type CoachPlayer } from "../../data/coachData";

const FORMATION_KEYS = Object.keys(FORMATIONS) as (keyof typeof FORMATIONS)[];
const AVAILABLE = SQUAD.filter(p => p.status === "Disponible" || p.status === "Surveillance");

function formeColor(v: number) { return v >= 85 ? "#22C55E" : v >= 70 ? "#FF7A00" : "#EF4444"; }

// Pitch dimensions in SVG units
const W = 400;
const H = 600;

export function CoachLineupPage() {
  const [formation, setFormation] = useState<keyof typeof FORMATIONS>("4-3-3");
  const [starters, setStarters] = useState<(CoachPlayer | null)[]>(Array(11).fill(null));
  const [subs, setSubs] = useState<CoachPlayer[]>([]);
  const [captain, setCaptain] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const formationDef = FORMATIONS[formation];
  const usedIds = [...starters.filter(Boolean).map(p => p!.id), ...subs.map(p => p.id)];
  const bench = AVAILABLE.filter(p => !usedIds.includes(p.id));
  const starterCount = starters.filter(Boolean).length;

  const addToFirstEmpty = (player: CoachPlayer) => {
    const emptyIdx = starters.findIndex(s => s === null);
    if (emptyIdx < 0) return;
    setStarters(prev => { const n = [...prev]; n[emptyIdx] = player; return n; });
    setSubs(s => s.filter(p => p.id !== player.id));
  };

  const addToSub = (player: CoachPlayer) => {
    if (subs.length >= 7) return;
    setSubs(s => [...s.filter(p => p.id !== player.id), player]);
    setStarters(prev => prev.map(p => p?.id === player.id ? null : p));
  };

  const removeStarter = (idx: number) => {
    setStarters(prev => { const n = [...prev]; n[idx] = null; return n; });
  };

  const removeSub = (id: string) => setSubs(s => s.filter(p => p.id !== id));

  const resetLineup = () => { setStarters(Array(11).fill(null)); setSubs([]); setCaptain(null); };

  const saveLineup = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <CoachPageTransition>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Composition d'équipe</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {starterCount}/11 titulaires · {subs.length} remplaçants
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button type="button" onClick={resetLineup}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <RotateCcw size={12} /> Reset
          </motion.button>
          <motion.button type="button" onClick={saveLineup}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, boxShadow: `0 0 14px ${COACH_ACCENT}40` }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Save size={12} /> {saved ? "Sauvegardé ✓" : "Sauvegarder"}
          </motion.button>
        </div>
      </div>

      {/* Formation selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Formation:</span>
        {FORMATION_KEYS.map(f => (
          <motion.button key={f} type="button" onClick={() => { setFormation(f); resetLineup(); }}
            className="rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{
              background: formation === f ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.06)",
              color: formation === f ? "white" : "var(--text-muted)",
              boxShadow: formation === f ? `0 0 12px ${COACH_ACCENT}40` : "none",
            }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            {FORMATIONS[f].label}
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
        {/* Football Pitch */}
        <CCard className="!p-4">
          <div className="flex justify-center">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: "100%", maxWidth: 420, borderRadius: 16, display: "block" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Background grass gradient */}
              <defs>
                <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1a5c30" />
                  <stop offset="50%" stopColor="#1e6b38" />
                  <stop offset="100%" stopColor="#1a5c30" />
                </linearGradient>
                {/* Stripe pattern */}
                <pattern id="stripes" x="0" y="0" width={W} height="50" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width={W} height="25" fill="rgba(255,255,255,0.025)" />
                  <rect x="0" y="25" width={W} height="25" fill="rgba(0,0,0,0.0)" />
                </pattern>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={COACH_ACCENT} floodOpacity="0.8" />
                </filter>
                <filter id="shadowGK" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Pitch background */}
              <rect x="0" y="0" width={W} height={H} fill="url(#grassGrad)" rx="16" />
              <rect x="0" y="0" width={W} height={H} fill="url(#stripes)" rx="16" />

              {/* Outer border */}
              <rect x="20" y="20" width={W - 40} height={H - 40} fill="none"
                stroke="rgba(255,255,255,0.55)" strokeWidth="2.5" rx="4" />

              {/* Halfway line */}
              <line x1="20" y1={H / 2} x2={W - 20} y2={H / 2}
                stroke="rgba(255,255,255,0.5)" strokeWidth="2" />

              {/* Center circle */}
              <circle cx={W / 2} cy={H / 2} r="55"
                fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
              <circle cx={W / 2} cy={H / 2} r="4" fill="rgba(255,255,255,0.7)" />

              {/* Top penalty area (opponent) */}
              <rect x="110" y="20" width="180" height="100"
                fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
              {/* Top 6-yard box */}
              <rect x="150" y="20" width="100" height="40"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              {/* Top goal */}
              <rect x="155" y="14" width="90" height="14"
                fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" rx="2" />
              {/* Top penalty spot */}
              <circle cx={W / 2} cy="88" r="4" fill="rgba(255,255,255,0.65)" />
              {/* Top penalty arc */}
              <path d={`M 148 120 A 55 55 0 0 1 252 120`}
                fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" />

              {/* Bottom penalty area (our team) */}
              <rect x="110" y={H - 120} width="180" height="100"
                fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.45)" strokeWidth="2" />
              {/* Bottom 6-yard box */}
              <rect x="150" y={H - 60} width="100" height="40"
                fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              {/* Bottom goal */}
              <rect x="155" y={H - 28} width="90" height="14"
                fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" rx="2" />
              {/* Bottom penalty spot */}
              <circle cx={W / 2} cy={H - 88} r="4" fill="rgba(255,255,255,0.65)" />
              {/* Bottom penalty arc */}
              <path d={`M 148 ${H - 120} A 55 55 0 0 0 252 ${H - 120}`}
                fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" />

              {/* Corner arcs */}
              <path d="M 20 40 A 20 20 0 0 1 40 20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              <path d={`M ${W - 40} 20 A 20 20 0 0 1 ${W - 20} 40`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              <path d={`M 20 ${H - 40} A 20 20 0 0 0 40 ${H - 20}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
              <path d={`M ${W - 40} ${H - 20} A 20 20 0 0 0 ${W - 20} ${H - 40}`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

              {/* Player positions */}
              {formationDef.positions.map((pos, idx) => {
                const player = starters[idx];
                const px = (pos.x / 100) * W;
                const py = (pos.y / 100) * H;
                const isGK = pos.pos === "GK";
                const r = 24;

                return (
                  <g key={idx} onClick={() => removeStarter(idx)} style={{ cursor: player ? "pointer" : "default" }}>
                    {player ? (
                      <>
                        {/* Glow ring */}
                        <circle cx={px} cy={py} r={r + 5}
                          fill={isGK ? "rgba(245,158,11,0.18)" : `rgba(255,122,0,0.18)`}
                          stroke={isGK ? "rgba(245,158,11,0.5)" : `rgba(255,122,0,0.5)`}
                          strokeWidth="1.5" />
                        {/* Main circle */}
                        <circle cx={px} cy={py} r={r}
                          fill={isGK ? "url(#gkGrad)" : "url(#playerGrad)"}
                          stroke="rgba(255,255,255,0.9)" strokeWidth="2.5"
                          filter={isGK ? "url(#shadowGK)" : "url(#shadow)"} />
                        {/* Number */}
                        <text x={px} y={py - 2} textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize="12" fontWeight="900" fontFamily="system-ui">
                          {player.number}
                        </text>
                        {/* Name label */}
                        <rect x={px - 32} y={py + r + 2} width="64" height="18" rx="5"
                          fill="rgba(0,0,0,0.72)" />
                        <text x={px} y={py + r + 12} textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize="9.5" fontWeight="700" fontFamily="system-ui">
                          {player.name.split(" ").slice(-1)[0].substring(0, 10)}
                        </text>
                        {/* Forme dot */}
                        <circle cx={px + r - 4} cy={py - r + 4} r="6"
                          fill={formeColor(player.forme)} stroke="rgba(0,0,0,0.6)" strokeWidth="1" />
                        <text x={px + r - 4} y={py - r + 4} textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize="6" fontWeight="900" fontFamily="system-ui">
                          {player.forme > 0 ? player.forme : "—"}
                        </text>
                        {/* Captain badge */}
                        {captain === player.id && (
                          <circle cx={px - r + 4} cy={py - r + 4} r="7"
                            fill="#F59E0B" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                        )}
                        {captain === player.id && (
                          <text x={px - r + 4} y={py - r + 4} textAnchor="middle" dominantBaseline="middle"
                            fill="white" fontSize="7" fontWeight="900">C</text>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Empty slot */}
                        <circle cx={px} cy={py} r={r}
                          fill="rgba(255,255,255,0.06)"
                          stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="5 3" />
                        <text x={px} y={py - 2} textAnchor="middle" dominantBaseline="middle"
                          fill="rgba(255,255,255,0.5)" fontSize="9" fontWeight="700" fontFamily="system-ui">
                          {pos.pos}
                        </text>
                        <text x={px} y={py + 8} textAnchor="middle" dominantBaseline="middle"
                          fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="system-ui">
                          Choisir
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Gradients for players */}
              <defs>
                <linearGradient id="playerGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9A40" />
                  <stop offset="100%" stopColor="#E66000" />
                </linearGradient>
                <linearGradient id="gkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Subs strip */}
          {subs.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold mb-2 px-1" style={{ color: "var(--text-muted)" }}>
                Remplaçants ({subs.length}/7)
              </p>
              <div className="flex flex-wrap gap-2">
                {subs.map(p => (
                  <motion.div key={p.id} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    className="flex items-center gap-1.5 rounded-xl border px-2 py-1.5 cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)" }}
                    onClick={() => removeSub(p.id)}>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ background: "rgba(255,122,0,0.2)", color: COACH_ACCENT }}>{p.number}</div>
                    <div>
                      <p className="text-[10px] font-semibold leading-none" style={{ color: "var(--text-primary)" }}>{p.name.split(" ").slice(-1)[0]}</p>
                      <p className="text-[8px]" style={{ color: "var(--text-muted)" }}>{p.position}</p>
                    </div>
                    <span className="text-[9px] font-bold ml-1" style={{ color: formeColor(p.forme) }}>{p.forme}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: COACH_ACCENT }} />
              Joueur de champ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: "#F59E0B" }} />
              Gardien
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
              Forme ≥85
            </span>
            <span className="flex items-center gap-1.5">🖱 Cliquer = retirer</span>
          </div>
        </CCard>

        {/* Bench panel */}
        <div className="space-y-3">
          {/* Stats */}
          <CCard>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Titulaires", value: starterCount, max: 11, color: COACH_ACCENT },
                { label: "Remplaçants", value: subs.length, max: 7, color: "#3B82F6" },
                { label: "Forme moy.", value: starters.filter(Boolean).length > 0 ? Math.round(starters.filter(Boolean).reduce((a, p) => a + (p?.forme ?? 0), 0) / starters.filter(Boolean).length) : "—", max: null, color: "#22C55E" },
              ].map(k => (
                <div key={k.label} className="rounded-xl border p-2"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                  <p className="text-lg font-extrabold" style={{ color: k.color }}>
                    {k.max ? `${k.value}/${k.max}` : k.value}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{k.label}</p>
                </div>
              ))}
            </div>
          </CCard>

          {/* Available players */}
          <CCard>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              Effectif disponible ({bench.length})
            </p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {bench.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="group flex items-center gap-2 rounded-xl border px-2.5 py-2"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
                    style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, color: "white" }}>
                    {p.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate" style={{ color: "var(--text-primary)" }}>{p.name}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{p.positionFull}</p>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: formeColor(p.forme) }}>{p.forme}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button type="button" title="Titulaire" onClick={() => addToFirstEmpty(p)}
                      className="rounded-lg px-2 py-1 text-[9px] font-bold"
                      style={{ background: `${COACH_ACCENT}22`, color: COACH_ACCENT }}
                      whileHover={{ scale: 1.1 }}>
                      Tit.
                    </motion.button>
                    <motion.button type="button" title="Remplaçant" onClick={() => addToSub(p)}
                      className="rounded-lg px-2 py-1 text-[9px] font-bold"
                      style={{ background: "rgba(59,130,246,0.18)", color: "#3B82F6" }}
                      whileHover={{ scale: 1.1 }}>
                      Rem.
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              {bench.length === 0 && (
                <p className="py-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  Tous les joueurs sont placés ✓
                </p>
              )}
            </div>
          </CCard>

          {/* Captain */}
          {starters.some(Boolean) && (
            <CCard>
              <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                <Star size={11} className="inline mr-1" style={{ color: "#F59E0B" }} />Capitaine
              </p>
              <select value={captain ?? ""} onChange={e => setCaptain(e.target.value || null)}
                className="w-full rounded-xl border px-3 py-2 text-xs outline-none"
                style={{ background: "rgba(10,8,28,0.9)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}>
                <option value="">— Choisir capitaine —</option>
                {starters.filter(Boolean).map(p => (
                  <option key={p!.id} value={p!.id}>{p!.name} (#{p!.number})</option>
                ))}
              </select>
              {captain && (
                <motion.div className="mt-2 flex items-center gap-2 rounded-xl border p-2"
                  style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.3)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-bold" style={{ color: "#F59E0B" }}>
                    {starters.find(p => p?.id === captain)?.name}
                  </span>
                </motion.div>
              )}
            </CCard>
          )}
        </div>
      </div>

      {/* Save banner */}
      <AnimatePresence>
        {starterCount === 11 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] border p-4 flex flex-wrap items-center justify-between gap-3"
            style={{ background: `${COACH_ACCENT}08`, borderColor: `${COACH_ACCENT}35` }}>
            <div>
              <p className="font-bold" style={{ color: COACH_ACCENT }}>✓ Composition complète — {FORMATIONS[formation].label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Forme moyenne: <strong style={{ color: "#22C55E" }}>
                  {Math.round(starters.filter(Boolean).reduce((a, p) => a + (p?.forme ?? 0), 0) / 11)}
                </strong>
                {captain && ` · Capitaine: ${starters.find(p => p?.id === captain)?.name}`}
              </p>
            </div>
            <motion.button type="button" onClick={saveLineup}
              className="rounded-xl px-5 py-2 text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg,${COACH_ACCENT},#E66000)` }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Save size={13} className="inline mr-1" /> Enregistrer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </CoachPageTransition>
  );
}
