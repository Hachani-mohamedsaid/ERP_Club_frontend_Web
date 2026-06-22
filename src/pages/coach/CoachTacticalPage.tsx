import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Download, Pencil } from "lucide-react";
import { CoachPageTransition, CCard, COACH_ACCENT } from "../../components/coach2/CoachPageTransition";

const PLAYS = [
  { id: "pl1", name: "Pressing haut coordonné", desc: "Toute l'équipe monte au pressing dès la perte du ballon en zone offensive" },
  { id: "pl2", name: "Transition rapide", desc: "Récupération → passe directe vers les ailiers en sprint" },
  { id: "pl3", name: "Corner offensive", desc: "Mouvement en pivot avec appel dos au but + déviation 2e poteau" },
  { id: "pl4", name: "Coup franc direct", desc: "Frappe puissante bas gauche en mur de 4 joueurs adverses" },
  { id: "pl5", name: "Sortie propre GK", desc: "Sortie courte avec relance sur les DC, pivot vers MC et remontée de balle" },
];

const FORMATIONS_POS: Record<string, { pos: string; x: number; y: number; color: string }[]> = {
  "4-3-3": [
    { pos: "GK",  x: 50, y: 87, color: "#F59E0B" },
    { pos: "RB",  x: 80, y: 68 }, { pos: "DC",  x: 62, y: 70 }, { pos: "DC",  x: 38, y: 70 }, { pos: "LB",  x: 20, y: 68 },
    { pos: "MC",  x: 70, y: 48 }, { pos: "MC",  x: 50, y: 46 }, { pos: "MC",  x: 30, y: 48 },
    { pos: "AD",  x: 75, y: 26 }, { pos: "BU",  x: 50, y: 20 }, { pos: "AG",  x: 25, y: 26 },
  ].map((p, i) => ({ ...p, color: p.color ?? COACH_ACCENT })),
};

const MOVEMENT_ARROWS = [
  { from: { x: 50, y: 46 }, to: { x: 50, y: 20 }, label: "Passe verticale" },
  { from: { x: 70, y: 48 }, to: { x: 75, y: 26 }, label: "Appel ailier droit" },
  { from: { x: 30, y: 48 }, to: { x: 25, y: 26 }, label: "Appel ailier gauche" },
];

const ZONES = [
  { label: "Pressing", x: 20, y: 10, w: 60, h: 25, color: "#EF4444" },
  { label: "Transition", x: 15, y: 40, w: 70, h: 20, color: "#F59E0B" },
  { label: "Bloc bas", x: 20, y: 65, w: 60, h: 25, color: "#3B82F6" },
];

type DrawMode = "positions" | "zones" | "arrows";

export function CoachTacticalPage() {
  const [mode, setMode] = useState<DrawMode>("positions");
  const [showMovements, setShowMovements] = useState(true);
  const [showZones, setShowZones] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<string | null>(null);
  const [note, setNote] = useState("");

  return (
    <CoachPageTransition>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>Tableau Tactique</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Dessin de positions, mouvements & pressing</p>
        </div>
        <div className="flex gap-2">
          <motion.button type="button"
            className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold"
            style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-muted)" }}
            whileHover={{ scale: 1.04 }}>
            <Download size={12} /> Export
          </motion.button>
          <motion.button type="button"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
            style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}
            whileHover={{ scale: 1.04 }}>
            <RotateCcw size={12} /> Reset
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_300px]">
        {/* Tactical board */}
        <CCard className="!p-3">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {(["positions","zones","arrows"] as const).map(m => (
              <motion.button key={m} type="button" onClick={() => setMode(m)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold capitalize"
                style={{
                  background: mode === m ? `linear-gradient(135deg,${COACH_ACCENT},#E66000)` : "rgba(255,255,255,0.06)",
                  color: mode === m ? "white" : "var(--text-muted)",
                }}
                whileHover={{ scale: 1.04 }}>
                {m === "positions" ? "🔵 Positions" : m === "zones" ? "🟥 Zones" : "↗ Mouvements"}
              </motion.button>
            ))}
            <div className="ml-auto flex gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]" style={{ color: "var(--text-muted)" }}>
                <input type="checkbox" checked={showMovements} onChange={e => setShowMovements(e.target.checked)} className="accent-orange-500" />
                Mouvements
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px]" style={{ color: "var(--text-muted)" }}>
                <input type="checkbox" checked={showZones} onChange={e => setShowZones(e.target.checked)} className="accent-orange-500" />
                Zones
              </label>
            </div>
          </div>

          {/* The pitch */}
          <div className="relative w-full rounded-[16px] overflow-hidden"
            style={{ paddingBottom: "138%", background: "linear-gradient(180deg,rgba(22,101,52,0.5),rgba(20,83,45,0.5))" }}>
            {/* SVG for pitch + arrows */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
              {/* Pitch markings */}
              <rect x="5" y="5" width="90" height="130" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="5" y1="70" x2="95" y2="70" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
              <circle cx="50" cy="70" r="9" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
              <rect x="28" y="5" width="44" height="17" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
              <rect x="37" y="5" width="26" height="8" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
              <rect x="28" y="118" width="44" height="17" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
              <rect x="37" y="127" width="26" height="8" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.4" />
              {/* Goal */}
              <rect x="40" y="1" width="20" height="5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
              <rect x="40" y="134" width="20" height="5" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
              {/* Zones */}
              {showZones && ZONES.map(z => (
                <rect key={z.label} x={z.x} y={z.y * 1.4} width={z.w} height={z.h * 1.4} rx="2"
                  fill={`${z.color}22`} stroke={z.color} strokeWidth="0.5" strokeDasharray="2" />
              ))}
              {/* Movement arrows */}
              {showMovements && MOVEMENT_ARROWS.map((arr, i) => {
                const fx = arr.from.x, fy = arr.from.y * 1.4;
                const tx = arr.to.x, ty = arr.to.y * 1.4;
                const dx = tx - fx, dy = ty - fy;
                const len = Math.sqrt(dx * dx + dy * dy);
                const nx = dx / len, ny = dy / len;
                const arrowX = tx - nx * 3, arrowY = ty - ny * 3;
                return (
                  <g key={i}>
                    <line x1={fx} y1={fy} x2={arrowX} y2={arrowY}
                      stroke={COACH_ACCENT} strokeWidth="0.8" strokeDasharray="2 1" opacity={0.8} />
                    <polygon
                      points={`${tx},${ty} ${arrowX - ny * 1.5},${arrowY + nx * 1.5} ${arrowX + ny * 1.5},${arrowY - nx * 1.5}`}
                      fill={COACH_ACCENT} opacity={0.8} />
                  </g>
                );
              })}
            </svg>

            {/* Player tokens */}
            {FORMATIONS_POS["4-3-3"].map((p, i) => (
              <motion.div key={i} className="absolute"
                style={{ left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)" }}>
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-extrabold text-white cursor-pointer shadow-lg"
                  style={{ background: p.pos === "GK" ? `linear-gradient(135deg,#F59E0B,#D97706)` : `linear-gradient(135deg,${COACH_ACCENT},#E66000)`, borderColor: "rgba(255,255,255,0.3)" }}
                  whileHover={{ scale: 1.25, zIndex: 10 }}
                  animate={{ boxShadow: [`0 0 0px ${COACH_ACCENT}00`, `0 0 12px ${COACH_ACCENT}80`, `0 0 0px ${COACH_ACCENT}00`] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}>
                  {p.pos}
                </motion.div>
              </motion.div>
            ))}

            {/* Zone labels */}
            {showZones && ZONES.map(z => (
              <div key={z.label} className="absolute text-[9px] font-bold pointer-events-none"
                style={{ left: `${z.x + z.w / 2}%`, top: `${z.y + 2}%`, transform: "translateX(-50%)", color: z.color }}>
                {z.label}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full" style={{ background: COACH_ACCENT }} /> Joueur de champ</span>
            <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-full" style={{ background: "#F59E0B" }} /> Gardien</span>
            <span className="flex items-center gap-1"><span className="inline-block h-4 border-t-2 border-dashed w-5 border-orange-400" /> Mouvement</span>
          </div>
        </CCard>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Play library */}
          <CCard>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>
              <Pencil size={11} className="inline mr-1" style={{ color: COACH_ACCENT }} />
              Séquences tactiques
            </p>
            <div className="space-y-1.5">
              {PLAYS.map(pl => (
                <motion.div key={pl.id} onClick={() => setSelectedPlay(pl.id === selectedPlay ? null : pl.id)}
                  className="rounded-xl border px-3 py-2 cursor-pointer"
                  style={{
                    background: selectedPlay === pl.id ? `${COACH_ACCENT}10` : "rgba(255,255,255,0.03)",
                    borderColor: selectedPlay === pl.id ? `${COACH_ACCENT}40` : "rgba(255,255,255,0.07)",
                  }}
                  whileHover={{ borderColor: `${COACH_ACCENT}30` }}>
                  <p className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{pl.name}</p>
                  <AnimatePresence>
                    {selectedPlay === pl.id && (
                      <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="text-[10px] mt-1 overflow-hidden" style={{ color: "var(--text-muted)" }}>
                        {pl.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </CCard>

          {/* Coaching notes */}
          <CCard>
            <p className="mb-2 text-xs font-bold" style={{ color: "var(--text-primary)" }}>Notes coach</p>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Ajouter des instructions tactiques, consignes avant match..."
              rows={5}
              className="w-full resize-none rounded-xl border px-3 py-2 text-xs outline-none"
              style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.09)", color: "var(--text-primary)" }} />
            <motion.button type="button"
              className="mt-2 w-full rounded-xl py-2 text-xs font-bold"
              style={{ background: `${COACH_ACCENT}18`, color: COACH_ACCENT }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              Sauvegarder notes
            </motion.button>
          </CCard>

          {/* Zone legend */}
          <CCard>
            <p className="mb-2 text-[10px] font-bold" style={{ color: "var(--text-muted)" }}>Zones de jeu</p>
            {ZONES.map(z => (
              <div key={z.label} className="flex items-center gap-2 mb-1.5">
                <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: `${z.color}60`, border: `1px solid ${z.color}` }} />
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{z.label}</span>
              </div>
            ))}
          </CCard>
        </div>
      </div>
    </CoachPageTransition>
  );
}
