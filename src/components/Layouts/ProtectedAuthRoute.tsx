import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedAuthRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  if (isLoggedIn) {
    return <Navigate to="/view-profile" replace />;
  }

  return <>{children}</>;
}
