import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
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
  ChevronDown,
  Search,
  Heart,
  Scale,
  Workflow,
  FileText,
  Zap,
  Bell,
  FolderOpen,
  Bandage,
  Activity,
  AlertTriangle,
  Calendar,
  Cpu,
  Receipt,
  Handshake,
  DollarSign,
  ShieldCheck,
  Server,
  Settings,
  Trophy,
  Building2,
} from "lucide-react";

const JOUEUR_STATIC_ROUTES = ["performances", "medical", "planning", "profil", "ia", "messages"];

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  allowedRoles?: string[];
  excludeRoles?: string[];
  submenu?: Array<{ label: string; icon: typeof LayoutDashboard; path: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", allowedRoles: ["responsable"] },
  { label: "Joueurs", icon: Users, path: "/players", allowedRoles: ["responsable"] },
  { label: "Teams", icon: Shield, path: "/teams", allowedRoles: ["responsable"] },
  { label: "Entraîneur", icon: CalendarDays, path: "/coach", allowedRoles: ["coach"] },
  {
    label: "Scout",
    icon: Radar,
    path: "/scout",
    allowedRoles: ["scout"],
    submenu: [
      { label: "Recherche", icon: Search, path: "/scout/search" },
      { label: "Favoris", icon: Heart, path: "/scout/favorites" },
      { label: "Comparaison", icon: Scale, path: "/scout/comparison" },
      { label: "Recrutement", icon: Workflow, path: "/scout/recruitment" },
      { label: "Rapport", icon: FileText, path: "/scout/report" },
      { label: "IA Scout", icon: Zap, path: "/ai-scout" },
    ],
  },
  { label: "Performances", icon: BarChart3, path: "/performance", allowedRoles: ["coach"] },
  { label: "Recrutement", icon: UserPlus, path: "/recruitment", allowedRoles: ["coach"] },
  { label: "Entraînements", icon: CalendarDays, path: "/training", allowedRoles: ["coach", "responsable"] },
  { label: "Matchs", icon: Swords, path: "/matches", allowedRoles: ["coach", "responsable"] },
  { label: "Messages", icon: MessageSquare, path: "/messages", excludeRoles: ["medical", "joueur", "adminclub"] },
  { label: "Notifications", icon: Bell, path: "/notifications", allowedRoles: ["coach", "responsable", "scout", "finance", "superadmin"] },
  { label: "Reports", icon: ChartColumn, path: "/reports", allowedRoles: ["coach", "responsable"] },
  { label: "Contracts", icon: ScrollText, path: "/contracts", allowedRoles: ["responsable"] },
  {
    label: "Admin Club",
    icon: Building2,
    path: "/club",
    allowedRoles: ["adminclub"],
    submenu: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/club" },
      { label: "Gestion Joueurs", icon: Users, path: "/club/joueurs" },
      { label: "Staff Technique", icon: UserPlus, path: "/club/staff" },
      { label: "Finances", icon: Wallet, path: "/club/finances" },
      { label: "Contrats", icon: ScrollText, path: "/club/contrats" },
      { label: "Calendrier", icon: Calendar, path: "/club/calendrier" },
      { label: "Santé Club", icon: Stethoscope, path: "/club/sante" },
      { label: "Infrastructures", icon: Shield, path: "/club/infrastructures" },
      { label: "Analytics", icon: BarChart3, path: "/club/analytics" },
      { label: "Assistant IA", icon: Sparkles, path: "/club/ia" },
      { label: "Paramètres", icon: Settings, path: "/club/parametres" },
    ],
  },
  {
    label: "Mon Espace",
    icon: Trophy,
    path: "/joueurs",
    allowedRoles: ["joueur"],
    submenu: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/joueurs" },
      { label: "Mes Performances", icon: BarChart3, path: "/joueurs/performances" },
      { label: "Mon Suivi Médical", icon: Stethoscope, path: "/joueurs/medical" },
      { label: "Mon Planning", icon: Calendar, path: "/joueurs/planning" },
      { label: "AI Coach", icon: Zap, path: "/joueurs/ia" },
      { label: "Mon Profil", icon: Users, path: "/joueurs/profil" },
      { label: "Messages", icon: MessageSquare, path: "/joueurs/messages" },
    ],
  },
  {
    label: "Médical",
    icon: Stethoscope,
    path: "/medical",
    allowedRoles: ["medical"],
    submenu: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/medical" },
      { label: "Dossiers médicaux", icon: FolderOpen, path: "/medical/dossiers" },
      { label: "Blessures", icon: Bandage, path: "/medical/blessures" },
      { label: "Rééducation", icon: Activity, path: "/medical/reeducation" },
      { label: "Rendez-vous", icon: Calendar, path: "/medical/rendez-vous" },
      { label: "Documents", icon: FileText, path: "/medical/documents" },
      { label: "Rapports", icon: BarChart3, path: "/medical/rapports" },
      { label: "Joueurs à risque", icon: AlertTriangle, path: "/medical/risque" },
      { label: "Effectif disponible", icon: Users, path: "/medical/effectif" },
      { label: "Medical AI", icon: Cpu, path: "/medical/ia" },
    ],
  },
  {
    label: "Finance",
    icon: Wallet,
    path: "/comptabilite",
    allowedRoles: ["responsable", "finance"],
    submenu: [
      { label: "Dashboard", icon: BarChart3, path: "/comptabilite" },
      { label: "Salaires", icon: DollarSign, path: "/finance/salaires" },
      { label: "Contrats", icon: FileText, path: "/finance/contrats" },
      { label: "Factures & Dépenses", icon: Receipt, path: "/finance/factures" },
      { label: "Sponsors", icon: Handshake, path: "/finance/sponsors" },
      { label: "Rapports", icon: BarChart3, path: "/finance/rapports" },
      { label: "IA Finance", icon: Zap, path: "/finance/ia" },
    ],
  },  {
    label: "Super Admin",
    icon: ShieldCheck,
    path: "/superadmin/dashboard",
    allowedRoles: ["superadmin"],
    submenu: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/superadmin/dashboard" },
      { label: "Clubs", icon: Users, path: "/superadmin/clubs" },
      { label: "Utilisateurs", icon: UserPlus, path: "/superadmin/users" },
      { label: "Notifications", icon: Bell, path: "/superadmin/notifications" },
      { label: "Paiements", icon: DollarSign, path: "/superadmin/payments" },
      { label: "API Management", icon: Server, path: "/superadmin/api-management" },
      { label: "BI Dashboard", icon: BarChart3, path: "/superadmin/bi" },
      { label: "Revenue Analytics", icon: ChartColumn, path: "/superadmin/revenue-analytics" },
      { label: "Recherche", icon: Search, path: "/superadmin/search" },
      { label: "Abonnements", icon: Receipt, path: "/superadmin/subscriptions" },
      { label: "Analytics", icon: ChartColumn, path: "/superadmin/analytics" },
      { label: "Monitoring", icon: Server, path: "/superadmin/monitoring" },
      { label: "Audit Logs", icon: ScrollText, path: "/superadmin/audit-logs" },
      { label: "Support", icon: MessageSquare, path: "/superadmin/support" },
      { label: "Sécurité", icon: Shield, path: "/superadmin/security" },
      { label: "Paramètres", icon: Settings, path: "/superadmin/settings" },
      { label: "IA Admin", icon: Cpu, path: "/superadmin/ia" },
    ],
  },  { label: "ODIN AI", icon: Sparkles, path: "/odin-ai", allowedRoles: ["responsable"] },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedScout, setExpandedScout] = useState(false);
  const [expandedFinance, setExpandedFinance] = useState(false);
  const [expandedSuperAdmin, setExpandedSuperAdmin] = useState(false);
  const [expandedMedical, setExpandedMedical] = useState(true);
  const [expandedJoueur, setExpandedJoueur] = useState(true);
  const [expandedClubAdmin, setExpandedClubAdmin] = useState(true);

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
          if (it.excludeRoles && user && it.excludeRoles.includes(user.role)) return false;
          if (!it.allowedRoles) return true;
          if (!user) return false;
          return it.allowedRoles.includes(user.role);
        }).map(({ label, icon: Icon, path, submenu }) => {
          const active = location.pathname === path;
          const isScout = label === "Scout";
          const isFinance = label === "Finance";
          const isSuperAdmin = label === "Super Admin";
          const isMedical = label === "Médical";
          const isClubAdminMenu = path === "/club";
          const isJoueurMenu = path === "/joueurs";
          const activeSubmenu = submenu && submenu.some((item) => {
            if (location.pathname === item.path) return true;
            if (item.path === "/joueurs" || item.path === "/medical" || item.path === "/club") return false;
            return location.pathname.startsWith(item.path);
          });
          const isProfileActive = isJoueurMenu && /^\/joueurs\/[^/]+$/.test(location.pathname) && !JOUEUR_STATIC_ROUTES.includes(location.pathname.split("/")[2] ?? "");

          return (
            <div key={label}>
              <button
                type="button"
                onClick={() => {
                  if ((isScout || isFinance || isSuperAdmin || isMedical || isJoueurMenu || isClubAdminMenu) && submenu) {
                    if (isScout) setExpandedScout(!expandedScout);
                    if (isFinance) setExpandedFinance(!expandedFinance);
                    if (isSuperAdmin) setExpandedSuperAdmin(!expandedSuperAdmin);
                    if (isMedical) setExpandedMedical(!expandedMedical);
                    if (isJoueurMenu) setExpandedJoueur(!expandedJoueur);
                    if (isClubAdminMenu) setExpandedClubAdmin(!expandedClubAdmin);
                  } else {
                    navigate(path);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2.5 text-sm transition-colors duration-150"
                style={{
                  background: active || activeSubmenu || isProfileActive ? "var(--accent)" : "transparent",
                  color: active || activeSubmenu || isProfileActive ? "white" : "var(--nav-text)",
                }}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
                {(isScout || isFinance || isSuperAdmin || isMedical || isJoueurMenu || isClubAdminMenu) && submenu && (
                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className="ml-auto transition-transform duration-200"
                    style={{ transform: (isScout && expandedScout) || (isFinance && expandedFinance) || (isSuperAdmin && expandedSuperAdmin) || (isMedical && expandedMedical) || (isJoueurMenu && expandedJoueur) || (isClubAdminMenu && expandedClubAdmin) ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                )}
              </button>

              {isScout && submenu && expandedScout && (
                <div className="mt-1 space-y-1 pl-4">
                  {submenu.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                    const subActive = location.pathname === subPath;
                    return (
                      <button
                        key={subLabel}
                        type="button"
                        onClick={() => navigate(subPath)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-sm transition-colors duration-150"
                        style={{
                          background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                          color: subActive ? "var(--accent)" : "var(--nav-text)",
                        }}
                      >
                        <SubIcon size={16} strokeWidth={2} />
                        {subLabel}
                      </button>
                    );
                  })}
                </div>
              )}

              {isFinance && submenu && expandedFinance && (
                <div className="mt-1 space-y-1 pl-4">
                  {submenu.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                    const subActive = location.pathname === subPath;
                    return (
                      <button
                        key={subLabel}
                        type="button"
                        onClick={() => navigate(subPath)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-sm transition-colors duration-150"
                        style={{
                          background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                          color: subActive ? "var(--accent)" : "var(--nav-text)",
                        }}
                      >
                        <SubIcon size={15} strokeWidth={2} />
                        {subLabel}
                      </button>
                    );
                  })}
                </div>
              )}
              {isSuperAdmin && submenu && expandedSuperAdmin && (
                <div className="mt-1 space-y-1 pl-4">
                  {submenu.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                    const subActive = location.pathname === subPath;
                    return (
                      <button
                        key={subLabel}
                        type="button"
                        onClick={() => navigate(subPath)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-sm transition-colors duration-150"
                        style={{
                          background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                          color: subActive ? "var(--accent)" : "var(--nav-text)",
                        }}
                      >
                        <SubIcon size={15} strokeWidth={2} />
                        {subLabel}
                      </button>
                    );
                  })}
                </div>
              )}
              {isMedical && submenu && expandedMedical && (
                <div className="mt-1 space-y-1 pl-4">
                  {submenu.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                    const subActive = location.pathname === subPath || (subPath === "/medical" && location.pathname === "/medical");
                    return (
                      <button
                        key={subLabel}
                        type="button"
                        onClick={() => navigate(subPath)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-sm transition-colors duration-150"
                        style={{
                          background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                          color: subActive ? "var(--accent)" : "var(--nav-text)",
                        }}
                      >
                        <SubIcon size={15} strokeWidth={2} />
                        {subLabel}
                      </button>
                    );
                  })}
                </div>
              )}
              {isJoueurMenu && submenu && expandedJoueur && (
                <div className="mt-1 space-y-1 pl-4">
                  {submenu.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                    const subActive = location.pathname === subPath || (subPath === "/joueurs" && location.pathname === "/joueurs");
                    return (
                      <button
                        key={subLabel}
                        type="button"
                        onClick={() => navigate(subPath)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-sm transition-colors duration-150"
                        style={{
                          background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                          color: subActive ? "var(--accent)" : "var(--nav-text)",
                        }}
                      >
                        <SubIcon size={15} strokeWidth={2} />
                        {subLabel}
                      </button>
                    );
                  })}
                </div>
              )}
              {isClubAdminMenu && submenu && expandedClubAdmin && (
                <div className="mt-1 space-y-1 pl-4">
                  {submenu.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                    const subActive = location.pathname === subPath || (subPath === "/club" && location.pathname === "/club");
                    return (
                      <button
                        key={subLabel}
                        type="button"
                        onClick={() => navigate(subPath)}
                        className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-sm transition-colors duration-150"
                        style={{
                          background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                          color: subActive ? "var(--accent)" : "var(--nav-text)",
                        }}
                      >
                        <SubIcon size={15} strokeWidth={2} />
                        {subLabel}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
