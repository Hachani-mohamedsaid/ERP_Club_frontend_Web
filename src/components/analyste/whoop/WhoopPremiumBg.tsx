import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../../hooks/usePrefersReducedMotion";
import { VIIV_THEME } from "./whoopTheme";

/** OdinBackdrop-equivalent: canvas + aurora + subtle grid */
export function WhoopPremiumBg() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${VIIV_THEME.bg} 0%, ${VIIV_THEME.bgMid} 50%, ${VIIV_THEME.bg} 100%)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {!reduced && (
        <>
          <motion.div
            className="absolute -right-24 -top-16 h-[55vh] w-[55vw] rounded-full blur-[110px]"
            style={{ background: "rgba(255,107,87,0.14)" }}
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.05, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -left-20 top-1/3 h-[45vh] w-[45vw] rounded-full blur-[100px]"
            style={{ background: "rgba(255,122,0,0.10)" }}
            animate={{ opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 h-[40vh] w-[40vw] rounded-full blur-[90px]"
            style={{ background: "rgba(34,211,238,0.06)" }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
}
