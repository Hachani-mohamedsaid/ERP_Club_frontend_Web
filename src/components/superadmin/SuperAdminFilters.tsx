import { motion } from "framer-motion";
import { Button } from "../ui/Button";

/* ── Animated filter pills ──────────────────────────────────────── */
interface SuperAdminFilterPillsProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SuperAdminFilterPills({ options, value, onChange }: SuperAdminFilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option, i) => {
        const active = value === option;
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className="rounded-xl px-4 py-2 text-xs font-semibold"
            style={{
              background: active ? "linear-gradient(135deg,#FF7A00,#E66000)" : "rgba(255,255,255,0.04)",
              color: active ? "white" : "var(--text-muted)",
              border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
              boxShadow: active ? "0 0 20px rgba(255,122,0,0.35)" : "none",
            }}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 280, damping: 22 }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.95 }}
          >
            {option}
          </motion.button>
        );
      })}
    </div>
  );
}

/* ── Select filter ──────────────────────────────────────────────── */
interface SuperAdminSelectFilterProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export function SuperAdminSelectFilter({ label, value, options, onChange }: SuperAdminSelectFilterProps) {
  return (
    <motion.select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border px-3 py-2 text-sm"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
        color: "var(--text-primary)",
      }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileFocus={{ borderColor: "rgba(255,122,0,0.5)" }}
    >
      {options.map((option) => (
        <option key={option} value={option} style={{ background: "#0F1D3A" }}>
          {label}: {option}
        </option>
      ))}
    </motion.select>
  );
}

/* ── Search input ───────────────────────────────────────────────── */
export function SuperAdminSearchInput({
  value,
  onChange,
  placeholder,
  className = "w-full",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <motion.input
      className={`rounded-lg border px-4 py-2.5 text-sm outline-none ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.08)",
        color: "var(--text-primary)",
      }}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileFocus={{ borderColor: "rgba(255,122,0,0.55)", boxShadow: "0 0 0 2px rgba(255,122,0,0.12)" }}
    />
  );
}

/* ── Action button (gradient CTA) ───────────────────────────────── */
export function SuperAdminActionButton({
  children,
  onClick,
  type = "button",
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{ background: "linear-gradient(135deg,#FF7A00,#E66000)", boxShadow: "0 0 24px rgba(255,122,0,0.4)" }}
      whileHover={disabled ? undefined : { scale: 1.05, boxShadow: "0 0 32px rgba(255,122,0,0.6)" }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

/* ── Ghost button ───────────────────────────────────────────────── */
export function SuperAdminGhostButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        background: "transparent",
        borderColor: "rgba(255,255,255,0.08)",
        color: "var(--text-secondary)",
      }}
      whileHover={{
        borderColor: "rgba(255,122,0,0.4)",
        color: "#FF7A00",
        background: "rgba(255,122,0,0.06)",
      }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.button>
  );
}
