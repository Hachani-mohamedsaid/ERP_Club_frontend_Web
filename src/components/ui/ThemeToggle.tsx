import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Basculer entre le thème clair et sombre"
      className="relative flex h-9 w-16 items-center rounded-full px-1 transition-colors duration-200"
      style={{
        background: isDark ? "rgba(255,255,255,0.08)" : "rgba(26,26,46,0.08)",
        border: "1px solid var(--surface-panel-border)",
      }}
    >
      <span
        className="absolute flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200"
        style={{
          background: "var(--accent)",
          transform: isDark ? "translateX(26px)" : "translateX(0px)",
          boxShadow: "0 2px 8px rgba(192,57,43,0.4)",
        }}
      >
        {isDark ? (
          <Moon size={14} color="white" strokeWidth={2.2} />
        ) : (
          <Sun size={14} color="white" strokeWidth={2.2} />
        )}
      </span>
    </button>
  );
}
