import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { Dashboard } from "./components/dashboard/Dashboard";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { PlayersPage } from "./pages/PlayersPage";
import { TeamsPage } from "./pages/TeamsPage";
import { TrainingPage } from "./pages/TrainingPage";
import { MatchesPage } from "./pages/MatchesPage";
import { MedicalPage } from "./pages/MedicalPage";
import { FinancePage } from "./pages/FinancePage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { MessagesPage } from "./pages/MessagesPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/teams" element={<TeamsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/medical" element={<MedicalPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
