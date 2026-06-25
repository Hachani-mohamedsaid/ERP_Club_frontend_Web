import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface MatchCountdownProps {
  targetDate: Date;
  label: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function MatchCountdown({ targetDate, label }: MatchCountdownProps) {
  const [remaining, setRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      setRemaining({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const parts = [
    { v: remaining.days, u: "j" },
    { v: remaining.hours, u: "h" },
    { v: remaining.minutes, u: "m" },
    { v: remaining.seconds, u: "s" },
  ];

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <div className="flex gap-2">
        {parts.map(({ v, u }, i) => (
          <motion.div
            key={u}
            className="flex flex-col items-center rounded-xl border px-3 py-2"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,107,87,0.08)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <span className="text-xl font-bold tabular-nums" style={{ color: "#FF6B57" }}>
              {pad(v)}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{u}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
