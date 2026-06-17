import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarDays,
  Swords,
  Stethoscope,
  Wallet,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, active: true },
  { label: "Joueurs", icon: Users },
  { label: "Équipes", icon: Shield },
  { label: "Entraînements", icon: CalendarDays },
  { label: "Matchs", icon: Swords },
  { label: "Médical", icon: Stethoscope },
  { label: "Finance", icon: Wallet },
  { label: "Documents", icon: FileText },
  { label: "Messages", icon: MessageSquare },
];

export function Sidebar() {
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
        {NAV_ITEMS.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-sm transition-colors duration-150"
            style={{
              background: active ? "var(--accent)" : "transparent",
              color: active ? "white" : "var(--nav-text)",
            }}
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </button>
        ))}
      </nav>

      <button
        className="flex items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-sm"
        style={{ color: "var(--nav-text)" }}
      >
        <Settings size={17} strokeWidth={2} />
        Paramètres
      </button>
    </aside>
  );
}
