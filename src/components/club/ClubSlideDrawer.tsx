import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ClubSlideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: string;
}

export function ClubSlideDrawer({ open, onClose, title, subtitle, children, width = "max-w-lg" }: ClubSlideDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={`fixed inset-y-0 right-0 z-50 flex w-full ${width} flex-col border-l shadow-2xl`}
            style={{ background: "rgba(15,29,58,0.98)", borderColor: "var(--surface-panel-border)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between border-b p-5" style={{ borderColor: "var(--surface-panel-border)" }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{title}</h2>
                {subtitle && <p className="text-sm" style={{ color: "var(--text-muted)" }}>{subtitle}</p>}
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-white/5">
                <X size={18} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
