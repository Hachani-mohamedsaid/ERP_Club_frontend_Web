import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface ZoneInjuryInfo {
  player: string;
  grade: string;
  risk: number;
  daysRemaining: number;
}

export interface BodyZone {
  id: string;
  name: string;
  severity: "low" | "medium" | "critical" | "none";
  description?: string;
  injuryInfo?: ZoneInjuryInfo;
  risk?: number;
  lastControl?: string;
}

interface BodyInjuryViewerProps {
  zones?: BodyZone[];
  onZoneClick?: (zone: BodyZone) => void;
}

const DEFAULT_ZONES: BodyZone[] = [
  { id: "head", name: "Tête", severity: "none" },
  { id: "shoulder-left", name: "Épaule gauche", severity: "none" },
  { id: "shoulder-right", name: "Épaule droite", severity: "low" },
  { id: "arm-left", name: "Bras gauche", severity: "none" },
  { id: "arm-right", name: "Bras droit", severity: "none" },
  { id: "chest", name: "Poitrine", severity: "none" },
  { id: "abdomen", name: "Abdomen", severity: "none" },
  { id: "groin", name: "Aine", severity: "none" },
  { id: "knee-left", name: "Genou gauche", severity: "critical" },
  { id: "knee-right", name: "Genou droit", severity: "medium" },
  { id: "ankle-left", name: "Cheville gauche", severity: "none" },
  { id: "ankle-right", name: "Cheville droite", severity: "none" },
];

const ZONE_POSITIONS: Record<string, { cx: number; cy: number; r: number }> = {
  head: { cx: 100, cy: 40, r: 15 },
  "shoulder-left": { cx: 70, cy: 75, r: 12 },
  "shoulder-right": { cx: 130, cy: 75, r: 12 },
  "arm-left": { cx: 50, cy: 110, r: 10 },
  "arm-right": { cx: 150, cy: 110, r: 10 },
  chest: { cx: 100, cy: 100, r: 18 },
  abdomen: { cx: 100, cy: 140, r: 16 },
  groin: { cx: 100, cy: 165, r: 12 },
  "knee-left": { cx: 75, cy: 210, r: 12 },
  "knee-right": { cx: 125, cy: 210, r: 12 },
  "ankle-left": { cx: 75, cy: 250, r: 10 },
  "ankle-right": { cx: 125, cy: 250, r: 10 },
};

const SEVERITY_COLORS: Record<string, { stroke: string; fill: string; glow: string }> = {
  none: { stroke: "rgba(255,255,255,0.25)", fill: "rgba(255,255,255,0.06)", glow: "none" },
  low: { stroke: "#22C55E", fill: "rgba(34,197,94,0.35)", glow: "0 0 14px rgba(34,197,94,0.7)" },
  medium: { stroke: "#F59E0B", fill: "rgba(245,158,11,0.4)", glow: "0 0 18px rgba(245,158,11,0.75)" },
  critical: { stroke: "#EF4444", fill: "rgba(239,68,68,0.45)", glow: "0 0 22px rgba(239,68,68,0.85)" },
};

function ZonePopup({ zone, position }: { zone: BodyZone; position: { cx: number; cy: number } }) {
  const risk = zone.risk ?? (zone.severity === "critical" ? 65 : zone.severity === "medium" ? 35 : zone.severity === "low" ? 15 : 5);
  const riskColor = risk >= 40 ? "#F59E0B" : risk >= 25 ? "#F59E0B" : "#22C55E";
  const lastControl = zone.lastControl ?? "—";

  const left = `${(position.cx / 200) * 100}%`;
  const top = `${(position.cy / 300) * 100}%`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 8 }}
      transition={{ duration: 0.15 }}
      className="pointer-events-none absolute z-20 w-48 rounded-[16px] border p-3 shadow-xl"
      style={{
        left,
        top,
        transform: "translate(-50%, -110%)",
        background: "rgba(20, 27, 45, 0.97)",
        borderColor: "rgba(255,107,87,0.3)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{zone.name}</p>
      <div className="my-2 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--text-muted)" }}>Risque</span>
          <span className="font-bold" style={{ color: riskColor }}>{risk}%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: "var(--text-muted)" }}>Dernier contrôle</span>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{lastControl}</span>
        </div>
      </div>
      {zone.injuryInfo && (
        <p className="mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>
          {zone.injuryInfo.grade} — {zone.injuryInfo.daysRemaining}j restants
        </p>
      )}
    </motion.div>
  );
}

export function BodyInjuryViewer({ zones = DEFAULT_ZONES, onZoneClick }: BodyInjuryViewerProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const activeZoneId = hoveredZone ?? selectedZone;
  const activeZone = activeZoneId ? zones.find((z) => z.id === activeZoneId) : null;
  const activePos = activeZoneId ? ZONE_POSITIONS[activeZoneId] : null;

  const handleZoneClick = (zone: BodyZone) => {
    setSelectedZone(zone.id);
    onZoneClick?.(zone);
  };

  const getZoneColor = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return SEVERITY_COLORS.none;
    if (selectedZone === zoneId || hoveredZone === zoneId) {
      return { stroke: "#3B82F6", fill: "rgba(59,130,246,0.25)", glow: "0 0 15px rgba(59,130,246,0.6)" };
    }
    return SEVERITY_COLORS[zone.severity];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: 250, height: 375 }}>
          <svg viewBox="0 0 200 300" width={250} height={375} className="drop-shadow-lg">
            <defs>
              <linearGradient id="bodyFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
              </linearGradient>
            </defs>
            {/* Silhouette — visible outline */}
            <ellipse cx={100} cy={38} rx={22} ry={26} fill="url(#bodyFill)" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
            <path d="M 78 62 Q 100 58 122 62 L 130 78 Q 145 95 148 118 L 152 145 Q 153 155 145 158 L 135 160 L 132 200 Q 131 230 128 255 L 125 275 Q 124 285 118 285 L 112 285 Q 108 285 107 275 L 105 230 L 103 175 L 100 168 L 97 175 L 95 230 L 93 275 Q 92 285 88 285 L 82 285 Q 76 285 75 275 L 72 255 Q 69 230 68 200 L 65 160 L 55 158 Q 47 155 48 145 L 52 118 Q 55 95 70 78 Z" fill="url(#bodyFill)" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} strokeLinejoin="round" />
            <ellipse cx={55} cy={115} rx={10} ry={28} fill="url(#bodyFill)" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} transform="rotate(15 55 115)" />
            <ellipse cx={145} cy={115} rx={10} ry={28} fill="url(#bodyFill)" stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} transform="rotate(-15 145 115)" />

            {zones.map((zone) => {
              const pos = ZONE_POSITIONS[zone.id];
              if (!pos) return null;
              const colors = getZoneColor(zone.id);
              const isHovered = hoveredZone === zone.id;
              const isSelected = selectedZone === zone.id;

              return (
                <motion.g
                  key={zone.id}
                  onHoverStart={() => setHoveredZone(zone.id)}
                  onHoverEnd={() => setHoveredZone(null)}
                  onClick={() => handleZoneClick(zone)}
                  style={{ cursor: "pointer" }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.circle
                    cx={pos.cx}
                    cy={pos.cy}
                    initial={{ r: pos.r }}
                    stroke={colors.stroke}
                    strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 2}
                    fill={colors.fill}
                    style={{ filter: colors.glow !== "none" ? `drop-shadow(${colors.glow})` : "none" }}
                    animate={{ r: isHovered || isSelected ? pos.r * 1.25 : pos.r, opacity: zone.severity === "none" ? 0.4 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.g>
              );
            })}
          </svg>

          <AnimatePresence>
            {activeZone && activePos && (
              <ZonePopup key={activeZone.id} zone={activeZone} position={activePos} />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-xs">
        {[
          { key: "none", label: "Normal", color: "rgba(100,200,255,0.5)" },
          { key: "low", label: "Faible", color: "#22C55E" },
          { key: "medium", label: "Moyenne", color: "#F59E0B" },
          { key: "critical", label: "Critique", color: "#EF4444" },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
