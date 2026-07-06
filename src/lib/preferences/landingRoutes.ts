import type { Role } from "../../contexts/AuthContext";

export interface LandingOption {
  path: string;
  labelFr: string;
  labelEn: string;
  labelAr: string;
}

export const DEFAULT_LANDING_BY_ROLE: Record<Role, string> = {
  responsable: "/dashboard",
  coach: "/coach",
  scout: "/scout",
  medical: "/medical",
  finance: "/comptabilite",
  superadmin: "/superadmin/dashboard",
  adminclub: "/club",
  preparateur: "/preparateur",
  analyste: "/analyste",
  recruteur: "/recruteur",
  joueur: "/joueurs",
  guest: "/dashboard",
};

export const LANDING_OPTIONS_BY_ROLE: Partial<Record<Role, LandingOption[]>> = {
  responsable: [
    { path: "/dashboard", labelFr: "Dashboard", labelEn: "Dashboard", labelAr: "لوحة التحكم" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
    { path: "/training", labelFr: "Entraînements", labelEn: "Training", labelAr: "التدريبات" },
    { path: "/matches", labelFr: "Matchs", labelEn: "Matches", labelAr: "المباريات" },
    { path: "/responsable/notifications", labelFr: "Notifications", labelEn: "Notifications", labelAr: "الإشعارات" },
  ],
  coach: [
    { path: "/coach", labelFr: "Dashboard Coach", labelEn: "Coach Dashboard", labelAr: "لوحة المدرب" },
    { path: "/coach/effectif", labelFr: "Effectif", labelEn: "Squad", labelAr: "الفريق" },
    { path: "/training", labelFr: "Entraînements", labelEn: "Training", labelAr: "التدريبات" },
    { path: "/matches", labelFr: "Matchs", labelEn: "Matches", labelAr: "المباريات" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  scout: [
    { path: "/scout", labelFr: "Dashboard Scout", labelEn: "Scout Dashboard", labelAr: "لوحة الكشاف" },
    { path: "/scout/search", labelFr: "Recherche", labelEn: "Search", labelAr: "البحث" },
    { path: "/scout/watchlist", labelFr: "Watchlist", labelEn: "Watchlist", labelAr: "قائمة المراقبة" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  medical: [
    { path: "/medical", labelFr: "Dashboard Médical", labelEn: "Medical Dashboard", labelAr: "لوحة طبية" },
    { path: "/medical/rendez-vous", labelFr: "Rendez-vous", labelEn: "Appointments", labelAr: "المواعيد" },
    { path: "/medical/blessures", labelFr: "Blessures", labelEn: "Injuries", labelAr: "الإصابات" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  finance: [
    { path: "/comptabilite", labelFr: "Comptabilité", labelEn: "Accounting", labelAr: "المحاسبة" },
    { path: "/finance/contrats", labelFr: "Contrats", labelEn: "Contracts", labelAr: "العقود" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  superadmin: [
    { path: "/superadmin/dashboard", labelFr: "Dashboard", labelEn: "Dashboard", labelAr: "لوحة التحكم" },
    { path: "/superadmin/clubs", labelFr: "Clubs", labelEn: "Clubs", labelAr: "الأندية" },
    { path: "/superadmin/users", labelFr: "Utilisateurs", labelEn: "Users", labelAr: "المستخدمون" },
  ],
  adminclub: [
    { path: "/club", labelFr: "Dashboard Club", labelEn: "Club Dashboard", labelAr: "لوحة النادي" },
    { path: "/club/joueurs", labelFr: "Joueurs", labelEn: "Players", labelAr: "اللاعبون" },
    { path: "/club/calendrier", labelFr: "Calendrier", labelEn: "Calendar", labelAr: "التقويم" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  preparateur: [
    { path: "/preparateur", labelFr: "Dashboard", labelEn: "Dashboard", labelAr: "لوحة التحكم" },
    { path: "/preparateur/calendrier", labelFr: "Calendrier", labelEn: "Calendar", labelAr: "التقويم" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  analyste: [
    { path: "/analyste", labelFr: "Dashboard Analyste", labelEn: "Analyst Dashboard", labelAr: "لوحة المحلل" },
    { path: "/analyste/tactique", labelFr: "Tactique", labelEn: "Tactics", labelAr: "التكتيك" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  recruteur: [
    { path: "/recruteur", labelFr: "Dashboard Recruteur", labelEn: "Recruiter Dashboard", labelAr: "لوحة المُوظّف" },
    { path: "/recruteur/pipeline", labelFr: "Pipeline", labelEn: "Pipeline", labelAr: "خط الأنابيب" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
  joueur: [
    { path: "/joueurs", labelFr: "Mon Dashboard", labelEn: "My Dashboard", labelAr: "لوحتي" },
    { path: "/joueurs/planning", labelFr: "Mon Planning", labelEn: "My Schedule", labelAr: "جدولي" },
    { path: "/joueurs/medical", labelFr: "Suivi Médical", labelEn: "Medical", labelAr: "الطبي" },
    { path: "/messages", labelFr: "Messages", labelEn: "Messages", labelAr: "الرسائل" },
  ],
};

export function getLandingPage(role: Role, landingPages: Record<string, string>): string {
  const custom = landingPages[role];
  const options = LANDING_OPTIONS_BY_ROLE[role] ?? [];
  if (custom && options.some((o) => o.path === custom)) return custom;
  return DEFAULT_LANDING_BY_ROLE[role] ?? "/dashboard";
}

export function landingLabel(option: LandingOption, locale: "fr" | "en" | "ar") {
  if (locale === "en") return option.labelEn;
  if (locale === "ar") return option.labelAr;
  return option.labelFr;
}
