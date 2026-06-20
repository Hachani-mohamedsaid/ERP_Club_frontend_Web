import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  // Redirection selon le rôle
  const roleRedirects: Record<string, string> = {
    coach: "/coach",
    scout: "/scout",
    medical: "/medical",
    finance: "/comptabilite",
    superadmin: "/superadmin/dashboard",
    adminclub: "/club",
    joueur: "/joueurs",
    responsable: "/dashboard",
    guest: "/login",
  };

  const destination = roleRedirects[user.role] || "/login";
  return <Navigate to={destination} replace />;
}
