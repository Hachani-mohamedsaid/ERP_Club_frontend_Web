import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
}
