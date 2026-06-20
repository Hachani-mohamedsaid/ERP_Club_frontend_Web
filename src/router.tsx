import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./components/dashboard/Dashboard";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { PlayersPage } from "./pages/PlayersPage";
import { TeamsPage } from "./pages/TeamsPage";
import { TrainingPage } from "./pages/TrainingPage";
import { MatchesPage } from "./pages/MatchesPage";
import { PerformancePage } from "./pages/PerformancePage";
import { RecruitmentRequestsPage } from "./pages/RecruitmentRequestsPage";
import { ScoutingPage } from "./pages/ScoutingPage";
import { ContractsPage } from "./pages/ContractsPage";
import { MedicalPage } from "./pages/MedicalPage";
import { MedicalDossiersPage } from "./pages/medical/MedicalDossiersPage";
import { MedicalBlessuresPage } from "./pages/medical/MedicalBlessuresPage";
import { MedicalReeducationPage } from "./pages/medical/MedicalReeducationPage";
import { MedicalRendezVousPage } from "./pages/medical/MedicalRendezVousPage";
import { MedicalDocumentsPage } from "./pages/medical/MedicalDocumentsPage";
import { MedicalRapportsPage } from "./pages/medical/MedicalRapportsPage";
import { MedicalRiskPage } from "./pages/medical/MedicalRiskPage";
import { MedicalEffectifPage } from "./pages/medical/MedicalEffectifPage";
import { MedicalAIPage } from "./pages/medical/MedicalAIPage";
import { FinancePage } from "./pages/FinancePage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { OdinAiPage } from "./pages/OdinAiPage";
import { AIAssistantPage } from "./pages/AIAssistantPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { CoachPage } from "./pages/CoachPage";
import { ScoutDashboard } from "./pages/ScoutDashboard";
import { ScoutSearchPage } from "./pages/ScoutSearchPage";
import { ScoutProspectPage } from "./pages/ScoutProspectPage";
import { ScoutReportPage } from "./pages/ScoutReportPage";
import { ScoutFavoritesPage } from "./pages/ScoutFavoritesPage";
import { ScoutComparisonPage } from "./pages/ScoutComparisonPage";
import { ScoutRecruitmentPage } from "./pages/ScoutRecruitmentPage";
import { PlayerProfilePage } from "./pages/PlayerProfilePage";
import { FinanceComptabilite } from "./pages/FinanceComptabilite";
import { ContratsFinance } from "./pages/ContratsFinance";
import { SalairesFinance } from "./pages/SalairesFinance";
import { TransfertsFinance } from "./pages/TransfertsFinance";
import { SponsorsFinance } from "./pages/SponsorsFinance";
import { GestionFinanciereFinance } from "./pages/GestionFinanciereFinance";
import { RapportsFinance } from "./pages/RapportsFinance";
import { FinanceAIPage } from "./pages/FinanceAIPage";
import { TresorerieFinance } from "./pages/TresorerieFinance";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { SuperAdminClubs } from "./pages/SuperAdminClubs";
import { SuperAdminClubDetails } from "./pages/SuperAdminClubDetails";
import { SuperAdminUsers } from "./pages/SuperAdminUsers";
import { SuperAdminUserDetails } from "./pages/SuperAdminUserDetails";
import { SuperAdminSubscriptions } from "./pages/SuperAdminSubscriptions";
import { SuperAdminAnalytics } from "./pages/SuperAdminAnalytics";
import { SuperAdminRevenueAnalytics } from "./pages/SuperAdminRevenueAnalytics";
import { SuperAdminMonitoring } from "./pages/SuperAdminMonitoring";
import { SuperAdminAuditLogs } from "./pages/SuperAdminAuditLogs";
import { SuperAdminSupport } from "./pages/SuperAdminSupport";
import { SuperAdminSecurity } from "./pages/SuperAdminSecurity";
import { SuperAdminPayments } from "./pages/SuperAdminPayments";
import { SuperAdminNotifications } from "./pages/SuperAdminNotifications";
import { SuperAdminAPIManagement } from "./pages/SuperAdminAPIManagement";
import { SuperAdminBI } from "./pages/SuperAdminBI";
import { SuperAdminSearch } from "./pages/SuperAdminSearch";
import { SuperAdminSettings } from "./pages/SuperAdminSettings";
import { SuperAdminIA } from "./pages/SuperAdminIA";
import { JoueurDashboard } from "./pages/joueur/JoueurDashboard";
import { JoueurListPage } from "./pages/joueur/JoueurListPage";
import { JoueurComparePage } from "./pages/joueur/JoueurComparePage";
import { JoueurFormationPage } from "./pages/joueur/JoueurFormationPage";
import { JoueurTransfersPage } from "./pages/joueur/JoueurTransfersPage";
import { JoueurDocumentsPage } from "./pages/joueur/JoueurDocumentsPage";
import { JoueurAIPage } from "./pages/joueur/JoueurAIPage";
import { JoueurTrainingPage } from "./pages/joueur/JoueurTrainingPage";
import { JoueurMatchAnalysisPage } from "./pages/joueur/JoueurMatchAnalysisPage";
import { JoueurAwardsPage } from "./pages/joueur/JoueurAwardsPage";
import { JoueurChemistryPage } from "./pages/joueur/JoueurChemistryPage";
import { JoueurPerformancesPage } from "./pages/joueur/JoueurPerformancesPage";
import { JoueurMedicalPage } from "./pages/joueur/JoueurMedicalPage";
import { JoueurPlanningPage } from "./pages/joueur/JoueurPlanningPage";
import { JoueurMonProfilPage } from "./pages/joueur/JoueurMonProfilPage";
import { JoueurMessagesPage } from "./pages/joueur/JoueurMessagesPage";
import { ClubDashboard } from "./pages/club/ClubDashboard";
import { ClubJoueursPage } from "./pages/club/ClubJoueursPage";
import { ClubStaffPage } from "./pages/club/ClubStaffPage";
import { ClubFinancesPage } from "./pages/club/ClubFinancesPage";
import { ClubContratsPage } from "./pages/club/ClubContratsPage";
import { ClubCalendrierPage } from "./pages/club/ClubCalendrierPage";
import { ClubSantePage } from "./pages/club/ClubSantePage";
import { ClubInfrastructuresPage } from "./pages/club/ClubInfrastructuresPage";
import { ClubAnalyticsPage } from "./pages/club/ClubAnalyticsPage";
import { ClubAIPage } from "./pages/club/ClubAIPage";
import { ClubParametresPage } from "./pages/club/ClubParametresPage";
import { RequireRole } from "./components/auth/RequireRole";
import { RoleBasedRedirect } from "./components/auth/RoleBasedRedirect";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<RequireRole roles={["responsable"]}><Dashboard /></RequireRole>} />
        <Route path="/players" element={<RequireRole roles={["responsable"]}><PlayersPage /></RequireRole>} />
        <Route path="/players/:name" element={<RequireRole roles={["responsable","coach"]}><PlayerProfilePage /></RequireRole>} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/performance" element={<RequireRole roles={["coach"]}><PerformancePage /></RequireRole>} />
        <Route path="/recruitment" element={<RequireRole roles={["coach"]}><RecruitmentRequestsPage /></RequireRole>} />
        <Route path="/coach" element={<RequireRole roles={["coach"]}><CoachPage /></RequireRole>} />
        <Route path="/scouting" element={<RequireRole roles={["coach", "scout"]}><ScoutingPage /></RequireRole>} />
        <Route path="/scout" element={<RequireRole roles={["scout"]}><ScoutDashboard /></RequireRole>} />
        <Route path="/scout/search" element={<RequireRole roles={["scout"]}><ScoutSearchPage /></RequireRole>} />
        <Route path="/scout/prospect" element={<RequireRole roles={["scout"]}><ScoutProspectPage /></RequireRole>} />
        <Route path="/scout/report" element={<RequireRole roles={["scout"]}><ScoutReportPage /></RequireRole>} />
        <Route path="/scout/favorites" element={<RequireRole roles={["scout"]}><ScoutFavoritesPage /></RequireRole>} />
        <Route path="/scout/comparison" element={<RequireRole roles={["scout"]}><ScoutComparisonPage /></RequireRole>} />
        <Route path="/scout/recruitment" element={<RequireRole roles={["scout"]}><ScoutRecruitmentPage /></RequireRole>} />
        <Route path="/player/:id" element={<RequireRole roles={["scout", "coach"]}><PlayerProfilePage /></RequireRole>} />
        <Route path="/ai-scout" element={<RequireRole roles={["scout", "coach"]}><AIAssistantPage /></RequireRole>} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/medical" element={<RequireRole roles={["medical"]}><MedicalPage /></RequireRole>} />
        <Route path="/medical/dossiers" element={<RequireRole roles={["medical"]}><MedicalDossiersPage /></RequireRole>} />
        <Route path="/medical/blessures" element={<RequireRole roles={["medical"]}><MedicalBlessuresPage /></RequireRole>} />
        <Route path="/medical/reeducation" element={<RequireRole roles={["medical"]}><MedicalReeducationPage /></RequireRole>} />
        <Route path="/medical/rendez-vous" element={<RequireRole roles={["medical"]}><MedicalRendezVousPage /></RequireRole>} />
        <Route path="/medical/documents" element={<RequireRole roles={["medical"]}><MedicalDocumentsPage /></RequireRole>} />
        <Route path="/medical/rapports" element={<RequireRole roles={["medical"]}><MedicalRapportsPage /></RequireRole>} />
        <Route path="/medical/risque" element={<RequireRole roles={["medical"]}><MedicalRiskPage /></RequireRole>} />
        <Route path="/medical/effectif" element={<RequireRole roles={["medical"]}><MedicalEffectifPage /></RequireRole>} />
        <Route path="/medical/ia" element={<RequireRole roles={["medical"]}><MedicalAIPage /></RequireRole>} />
        <Route path="/joueurs" element={<RequireRole roles={["joueur"]}><JoueurDashboard /></RequireRole>} />
        <Route path="/joueurs/performances" element={<RequireRole roles={["joueur"]}><JoueurPerformancesPage /></RequireRole>} />
        <Route path="/joueurs/medical" element={<RequireRole roles={["joueur"]}><JoueurMedicalPage /></RequireRole>} />
        <Route path="/joueurs/planning" element={<RequireRole roles={["joueur"]}><JoueurPlanningPage /></RequireRole>} />
        <Route path="/joueurs/ia" element={<RequireRole roles={["joueur"]}><JoueurAIPage /></RequireRole>} />
        <Route path="/joueurs/profil" element={<RequireRole roles={["joueur"]}><JoueurMonProfilPage /></RequireRole>} />
        <Route path="/joueurs/liste" element={<RequireRole roles={["joueur"]}><JoueurListPage /></RequireRole>} />
        <Route path="/joueurs/comparer" element={<RequireRole roles={["joueur"]}><JoueurComparePage /></RequireRole>} />
        <Route path="/joueurs/formation" element={<RequireRole roles={["joueur"]}><JoueurFormationPage /></RequireRole>} />
        <Route path="/joueurs/transferts" element={<RequireRole roles={["joueur"]}><JoueurTransfersPage /></RequireRole>} />
        <Route path="/joueurs/documents" element={<RequireRole roles={["joueur"]}><JoueurDocumentsPage /></RequireRole>} />
        <Route path="/joueurs/entrainement" element={<RequireRole roles={["joueur"]}><JoueurTrainingPage /></RequireRole>} />
        <Route path="/joueurs/analyse" element={<RequireRole roles={["joueur"]}><JoueurMatchAnalysisPage /></RequireRole>} />
        <Route path="/joueurs/recompenses" element={<RequireRole roles={["joueur"]}><JoueurAwardsPage /></RequireRole>} />
        <Route path="/joueurs/chimie" element={<RequireRole roles={["joueur"]}><JoueurChemistryPage /></RequireRole>} />
        <Route path="/joueurs/messages" element={<RequireRole roles={["joueur"]}><JoueurMessagesPage /></RequireRole>} />
        <Route path="/club" element={<RequireRole roles={["adminclub"]}><ClubDashboard /></RequireRole>} />
        <Route path="/club/joueurs" element={<RequireRole roles={["adminclub"]}><ClubJoueursPage /></RequireRole>} />
        <Route path="/club/staff" element={<RequireRole roles={["adminclub"]}><ClubStaffPage /></RequireRole>} />
        <Route path="/club/finances" element={<RequireRole roles={["adminclub"]}><ClubFinancesPage /></RequireRole>} />
        <Route path="/club/contrats" element={<RequireRole roles={["adminclub"]}><ClubContratsPage /></RequireRole>} />
        <Route path="/club/calendrier" element={<RequireRole roles={["adminclub"]}><ClubCalendrierPage /></RequireRole>} />
        <Route path="/club/sante" element={<RequireRole roles={["adminclub"]}><ClubSantePage /></RequireRole>} />
        <Route path="/club/infrastructures" element={<RequireRole roles={["adminclub"]}><ClubInfrastructuresPage /></RequireRole>} />
        <Route path="/club/analytics" element={<RequireRole roles={["adminclub"]}><ClubAnalyticsPage /></RequireRole>} />
        <Route path="/club/ia" element={<RequireRole roles={["adminclub"]}><ClubAIPage /></RequireRole>} />
        <Route path="/club/parametres" element={<RequireRole roles={["adminclub"]}><ClubParametresPage /></RequireRole>} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/comptabilite" element={<RequireRole roles={["finance"]}><FinanceComptabilite /></RequireRole>} />
        <Route path="/finance/dashboard" element={<RequireRole roles={["finance"]}><FinanceComptabilite /></RequireRole>} />
        <Route path="/finance/contrats" element={<RequireRole roles={["finance"]}><ContratsFinance /></RequireRole>} />
        <Route path="/finance/salaires" element={<RequireRole roles={["finance"]}><SalairesFinance /></RequireRole>} />
        <Route path="/finance/transferts" element={<RequireRole roles={["finance"]}><TransfertsFinance /></RequireRole>} />
        <Route path="/finance/sponsors" element={<RequireRole roles={["finance"]}><SponsorsFinance /></RequireRole>} />
        <Route path="/finance/factures" element={<RequireRole roles={["finance"]}><GestionFinanciereFinance /></RequireRole>} />
        <Route path="/finance/tresorerie" element={<RequireRole roles={["finance"]}><TresorerieFinance /></RequireRole>} />
        <Route path="/finance/rapports" element={<RequireRole roles={["finance"]}><RapportsFinance /></RequireRole>} />
        <Route path="/finance/ia" element={<RequireRole roles={["finance"]}><FinanceAIPage /></RequireRole>} />
        <Route path="/superadmin" element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="/superadmin/dashboard" element={<RequireRole roles={["superadmin"]}><SuperAdminDashboard /></RequireRole>} />
        <Route path="/superadmin/clubs" element={<RequireRole roles={["superadmin"]}><SuperAdminClubs /></RequireRole>} />
        <Route path="/superadmin/clubs/:id" element={<RequireRole roles={["superadmin"]}><SuperAdminClubDetails /></RequireRole>} />
        <Route path="/superadmin/users" element={<RequireRole roles={["superadmin"]}><SuperAdminUsers /></RequireRole>} />
        <Route path="/superadmin/users/:id" element={<RequireRole roles={["superadmin"]}><SuperAdminUserDetails /></RequireRole>} />
        <Route path="/superadmin/notifications" element={<RequireRole roles={["superadmin"]}><SuperAdminNotifications /></RequireRole>} />
        <Route path="/superadmin/payments" element={<RequireRole roles={["superadmin"]}><SuperAdminPayments /></RequireRole>} />
        <Route path="/superadmin/api-management" element={<RequireRole roles={["superadmin"]}><SuperAdminAPIManagement /></RequireRole>} />
        <Route path="/superadmin/bi" element={<RequireRole roles={["superadmin"]}><SuperAdminBI /></RequireRole>} />
        <Route path="/superadmin/revenue-analytics" element={<RequireRole roles={["superadmin"]}><SuperAdminRevenueAnalytics /></RequireRole>} />
        <Route path="/superadmin/search" element={<RequireRole roles={["superadmin"]}><SuperAdminSearch /></RequireRole>} />
        <Route path="/superadmin/subscriptions" element={<RequireRole roles={["superadmin"]}><SuperAdminSubscriptions /></RequireRole>} />
        <Route path="/superadmin/analytics" element={<RequireRole roles={["superadmin"]}><SuperAdminAnalytics /></RequireRole>} />
        <Route path="/superadmin/monitoring" element={<RequireRole roles={["superadmin"]}><SuperAdminMonitoring /></RequireRole>} />
        <Route path="/superadmin/audit-logs" element={<RequireRole roles={["superadmin"]}><SuperAdminAuditLogs /></RequireRole>} />
        <Route path="/superadmin/support" element={<RequireRole roles={["superadmin"]}><SuperAdminSupport /></RequireRole>} />
        <Route path="/superadmin/security" element={<RequireRole roles={["superadmin"]}><SuperAdminSecurity /></RequireRole>} />
        <Route path="/superadmin/settings" element={<RequireRole roles={["superadmin"]}><SuperAdminSettings /></RequireRole>} />
        <Route path="/superadmin/ia" element={<RequireRole roles={["superadmin"]}><SuperAdminIA /></RequireRole>} />
        <Route path="/reports" element={<RequireRole roles={["coach", "responsable"]}><ReportsPage /></RequireRole>} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/odin-ai" element={<OdinAiPage />} />
        <Route path="/administration/documents" element={<DocumentsPage />} />
      </Route>

      <Route path="/" element={<RoleBasedRedirect />} />
    </Routes>
  );
}
