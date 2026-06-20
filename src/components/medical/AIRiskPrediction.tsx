import { motion } from "framer-motion";

interface RiskPredictionProps {
  overallRisk: number; // 0-100
  risksByZone?: Array<{
    zone: string;
    risk: number;
    severity: "low" | "medium" | "critical";
  }>;
}

export function AIRiskPrediction({
  overallRisk,
  risksByZone = [
    { zone: "Genou droit", risk: 85, severity: "critical" },
    { zone: "Cheville gauche", risk: 45, severity: "medium" },
    { zone: "Épaule droite", risk: 25, severity: "low" },
  ],
}: RiskPredictionProps) {
  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "#EF4444"; // Critique - rouge
    if (risk >= 40) return "#F59E0B"; // Moyenne - orange
    return "#22C55E"; // Faible - vert
  };

  const getRiskLabel = (risk: number) => {
    if (risk >= 70) return "Critique";
    if (risk >= 40) return "Élevé";
    return "Modéré";
  };

  const clampedRisk = Math.max(0, Math.min(100, overallRisk));
  // Convert to angle: -90 to +90 degrees (180 degree range)
  const needleAngle = (clampedRisk / 100) * 180 - 90;

  return (
    <div className="space-y-6">
      {/* Main Gauge Chart */}
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-48 w-48">
          <svg
            viewBox="0 0 200 120"
            width={280}
            height={170}
            className="drop-shadow-lg"
            style={{
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))",
            }}
          >
            {/* Gauge background arc */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: "#22C55E", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#F59E0B", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#EF4444", stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Outer circle border */}
            <circle
              cx={100}
              cy={100}
              r={90}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={2}
              fill="none"
            />

            {/* Gauge arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              stroke="url(#gaugeGradient)"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
            />

            {/* Risk zones markers */}
            {[0, 25, 50, 75, 100].map((marker) => {
              const angle = (marker / 100) * 180 - 90;
              const radian = (angle * Math.PI) / 180;
              const x = 100 + 75 * Math.cos(radian);
              const y = 100 + 75 * Math.sin(radian);
              const x2 = 100 + 82 * Math.cos(radian);
              const y2 = 100 + 82 * Math.sin(radian);

              return (
                <g key={`marker-${marker}`}>
                  <line
                    x1={x}
                    y1={y}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1.5}
                  />
                  <text
                    x={100 + 60 * Math.cos(radian)}
                    y={100 + 60 * Math.sin(radian)}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.6)"
                    fontSize={10}
                    fontFamily="system-ui"
                  >
                    {marker}%
                  </text>
                </g>
              );
            })}

            {/* Animated needle */}
            <g>
              <motion.g
                style={{
                  transformOrigin: "100px 100px",
                }}
                animate={{
                  rotate: needleAngle,
                }}
                transition={{
                  duration: 1.5,
                  ease: "easeOut",
                }}
              >
                {/* Needle */}
                <line
                  x1={100}
                  y1={100}
                  x2={100}
                  y2={25}
                  stroke={getRiskColor(clampedRisk)}
                  strokeWidth={3}
                  strokeLinecap="round"
                />

                {/* Needle tip */}
                <polygon
                  points="100,20 96,25 104,25"
                  fill={getRiskColor(clampedRisk)}
                />
              </motion.g>

              {/* Center circle */}
              <circle
                cx={100}
                cy={100}
                r={8}
                fill={getRiskColor(clampedRisk)}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              />
            </g>

            {/* Center text */}
            <text
              x={100}
              y={115}
              textAnchor="middle"
              fill="rgba(255,255,255,0.8)"
              fontSize={14}
              fontWeight={600}
              fontFamily="system-ui"
            >
              {clampedRisk}%
            </text>
          </svg>
        </div>

        {/* Risk level indicator */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-medium" style={{ color: getRiskColor(clampedRisk) }}>
            {getRiskLabel(clampedRisk)}
          </div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>
            Risque global de blessure
          </div>
        </div>
      </div>

      {/* Risk by zone breakdown */}
      <div className="space-y-3 rounded-lg border p-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Risques par zone
        </h3>

        <div className="space-y-3">
          {risksByZone.map((item, index) => (
            <motion.div
              key={item.zone}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  {item.zone}
                </span>
                <motion.span
                  className="text-xs font-semibold"
                  style={{ color: getRiskColor(item.risk) }}
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 2,
                    delay: index * 0.2,
                    repeat: Infinity,
                  }}
                >
                  {item.risk}%
                </motion.span>
              </div>

              {/* Animated progress bar */}
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                }}
              >
                <motion.div
                  className="h-full"
                  style={{
                    backgroundColor: getRiskColor(item.risk),
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.risk}%` }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-4"
      >
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Recommandation IA:{" "}
          </span>
          Retour estimé: <span className="font-semibold">21 jours</span>. Surveillance médicale recommandée
          du genou droit.
        </p>
      </motion.div>
    </div>
  );
}
