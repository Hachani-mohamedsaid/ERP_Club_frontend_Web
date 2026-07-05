import { motion } from "framer-motion";

interface WhoopAppMirrorProps {
  recovery: number;
  strain: number;
  strainTarget: number;
  sleepHours: number;
  sleepPerformance: number;
  hrv: number;
  hrvBaseline: number;
  restingHr: number;
  activeTab?: "recovery" | "strain" | "sleep";
}

function recoveryColor(v: number) {
  if (v >= 67) return "#34d399";
  if (v >= 34) return "#fbbf24";
  return "#ef4444";
}

export function WhoopAppMirror({
  recovery,
  strain,
  strainTarget,
  sleepHours,
  sleepPerformance,
  hrv,
  hrvBaseline,
  restingHr,
  activeTab = "recovery",
}: WhoopAppMirrorProps) {
  const color = recoveryColor(recovery);
  const r = 72;
  const circ = 2 * Math.PI * r;
  const hrvDelta = Math.round(((hrv - hrvBaseline) / hrvBaseline) * 100);
  const strainPct = Math.min(100, (strain / 21) * 100);
  const targetPct = Math.min(100, (strainTarget / 21) * 100);

  return (
    <div
      className="flex h-[400px] w-full flex-col overflow-hidden rounded-2xl border border-slate-600/50"
      style={{
        background: "linear-gradient(180deg, #0f1419 0%, #0a0d12 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-3 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
        <span>9:41</span>
        <span className="font-bold tracking-[0.25em]" style={{ color: "var(--text-muted)" }}>WHOOP</span>
        <span>100%</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-4">
        {activeTab === "recovery" && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Today&apos;s Recovery
            </p>
            <div className="relative mt-6 flex items-center justify-center">
              <svg width="200" height="200" className="-rotate-90">
                <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <motion.circle
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke={color}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - recovery / 100) }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-5xl font-light tabular-nums tracking-tight" style={{ color: "white" }}>{recovery}</p>
                <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>percent</p>
              </div>
            </div>
            <div className="mt-8 grid w-full grid-cols-3 gap-3 border-t pt-5" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div className="text-center">
                <p className="text-lg font-semibold tabular-nums text-white">{hrv}</p>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>HRV</p>
                <p className="text-[9px] font-medium" style={{ color: hrvDelta >= 0 ? "#44D62C" : "#E84855" }}>
                  {hrvDelta >= 0 ? "+" : ""}{hrvDelta}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold tabular-nums text-white">{restingHr}</p>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>RHR</p>
                <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>bpm</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold tabular-nums text-white">{sleepPerformance}%</p>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Sleep</p>
                <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{sleepHours}h</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "strain" && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Day Strain
            </p>
            <p className="mt-4 text-6xl font-light tabular-nums text-white">{strain}</p>
            <div className="mt-8 w-full">
              <div className="relative h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: "linear-gradient(90deg, #F5A623, #E84855)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${strainPct}%` }}
                  transition={{ duration: 0.8 }}
                />
                <div
                  className="absolute top-0 h-full w-0.5"
                  style={{ left: `${targetPct}%`, background: "rgba(255,255,255,0.6)" }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[9px]" style={{ color: "var(--text-muted)" }}>
                <span>0</span>
                <span>Objectif {strainTarget}</span>
                <span>21</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "sleep" && (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
              Sleep Performance
            </p>
            <p className="mt-4 text-6xl font-light tabular-nums text-white">{sleepPerformance}<span className="text-2xl">%</span></p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{sleepHours} heures · besoin 8h</p>
          </>
        )}
      </div>

      {/* Tab bar */}
      <div className="grid grid-cols-3 border-t" style={{ borderColor: "var(--surface-panel-border)" }}>
        {(["recovery", "strain", "sleep"] as const).map((tab) => (
          <div
            key={tab}
            className="py-3 text-center text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: activeTab === tab ? "white" : "rgba(255,255,255,0.3)",
              borderTop: activeTab === tab ? "2px solid white" : "2px solid transparent",
            }}
          >
            {tab === "recovery" ? "Recovery" : tab === "strain" ? "Strain" : "Sleep"}
          </div>
        ))}
      </div>
    </div>
  );
}
