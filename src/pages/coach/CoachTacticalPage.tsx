import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, RotateCcw, Pencil, Flag,
  CheckCircle2, Layers, ArrowRight, Square,
  Plus, Circle,
} from "lucide-react";
import {
  CoachPageTransition, CCard, COACH_ACCENT,
} from "../../components/coach2/CoachPageTransition";

const C = {
  red:    { main: "#ef4444", bg: "rgba(239,68,68,0.15)",  label: "Rouge"  },
  amber:  { main: "#f59e0b", bg: "rgba(245,158,11,0.15)", label: "Orange" },
  blue:   { main: "#3b82f6", bg: "rgba(59,130,246,0.15)", label: "Bleu"   },
  green:  { main: "#22c55e", bg: "rgba(34,197,94,0.15)",  label: "Vert"   },
  violet: { main: "#8b5cf6", bg: "rgba(139,92,246,0.15)", label: "Violet" },
  teal:   { main: "#0d9488", bg: "rgba(13,148,136,0.15)", label: "Turquoise" },
};

const COLOR_OPTIONS = Object.entries(C);

interface TacticalZone {
  id: string;
  label: string;
  x: number; y: number;
  w: number; h: number;
  color: string;
  active: boolean;
}

interface TacticalArrow {
  id: string;
  fromX: number; fromY: number;
  toX: number; toY: number;
  color: string;
  label: string;
  style: "solid" | "dashed" | "wavy";
}

interface TacticalPlayer {
  id: string;
  pos: string;
  name: string;
  x: number; y: number;
  color: string;
  isGK: boolean;
}

interface TacticalPlay {
  id: string;
  name: string;
  desc: string;
  arrows: TacticalArrow[];
  zones: string[]; // active zone ids
}

const DEFAULT_ZONES: TacticalZone[] = [
  { id: "z1", label: "Pressing haut",
    x: 8, y: 4, w: 84, h: 18,
    color: "#ef4444", active: false },
  { id: "z2", label: "Zone de transition",
    x: 8, y: 38, w: 84, h: 18,
    color: "#f59e0b", active: false },
  { id: "z3", label: "Bloc défensif",
    x: 8, y: 64, w: 84, h: 18,
    color: "#3b82f6", active: false },
  { id: "z4", label: "Couloir droit",
    x: 70, y: 20, w: 18, h: 55,
    color: "#22c55e", active: false },
  { id: "z5", label: "Couloir gauche",
    x: 12, y: 20, w: 18, h: 55,
    color: "#22c55e", active: false },
];

const DEFAULT_PLAYS: TacticalPlay[] = [
  { id: "p1", name: "Pressing haut coordonné",
    desc: "Toute l'équipe monte dès la perte en zone offensive",
    arrows: [], zones: ["z1"] },
  { id: "p2", name: "Transition rapide",
    desc: "Récupération → passe directe vers les ailiers",
    arrows: [], zones: ["z2"] },
  { id: "p3", name: "Corner offensive",
    desc: "Pivot + déviation 2e poteau",
    arrows: [], zones: [] },
  { id: "p4", name: "Coup franc",
    desc: "Frappe bas gauche en mur de 4",
    arrows: [], zones: [] },
  { id: "p5", name: "Sortie propre GK",
    desc: "Relance courte DC → MC → remontée",
    arrows: [], zones: [] },
];

const FORMATION_POSITIONS: Record<string, {
  pos: string; x: number; y: number; isGK?: boolean;
}[]> = {
  "4-3-3": [
    { pos: "GK",  x: 50, y: 88, isGK: true },
    { pos: "RB",  x: 80, y: 70 },
    { pos: "DC",  x: 62, y: 73 },
    { pos: "DC",  x: 38, y: 73 },
    { pos: "LB",  x: 20, y: 70 },
    { pos: "MC",  x: 70, y: 50 },
    { pos: "MC",  x: 50, y: 47 },
    { pos: "MC",  x: 30, y: 50 },
    { pos: "AD",  x: 75, y: 27 },
    { pos: "BU",  x: 50, y: 20 },
    { pos: "AG",  x: 25, y: 27 },
  ],
  "4-4-2": [
    { pos: "GK",  x: 50, y: 88, isGK: true },
    { pos: "RB",  x: 80, y: 70 },
    { pos: "DC",  x: 62, y: 73 },
    { pos: "DC",  x: 38, y: 73 },
    { pos: "LB",  x: 20, y: 70 },
    { pos: "MD",  x: 75, y: 50 },
    { pos: "MC",  x: 58, y: 48 },
    { pos: "MC",  x: 42, y: 48 },
    { pos: "MG",  x: 25, y: 50 },
    { pos: "BU",  x: 62, y: 24 },
    { pos: "BU",  x: 38, y: 24 },
  ],
  "4-2-3-1": [
    { pos: "GK",  x: 50, y: 88, isGK: true },
    { pos: "RB",  x: 80, y: 70 },
    { pos: "DC",  x: 62, y: 73 },
    { pos: "DC",  x: 38, y: 73 },
    { pos: "LB",  x: 20, y: 70 },
    { pos: "MDF", x: 60, y: 54 },
    { pos: "MDF", x: 40, y: 54 },
    { pos: "AD",  x: 75, y: 35 },
    { pos: "MOC", x: 50, y: 32 },
    { pos: "AG",  x: 25, y: 35 },
    { pos: "BU",  x: 50, y: 20 },
  ],
  "3-5-2": [
    { pos: "GK",  x: 50, y: 88, isGK: true },
    { pos: "DC",  x: 70, y: 72 },
    { pos: "DC",  x: 50, y: 74 },
    { pos: "DC",  x: 30, y: 72 },
    { pos: "MD",  x: 84, y: 50 },
    { pos: "MC",  x: 67, y: 47 },
    { pos: "MC",  x: 50, y: 45 },
    { pos: "MC",  x: 33, y: 47 },
    { pos: "MG",  x: 16, y: 50 },
    { pos: "BU",  x: 62, y: 24 },
    { pos: "BU",  x: 38, y: 24 },
  ],
};

type DrawMode = "select" | "arrow" | "zone";

function buildPlayersFromFormation(
  f: string,
  starterIds?: (string | null)[],
  savedPlayers?: Record<string, string>,
): TacticalPlayer[] {
  const formPos =
    FORMATION_POSITIONS[f] ?? FORMATION_POSITIONS["4-3-3"];
  return formPos.map((p, i) => {
    const playerId = starterIds?.[i];
    const playerName = playerId && savedPlayers
      ? savedPlayers[playerId] ?? p.pos
      : p.pos;
    return {
      id: `player_${i}`,
      pos: p.pos,
      name: playerName,
      x: p.x, y: p.y,
      color: p.isGK ? "#F59E0B" : "#ff7a00",
      isGK: p.isGK ?? false,
    };
  });
}

export function CoachTacticalPage() {
  const [formation, setFormation] = useState("4-3-3");
  const [players, setPlayers] =
    useState<TacticalPlayer[]>([]);
  const [zones, setZones] =
    useState<TacticalZone[]>(DEFAULT_ZONES);
  const [arrows, setArrows] =
    useState<TacticalArrow[]>([]);
  const [plays, setPlays] =
    useState<TacticalPlay[]>(DEFAULT_PLAYS);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [newPlayName, setNewPlayName] = useState("");
  const [showNewPlay, setShowNewPlay] = useState(false);

  const [drawMode, setDrawMode] =
    useState<DrawMode>("select");
  const [selectedColor, setSelectedColor] =
    useState("#ff7a00");
  const [arrowStyle, setArrowStyle] =
    useState<"solid" | "dashed" | "wavy">("dashed");
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] =
    useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] =
    useState<{ x: number; y: number } | null>(null);
  const [selectedPlay, setSelectedPlay] =
    useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const formations = [
      "4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2",
    ];
    let loadedFormation = "4-3-3";
    let loadedPlayers: TacticalPlayer[] | null = null;

    for (const f of formations) {
      const saved = localStorage.getItem(
        `odin_lineup_${f}`
      );
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.formation) {
            loadedFormation = data.formation;
            const starterIds: (string | null)[] =
              data.starters ?? [];
            const savedPlayers = data.playerNames ?? {};
            loadedPlayers = buildPlayersFromFormation(
              loadedFormation,
              starterIds,
              savedPlayers,
            );
          }
        } catch {}
        break;
      }
    }

    // Also try match-based lineup keys
    if (!loadedPlayers) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key?.startsWith("odin_lineup_match_")) continue;
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const data = JSON.parse(raw);
          if (data.formation) {
            loadedFormation = data.formation;
            loadedPlayers = buildPlayersFromFormation(
              loadedFormation,
              data.starters ?? [],
              data.playerNames ?? {},
            );
            break;
          }
        }
      } catch {}
    }

    setFormation(loadedFormation);
    setPlayers(
      loadedPlayers ??
      buildPlayersFromFormation(loadedFormation)
    );

    try {
      const savedNote = localStorage.getItem(
        "odin_tactical_notes"
      );
      if (savedNote) setNote(savedNote);
    } catch {}

    try {
      const savedZones = localStorage.getItem(
        "odin_tactical_zones"
      );
      if (savedZones) setZones(JSON.parse(savedZones));
    } catch {}

    try {
      const savedArrows = localStorage.getItem(
        "odin_tactical_arrows"
      );
      if (savedArrows) {
        const parsed = JSON.parse(savedArrows);
        if (Array.isArray(parsed)) {
          setArrows(parsed);
        }
      }
    } catch {}

    try {
      const savedPlays = localStorage.getItem(
        "odin_tactical_plays"
      );
      if (savedPlays) {
        const parsed = JSON.parse(savedPlays);
        if (Array.isArray(parsed)) {
          setPlays(parsed.map((pl: any) => ({
            ...pl,
            arrows: Array.isArray(pl.arrows) ? pl.arrows : [],
            zones: Array.isArray(pl.zones) ? pl.zones : [],
          })));
        }
      }
    } catch {}
  }, []);

  const handleFormationChange = (f: string) => {
    setFormation(f);
    setPlayers(buildPlayersFromFormation(f));
    setArrows([]);
  };

  const getSVGPoint = (
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 154,
    };
  };

  const handleSVGMouseDown = (
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    if (drawMode === "select") return;
    const pt = getSVGPoint(e);
    setIsDrawing(true);
    setDrawStart(pt);
    setDrawEnd(pt);
  };

  const handleSVGMouseMove = (
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    if (!isDrawing || drawMode === "select") return;
    setDrawEnd(getSVGPoint(e));
  };

  const handleSVGMouseUp = () => {
    if (!isDrawing || !drawStart || !drawEnd) return;
    setIsDrawing(false);

    const dx = Math.abs(drawEnd.x - drawStart.x);
    const dy = Math.abs(drawEnd.y - drawStart.y);

    if (dx < 2 && dy < 2) {
      setDrawStart(null);
      setDrawEnd(null);
      return;
    }

    if (drawMode === "arrow") {
      const newArrow: TacticalArrow = {
        id: Date.now().toString(),
        fromX: drawStart.x, fromY: drawStart.y,
        toX: drawEnd.x, toY: drawEnd.y,
        color: selectedColor,
        label: "",
        style: arrowStyle,
      };
      setArrows(prev => {
        const updated = [...prev, newArrow];
        try {
          localStorage.setItem(
            "odin_tactical_arrows",
            JSON.stringify(updated)
          );
        } catch {}
        return updated;
      });
    }

    if (drawMode === "zone") {
      const newZone: TacticalZone = {
        id: Date.now().toString(),
        label: "Nouvelle zone",
        x: Math.min(drawStart.x, drawEnd.x),
        y: Math.min(drawStart.y, drawEnd.y) / 1.54,
        w: Math.abs(drawEnd.x - drawStart.x),
        h: Math.abs(drawEnd.y - drawStart.y) / 1.54,
        color: selectedColor,
        active: true,
      };
      const updated = [...zones, newZone];
      setZones(updated);
      try {
        localStorage.setItem(
          "odin_tactical_zones",
          JSON.stringify(updated)
        );
      } catch {}
    }

    setDrawStart(null);
    setDrawEnd(null);
  };

  const toggleZone = (id: string) => {
    const updated = zones.map(z =>
      z.id === id ? { ...z, active: !z.active } : z
    );
    setZones(updated);
    try {
      localStorage.setItem(
        "odin_tactical_zones",
        JSON.stringify(updated)
      );
    } catch {}
  };

  const deleteArrow = (id: string) => {
    const updated = arrows.filter(a => a.id !== id);
    setArrows(updated);
    try {
      localStorage.setItem(
        "odin_tactical_arrows",
        JSON.stringify(updated)
      );
    } catch {}
  };

  const deleteZone = (id: string) => {
    const updated = zones.filter(z => z.id !== id);
    setZones(updated);
    try {
      localStorage.setItem(
        "odin_tactical_zones",
        JSON.stringify(updated)
      );
    } catch {}
  };

  const saveNote = () => {
    try {
      localStorage.setItem(
        "odin_tactical_notes", note
      );
    } catch {}
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const resetAll = () => {
    setArrows([]);
    setZones(DEFAULT_ZONES);
    try {
      localStorage.removeItem("odin_tactical_arrows");
      localStorage.setItem(
        "odin_tactical_zones",
        JSON.stringify(DEFAULT_ZONES)
      );
    } catch {}
  };

  const exportSVG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr],
      { type: "image/svg+xml" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tableau-tactique-odin.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderArrowPath = (arr: TacticalArrow) => {
    const fx = arr.fromX, fy = arr.fromY;
    const tx = arr.toX, ty = arr.toY;
    const dx = tx - fx, dy = ty - fy;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return null;
    const nx = dx / len, ny = dy / len;
    const ax = tx - nx * 3, ay = ty - ny * 3;

    const strokeDash = arr.style === "dashed"
      ? "2 1.5"
      : arr.style === "wavy"
      ? "1 1"
      : "none";

    return (
      <g key={arr.id}>
        <line
          x1={fx} y1={fy} x2={ax} y2={ay}
          stroke={arr.color}
          strokeWidth="1.2"
          strokeDasharray={strokeDash}
          opacity={0.9}
        />
        <polygon
          points={`${tx},${ty} ${ax - ny * 2},${ay + nx * 2} ${ax + ny * 2},${ay - nx * 2}`}
          fill={arr.color}
          opacity={0.9}
        />
      </g>
    );
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
              Tableau Tactique
            </h1>
            <p style={{
              fontSize: 12, color: "var(--text-muted)",
              marginTop: 3,
            }}>
              Formation: {formation} ·{" "}
              {arrows.length} flèches ·{" "}
              {zones.filter(z => z.active).length} zones actives
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button
              type="button"
              onClick={resetAll}
              whileHover={{ scale: 1.04 }}
              style={{
                display: "flex", alignItems: "center",
                gap: 6, padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "var(--text-muted)",
                fontSize: 12, fontWeight: 600,
                cursor: "pointer",
              }}>
              <RotateCcw size={13} /> Réinitialiser
            </motion.button>
            <motion.button
              type="button"
              onClick={exportSVG}
              whileHover={{ scale: 1.04 }}
              style={{
                display: "flex", alignItems: "center",
                gap: 6, padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(59,130,246,0.12)",
                border: "1px solid rgba(59,130,246,0.25)",
                color: "#3b82f6",
                fontSize: 12, fontWeight: 700,
                cursor: "pointer",
              }}>
              <Download size={13} /> Exporter SVG
            </motion.button>
          </div>
        </div>

        {/* FORMATION SELECTOR */}
        <div style={{
          display: "flex", gap: 8,
          alignItems: "center", flexWrap: "wrap",
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: "var(--text-muted)",
          }}>
            Formation:
          </span>
          {Object.keys(FORMATION_POSITIONS).map(f => (
            <motion.button
              key={f} type="button"
              onClick={() => handleFormationChange(f)}
              whileHover={{ scale: 1.05 }}
              style={{
                padding: "5px 12px", borderRadius: 8,
                fontSize: 12, fontWeight: 700,
                background: formation === f
                  ? `linear-gradient(135deg,#ff7a00,#e66000)`
                  : "rgba(255,255,255,0.06)",
                color: formation === f
                  ? "white" : "var(--text-muted)",
                border: "none", cursor: "pointer",
              }}>
              {f}
            </motion.button>
          ))}
        </div>

        {/* MAIN GRID */}
        <div
          className="tactical-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 16, alignItems: "start",
          }}>
          <style>{`
            @media (max-width: 1100px) {
              .tactical-main-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}</style>

          {/* LEFT — Drawing Board */}
          <CCard className="!p-3">
            {/* Toolbar */}
            <div style={{
              display: "flex", gap: 8,
              alignItems: "center",
              marginBottom: 12, flexWrap: "wrap",
            }}>
              {([
                { mode: "select" as const, icon: Layers, label: "Sélection" },
                { mode: "arrow" as const, icon: ArrowRight, label: "Flèche" },
                { mode: "zone" as const, icon: Square, label: "Zone" },
              ]).map(m => (
                <motion.button
                  key={m.mode} type="button"
                  onClick={() => setDrawMode(m.mode)}
                  whileHover={{ scale: 1.04 }}
                  style={{
                    display: "flex", alignItems: "center",
                    gap: 5, padding: "6px 12px",
                    borderRadius: 9, fontSize: 11,
                    fontWeight: 700, cursor: "pointer",
                    border: "none",
                    background: drawMode === m.mode
                      ? `linear-gradient(135deg,#ff7a00,#e66000)`
                      : "rgba(255,255,255,0.06)",
                    color: drawMode === m.mode
                      ? "white" : "var(--text-muted)",
                  }}>
                  <m.icon size={12} />
                  {m.label}
                </motion.button>
              ))}

              {drawMode !== "select" && (
                <div style={{
                  display: "flex", gap: 5,
                  alignItems: "center", marginLeft: 8,
                }}>
                  {COLOR_OPTIONS.map(([key, val]) => (
                    <button
                      key={key} type="button"
                      title={val.label}
                      onClick={() => setSelectedColor(val.main)}
                      style={{
                        width: 20, height: 20,
                        borderRadius: "50%",
                        background: val.main,
                        border: selectedColor === val.main
                          ? "2px solid white"
                          : "2px solid transparent",
                        cursor: "pointer",
                        boxShadow: selectedColor === val.main
                          ? `0 0 8px ${val.main}80` : "none",
                      }}
                    />
                  ))}
                </div>
              )}

              {selectedPlay && (
                <div style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(139,92,246,0.12)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  fontSize: 10, fontWeight: 600,
                  color: "#8b5cf6",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Circle size={8} style={{ color: "#8b5cf6" }} />
                  {plays.find(p => p.id === selectedPlay)?.name}
                </div>
              )}

              {drawMode === "arrow" && (
                <div style={{
                  display: "flex", gap: 5,
                  alignItems: "center", marginLeft: 4,
                }}>
                  {([
                    { val: "solid" as const, label: "─" },
                    { val: "dashed" as const, label: "╌" },
                    { val: "wavy" as const, label: "≈" },
                  ]).map(s => (
                    <button
                      key={s.val} type="button"
                      onClick={() => setArrowStyle(s.val)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 6, fontSize: 13,
                        fontWeight: 800, cursor: "pointer",
                        border: "none",
                        background: arrowStyle === s.val
                          ? "rgba(255,122,0,0.25)"
                          : "rgba(255,255,255,0.06)",
                        color: arrowStyle === s.val
                          ? "#ff7a00" : "var(--text-muted)",
                      }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              <span style={{
                marginLeft: "auto",
                fontSize: 10, color: "var(--text-muted)",
                fontStyle: "italic",
              }}>
                {drawMode === "select"
                  ? "Cliquez sur une zone pour activer/désactiver"
                  : drawMode === "arrow"
                  ? "Cliquez et glissez pour tracer une flèche"
                  : "Cliquez et glissez pour délimiter une zone"}
              </span>
            </div>

            {/* SVG Pitch */}
            <div style={{
              position: "relative",
              borderRadius: 16, overflow: "hidden",
              cursor: drawMode === "select"
                ? "default"
                : "crosshair",
            }}>
              <svg
                ref={svgRef}
                viewBox="0 0 100 154"
                style={{
                  width: "100%",
                  maxWidth: 500,
                  display: "block",
                  margin: "0 auto",
                  borderRadius: 16,
                  background: `linear-gradient(180deg,
                    #1a5c30 0%, #1e6b38 30%,
                    #1a5c30 50%, #1e6b38 70%,
                    #1a5c30 100%)`,
                }}
                onMouseDown={handleSVGMouseDown}
                onMouseMove={handleSVGMouseMove}
                onMouseUp={handleSVGMouseUp}
                onMouseLeave={() => {
                  setIsDrawing(false);
                  setDrawStart(null);
                  setDrawEnd(null);
                }}
              >
                <defs>
                  <pattern id="stripes" x="0" y="0"
                    width="100" height="15.4"
                    patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="100" height="7.7"
                      fill="rgba(255,255,255,0.018)" />
                  </pattern>
                </defs>
                <rect x="0" y="0" width="100" height="154"
                  fill="url(#stripes)" />

                <rect x="3" y="3" width="94" height="148"
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="0.5" rx="1" />
                <line x1="3" y1="77" x2="97" y2="77"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.4" />
                <circle cx="50" cy="77" r="10"
                  fill="none"
                  stroke="rgba(255,255,255,0.40)"
                  strokeWidth="0.4" />
                <circle cx="50" cy="77" r="0.8"
                  fill="rgba(255,255,255,0.6)" />

                <rect x="27" y="3" width="46" height="20"
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.40)"
                  strokeWidth="0.4" />
                <rect x="37" y="3" width="26" height="9"
                  fill="rgba(255,255,255,0.02)"
                  stroke="rgba(255,255,255,0.30)"
                  strokeWidth="0.3" />
                <rect x="41" y="0" width="18" height="4"
                  fill="rgba(255,255,255,0.10)"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="0.5" />
                <circle cx="50" cy="21" r="0.8"
                  fill="rgba(255,255,255,0.55)" />
                <path d="M 36 23 A 11 11 0 0 1 64 23"
                  fill="none"
                  stroke="rgba(255,255,255,0.30)"
                  strokeWidth="0.4" />

                <rect x="27" y="131" width="46" height="20"
                  fill="rgba(255,255,255,0.03)"
                  stroke="rgba(255,255,255,0.40)"
                  strokeWidth="0.4" />
                <rect x="37" y="142" width="26" height="9"
                  fill="rgba(255,255,255,0.02)"
                  stroke="rgba(255,255,255,0.30)"
                  strokeWidth="0.3" />
                <rect x="41" y="150" width="18" height="4"
                  fill="rgba(255,255,255,0.10)"
                  stroke="rgba(255,255,255,0.40)"
                  strokeWidth="0.5" />
                <circle cx="50" cy="133" r="0.8"
                  fill="rgba(255,255,255,0.55)" />
                <path d="M 36 131 A 11 11 0 0 0 64 131"
                  fill="none"
                  stroke="rgba(255,255,255,0.30)"
                  strokeWidth="0.4" />

                <path d="M 3 10 A 7 7 0 0 1 10 3"
                  fill="none" stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.4" />
                <path d="M 90 3 A 7 7 0 0 1 97 10"
                  fill="none" stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.4" />
                <path d="M 3 144 A 7 7 0 0 0 10 151"
                  fill="none" stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.4" />
                <path d="M 90 151 A 7 7 0 0 0 97 144"
                  fill="none" stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.4" />

                {zones.filter(z => z.active).map(z => (
                  <g key={z.id}>
                    <rect
                      x={z.x} y={z.y * 1.54}
                      width={z.w} height={z.h * 1.54}
                      rx="2"
                      fill={`${z.color}25`}
                      stroke={z.color}
                      strokeWidth="0.6"
                      strokeDasharray="2 1"
                    />
                    <text
                      x={z.x + z.w / 2}
                      y={z.y * 1.54 + 3.5}
                      textAnchor="middle"
                      fill={z.color}
                      fontSize="3.5"
                      fontWeight="700"
                      fontFamily="system-ui">
                      {z.label}
                    </text>
                  </g>
                ))}

                {arrows.map(arr => renderArrowPath(arr))}

                {isDrawing && drawStart && drawEnd && (
                  <>
                    {drawMode === "arrow" && (
                      <line
                        x1={drawStart.x} y1={drawStart.y}
                        x2={drawEnd.x} y2={drawEnd.y}
                        stroke={selectedColor}
                        strokeWidth="1.2"
                        strokeDasharray="2 1"
                        opacity={0.7}
                      />
                    )}
                    {drawMode === "zone" && (
                      <rect
                        x={Math.min(drawStart.x, drawEnd.x)}
                        y={Math.min(drawStart.y, drawEnd.y)}
                        width={Math.abs(
                          drawEnd.x - drawStart.x
                        )}
                        height={Math.abs(
                          drawEnd.y - drawStart.y
                        )}
                        rx="2"
                        fill={`${selectedColor}20`}
                        stroke={selectedColor}
                        strokeWidth="0.6"
                        strokeDasharray="2 1"
                      />
                    )}
                  </>
                )}

                {players.map(p => {
                  const px = p.x;
                  const py = p.y * 1.54;
                  const r = 4;
                  const displayName = p.name !== p.pos
                    ? p.name.split(" ").slice(-1)[0]
                        .substring(0, 8)
                    : p.pos;
                  return (
                    <g key={p.id}>
                      <circle cx={px} cy={py} r={r + 1.5}
                        fill={`${p.color}25`}
                        stroke={`${p.color}60`}
                        strokeWidth="0.5" />
                      <circle cx={px} cy={py} r={r}
                        fill={p.color}
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="0.8" />
                      <text
                        x={px} y={py}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="2.8"
                        fontWeight="900"
                        fontFamily="system-ui">
                        {displayName}
                      </text>
                      <circle
                        cx={px} cy={py} r={r + 3}
                        fill="none"
                        stroke={p.color}
                        strokeWidth="0.4"
                        opacity="0.4">
                        <animate
                          attributeName="r"
                          values={`${r + 1};${r + 3};${r + 1}`}
                          dur="3s"
                          repeatCount="indefinite" />
                        <animate
                          attributeName="opacity"
                          values="0.4;0;0.4"
                          dur="3s"
                          repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })}
              </svg>
            </div>

            {arrows.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <p style={{
                  fontSize: 10, fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}>
                  Flèches tracées ({arrows.length})
                </p>
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 5,
                }}>
                  {arrows.map((arr, i) => (
                    <div key={arr.id} style={{
                      display: "flex", alignItems: "center",
                      gap: 5, padding: "3px 8px",
                      borderRadius: 7,
                      background: `${arr.color}15`,
                      border: `1px solid ${arr.color}30`,
                    }}>
                      <div style={{
                        width: 16, height: 2,
                        background: arr.color,
                        borderRadius: 1,
                      }} />
                      <span style={{
                        fontSize: 9, color: "var(--text-muted)",
                      }}>
                        Flèche {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteArrow(arr.id)}
                        style={{
                          background: "none", border: "none",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          fontSize: 10, padding: "0 2px",
                        }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CCard>

          {/* RIGHT — Sidebar */}
          <div style={{
            display: "flex", flexDirection: "column",
            gap: 12,
          }}>
            {/* ZONES PANEL */}
            <CCard>
              <p style={{
                fontSize: 12, fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 10,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Square size={12}
                  style={{ color: "#3b82f6" }} />
                Zones de jeu
              </p>
              <div style={{
                display: "flex", flexDirection: "column",
                gap: 5,
              }}>
                {zones.map((z, zi) => (
                  <div key={z.id} style={{
                    display: "flex", alignItems: "center",
                    gap: 8, padding: "7px 10px",
                    borderRadius: 9,
                    background: z.active
                      ? `${z.color}15`
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${z.active
                      ? z.color + "40"
                      : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer",
                  }}
                  onClick={() => toggleZone(z.id)}>
                    <div style={{
                      width: 12, height: 12,
                      borderRadius: 3,
                      background: z.active
                        ? z.color
                        : "rgba(255,255,255,0.15)",
                      border: `1px solid ${z.color}`,
                      flexShrink: 0,
                    }} />
                    <p style={{
                      fontSize: 11, fontWeight: 600,
                      color: z.active
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                      flex: 1,
                    }}>
                      {z.label}
                    </p>
                    {z.active && (
                      <CheckCircle2 size={11}
                        style={{ color: z.color }} />
                    )}
                    {zi >= DEFAULT_ZONES.length && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          deleteZone(z.id);
                        }}
                        style={{
                          background: "none", border: "none",
                          cursor: "pointer", fontSize: 10,
                          color: "var(--text-muted)",
                        }}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </CCard>

            {/* TACTICAL PLAYS */}
            <CCard>
              <p style={{
                fontSize: 12, fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 10,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Pencil size={12}
                  style={{ color: C.violet.main }} />
                Séquences tactiques
              </p>
              <div style={{
                display: "flex", flexDirection: "column",
                gap: 5,
              }}>
                {plays.map(pl => (
                  <motion.div
                    key={pl.id}
                    onClick={() => {
                      if (pl.id === selectedPlay) {
                        setSelectedPlay(null);
                        try {
                          const saved = localStorage.getItem(
                            "odin_tactical_arrows"
                          );
                          if (saved) {
                            const parsed = JSON.parse(saved);
                            setArrows(Array.isArray(parsed) ? parsed : []);
                          } else {
                            setArrows([]);
                          }
                        } catch { setArrows([]); }
                        setZones(DEFAULT_ZONES);
                      } else {
                        setSelectedPlay(pl.id);
                        setArrows(pl.arrows ?? []);
                        setZones(prev => prev.map(z => ({
                          ...z,
                          active: (pl.zones ?? []).includes(z.id),
                        })));
                      }
                    }}
                    whileHover={{
                      borderColor: `${COACH_ACCENT}40`,
                    }}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 9, cursor: "pointer",
                      background: selectedPlay === pl.id
                        ? `${COACH_ACCENT}10`
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${
                        selectedPlay === pl.id
                          ? `${COACH_ACCENT}40`
                          : "rgba(255,255,255,0.07)"
                      }`,
                      borderLeft: selectedPlay === pl.id
                        ? `3px solid ${COACH_ACCENT}`
                        : "3px solid transparent",
                    }}>
                    <p style={{
                      fontSize: 11, fontWeight: 700,
                      color: "var(--text-primary)",
                      display: "flex", alignItems: "center",
                      flexWrap: "wrap",
                    }}>
                      {pl.name}
                      {pl.arrows && pl.arrows.length > 0 && (
                        <span style={{
                          fontSize: 9, fontWeight: 700,
                          color: "#8b5cf6",
                          background: "rgba(139,92,246,0.12)",
                          border: "1px solid rgba(139,92,246,0.25)",
                          padding: "1px 6px", borderRadius: 99,
                          marginLeft: 6,
                        }}>
                          {pl.arrows.length} flèche(s)
                        </span>
                      )}
                    </p>
                    <AnimatePresence>
                      {selectedPlay === pl.id && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            height: "auto", opacity: 1,
                          }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{
                            fontSize: 10, marginTop: 4,
                            color: "var(--text-muted)",
                            overflow: "hidden",
                          }}>
                          {pl.desc}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {selectedPlay && (
                <motion.button
                  type="button"
                  onClick={() => {
                    setPlays(prev => {
                      const updated = prev.map(pl =>
                        pl.id === selectedPlay
                          ? {
                              ...pl,
                              arrows: [...arrows],
                              zones: zones
                                .filter(z => z.active)
                                .map(z => z.id),
                            }
                          : pl
                      );
                      try {
                        localStorage.setItem(
                          "odin_tactical_plays",
                          JSON.stringify(updated)
                        );
                      } catch {}
                      return updated;
                    });
                  }}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    width: "100%", padding: "7px",
                    borderRadius: 8, fontSize: 11,
                    fontWeight: 700, border: "none",
                    cursor: "pointer", marginTop: 6,
                    background: "rgba(139,92,246,0.15)",
                    color: "#8b5cf6",
                  }}>
                  💾 Associer ces flèches à la séquence
                </motion.button>
              )}

              {showNewPlay ? (
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <input
                    autoFocus
                    placeholder="Nom de la séquence..."
                    value={newPlayName}
                    onChange={e => setNewPlayName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && newPlayName.trim()) {
                        const newPlay: TacticalPlay = {
                          id: Date.now().toString(),
                          name: newPlayName.trim(),
                          desc: "Séquence personnalisée",
                          arrows: [],
                          zones: [],
                        };
                        const updated = [...plays, newPlay];
                        setPlays(updated);
                        try {
                          localStorage.setItem(
                            "odin_tactical_plays",
                            JSON.stringify(updated)
                          );
                        } catch {}
                        setNewPlayName("");
                        setShowNewPlay(false);
                        setSelectedPlay(newPlay.id);
                      }
                      if (e.key === "Escape") {
                        setShowNewPlay(false);
                        setNewPlayName("");
                      }
                    }}
                    style={{
                      flex: 1, padding: "6px 10px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 8, fontSize: 11,
                      color: "var(--text-primary)", outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPlay(false)}
                    style={{
                      padding: "6px 8px", borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "none", cursor: "pointer",
                      color: "var(--text-muted)", fontSize: 12,
                    }}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewPlay(true)}
                  style={{
                    width: "100%", padding: "6px",
                    borderRadius: 8, fontSize: 11,
                    fontWeight: 600, cursor: "pointer",
                    border: "1px dashed rgba(255,255,255,0.15)",
                    background: "none",
                    color: "var(--text-muted)",
                    marginTop: 6,
                    display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 5,
                  }}>
                  <Plus size={11} /> Nouvelle séquence
                </button>
              )}
            </CCard>

            {/* COACH NOTES */}
            <CCard>
              <p style={{
                fontSize: 12, fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: 8,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Flag size={12}
                  style={{ color: C.amber.main }} />
                Notes coach
              </p>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Instructions tactiques, consignes avant match..."
                rows={5}
                style={{
                  width: "100%", padding: "10px 12px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${noteSaved
                    ? "rgba(34,197,94,0.30)"
                    : "rgba(255,255,255,0.10)"}`,
                  borderRadius: 10, fontSize: 11,
                  color: "var(--text-primary)",
                  resize: "vertical", outline: "none",
                  fontFamily: "inherit", lineHeight: 1.6,
                  transition: "border-color 0.3s",
                }}
              />
              <motion.button
                type="button"
                onClick={saveNote}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  marginTop: 8, width: "100%",
                  padding: "8px",
                  borderRadius: 9, fontSize: 12,
                  fontWeight: 700, border: "none",
                  cursor: "pointer",
                  background: noteSaved
                    ? "rgba(34,197,94,0.15)"
                    : `rgba(255,122,0,0.15)`,
                  color: noteSaved
                    ? "#22c55e" : "#ff7a00",
                  transition: "all 0.3s",
                }}>
                {noteSaved
                  ? "✓ Notes sauvegardées"
                  : "Sauvegarder les notes"}
              </motion.button>
            </CCard>

            {/* LEGEND */}
            <CCard>
              <p style={{
                fontSize: 10, fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}>
                Légende
              </p>
              <div style={{
                display: "flex", flexDirection: "column",
                gap: 5,
              }}>
                {[
                  { color: "#ff7a00", label: "Joueur de champ" },
                  { color: "#F59E0B", label: "Gardien de but" },
                  { color: "#ef4444", label: "Zone pressing" },
                  { color: "#f59e0b", label: "Zone transition" },
                  { color: "#3b82f6", label: "Zone défensive" },
                ].map(item => (
                  <div key={item.label} style={{
                    display: "flex", alignItems: "center",
                    gap: 8,
                  }}>
                    <div style={{
                      width: 12, height: 12,
                      borderRadius: 3,
                      background: item.color,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: 10,
                      color: "var(--text-muted)",
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: 8, marginTop: 2,
                }}>
                  <div style={{
                    width: 16, height: 2,
                    background: "#ff7a00",
                    borderRadius: 1,
                  }} />
                  <span style={{
                    fontSize: 10,
                    color: "var(--text-muted)",
                  }}>
                    Flèche de mouvement
                  </span>
                </div>
              </div>
            </CCard>
          </div>
        </div>
      </div>
    </CoachPageTransition>
  );
}
