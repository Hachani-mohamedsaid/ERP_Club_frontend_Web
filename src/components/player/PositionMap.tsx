import { useState } from "react";
import { motion } from "framer-motion";

interface PositionMapProps {
  preferred: string;
  secondary: string;
}

const POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  GB: { x: 50, y: 92, label: "GB" },
  DG: { x: 15, y: 70, label: "DG" },
  DC: { x: 38, y: 72, label: "DC" },
  DD: { x: 62, y: 72, label: "DD" },
  MOC: { x: 50, y: 52, label: "MOC" },
  MC: { x: 50, y: 62, label: "MC" },
  MG: { x: 20, y: 55, label: "MG" },
  MD: { x: 80, y: 55, label: "MD" },
  AG: { x: 18, y: 28, label: "AG" },
  BU: { x: 50, y: 18, label: "BU" },
  AD: { x: 82, y: 28, label: "AD" },
};

export function PositionMap({ preferred, secondary }: PositionMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const prefPos = POSITIONS[preferred];
  const secPos = secondary !== "—" ? POSITIONS[secondary] : null;

  return (
    <div className="relative mx-auto" style={{ width: 200, height: 280 }}>
      <div
        className="absolute inset-0 rounded-[var(--radius-odin-md)] border-2"
        style={{ borderColor: "var(--color-state-success)", background: "rgba(46,158,91,0.08)" }}
      />
      <div className="absolute inset-x-4 top-1/2 h-0.5" style={{ background: "rgba(255,255,255,0.15)" }} />
      <div className="absolute inset-x-4 top-1/4 h-0.5" style={{ background: "var(--divider)" }} />
      <div className="absolute left-1/2 top-4 h-16 w-16 -translate-x-1/2 rounded-full border" style={{ borderColor: "var(--surface-panel-border)" }} />

      {Object.entries(POSITIONS).map(([key, pos]) => {
        const isPreferred = key === preferred;
        const isSecondary = key === secondary;
        const isHovered = hovered === key;
        if (!isPreferred && !isSecondary && !isHovered) return null;

        return (
          <motion.div
            key={key}
            className="absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              background: isPreferred ? "var(--accent)" : isSecondary ? "rgba(var(--accent-rgb),0.4)" : "var(--surface-panel-border)",
              color: "white",
              boxShadow: isPreferred ? "0 0 20px rgba(224,88,74,0.6)" : undefined,
            }}
            onHoverStart={() => setHovered(key)}
            onHoverEnd={() => setHovered(null)}
            animate={{ scale: isHovered ? 1.2 : 1 }}
          >
            {pos.label}
          </motion.div>
        );
      })}

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded px-3 py-1 text-[10px] font-medium whitespace-nowrap"
          style={{ background: "var(--accent)", color: "white" }}
        >
          {hovered === preferred ? "Preferred Position" : hovered === secondary ? "Secondary Position" : hovered}
        </motion.div>
      )}

      {prefPos && (
        <motion.div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{ left: `${prefPos.x}%`, top: `${prefPos.y}%`, background: "var(--accent)" }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
