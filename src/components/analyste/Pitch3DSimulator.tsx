import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RefreshCw, Users, Sparkles } from "lucide-react";
import type { PitchPlayer, FormationId, TacticalMetrics, TacticalSuggestion } from "../../data/analysteData";
import { computeTacticalMetrics, applyFormation, chemistryColor, fifaOvrColor } from "../../data/analysteData";
import { PlayerCard } from "./PlayerCard";
import { PlayerInsightDrawer } from "./PlayerInsightDrawer";

const FORMATIONS: FormationId[] = ["4-3-3", "4-2-3-1", "3-5-2", "5-3-2"];
const TILT = 50;

function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    const start = performance.now();
    const dur = 500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toFixed(decimals)}{suffix}</>;
}

interface Pitch3DSimulatorProps {
  initialPlayers: PitchPlayer[];
  initialBench: PitchPlayer[];
  suggestions: TacticalSuggestion[];
  initialFormation?: FormationId;
}

export function Pitch3DSimulator({
  initialPlayers,
  initialBench,
  suggestions,
  initialFormation = "4-3-3",
}: Pitch3DSimulatorProps) {
  const [formation, setFormation] = useState<FormationId>(initialFormation);
  const [players, setPlayers] = useState<PitchPlayer[]>(() => applyFormation(initialPlayers, initialFormation));
  const [bench, setBench] = useState<PitchPlayer[]>(initialBench);
  const [metrics, setMetrics] = useState<TacticalMetrics>(() => computeTacticalMetrics(initialPlayers, initialFormation));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [dragMoved, setDragMoved] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  function selectFormation(f: FormationId) {
    if (f === formation) return;
    setFormation(f);
    const updated = applyFormation(players, f);
    setPlayers(updated);
    setMetrics(computeTacticalMetrics(updated, f));
  }

  function resetFormation() {
    const fresh = applyFormation(initialPlayers, formation);
    setPlayers(fresh);
    setBench(initialBench);
    setMetrics(computeTacticalMetrics(fresh, formation));
  }

  const pointerToPercent = useCallback((clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const x = Math.max(6, Math.min(94, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(6, Math.min(94, ((clientY - rect.top) / rect.height) * 100));
    return { x, y };
  }, []);

  useEffect(() => {
    if (!draggingId) return;
    function onMove(e: PointerEvent) {
      const pos = pointerToPercent(e.clientX, e.clientY);
      if (!pos) return;
      setDragMoved(true);
      setPlayers((prev) => {
        const updated = prev.map((p) => (p.id === draggingId ? { ...p, x: pos.x, y: pos.y } : p));
        setMetrics(computeTacticalMetrics(updated, formation));
        return updated;
      });
    }
    function onUp() {
      setDraggingId(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [draggingId, formation, pointerToPercent]);

  function handleCardPointerDown(id: string) {
    setDragMoved(false);
    setDraggingId(id);
  }
  function handleCardClick(id: string) {
    if (!dragMoved) setDrawerId(id);
  }

  // Bench → field substitution via HTML5 drag
  function handleBenchDrop(e: React.DragEvent) {
    e.preventDefault();
    const benchId = e.dataTransfer.getData("text/plain");
    const pos = pointerToPercent(e.clientX, e.clientY);
    if (!benchId || !pos) return;
    const benchPlayer = bench.find((b) => b.id === benchId);
    if (!benchPlayer) return;
    // find nearest field player
    let nearest = players[0];
    let best = Infinity;
    for (const p of players) {
      const d = Math.hypot(p.x - pos.x, p.y - pos.y);
      if (d < best) { best = d; nearest = p; }
    }
    const incoming = { ...benchPlayer, x: nearest.x, y: nearest.y };
    const outgoing = { ...nearest, x: 0, y: 0 };
    setPlayers((prev) => {
      const updated = prev.map((p) => (p.id === nearest.id ? incoming : p));
      setMetrics(computeTacticalMetrics(updated, formation));
      return updated;
    });
    setBench((prev) => prev.map((b) => (b.id === benchId ? outgoing : b)));
  }

  // Chemistry links
  const links: { a: PitchPlayer; b: PitchPlayer; color: string }[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const dx = Math.abs(players[i].x - players[j].x);
      const dy = Math.abs(players[i].y - players[j].y);
      if (dy < 24 && dx < 42) {
        links.push({ a: players[i], b: players[j], color: chemistryColor(players[i], players[j]).color });
      }
    }
  }

  const pressingColor = metrics.pressing === "Fort" ? "#22C55E" : metrics.pressing === "Moyen" ? "#F59E0B" : "#EF4444";
  const fatigueColor = metrics.fatigueRisk === "Élevé" ? "#EF4444" : metrics.fatigueRisk === "Moyen" ? "#F59E0B" : "#22C55E";
  const hovered = hoveredId ? players.find((p) => p.id === hoveredId) : null;
  const drawerPlayer = drawerId ? players.find((p) => p.id === drawerId) ?? null : null;

  return (
    <div className="space-y-4">
      {/* Formation selector */}
      <div className="flex flex-wrap items-center gap-2">
        {FORMATIONS.map((f) => (
          <motion.button
            key={f}
            type="button"
            onClick={() => selectFormation(f)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="relative rounded-xl px-5 py-2 text-sm font-bold tracking-wide"
            style={{
              background: formation === f ? "linear-gradient(135deg,rgba(139,92,246,0.4),rgba(99,102,241,0.3))" : "rgba(255,255,255,0.04)",
              color: formation === f ? "#c4b5fd" : "var(--text-muted)",
              border: formation === f ? "1px solid rgba(139,92,246,0.6)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: formation === f ? "0 0 20px rgba(139,92,246,0.2)" : "none",
            }}
          >
            {f}
          </motion.button>
        ))}
        <motion.button
          type="button"
          onClick={resetFormation}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9, rotate: -180 }}
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--surface-panel-border)" }}
          title="Réinitialiser"
        >
          <RefreshCw size={14} style={{ color: "var(--text-muted)" }} />
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* === TERRAIN === */}
        <div className="xl:col-span-2">
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{
              perspective: "1200px",
              background: "radial-gradient(ellipse at 50% 0%, rgba(20,40,25,0.6), rgba(7,11,31,0.95))",
              padding: "8% 4% 4%",
            }}
          >
            {/* Tilted ground plane (decorative) */}
            <div
              className="relative mx-auto"
              style={{
                transform: `rotateX(${TILT}deg)`,
                transformStyle: "preserve-3d",
                filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.55))",
              }}
            >
              <svg viewBox="0 0 100 130" className="block w-full" style={{ display: "block" }}>
                <defs>
                  <pattern id="grassStripes" x="0" y="0" width="100" height="21.6" patternUnits="userSpaceOnUse">
                    <rect width="100" height="21.6" fill="#1a5c2e" />
                    <rect width="100" height="10.8" fill="#1d6633" />
                  </pattern>
                  <radialGradient id="pitchLight" cx="50%" cy="0%" r="90%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="100" height="130" rx="2" fill="url(#grassStripes)" />
                <rect x="0" y="0" width="100" height="130" rx="2" fill="url(#pitchLight)" />
                <g fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5">
                  <rect x="3" y="3" width="94" height="124" rx="1" />
                  <line x1="3" y1="65" x2="97" y2="65" />
                  <circle cx="50" cy="65" r="10" />
                  <circle cx="50" cy="65" r="0.7" fill="rgba(255,255,255,0.55)" />
                  <rect x="24" y="3" width="52" height="18" />
                  <rect x="36" y="3" width="28" height="8" />
                  <rect x="24" y="109" width="52" height="18" />
                  <rect x="36" y="119" width="28" height="8" />
                </g>
              </svg>
            </div>

            {/* Flat overlay: chemistry + players (true coordinate space) */}
            <div
              ref={stageRef}
              className="absolute inset-0"
              style={{ padding: "8% 4% 4%" }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleBenchDrop}
            >
              <div className="relative h-full w-full">
                {/* Chemistry links */}
                <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ overflow: "visible" }}>
                  {links.map((l, i) => (
                    <motion.line
                      key={`${l.a.id}-${l.b.id}`}
                      x1={`${l.a.x}%`} y1={`${l.a.y}%`}
                      x2={`${l.b.x}%`} y2={`${l.b.y}%`}
                      stroke={l.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={0.55}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.55 }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                      style={{ filter: `drop-shadow(0 0 3px ${l.color})` }}
                    />
                  ))}
                </svg>

                {/* Players */}
                {players.map((player) => (
                  <motion.div
                    key={player.id}
                    layout
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="absolute"
                    style={{ left: `${player.x}%`, top: `${player.y}%`, transform: "translate(-50%,-50%)", zIndex: draggingId === player.id ? 30 : hoveredId === player.id ? 20 : 10 }}
                  >
                    <motion.div
                      className="cursor-grab active:cursor-grabbing"
                      style={{ touchAction: "none" }}
                      onPointerDown={() => handleCardPointerDown(player.id)}
                      onClick={() => handleCardClick(player.id)}
                      onMouseEnter={() => setHoveredId(player.id)}
                      onMouseLeave={() => setHoveredId((cur) => (cur === player.id ? null : cur))}
                      animate={{ scale: draggingId === player.id ? 1.18 : hoveredId === player.id ? 1.1 : 1, y: draggingId === player.id ? 0 : [0, -3, 0] }}
                      transition={draggingId === player.id ? { duration: 0.15 } : { y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" }, scale: { duration: 0.18 } }}
                    >
                      <PlayerCard player={player} selected={drawerId === player.id} dragging={draggingId === player.id} />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hover insight card */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="pointer-events-none absolute left-4 top-4 z-40 w-44 rounded-2xl border p-3"
                  style={{
                    background: "rgba(7,11,31,0.94)",
                    borderColor: `${fifaOvrColor(hovered.ovr).color}55`,
                    backdropFilter: "blur(10px)",
                    boxShadow: `0 0 24px ${fifaOvrColor(hovered.ovr).color}40`,
                  }}
                >
                  <p className="text-sm font-black" style={{ color: "var(--text-primary)" }}>{hovered.name}</p>
                  <p className="mb-2 text-[10px]" style={{ color: "var(--text-muted)" }}>{hovered.position}</p>
                  {[
                    { label: "OVR", value: hovered.ovr, color: fifaOvrColor(hovered.ovr).color },
                    { label: "Fatigue", value: `${hovered.fatigue}%`, color: hovered.fatigue >= 70 ? "#EF4444" : "#F59E0B" },
                    { label: "Vitesse", value: hovered.speed ?? "—", color: "#3B82F6" },
                    { label: "xG", value: (hovered.xg ?? 0).toFixed(1), color: "#22C55E" },
                    { label: "Injury Risk", value: `${hovered.injuryRisk ?? 0}%`, color: (hovered.injuryRisk ?? 0) >= 60 ? "#EF4444" : "#22C55E" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-[11px]">
                      <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
                      <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  <p className="mt-2 text-[9px] italic" style={{ color: "var(--text-muted)" }}>Clic → analyse complète</p>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-3 text-center text-[10px] tracking-wide" style={{ color: "var(--text-muted)" }}>
              Glisser pour repositionner · Survol = stats · Clic = analyse · Glisser un remplaçant sur le terrain
            </p>
          </div>
        </div>

        {/* === RIGHT PANEL === */}
        <div className="space-y-4">
          {/* Live metrics */}
          <div className="rounded-[20px] border p-5" style={{ background: "rgba(15,29,58,0.9)", borderColor: "rgba(139,92,246,0.15)", boxShadow: "0 0 30px rgba(139,92,246,0.06)" }}>
            <div className="mb-4 flex items-center gap-2">
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="h-2 w-2 rounded-full" style={{ background: "#22C55E" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Métriques Live — {formation}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Possession", node: <AnimatedNumber value={metrics.possession} suffix="%" />, color: "#8B5CF6", bar: metrics.possession },
                { label: "xG estimé", node: <AnimatedNumber value={metrics.xG} decimals={1} />, color: "#22C55E", bar: metrics.xG * 25 },
                { label: "Pressing", node: metrics.pressing, color: pressingColor, bar: metrics.pressing === "Fort" ? 90 : metrics.pressing === "Moyen" ? 55 : 25 },
                { label: "Risque fatigue", node: metrics.fatigueRisk, color: fatigueColor, bar: metrics.fatigueRisk === "Élevé" ? 80 : metrics.fatigueRisk === "Moyen" ? 50 : 20 },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border p-3" style={{ borderColor: `${m.color}25`, background: `${m.color}08` }}>
                  <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{m.label}</p>
                  <p className="mt-1 text-lg font-black" style={{ color: m.color }}>{m.node}</p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: m.color }} animate={{ width: `${Math.min(100, m.bar)}%` }} transition={{ duration: 0.5 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chemistry legend */}
          <div className="rounded-[20px] border p-4" style={{ background: "rgba(15,29,58,0.9)", borderColor: "var(--surface-panel-border)" }}>
            <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Chemistry · Connexions</h4>
            <div className="flex flex-wrap gap-3 text-xs">
              {[
                { c: "#22C55E", l: "Excellent" },
                { c: "#F59E0B", l: "Moyen" },
                { c: "#EF4444", l: "Faible" },
              ].map((x) => (
                <div key={x.l} className="flex items-center gap-1.5">
                  <div className="h-0.5 w-5 rounded-full" style={{ background: x.c, boxShadow: `0 0 4px ${x.c}` }} />
                  <span style={{ color: "var(--text-muted)" }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI suggestions with confidence */}
          <div className="rounded-[20px] border p-5" style={{ background: "rgba(15,29,58,0.9)", borderColor: "var(--surface-panel-border)" }}>
            <div className="mb-3 flex items-center gap-2">
              <Zap size={14} style={{ color: "#8B5CF6" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "#8B5CF6" }}>AI Suggestions</h3>
            </div>
            <div className="space-y-2">
              {suggestions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-xl border px-3 py-2.5"
                  style={{
                    borderColor: s.type === "positive" ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)",
                    background: s.type === "positive" ? "rgba(34,197,94,0.04)" : "rgba(245,158,11,0.04)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{s.action}</p>
                    <span className="text-xs font-black" style={{ color: s.type === "positive" ? "#22C55E" : "#F59E0B" }}>{s.impact}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div className="h-full rounded-full" style={{ background: "#8B5CF6" }} initial={{ width: 0 }} animate={{ width: `${s.confidence}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }} />
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: "#8B5CF6" }}>Confiance {s.confidence}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === BENCH === */}
      <div className="rounded-[20px] border p-4" style={{ background: "rgba(15,29,58,0.9)", borderColor: "var(--surface-panel-border)" }}>
        <div className="mb-3 flex items-center gap-2">
          <Users size={14} style={{ color: "#6366F1" }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Remplaçants</h3>
          <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--text-muted)" }}>
            <Sparkles size={10} /> Glisser un joueur sur le terrain pour substituer
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {bench.map((b) => (
            <div
              key={b.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", b.id)}
              className="cursor-grab active:cursor-grabbing"
              onMouseEnter={() => setHoveredId(null)}
            >
              <PlayerCard player={b} size={44} />
            </div>
          ))}
        </div>
      </div>

      <PlayerInsightDrawer player={drawerPlayer} open={!!drawerId} onClose={() => setDrawerId(null)} />
    </div>
  );
}
