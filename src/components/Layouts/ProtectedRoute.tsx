import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null; // hoặc skeleton

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
