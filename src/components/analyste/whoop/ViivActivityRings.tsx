import { motion } from "framer-motion";
import { METRIC_COLORS, VIIV_THEME } from "./whoopTheme";

interface ViivActivityRingsProps {
  steps: number;
  calories: number;
  distanceKm: number;
  centerHr: number;
  stepsGoal?: number;
  calGoal?: number;
  distGoal?: number;
}

function Ring({
  progress,
  color,
  radius,
  stroke,
}: {
  progress: number;
  color: string;
  radius: number;
  stroke: number;
}) {
  const c = 2 * Math.PI * radius;
  const p = Math.min(1, Math.max(0, progress));
  return (
    <motion.circle
      cx={110}
      cy={110}
      r={radius}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeDasharray={c}
      initial={{ strokeDashoffset: c }}
      animate={{ strokeDashoffset: c * (1 - p) }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
    />
  );
}

export function ViivActivityRings({
  steps,
  calories,
  distanceKm,
  centerHr,
  stepsGoal = 8000,
  calGoal = 500,
  distGoal = 5,
}: ViivActivityRingsProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[220px] w-[220px]">
        <svg width={220} height={220} viewBox="0 0 220 220" className="absolute inset-0">
          <g transform="rotate(-90 110 110)">
            {[
              { r: 92, s: 12, color: "rgba(34,197,94,0.15)" },
              { r: 72, s: 12, color: "rgba(255,122,0,0.15)" },
              { r: 52, s: 12, color: "rgba(34,211,238,0.15)" },
            ].map((t) => (
              <circle key={t.r} cx={110} cy={110} r={t.r} fill="none" stroke={t.color} strokeWidth={t.s} />
            ))}
            <Ring progress={steps / stepsGoal} color={METRIC_COLORS.steps} radius={92} stroke={12} />
            <Ring progress={calories / calGoal} color={METRIC_COLORS.calories} radius={72} stroke={12} />
            <Ring progress={distanceKm / distGoal} color={METRIC_COLORS.distance} radius={52} stroke={12} />
          </g>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: VIIV_THEME.muted }}>
            FC
          </p>
          <p
            className="text-[28px] font-black tabular-nums leading-none"
            style={{ color: VIIV_THEME.text, letterSpacing: "-0.5px" }}
          >
            {centerHr > 0 ? centerHr : "—"}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            bpm
          </p>
        </div>
      </div>
      <div className="mt-4 grid w-full grid-cols-3 gap-2">
        {[
          { color: METRIC_COLORS.steps, label: "Pas", value: String(steps) },
          { color: METRIC_COLORS.calories, label: "kcal", value: String(calories) },
          {
            color: METRIC_COLORS.distance,
            label: "km",
            value: distanceKm > 0 ? distanceKm.toFixed(2) : "—",
          },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div className="mx-auto mb-1 h-2 w-2 rounded-full" style={{ background: item.color }} />
            <p className="text-[10px] uppercase tracking-wider" style={{ color: VIIV_THEME.muted }}>
              {item.label}
            </p>
            <p className="text-sm font-bold tabular-nums" style={{ color: VIIV_THEME.text }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
