import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import odinLogo from "../../assets/odin-logo.png";
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
  Settings,
  Trophy,
  Building2,
  Dumbbell,
  History,
  CheckCircle,
  Brain,
  Crosshair,
  Film,
  Mic,
  TrendingUp,
  Briefcase,
  Star,
  GitCompare,
  ArrowLeftRight,
  Inbox,
  CheckSquare,
  KeyRound,
  FolderArchive,
  CalendarRange,
  Snowflake,
  SmilePlus,
  BellRing,
  UserSquare2,
  UserSearch,
  Users2,
  KanbanSquare,
  BookMarked,
  Stethoscope as StethoscopeIcon,
  Clipboard,
  PenTool,
  Map,
  Video,
  Target,
  Bot,
} from "lucide-react";

const JOUEUR_STATIC_ROUTES = ["performances", "medical", "planning", "profil", "ia", "messages"];

interface NavSubItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
}

interface NavGroup {
  label: string;
  items: NavSubItem[];
}

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  path: string;
  allowedRoles?: string[];
  excludeRoles?: string[];
  submenu?: NavSubItem[];
  submenuGroups?: NavGroup[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Responsable Club",
    icon: Building2,
    path: "/dashboard",
    allowedRoles: ["responsable"],
    submenuGroups: [
      {
        label: "TABLEAU DE BORD",
        items: [
          { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
          { label: "Joueurs", icon: Users, path: "/players" },
          { label: "Équipes", icon: Shield, path: "/teams" },
        ],
      },
      {
        label: "OPÉRATIONS",
        items: [
          { label: "Validation", icon: CheckSquare, path: "/responsable/validation" },
          { label: "Recrutement", icon: UserPlus, path: "/responsable/recrutement" },
          { label: "Gestion Budget", icon: Wallet, path: "/responsable/budget" },
          { label: "Entraînements", icon: CalendarDays, path: "/training" },
          { label: "Matchs", icon: Swords, path: "/matches" },
          { label: "Contrats", icon: ScrollText, path: "/contracts" },
        ],
      },
      {
        label: "RESSOURCES",
        items: [
          { label: "Staff", icon: UserPlus, path: "/responsable/staff" },
          { label: "Utilisateurs", icon: KeyRound, path: "/responsable/utilisateurs" },
          { label: "Documents", icon: FolderArchive, path: "/responsable/documents" },
        ],
      },
      {
        label: "RAPPORTS & SYSTÈME",
        items: [
          { label: "Reports", icon: ChartColumn, path: "/reports" },
          { label: "Journal Activité", icon: History, path: "/responsable/audit" },
          { label: "Notifications", icon: Bell, path: "/responsable/notifications" },
          { label: "Paramètres Club", icon: Settings, path: "/responsable/parametres" },
        ],
      },
    ],
  },
  {
    label: "Entraîneur",
    icon: CalendarDays,
    path: "/coach",
    allowedRoles: ["coach"],
    submenuGroups: [
      {
        label: "TABLEAU DE BORD",
        items: [
          { label: "Dashboard", icon: LayoutDashboard, path: "/coach" },
        ],
      },
      {
        label: "EFFECTIF",
        items: [
          { label: "Effectif / Squad", icon: Users, path: "/coach/effectif" },
          { label: "Fiche Joueur", icon: UserSearch, path: "/coach/effectif" },
          { label: "Centre Médical", icon: Stethoscope, path: "/coach/medical" },
        ],
      },
      {
        label: "ENTRAÎNEMENTS",
        items: [
          { label: "Planning Séances", icon: CalendarDays, path: "/training" },
          { label: "Training Builder", icon: Dumbbell, path: "/coach/training-builder" },
          { label: "Présence", icon: CheckCircle, path: "/coach/attendance" },
          { label: "Performances", icon: BarChart3, path: "/performance" },
        ],
      },
      {
        label: "MATCHS",
        items: [
          { label: "Matchs", icon: Swords, path: "/matches" },
          { label: "Composition", icon: Map, path: "/coach/lineup" },
          { label: "Analyse Match", icon: Target, path: "/coach/match-analysis" },
          { label: "Tableau Tactique", icon: PenTool, path: "/coach/tactical" },
        ],
      },
      {
        label: "IA & ADVERSAIRES",
        items: [
          { label: "IA Coach ODIN", icon: Bot, path: "/coach/ai" },
          { label: "Analyse Adversaire", icon: Crosshair, path: "/coach/opponent" },
          { label: "Recrutement", icon: UserPlus, path: "/recruitment" },
        ],
      },
    ],
  },
  {
    label: "Scout",
    icon: Radar,
    path: "/scout",
    allowedRoles: ["scout"],
    submenuGroups: [
      {
        label: "EXPLORATION",
        items: [
          { label: "Tableau de bord", icon: LayoutDashboard, path: "/scout" },
          { label: "Recherche", icon: Search, path: "/scout/search" },
          { label: "ODIN AI Scout", icon: Brain, path: "/scout/ai" },
        ],
      },
      {
        label: "SUIVI",
        items: [
          { label: "Watchlist", icon: Heart, path: "/scout/watchlist" },
          { label: "Workflow", icon: Workflow, path: "/scout/recruitment" },
          { label: "Rapports", icon: FileText, path: "/scout/report" },
        ],
      },
    ],
  },
  { label: "Messages", icon: MessageSquare, path: "/messages", excludeRoles: ["medical", "joueur", "adminclub", "preparateur", "analyste", "recruteur", "responsable"] },
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
      { label: "Utilisateurs", icon: Users, path: "/club/utilisateurs" },
      { label: "Permissions", icon: ShieldCheck, path: "/club/permissions" },
      { label: "Audit Logs", icon: History, path: "/club/audit-logs" },
      { label: "Notifications", icon: Bell, path: "/club/notifications" },
    ],
  },
  {
    label: "Préparateur",
    icon: Dumbbell,
    path: "/preparateur",
    allowedRoles: ["preparateur"],
    submenuGroups: [
      {
        label: "TABLEAU DE BORD",
        items: [
          { label: "Dashboard",          icon: LayoutDashboard, path: "/preparateur" },
          { label: "Charge Équipe",      icon: Activity,        path: "/preparateur/charge" },
          { label: "Condition Physique", icon: BarChart3,        path: "/preparateur/condition" },
          { label: "Risque Blessures",   icon: Bandage,         path: "/preparateur/risques" },
        ],
      },
      {
        label: "PLANIFICATION",
        items: [
          { label: "Calendrier",         icon: CalendarRange,   path: "/preparateur/calendrier" },
          { label: "Gestion Séances",    icon: Dumbbell,        path: "/preparateur/seances" },
          { label: "Programmes",         icon: Calendar,        path: "/preparateur/programmes" },
          { label: "Disponibilité Match",icon: CheckCircle,     path: "/preparateur/disponibilite" },
        ],
      },
      {
        label: "JOUEURS",
        items: [
          { label: "Comparaison",        icon: GitCompare,      path: "/preparateur/comparaison" },
          { label: "Historique Séances", icon: History,         path: "/preparateur/historique" },
          { label: "Wellness",           icon: SmilePlus,       path: "/preparateur/wellness" },
          { label: "Recovery Center",    icon: Snowflake,       path: "/preparateur/recovery" },
        ],
      },
      {
        label: "RAPPORTS & IA",
        items: [
          { label: "Rapports",           icon: FileText,        path: "/preparateur/rapports" },
          { label: "Notifications",      icon: BellRing,        path: "/preparateur/notifications" },
          { label: "Assistant IA",       icon: Sparkles,        path: "/preparateur/ia" },
        ],
      },
    ],
  },
  {
    label: "Analyste",
    icon: Brain,
    path: "/analyste",
    allowedRoles: ["analyste"],
    submenuGroups: [
      {
        label: "TABLEAU DE BORD",
        items: [
          { label: "Intelligence Center",   icon: LayoutDashboard, path: "/analyste" },
          { label: "Executive Dashboard",   icon: BarChart3,        path: "/analyste/executive" },
          { label: "Live Match",            icon: Zap,              path: "/analyste/live-match" },
        ],
      },
      {
        label: "IA & PRÉDICTION",
        items: [
          { label: "Match Prediction",      icon: Brain,            path: "/analyste/prediction" },
          { label: "Player PPI",            icon: Star,             path: "/analyste/ppi" },
          { label: "Team Chemistry",        icon: GitCompare,       path: "/analyste/chemistry" },
          { label: "Pattern Detection",     icon: Sparkles,         path: "/analyste/patterns" },
        ],
      },
      {
        label: "TACTIQUE & VIDÉO",
        items: [
          { label: "Tactical Simulator",    icon: Crosshair,        path: "/analyste/tactique" },
          { label: "Video Analysis Center", icon: Film,             path: "/analyste/video-analysis" },
          { label: "Opponent Intel",        icon: Shield,           path: "/analyste/adversaire" },
          { label: "Fatigue Heatmap",       icon: Activity,         path: "/analyste/fatigue-heatmap" },
        ],
      },
      {
        label: "SANTÉ & MARCHÉ",
        items: [
          { label: "Injury Lab",            icon: Bandage,          path: "/analyste/blessures" },
          { label: "Injury Forecast",       icon: TrendingUp,       path: "/analyste/injury-forecast" },
          { label: "Transfer Engine",       icon: UserPlus,         path: "/analyste/transfer" },
          { label: "Market Value",          icon: DollarSign,       path: "/analyste/valeur" },
          { label: "Scouting AI",           icon: Search,           path: "/analyste/scouting" },
        ],
      },
      {
        label: "DÉVELOPPEMENT",
        items: [
          { label: "Evolution Lab",         icon: TrendingUp,       path: "/analyste/evolution" },
          { label: "Training Optimizer",    icon: Calendar,         path: "/analyste/training" },
        ],
      },
    ],
  },
  {
    label: "Recruteur",
    icon: Briefcase,
    path: "/recruteur",
    allowedRoles: ["recruteur"],
    submenuGroups: [
      {
        label: "TABLEAU DE BORD",
        items: [
          { label: "Dashboard", icon: LayoutDashboard, path: "/recruteur" },
          { label: "Notifications", icon: BellRing, path: "/recruteur/notifications" },
          { label: "Journal Audit", icon: BookMarked, path: "/recruteur/audit" },
        ],
      },
      {
        label: "PROSPECTION",
        items: [
          { label: "Talent Discovery", icon: Radar, path: "/recruteur/discovery" },
          { label: "Shortlist", icon: Star, path: "/recruteur/shortlist" },
          { label: "Pipeline Talent", icon: KanbanSquare, path: "/recruteur/pipeline" },
          { label: "Video Scouting", icon: Film, path: "/recruteur/video" },
          { label: "Player Compare", icon: GitCompare, path: "/recruteur/compare" },
        ],
      },
      {
        label: "SCOUTING & AGENTS",
        items: [
          { label: "Scouts", icon: UserSearch, path: "/recruteur/scouts" },
          { label: "Agents", icon: Users2, path: "/recruteur/agents" },
          { label: "Calendrier", icon: CalendarRange, path: "/recruteur/calendar" },
        ],
      },
      {
        label: "MARCHÉ & CONTRATS",
        items: [
          { label: "Market Value", icon: TrendingUp, path: "/recruteur/market" },
          { label: "Negotiations", icon: Handshake, path: "/recruteur/negotiations" },
          { label: "Contracts", icon: FileText, path: "/recruteur/contracts" },
          { label: "Transfer Center", icon: ArrowLeftRight, path: "/recruteur/transfers" },
        ],
      },
      {
        label: "IA & RAPPORTS",
        items: [
          { label: "AI Recruitment", icon: Sparkles, path: "/recruteur/ai" },
          { label: "Requests & Validation", icon: Inbox, path: "/recruteur/requests" },
          { label: "Reports", icon: BarChart3, path: "/recruteur/reports" },
        ],
      },
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
    allowedRoles: ["finance"],
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
    submenuGroups: [
      {
        label: "PLATFORM",
        items: [
          { label: "Dashboard", icon: LayoutDashboard, path: "/superadmin/dashboard" },
          { label: "Clubs", icon: Building2, path: "/superadmin/clubs" },
          { label: "Utilisateurs", icon: UserPlus, path: "/superadmin/users" },
        ],
      },
      {
        label: "BUSINESS",
        items: [
          { label: "Paiements", icon: DollarSign, path: "/superadmin/payments" },
          { label: "Abonnements", icon: Receipt, path: "/superadmin/subscriptions" },
          { label: "Revenue Analytics", icon: TrendingUp, path: "/superadmin/revenue-analytics" },
        ],
      },
      {
        label: "DATA & IA",
        items: [
          { label: "Analytics", icon: ChartColumn, path: "/superadmin/analytics" },
          { label: "BI Dashboard", icon: BarChart3, path: "/superadmin/bi" },
        ],
      },
      {
        label: "SYSTEM",
        items: [
          { label: "Support", icon: MessageSquare, path: "/superadmin/support" },
          { label: "Sécurité", icon: Shield, path: "/superadmin/security" },
          { label: "Paramètres", icon: Settings, path: "/superadmin/settings" },
          { label: "IA Admin", icon: Cpu, path: "/superadmin/ia" },
        ],
      },
    ],
  },];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [expandedScout, setExpandedScout] = useState(false);
  const [expandedFinance, setExpandedFinance] = useState(false);
  const [expandedSuperAdmin, setExpandedSuperAdmin] = useState(true);
  const [expandedMedical, setExpandedMedical] = useState(true);
  const [expandedJoueur, setExpandedJoueur] = useState(true);
  const [expandedClubAdmin, setExpandedClubAdmin] = useState(true);
  const [expandedPreparateur, setExpandedPreparateur] = useState(true);
  const [expandedAnalyste, setExpandedAnalyste] = useState(true);
  const [expandedRecruteur, setExpandedRecruteur] = useState(true);
  const [expandedResponsable, setExpandedResponsable] = useState(true);
  const [expandedCoach, setExpandedCoach] = useState(true);

  return (
    <aside className="glass-nav flex h-full w-64 flex-col px-4 py-6">
      <div className="mb-8 flex items-center justify-center px-2">
        <img
          src={odinLogo}
          alt="ODIN ERP"
          className="app-logo w-36 cursor-pointer"
          draggable={false}
          onClick={() => navigate("/")}
        />
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.filter((it) => {
          if (it.excludeRoles && user && it.excludeRoles.includes(user.role)) return false;
          if (!it.allowedRoles) return true;
          if (!user) return false;
          return it.allowedRoles.includes(user.role);
        }).map(({ label, icon: Icon, path, submenu, submenuGroups }) => {
          const allSubPaths = [
            ...(submenu?.map((s) => s.path) ?? []),
            ...(submenuGroups?.flatMap((g) => g.items.map((i) => i.path)) ?? []),
          ];
          const active = location.pathname === path;
          const isScout = label === "Scout";
          const isFinance = label === "Finance";
          const isSuperAdmin = label === "Super Admin";
          const isMedical = label === "Médical";
          const isClubAdminMenu = path === "/club";
          const isPreparateurMenu = path === "/preparateur";
          const isAnalysteMenu = path === "/analyste";
          const isRecruteurMenu = path === "/recruteur";
          const isCoachMenu = path === "/coach" && label === "Entraîneur";
          const isJoueurMenu = path === "/joueurs";
          const isResponsableMenu = label === "Responsable Club";
          const activeSubmenu = allSubPaths.length > 0 && allSubPaths.some((itemPath) => {
            if (location.pathname === itemPath) return true;
            if (["/joueurs","/medical","/club","/preparateur","/analyste","/recruteur","/dashboard"].includes(itemPath)) return false;
            return location.pathname.startsWith(itemPath);
          });
          const isProfileActive = isJoueurMenu && /^\/joueurs\/[^/]+$/.test(location.pathname) && !JOUEUR_STATIC_ROUTES.includes(location.pathname.split("/")[2] ?? "");

          return (
            <div key={label}>
              <button
                type="button"
                onClick={() => {
                  if ((isScout || isFinance || isSuperAdmin || isMedical || isJoueurMenu || isClubAdminMenu || isPreparateurMenu || isAnalysteMenu || isRecruteurMenu || isResponsableMenu || isCoachMenu) && (submenu || submenuGroups)) {
                    if (isScout) setExpandedScout(!expandedScout);
                    if (isFinance) setExpandedFinance(!expandedFinance);
                    if (isSuperAdmin) setExpandedSuperAdmin(!expandedSuperAdmin);
                    if (isMedical) setExpandedMedical(!expandedMedical);
                    if (isJoueurMenu) setExpandedJoueur(!expandedJoueur);
                    if (isClubAdminMenu) setExpandedClubAdmin(!expandedClubAdmin);
                    if (isPreparateurMenu) setExpandedPreparateur(!expandedPreparateur);
                    if (isAnalysteMenu) setExpandedAnalyste(!expandedAnalyste);
                    if (isRecruteurMenu) setExpandedRecruteur(!expandedRecruteur);
                    if (isResponsableMenu) setExpandedResponsable(!expandedResponsable);
                    if (isCoachMenu) setExpandedCoach(!expandedCoach);
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
                {(isScout || isFinance || isSuperAdmin || isMedical || isJoueurMenu || isClubAdminMenu || isPreparateurMenu || isAnalysteMenu || isRecruteurMenu || isResponsableMenu || isCoachMenu) && (submenu || submenuGroups) && (
                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className="ml-auto transition-transform duration-200"
                    style={{ transform: (isScout && expandedScout) || (isFinance && expandedFinance) || (isSuperAdmin && expandedSuperAdmin) || (isMedical && expandedMedical) || (isJoueurMenu && expandedJoueur) || (isClubAdminMenu && expandedClubAdmin) || (isPreparateurMenu && expandedPreparateur) || (isAnalysteMenu && expandedAnalyste) || (isRecruteurMenu && expandedRecruteur) || (isResponsableMenu && expandedResponsable) || (isCoachMenu && expandedCoach) ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                )}
              </button>

              {isScout && submenuGroups && expandedScout && (
                <div className="mt-1 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pl-2 pr-1">
                  {submenuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                          const subActive = location.pathname === subPath || (subPath === "/scout" && location.pathname === "/scout");
                          return (
                            <button
                              key={subLabel}
                              type="button"
                              onClick={() => navigate(subPath)}
                              className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-xs transition-colors duration-150"
                              style={{
                                background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                                color: subActive ? "var(--accent)" : "var(--nav-text)",
                              }}
                            >
                              <SubIcon size={13} strokeWidth={2} />
                              {subLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
              {isSuperAdmin && submenuGroups && expandedSuperAdmin && (
                <div className="mt-1 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pl-2 pr-1">
                  {submenuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                          const subActive = location.pathname === subPath || location.pathname.startsWith(`${subPath}/`);
                          return (
                            <button
                              key={subPath}
                              type="button"
                              onClick={() => navigate(subPath)}
                              className="flex w-full items-center gap-2.5 rounded-[var(--radius-odin-md)] px-2.5 py-2 text-[13px] transition-colors duration-150"
                              style={{
                                background: subActive ? "rgba(var(--accent-rgb), 0.25)" : "transparent",
                                color: subActive ? "var(--accent)" : "var(--nav-text)",
                              }}
                            >
                              <SubIcon size={14} strokeWidth={2} />
                              {subLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
              {isPreparateurMenu && submenuGroups && expandedPreparateur && (
                <div className="mt-1 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pl-2 pr-1">
                  {submenuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                          const subActive = location.pathname === subPath || (subPath === "/preparateur" && location.pathname === "/preparateur");
                          return (
                            <button
                              key={subLabel}
                              type="button"
                              onClick={() => navigate(subPath)}
                              className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-xs transition-colors duration-150"
                              style={{
                                background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                                color: subActive ? "var(--accent)" : "var(--nav-text)",
                              }}
                            >
                              <SubIcon size={13} strokeWidth={2} />
                              {subLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isAnalysteMenu && submenuGroups && expandedAnalyste && (
                <div className="mt-1 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pl-2 pr-1">
                  {submenuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                          const subActive = location.pathname === subPath || (subPath === "/analyste" && location.pathname === "/analyste");
                          return (
                            <button
                              key={subLabel}
                              type="button"
                              onClick={() => navigate(subPath)}
                              className="flex w-full items-center gap-3 rounded-[var(--radius-odin-md)] px-3 py-2 text-xs transition-colors duration-150"
                              style={{
                                background: subActive ? "rgba(var(--accent-rgb), 0.3)" : "transparent",
                                color: subActive ? "var(--accent)" : "var(--nav-text)",
                              }}
                            >
                              <SubIcon size={13} strokeWidth={2} />
                              {subLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isRecruteurMenu && submenuGroups && expandedRecruteur && (
                <div className="mt-1 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pl-2 pr-1">
                  {submenuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                          const subActive = location.pathname === subPath || (subPath === "/recruteur" && location.pathname === "/recruteur") || (subPath !== "/recruteur" && location.pathname.startsWith(`${subPath}/`));
                          return (
                            <button
                              key={subPath}
                              type="button"
                              onClick={() => navigate(subPath)}
                              className="flex w-full items-center gap-2.5 rounded-[var(--radius-odin-md)] px-2.5 py-2 text-[13px] transition-colors duration-150"
                              style={{
                                background: subActive ? "rgba(var(--accent-rgb), 0.25)" : "transparent",
                                color: subActive ? "var(--accent)" : "var(--nav-text)",
                              }}
                            >
                              <SubIcon size={14} strokeWidth={2} />
                              {subLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isResponsableMenu && submenuGroups && expandedResponsable && (
                <div className="mt-1 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pl-2 pr-1">
                  {submenuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                          const subActive = location.pathname === subPath || location.pathname.startsWith(`${subPath}/`);
                          return (
                            <button
                              key={subPath}
                              type="button"
                              onClick={() => navigate(subPath)}
                              className="flex w-full items-center gap-2.5 rounded-[var(--radius-odin-md)] px-2.5 py-2 text-[13px] transition-colors duration-150"
                              style={{
                                background: subActive ? "rgba(var(--accent-rgb), 0.25)" : "transparent",
                                color: subActive ? "var(--accent)" : "var(--nav-text)",
                              }}
                            >
                              <SubIcon size={14} strokeWidth={2} />
                              {subLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isCoachMenu && submenuGroups && expandedCoach && (
                <div className="mt-1 max-h-[calc(100vh-220px)] space-y-3 overflow-y-auto pl-2 pr-1">
                  {submenuGroups.map((group) => (
                    <div key={group.label}>
                      <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                        {group.label}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) => {
                          const subActive = location.pathname === subPath || (subPath === "/coach" && location.pathname === "/coach") || (subPath !== "/coach" && location.pathname.startsWith(`${subPath}/`));
                          return (
                            <button
                              key={`${subPath}-${subLabel}`}
                              type="button"
                              onClick={() => navigate(subPath)}
                              className="flex w-full items-center gap-2.5 rounded-[var(--radius-odin-md)] px-2.5 py-2 text-[13px] transition-colors duration-150"
                              style={{
                                background: subActive ? "rgba(var(--accent-rgb), 0.25)" : "transparent",
                                color: subActive ? "var(--accent)" : "var(--nav-text)",
                              }}
                            >
                              <SubIcon size={14} strokeWidth={2} />
                              {subLabel}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
