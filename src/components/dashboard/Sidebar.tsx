import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  Swords,
  Radar,
  ScrollText,
  Stethoscope,
  Wallet,
  MessageSquare,
  ChartColumn,
  Sparkles,
  LogOut,
  BarChart3,
  UserPlus,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  allowedRoles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", allowedRoles: ["responsable"] },
  { label: "Joueurs", icon: Users, path: "/players", allowedRoles: ["responsable"] },
  { label: "Teams", icon: Shield, path: "/teams", allowedRoles: ["responsable"] },
  { label: "Entraîneur", icon: CalendarDays, path: "/coach", allowedRoles: ["coach"] },
  { label: "Scout", icon: Radar, path: "/scout", allowedRoles: ["scout"] },
  { label: "Performances", icon: BarChart3, path: "/performance", allowedRoles: ["coach"] },
  { label: "Recrutement", icon: UserPlus, path: "/recruitment", allowedRoles: ["coach"] },
  { label: "Entraînements", icon: CalendarDays, path: "/training" },
  { label: "Matchs", icon: Swords, path: "/matches" },
  { label: "Messages", icon: MessageSquare, path: "/messages" },
  { label: "Reports", icon: ChartColumn, path: "/reports", allowedRoles: ["coach", "responsable"] },
  { label: "Scouting", icon: Radar, path: "/scouting", allowedRoles: ["coach", "scout"] },
  { label: "Contracts", icon: ScrollText, path: "/contracts", allowedRoles: ["responsable"] },
  { label: "Médical", icon: Stethoscope, path: "/medical" },
  { label: "Finance", icon: Wallet, path: "/finance", allowedRoles: ["responsable"] },
  { label: "ODIN AI", icon: Sparkles, path: "/odin-ai", allowedRoles: ["responsable"] },
];

import { useAuth } from "../../contexts/AuthContext";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="glass-nav flex h-full w-64 flex-col px-4 py-6">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-odin-md)] text-sm font-semibold"
          style={{ background: "var(--accent)", color: "white" }}
        >
          O
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">
            ODIN ERP
          </p>
          <p className="text-[11px] leading-tight" style={{ color: "var(--nav-text)" }}>
            FC Carthage
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.filter((it) => {
          if (!it.allowedRoles) return true;
          if (!user) return false;
          return it.allowedRoles.includes(user.role);
        }).map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;

          return (
            <button
              key={label}
              type="button"
              onClick={() => navigate(path)}
              className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-sm transition-colors duration-150"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "white" : "var(--nav-text)",
              }}
            >
              <Icon size={17} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-sm transition-colors duration-150"
        style={{ color: "var(--nav-text)" }}
      >
        <LogOut size={17} strokeWidth={2} />
        Déconnexion
      </button>
    </aside>
  );
}
