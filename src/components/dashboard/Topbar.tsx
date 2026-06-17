import { ChevronDown, Search, Bell } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Topbar() {
  return (
    <header className="flex items-center justify-between gap-4 px-8 py-5">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          Tableau de bord
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Saison 2025/2026 — Vue d'ensemble du club
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Rechercher un joueur, un match..."
            className="glass-input w-64 py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <button className="glass-input relative flex h-10 w-10 items-center justify-center">
          <Bell size={16} style={{ color: "var(--text-secondary)" }} />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </button>

        <button className="glass-input flex items-center gap-2 py-2 pl-2 pr-3">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold"
            style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            FC
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            FC Carthage
          </span>
          <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}
