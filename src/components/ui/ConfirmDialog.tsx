import { motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { ReactNode } from "react";

interface ConfirmDialogProps {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ModalDecorations() {
  return (
    <>
      <div
        className="pointer-events-none absolute -left-14 -top-14 h-44 w-44 rounded-full"
        style={{ background: "rgba(255,122,0,0.08)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full"
        style={{ background: "rgba(79,70,229,0.06)" }}
      />
    </>
  );
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = variant === "danger";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="relative w-full max-w-md overflow-hidden rounded-[20px] border p-7"
        style={{
          background: "linear-gradient(145deg, rgba(26,26,46,0.98) 0%, rgba(15,15,30,0.99) 100%)",
          borderColor: isDanger ? "rgba(239,68,68,0.35)" : "rgba(255,122,0,0.25)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,122,0,0.1)",
        }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalDecorations />

        <div className="relative z-[1]">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: isDanger ? "rgba(239,68,68,0.15)" : "rgba(255,122,0,0.15)",
                  border: `1px solid ${isDanger ? "rgba(239,68,68,0.3)" : "rgba(255,122,0,0.3)"}`,
                }}
              >
                {isDanger ? (
                  <Trash2 size={20} style={{ color: "#f87171" }} />
                ) : (
                  <AlertTriangle size={20} style={{ color: "var(--accent)" }} />
                )}
              </div>
              <div>
                <h2 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {description}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-white/10 disabled:opacity-50"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "var(--text-secondary)" }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex flex-1 items-center justify-center rounded-[var(--radius-odin-md)] py-2.5 text-sm font-semibold transition-colors hover:bg-white/5 disabled:opacity-50"
              style={{
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex flex-1 items-center justify-center rounded-[var(--radius-odin-md)] py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{
                background: isDanger
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : "linear-gradient(135deg, var(--accent), #e56a00)",
              }}
            >
              {loading ? "..." : confirmLabel}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
