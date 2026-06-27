import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";

export function WhoopPremiumBg() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#070b14]" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at top right, rgba(255,120,0,0.18), transparent 45%), radial-gradient(circle at 20% 80%, rgba(52,211,153,0.08), transparent 40%)",
        }}
      />
      {!reduced && (
        <>
          <motion.div
            className="absolute -right-32 top-0 h-[60vh] w-[60vw] rounded-full blur-[120px]"
            style={{ background: "rgba(255,120,0,0.12)" }}
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.06, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -left-24 bottom-0 h-[50vh] w-[50vw] rounded-full blur-[100px]"
            style={{ background: "rgba(52,211,153,0.06)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white/20"
              style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%` }}
              animate={{ opacity: [0.1, 0.5, 0.1], y: [0, -20, 0] }}
              transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </>
      )}
    </div>
  );
}
