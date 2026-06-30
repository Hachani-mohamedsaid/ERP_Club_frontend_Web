import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export function AnalystePageLoader() {
  return (
    <div className="flex min-h-[320px] items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw size={28} style={{ color: "#8B5CF6" }} />
        </motion.div>
        <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          Chargement des données IA…
        </p>
      </motion.div>
    </div>
  );
}
