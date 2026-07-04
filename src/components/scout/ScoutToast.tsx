import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";
export interface Toast { id: number; message: string; type: ToastType }

let _setToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

export function showToast(message: string, type: ToastType = "success") {
  if (_setToasts) {
    const id = Date.now();
    _setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => _setToasts?.(prev => prev.filter(t => t.id !== id)), 3200);
  }
}

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
const COLORS = {
  success: { color: "#22C55E", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)" },
  error:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)" },
  info:    { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.25)" },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  _setToasts = setToasts;

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => {
          const Icon = ICONS[toast.type];
          const c = COLORS[toast.type];
          return (
            <motion.div key={toast.id}
              className="pointer-events-auto flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl min-w-[260px]"
              style={{ background: "var(--surface-panel-solid)", borderColor: c.border, boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${c.border}` }}
              initial={{ opacity: 0, x: 60, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.88 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl"
                style={{ background: c.bg }}>
                <Icon size={14} style={{ color: c.color }} />
              </div>
              <p className="flex-1 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {toast.message}
              </p>
              <motion.button type="button" onClick={() => dismiss(toast.id)}
                className="shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.2 }}>
                <X size={12} style={{ color: "white" }} />
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
