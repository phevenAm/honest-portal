// ============================================================
// APP.JSX — Root component
//
// Architecture overview:
//   1. Redux Provider wraps everything — makes the store available via useSelector/useDispatch
//   2. React Router (BrowserRouter) handles client-side navigation
//   3. ThemeWrapper reads from Redux to apply the dark/light CSS class
//   4. ProtectedRoute guards private pages
//
// Route structure:
//   /login                → LoginPage (public)
//   /dashboard            → ClientDashboard (client only)
//   /check-in             → CheckInPage (client only)
//   /resources            → ResourcesPage (client only)
//   /admin                → AdminDashboard (admin only)
//   /admin/clients        → AdminClientsPage (admin only)
//   /admin/questionnaires → AdminQuestionnairesPage (admin only)
//   /admin/resources      → AdminResourcesPage (admin only)
// ============================================================

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store } from './store';
import { selectThemeMode } from './store/slices/themeSlice';
import { selectIsAuthenticated, selectIsAdmin } from './store/slices/authSlice';

// Pages
import LoginPage                from './pages/LoginPage';
import ClientDashboard          from './pages/client/ClientDashboard';
import CheckInPage              from './pages/client/CheckInPage';
import ResourcesPage            from './pages/client/ResourcesPage';
import AdminDashboard           from './pages/AdminDashboard';
import AdminClientsPage         from './pages/admin/AdminClientsPage';
import AdminQuestionnairesPage  from './pages/admin/AdminQuestionnairesPage';
import AdminResourcesPage       from './pages/admin/AdminResourcesPage';

// Shared
import Navbar          from './components/shared/Navbar';
import ProtectedRoute  from './components/shared/ProtectedRoute';

// ── Theme wrapper ──────────────────────────────────────────
// Reads theme from Redux and applies it to <html> via className.
// All CSS custom properties in index.css are keyed off .dark class.
function ThemeWrapper({ children }) {
  const mode = useSelector(selectThemeMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  return children;
}

// ── Smart root redirect ────────────────────────────────────
function RootRedirect() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin         = useSelector(selectIsAdmin);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
}

// ── Layout wrapper (adds Navbar) ───────────────────────────
function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content" tabIndex={-1}> {/* Skip-to-main target */}
        {children}
      </main>
    </>
  );
}

// ── Inner app (needs access to Redux) ─────────────────────
function AppRoutes() {
  return (
    <ThemeWrapper>
      <BrowserRouter>
        {/* Skip navigation link — accessibility */}
        <a
          href="#main-content"
          style={{
            position: 'absolute', left: '-9999px', top: 'auto',
            width: 1, height: 1, overflow: 'hidden',
          }}
          onFocus={e => {
            e.target.style.cssText = 'position:fixed;top:16px;left:16px;z-index:9999;padding:12px 20px;background:var(--bg-card);border:2px solid var(--accent);border-radius:var(--r-md);font-weight:600;width:auto;height:auto;overflow:visible;left:16px;';
          }}
          onBlur={e => {
            e.target.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
          }}
        >
          Skip to main content
        </a>

        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Client routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="client">
              <AppLayout><ClientDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/check-in" element={
            <ProtectedRoute requiredRole="client">
              <AppLayout><CheckInPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute requiredRole="client">
              <AppLayout><ResourcesPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/clients" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminClientsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/questionnaires" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminQuestionnairesPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/resources" element={
            <ProtectedRoute requiredRole="admin">
              <AppLayout><AdminResourcesPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Root → smart redirect */}
          <Route path="/" element={<RootRedirect />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeWrapper>
  );
}

// ── Root export ────────────────────────────────────────────
export default function App() {
  return (
    // Provider makes the Redux store available to the entire tree
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}
