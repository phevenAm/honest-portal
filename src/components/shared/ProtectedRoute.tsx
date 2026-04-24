import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../ui-components/Spinner/Spinner';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isAdmin, loading, profile } = useAuth();
  const location = useLocation();

  // Wait for session check to finish
  if (loading) return <Spinner />;

  // Not logged in → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for profile to load before making role decisions
  // (profile loads async after auth, so isAdmin may briefly be false for admins)
  if (!profile) return <Spinner />;

  // Wrong role redirects
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  if (requiredRole === 'client' && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}