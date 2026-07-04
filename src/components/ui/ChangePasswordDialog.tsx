import { motion } from "framer-motion";
import { KeyRound, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale } from "../../contexts/LocaleContext";
import { changePassword } from "../../lib/api/auth";

interface ChangePasswordDialogProps {
  onClose: () => void;
}

export function ChangePasswordDialog({ onClose }: ChangePasswordDialogProps) {
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError(t.settings.passwordMin);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.settings.passwordMismatch);
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.settings.passwordError);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        className="relative w-full max-w-md rounded-[20px] border p-6"
        style={{
          background: "var(--surface-modal)",
          borderColor: "rgba(255,122,0,0.25)",
          boxShadow: "var(--shadow-glass-strong)",
        }}
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(255,122,0,0.15)", border: "1px solid var(--surface-panel-border)" }}
            >
              <KeyRound size={18} style={{ color: "var(--accent)" }} />
            </div>
            <h3 className="text-base font-extrabold" style={{ color: "var(--text-primary)" }}>
              {t.settings.changePassword}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border"
            style={{ borderColor: "var(--surface-panel-border)", color: "var(--text-secondary)" }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t.settings.currentPassword}
            required
            className="odin-input-surface w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t.settings.newPassword}
            required
            minLength={8}
            className="odin-input-surface w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t.settings.confirmPassword}
            required
            className="odin-input-surface w-full rounded-xl px-3 py-2.5 text-sm outline-none"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "#f87171" }}>
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 text-sm" style={{ color: "#22c55e" }}>
            {t.settings.passwordSuccess}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, var(--accent), #e56a00)" }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : t.settings.savePassword}
        </button>
      </motion.form>
    </motion.div>,
    document.body,
  );
}
