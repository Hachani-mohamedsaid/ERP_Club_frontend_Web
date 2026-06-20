import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) {
    const fallback: Record<string, string> = {
      joueur: "/joueurs", medical: "/medical", coach: "/coach", scout: "/scout",
      finance: "/comptabilite", superadmin: "/superadmin/dashboard", adminclub: "/club", responsable: "/dashboard",
    };
    return <Navigate to={fallback[user.role] ?? "/login"} replace />;
  }

  return children;
}
