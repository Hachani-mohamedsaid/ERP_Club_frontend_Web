import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "glass";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-odin-md)] px-4 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<ButtonVariant, string> = {
    primary: "",
    ghost: "",
    glass: "glass-input",
  };

  const style =
    variant === "primary"
      ? {
          background: "var(--accent)",
          color: "var(--text-on-accent)",
          boxShadow: "0 4px 14px rgba(192, 57, 43, 0.28)",
        }
      : variant === "ghost"
        ? { background: "transparent", color: "var(--text-secondary)" }
        : { padding: "0.625rem 1rem" };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </button>
  );
}
