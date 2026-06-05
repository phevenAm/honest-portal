import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Spinner from "../../../ui-components/Spinner/Spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: "admin" | "client";
}

export default function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to resolve before making routing decisions
  if (loading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === "admin" && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === "client" && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
