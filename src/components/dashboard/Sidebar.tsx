import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { SettingsModal } from "../ui/SettingsModal";
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
  UserCircle,
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
  Watch,
  PenTool,
  Map,
  Video,
  Target,
  Bot,
  Globe,
} from "lucide-react";

const JOUEUR_NAV_KEYS: Record<string, keyof import("../../i18n/joueurTranslations").JoueurTranslations["nav"]> = {
  "/joueurs": "dashboard",
  "/joueurs/performances": "performances",
  "/joueurs/medical": "medical",
  "/joueurs/planning": "planning",
  "/joueurs/ia": "aiCoach",
  "/joueurs/profil": "profile",
  "/messages": "messages",
};

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
          { label: "Contrats", icon: ScrollText, path: "/responsable/contrats" },
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
          { label: "Reports", icon: ChartColumn, path: "/responsable/reports" },
          { label: "Journal Activité", icon: History, path: "/responsable/audit" },
          { label: "Messages", icon: MessageSquare, path: "/messages" },
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
      {
        label: "COMMUNICATION",
        items: [
          { label: "Messages", icon: MessageSquare, path: "/messages" },
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
          { label: "Carte Explorer", icon: Globe, path: "/scout/map" },
          { label: "Recherche", icon: Search, path: "/scout/search" },
          { label: "ODIN AI Scout", icon: Brain, path: "/scout/ai" },
        ],
      },
      {
        label: "PROFILS & ANALYSE",
        items: [
          { label: "Annuaire profils", icon: Users, path: "/scout/prospects" },
          { label: "Comparaisons", icon: GitCompare, path: "/scout/comparison" },
          { label: "Shortlist Club", icon: Star, path: "/scout/shortlist" },
          { label: "Compatibilité", icon: Crosshair, path: "/scout/squad-fit" },
          { label: "Vidéothèque", icon: Video, path: "/scout/videos" },
          { label: "Analytics", icon: BarChart3, path: "/scout/analytics" },
        ],
      },
      {
        label: "SUIVI",
        items: [
          { label: "Watchlist", icon: Heart, path: "/scout/watchlist" },
          { label: "Workflow", icon: Workflow, path: "/scout/recruitment" },
          { label: "Rapport Scout", icon: FileText, path: "/scout/report" },
          { label: "Historique rapports", icon: History, path: "/scout/reports" },
          { label: "Missions", icon: Map, path: "/scout/missions" },
        ],
      },
      {
        label: "CRM & CONFIG",
        items: [
          { label: "Messages", icon: MessageSquare, path: "/messages" },
          { label: "Agents", icon: Briefcase, path: "/scout/agents" },
          { label: "Mon profil Scout", icon: UserCircle, path: "/scout/settings" },
        ],
      },
    ],
  },
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
      { label: "Permissions", icon: UserCircle, path: "/club/permissions" },
      { label: "Audit Logs", icon: History, path: "/club/audit-logs" },
      { label: "Messages", icon: MessageSquare, path: "/messages" },
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
          { label: "Messages",           icon: MessageSquare,   path: "/messages" },
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
          { label: "Video Analysis Pro", icon: Film,             path: "/analyste/video-analysis" },
          { label: "Opponent Intel",        icon: Shield,           path: "/analyste/adversaire" },
          { label: "Fatigue Heatmap",       icon: Activity,         path: "/analyste/fatigue-heatmap" },
        ],
      },
      {
        label: "SANTÉ & MARCHÉ",
        items: [
          { label: "Viiv Smartwatch",       icon: Watch,            path: "/analyste/viiv" },
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
      {
        label: "COMMUNICATION",
        items: [
          { label: "Messages", icon: MessageSquare, path: "/messages" },
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
          { label: "Messages", icon: MessageSquare, path: "/messages" },
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
      { label: "Messages", icon: MessageSquare, path: "/messages" },
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
      { label: "Messages", icon: MessageSquare, path: "/messages" },
    ],
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/comptabilite",
    allowedRoles: ["finance"],
  },
  {
    label: "Salaires",
    icon: DollarSign,
    path: "/finance/salaires",
    allowedRoles: ["finance"],
  },
  {
    label: "Contrats",
    icon: FileText,
    path: "/finance/contrats",
    allowedRoles: ["finance"],
  },
  {
    label: "Factures & Dépenses",
    icon: Receipt,
    path: "/finance/factures",
    allowedRoles: ["finance"],
  },
  {
    label: "Sponsors",
    icon: Handshake,
    path: "/finance/sponsors",
    allowedRoles: ["finance"],
  },
  {
    label: "Rapports",
    icon: BarChart3,
    path: "/finance/rapports",
    allowedRoles: ["finance"],
  },
  {
    label: "Messages",
    icon: MessageSquare,
    path: "/messages",
    allowedRoles: ["finance"],
  },
  {
    label: "IA Finance",
    icon: Zap,
    path: "/finance/ia",
    allowedRoles: ["finance"],
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
  const { user, logout } = useAuth();
  const { t } = useLocale();
  const { preferences } = useUserPreferences();
  const compact = preferences.compactSidebar;
  const [settingsOpen, setSettingsOpen] = useState(false);

  function subItemActive(subPath: string) {
    const exactOnly = [
      "/joueurs",
      "/medical",
      "/club",
      "/preparateur",
      "/analyste",
      "/recruteur",
      "/dashboard",
      "/coach",
      "/scout",
      "/superadmin/dashboard",
      "/comptabilite",
    ];
    if (location.pathname === subPath) return true;
    if (exactOnly.includes(subPath)) return false;
    return location.pathname.startsWith(`${subPath}/`);
  }

  function renderSubButton(
    subPath: string,
    subLabel: string,
    SubIcon: typeof LayoutDashboard,
    active: boolean,
    key?: string,
  ) {
    return (
      <button
        key={key ?? subPath}
        type="button"
        onClick={() => navigate(subPath)}
        title={compact ? subLabel : undefined}
        className={`flex w-full items-center rounded-[var(--radius-odin-md)] text-sm transition-colors duration-150 ${compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
        style={{
          background: active ? "var(--accent)" : "transparent",
          color: active ? "white" : "var(--nav-text)",
        }}
      >
        <SubIcon size={17} strokeWidth={2} />
        {!compact && subLabel}
      </button>
    );
  }

  return (
    <aside
      className={`glass-nav relative z-40 flex h-full flex-col overflow-visible py-6 transition-all duration-200 ${compact ? "w-[72px] px-2" : "w-64 px-4"}`}
    >
      <div className={`mb-8 flex shrink-0 items-center justify-center ${compact ? "px-0" : "px-2"}`}>
        <img
          src={odinLogo}
          alt="ODIN ERP"
          className={`app-logo cursor-pointer ${compact ? "w-10" : "w-36"}`}
          draggable={false}
          onClick={() => navigate("/")}
        />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter((it) => {
          if (it.excludeRoles && user && it.excludeRoles.includes(user.role)) return false;
          if (!it.allowedRoles) return true;
          if (!user) return false;
          return it.allowedRoles.includes(user.role);
        }).map(({ label, icon: Icon, path, submenu, submenuGroups }) => {
          const isJoueurMenu = path === "/joueurs";
          const hasSubmenu = !!(submenu?.length || submenuGroups?.length);

          const resolveLabel = (subPath: string, subLabel: string) => {
            if (isJoueurMenu && JOUEUR_NAV_KEYS[subPath]) {
              return t.nav[JOUEUR_NAV_KEYS[subPath]];
            }
            return subLabel;
          };

          if (hasSubmenu) {
            return (
              <div key={label} className="space-y-1">
                {submenu?.map(({ label: subLabel, icon: SubIcon, path: subPath }) =>
                  renderSubButton(
                    subPath,
                    resolveLabel(subPath, subLabel),
                    SubIcon,
                    subItemActive(subPath),
                    `${subPath}-${subLabel}`,
                  ),
                )}
                {submenuGroups?.map((group) => (
                  <div key={group.label} className="space-y-1 pt-2">
                    {!compact && (
                      <p
                        className="px-3 text-[10px] font-bold uppercase tracking-[0.15em]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {group.label}
                      </p>
                    )}
                    {group.items.map(({ label: subLabel, icon: SubIcon, path: subPath }) =>
                      renderSubButton(
                        subPath,
                        subLabel,
                        SubIcon,
                        subItemActive(subPath),
                        `${subPath}-${subLabel}`,
                      ),
                    )}
                  </div>
                ))}
              </div>
            );
          }

          return renderSubButton(path, label, Icon, subItemActive(path));
        })}

      </nav>

      <div
        className="mt-auto shrink-0 space-y-1 border-t pt-3"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          title={compact ? t.nav.settings : undefined}
          className={`flex w-full items-center rounded-[var(--radius-odin-md)] text-sm transition-colors duration-150 ${compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
          style={{ color: "var(--nav-text)" }}
        >
          <Settings size={17} strokeWidth={2} />
          {!compact && t.nav.settings}
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          title={compact ? t.nav.logout : undefined}
          className={`flex w-full items-center rounded-[var(--radius-odin-md)] text-sm transition-colors duration-150 ${compact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5"}`}
          style={{ color: "var(--nav-text)" }}
        >
          <LogOut size={17} strokeWidth={2} />
          {!compact && t.nav.logout}
        </button>
      </div>

      <AnimatePresence>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>
    </aside>
  );
}
