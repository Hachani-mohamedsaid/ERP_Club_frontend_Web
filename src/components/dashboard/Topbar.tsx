import { ChevronDown, Search, Bell, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useAuth } from "../../contexts/AuthContext";
import { ChatDrawer } from "../medical/ChatDrawer";
import { MedicalNotificationsDropdown } from "../medical/MedicalNotificationsDropdown";
import { JoueurNotificationsDropdown } from "../player/JoueurNotificationsDropdown";
import { JoueurChatDrawer } from "../player/JoueurChatDrawer";
import { getPlayerById } from "../../data/joueurMockData";

const JOUEUR_STATIC = ["performances", "medical", "planning", "profil", "ia", "messages"];

const TITLE_BY_PATH: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard Responsable Club", subtitle: "Vue exécutive du club" },
  "/players": { title: "Joueurs", subtitle: "" },
  "/teams": { title: "Équipes", subtitle: "Effectifs, staff et classement" },
  "/training": { title: "Entraînements", subtitle: "Présence et organisation des séances" },
  "/matches": { title: "Matchs", subtitle: "Composition, analyse et MVP" },
  "/performance": { title: "Performances", subtitle: "Indicateurs équipe & joueurs" },
  "/recruitment": { title: "Recrutement", subtitle: "Demandes et priorités pour le staff" },
  "/scouting": { title: "Scouting", subtitle: "Prospects et demandes de recrutement" },
  "/scout": { title: "Scout Dashboard", subtitle: "Tableau de bord scout avec analyse de prospects" },
  "/coach": { title: "Entraîneur", subtitle: "Tableau de bord de l'entraîneur" },
  "/contracts": { title: "Contrats", subtitle: "Contrats, alertes et renouvellement" },
  "/medical": { title: "Dashboard Médical", subtitle: "Vue synthétique — blessures, récupération et risques" },
  "/medical/dossiers": { title: "Dossiers Médicaux", subtitle: "Fiches joueurs complètes — FIFA Medical Card" },
  "/medical/blessures": { title: "Blessures", subtitle: "Suivi actif des blessures et gravité" },
  "/medical/reeducation": { title: "Rééducation", subtitle: "Board Kanban — phases de récupération" },
  "/medical/rendez-vous": { title: "Rendez-vous", subtitle: "Calendrier médical — consultations, IRM, rééducation" },
  "/medical/documents": { title: "Documents Médicaux", subtitle: "IRM, radios, certificats et analyses" },
  "/medical/rapports": { title: "Rapports Médicaux", subtitle: "Export PDF/Excel — rapports mensuels et joueurs" },
  "/medical/risque": { title: "Joueurs à Risque", subtitle: "Prédiction IA — heatmap et risk score" },
  "/medical/effectif": { title: "Effectif Disponible", subtitle: "Statut disponibilité pour le coach" },
  "/medical/ia": { title: "Medical AI", subtitle: "Assistant médical intelligent" },
  "/joueurs": { title: "Mon Dashboard", subtitle: "Vue personnelle — Ahmed Ben Salah" },
  "/joueurs/performances": { title: "Mes Performances", subtitle: "Radar FIFA, évolution et comparaison équipe" },
  "/joueurs/medical": { title: "Mon Suivi Médical", subtitle: "Statut, blessures et rendez-vous" },
  "/joueurs/planning": { title: "Mon Planning", subtitle: "Matchs, entraînements et repos" },
  "/joueurs/ia": { title: "AI Coach", subtitle: "Assistant personnel intelligent" },
  "/joueurs/profil": { title: "Mon Profil", subtitle: "Informations, contrat et documents" },
  "/club": { title: "Dashboard Club", subtitle: "Bonjour Mohamed — FC Carthage, Saison 2026" },
  "/club/joueurs": { title: "Gestion Joueurs", subtitle: "Effectif, statuts et comparaisons" },
  "/club/staff": { title: "Staff Technique", subtitle: "Coach, médecin, scout et préparateurs" },
  "/club/finances": { title: "Finances Club", subtitle: "Budget, dépenses et revenus" },
  "/club/contrats": { title: "Contrats", subtitle: "Alertes et renouvellements" },
  "/club/calendrier": { title: "Calendrier Club", subtitle: "Matchs, entraînements et réunions" },
  "/club/sante": { title: "Santé Club", subtitle: "Blessures, risques et disponibilité" },
  "/club/infrastructures": { title: "Infrastructures", subtitle: "Terrains, salles et centre médical" },
  "/club/analytics": { title: "Analytics Club", subtitle: "Performance, buteurs et valeur marchande" },
  "/club/ia": { title: "Assistant IA Club", subtitle: "Analyse intelligente du club" },
  "/club/parametres": { title: "Paramètres Club", subtitle: "Général, sécurité et notifications" },
  "/finance": { title: "Finance", subtitle: "Budget, revenus et dépenses" },
  "/reports": { title: "Rapports", subtitle: "Rapports sportifs, financiers et recrutement" },
  "/messages": { title: "Messages", subtitle: "Communication interne du club" },
  "/odin-ai": { title: "ODIN AI", subtitle: "Analyses intelligentes et prévisions" },
  "/administration/documents": { title: "Administration documentaire", subtitle: "Archivage et pièces de support" },
  "/superadmin/dashboard": { title: "Super Admin Dashboard", subtitle: "Vue globale de la plateforme SaaS" },
  "/superadmin/clubs": { title: "Clubs", subtitle: "Gestion des clubs et abonnements" },
  "/superadmin/users": { title: "Utilisateurs", subtitle: "Gestion des comptes et permissions" },
  "/superadmin/notifications": { title: "Notifications", subtitle: "Centre des alertes et événements" },
  "/superadmin/payments": { title: "Paiements", subtitle: "Suivi des factures et transactions" },
  "/superadmin/api-management": { title: "API Management", subtitle: "Clés, quotas et webhooks" },
  "/superadmin/bi": { title: "Business Intelligence", subtitle: "Prévisions et recommandations IA" },
  "/superadmin/revenue-analytics": { title: "Revenue Analytics", subtitle: "MRR, ARR et churn" },
  "/superadmin/search": { title: "Global Search", subtitle: "Spotlight de recherche interne" },
  "/superadmin/subscriptions": { title: "Abonnements", subtitle: "Revue des plans SaaS" },
  "/superadmin/analytics": { title: "Analytics", subtitle: "Tendances SaaS et performance" },
  "/superadmin/monitoring": { title: "Monitoring", subtitle: "Santé système et disponibilité" },
  "/superadmin/audit-logs": { title: "Audit Logs", subtitle: "Historique des opérations critiques" },
  "/superadmin/support": { title: "Support", subtitle: "Tickets et assistance" },
  "/superadmin/security": { title: "Sécurité", subtitle: "Risques et contrôles d'accès" },
  "/superadmin/settings": { title: "Paramètres", subtitle: "Configuration de la plateforme" },
  "/superadmin/ia": { title: "IA Admin", subtitle: "Supervision des services IA" },
};

export function Topbar() {
  const location = useLocation();
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const isMedical = user?.role === "medical";
  const isJoueur = user?.role === "joueur";

  const profileMatch = location.pathname.match(/^\/joueurs\/([^/]+)$/);
  const profileId = profileMatch?.[1];
  const isProfilePage = profileId && !JOUEUR_STATIC.includes(profileId);
  const profilePlayer = isProfilePage && profileId ? getPlayerById(profileId) : null;
  const currentPlayer = isJoueur ? getPlayerById(user?.playerId ?? "1") : null;

  const joueurTitles: Record<string, { title: string; subtitle: string }> = {
    "/joueurs": { title: "Mon Dashboard", subtitle: `Vue personnelle — ${currentPlayer?.name ?? "Joueur"}` },
    "/joueurs/performances": { title: "Mes Performances", subtitle: "Radar FIFA, évolution et comparaison équipe" },
    "/joueurs/medical": { title: "Mon Suivi Médical", subtitle: "Statut, blessures et rendez-vous" },
    "/joueurs/planning": { title: "Mon Planning", subtitle: "Matchs, entraînements et repos" },
    "/joueurs/ia": { title: "AI Coach", subtitle: "Assistant personnel intelligent" },
    "/joueurs/profil": { title: "Mon Profil", subtitle: currentPlayer?.name ?? "Profil joueur" },
    "/joueurs/messages": { title: "Messages", subtitle: "Coach, Médecin, Direction" },
  };

  const current = (isProfilePage && profilePlayer
    ? { title: profilePlayer.name, subtitle: `${profilePlayer.position} • OVR ${profilePlayer.ovr} • ${profilePlayer.marketValue}` }
    : isJoueur && joueurTitles[location.pathname]
      ? joueurTitles[location.pathname]
      : TITLE_BY_PATH[location.pathname])
    ?? TITLE_BY_PATH["/dashboard"];

  return (
    <header className="flex items-center justify-between gap-4 px-8 py-5">
      {location.pathname !== "/players" && (
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {current.title}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {current.subtitle}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isJoueur && (
          <div className="relative hidden sm:block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Rechercher un joueur, un contrat, un prospect..."
              className="glass-input w-64 py-2 pl-9 pr-3 text-sm"
            />
          </div>
        )}

        {isMedical ? (
          <MedicalNotificationsDropdown />
        ) : isJoueur ? (
          <JoueurNotificationsDropdown />
        ) : (
          <button className="glass-input relative flex h-10 w-10 items-center justify-center">
            <Bell size={16} style={{ color: "var(--text-secondary)" }} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          </button>
        )}

        {(isMedical || isJoueur) && (
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="glass-input relative flex h-10 w-10 items-center justify-center"
          >
            <MessageSquare size={16} style={{ color: "var(--text-secondary)" }} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          </button>
        )}

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

      {isMedical && <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />}
      {isJoueur && <JoueurChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />}
    </header>
  );
}
