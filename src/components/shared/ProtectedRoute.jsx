// ============================================================
// PROTECTED ROUTE
//
// Wraps any route that requires authentication.
// If not logged in → redirect to /login
// If logged in but wrong role → redirect to correct dashboard
//
// Usage in App.jsx:
//   <ProtectedRoute requiredRole="admin">
//     <AdminPage />
//   </ProtectedRoute>
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsAdmin } from '../../store/slices/authSlice';

export default function ProtectedRoute({ children, requiredRole }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);
  const location        = useLocation();

  // Not logged in at all → send to login, preserving where they were trying to go
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in as client but trying to access admin route
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Logged in as admin but trying to access client route
  if (requiredRole === 'client' && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
