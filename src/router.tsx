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
import { FinancePage } from "./pages/FinancePage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { OdinAiPage } from "./pages/OdinAiPage";
import { MessagesPage } from "./pages/MessagesPage";
import { CoachPage } from "./pages/CoachPage";
import { ScoutDashboard } from "./pages/ScoutDashboard";
import { PlayerProfile } from "./pages/PlayerProfile";
import { RequireRole } from "./components/auth/RequireRole";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<RequireRole roles={["responsable"]}><Dashboard /></RequireRole>} />
        <Route path="/players" element={<RequireRole roles={["responsable"]}><PlayersPage /></RequireRole>} />
        <Route path="/players/:name" element={<RequireRole roles={["responsable","coach"]}><PlayerProfile /></RequireRole>} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/performance" element={<RequireRole roles={["coach"]}><PerformancePage /></RequireRole>} />
        <Route path="/recruitment" element={<RequireRole roles={["coach"]}><RecruitmentRequestsPage /></RequireRole>} />
        <Route path="/coach" element={<RequireRole roles={["coach"]}><CoachPage /></RequireRole>} />
        <Route path="/scouting" element={<RequireRole roles={["coach", "scout"]}><ScoutingPage /></RequireRole>} />
        <Route path="/scout" element={<RequireRole roles={["scout"]}><ScoutDashboard /></RequireRole>} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/medical" element={<MedicalPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/reports" element={<RequireRole roles={["coach", "responsable"]}><ReportsPage /></RequireRole>} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/odin-ai" element={<OdinAiPage />} />
        <Route path="/administration/documents" element={<DocumentsPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
