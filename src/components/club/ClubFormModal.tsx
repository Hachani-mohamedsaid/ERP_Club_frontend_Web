import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";

interface ClubFormModalProps {
  title: string;
  fields: {
    key: string;
    label: string;
    type?: string;
    placeholder?: string;
    options?: string[];
  }[];
  initialValues?: Record<string, string>;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export function ClubFormModal({ title, fields, initialValues, submitLabel = "Enregistrer", onClose, onSubmit }: ClubFormModalProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(initialValues ?? {});
  }, [initialValues]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "rgba(10,18,40,0.98)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>{title}</h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>{f.label}</label>
              {f.type === "select" ? (
                <select
                  value={values[f.key] ?? f.options?.[0] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(30,35,50,0.97)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                >
                  {(f.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type ?? "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.1)", color: "var(--text-primary)" }}
                />
              )}
            </div>
          ))}
        </div>
        <motion.button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSubmit(values);
              onClose();
            } catch (err) {
              alert(err instanceof Error ? err.message : "Erreur");
            } finally {
              setSaving(false);
            }
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#FF6B57,#E65240)" }}
        >
          <Save size={14} /> {saving ? "Enregistrement…" : submitLabel}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
