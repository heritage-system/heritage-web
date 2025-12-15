import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allow: string[]; 
}

export default function RoleProtectedRoute({
  children,
  allow,
}: RoleProtectedRouteProps) {
  const { userType, loading } = useAuth();

  if (loading) return null;

  // nếu chưa login thì chặn trước
  if (!userType) return <Navigate to="/login" replace />;

  // kiểm tra quyền
  if (!allow.includes(userType)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
