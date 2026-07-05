import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";

export const CONTRACT_FORM_FIELDS = [
  { key: "startDate", label: "Date début", type: "date" },
  { key: "endDate", label: "Date fin", type: "date" },
  { key: "salaryMonthly", label: "Salaire mensuel (DT)", type: "number" },
  { key: "bonus", label: "Bonus (DT)", type: "number", placeholder: "5000" },
  { key: "releaseClause", label: "Clause libératoire", placeholder: "15M €" },
] as const;

export interface RosterEntry {
  name: string;
  salaryMonthly: number;
}

export interface ContractFormModalProps {
  holders: RosterEntry[];
  defaultHolder?: string;
  title?: string;
  lockHolder?: boolean;
  initialValues?: {
    startDate?: string;
    endDate?: string;
    salaryMonthly?: string;
    bonus?: string;
    releaseClause?: string;
  };
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export function ContractFormModal({
  holders,
  defaultHolder,
  title = "Nouveau contrat",
  lockHolder = false,
  initialValues,
  onClose,
  onSubmit,
}: ContractFormModalProps) {
  const [holderName, setHolderName] = useState(defaultHolder ?? "");
  const [form, setForm] = useState({
    startDate: initialValues?.startDate ?? "",
    endDate: initialValues?.endDate ?? "",
    salaryMonthly: initialValues?.salaryMonthly ?? "",
    bonus: initialValues?.bonus ?? "",
    releaseClause: initialValues?.releaseClause ?? "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (defaultHolder) setHolderName(defaultHolder);
  }, [defaultHolder]);

  useEffect(() => {
    if (initialValues) {
      setForm({
        startDate: initialValues.startDate ?? "",
        endDate: initialValues.endDate ?? "",
        salaryMonthly: initialValues.salaryMonthly ?? "",
        bonus: initialValues.bonus ?? "",
        releaseClause: initialValues.releaseClause ?? "",
      });
    }
  }, [initialValues]);

  function onHolderChange(name: string) {
    setHolderName(name);
    const entry = holders.find((h) => h.name === name);
    if (entry?.salaryMonthly && !form.salaryMonthly) {
      setForm((f) => ({ ...f, salaryMonthly: String(entry.salaryMonthly) }));
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-[24px] border p-6"
        style={{ background: "var(--surface-panel-solid)", borderColor: "rgba(255,107,87,0.25)" }}
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-extrabold" style={{ color: "var(--text-primary)" }}>
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Titulaire
            </label>
            {lockHolder ? (
              <input
                value={holderName}
                readOnly
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none opacity-80"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
              />
            ) : holders.length > 0 ? (
              <select
                value={holderName}
                onChange={(e) => onHolderChange(e.target.value)}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "rgba(30,35,50,0.97)",
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="">Sélectionner un joueur ou staff…</option>
                {holders.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Nom du joueur"
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
              />
            )}
          </div>
          {CONTRACT_FORM_FIELDS.map((f) => (
            <div key={f.key}>
              <label
                className="mb-1.5 block text-xs font-medium uppercase tracking-wide"
                style={{ color: "var(--text-muted)" }}
              >
                {f.label}
              </label>
              <input
                type={f.type ?? "text"}
                value={form[f.key as keyof typeof form] ?? ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={"placeholder" in f ? f.placeholder : undefined}
                className="w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--surface-panel-border)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
          ))}
        </div>
        <motion.button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await onSubmit({ holderName, ...form });
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
          <Save size={14} /> {saving ? "Enregistrement…" : "Enregistrer"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
