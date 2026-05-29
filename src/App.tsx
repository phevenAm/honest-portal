import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store } from "./store/index";
import { selectThemeMode } from "./store/slices/themeSlice";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/client/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ClientDashboard from "./pages/client/ClientDashboard/ClientDashboard";
import CheckInPage from "./pages/client/CheckInPage/CheckInPage";
import ResourcesPage from "./pages/client/ResourcesPage/ResourcesPage";
import AdminDashboard from "./pages/admin/AdminDashboard/AdminDashboard";
import AdminClientsPage from "./pages/admin/AdminClientsPage/AdminClientsPage";
import AdminQuestionnairesPage from "./pages/admin/AdminQuestionnairesPage/AdminQuestionnairesPage";
import AdminResourcesPage from "./pages/admin/AdminResourcesPage/AdminResourcesPage";
import Navbar from "./components/shared/Navbar/Navbar";
import ProtectedRoute from "./components/shared/ProtectedRoute/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const mode = useSelector(selectThemeMode);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);
  return <>{children}</>;
}

function RootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
    </>
  );
}

function AppRoutes() {
  return (
    <ThemeWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <ClientDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/check-in"
            element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <CheckInPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute requiredRole="client">
                <AppLayout>
                  <ResourcesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <AdminDashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <AdminClientsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questionnaires"
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <AdminQuestionnairesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout>
                  <AdminResourcesPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<RootRedirect />} />
          <Route
            path="*"
            element={<div>CAUGHT: {window.location.pathname}</div>}
          />
        </Routes>
      </BrowserRouter>
    </ThemeWrapper>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Provider>
  );
}
