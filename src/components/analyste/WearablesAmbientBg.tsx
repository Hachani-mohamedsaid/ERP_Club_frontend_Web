import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export function WearablesAmbientBg() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, #0c1222 0%, #0a0e1a 40%, #0d1117 100%)",
        }}
      />
      {!reduced && (
        <>
          <div
            className="absolute -left-20 top-0 h-[50vh] w-[50vw] animate-[wearables-breathe_16s_ease-in-out_infinite] rounded-full blur-[100px]"
            style={{ background: "rgba(52,211,153,0.1)" }}
          />
          <div
            className="absolute -right-20 top-1/3 h-[40vh] w-[40vw] animate-[wearables-breathe_20s_ease-in-out_infinite_reverse] rounded-full blur-[100px]"
            style={{ background: "rgba(249,115,22,0.07)" }}
          />
        </>
      )}
      <style>{`
        @keyframes wearables-breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[wearables-breathe_16s_ease-in-out_infinite\\],
          .animate-\\[wearables-breathe_20s_ease-in-out_infinite_reverse\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
