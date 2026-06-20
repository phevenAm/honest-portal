import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import OnboardingModal from "../components/Onboarding/OnboardingModal";
import Footer from "../components/shared/Footer/Footer";
import Navbar from "../components/shared/Navbar/Navbar";
import ProtectedRoute from "../components/shared/ProtectedRoute/ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import AdminClientsPage from "../pages/admin/AdminClientsPage/AdminClientsPage";
import AdminDashboard from "../pages/admin/AdminDashboard/AdminDashboard";
import AdminQuestionnairesPage from "../pages/admin/AdminQuestionnairesPage/AdminQuestionnairesPage";
import AdminResourcesPage from "../pages/admin/AdminResourcesPage/AdminResourcesPage";
import CheckInPage from "../pages/client/CheckInPage/CheckInPage";
import ClientDashboard from "../pages/client/ClientDashboard/ClientDashboard";
import LoginPage from "../pages/client/LoginPage/LoginPage";
import ResourcesPage from "../pages/client/ResourcesPage/ResourcesPage";
import SettingsPage from "../pages/common/SettingsPage/SettingsPage";
import SignUpPage from "../pages/common/SignUpPage/SignUpPage";
import { useAppSelector } from "../store/hooks";
import { selectThemeMode } from "../store/slices/themeSlice";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector(selectThemeMode);
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

function AppLayout() {
  const location = useLocation();
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.focus({ preventScroll: true });
  }, [location]);

  return (
    <>
      <div ref={topRef} tabIndex={-1} aria-hidden="true" />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}

function OnboardingGate() {
  const { userProfile, isAuthenticated, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && userProfile !== null && !userProfile.onboarding_completed) {
      setShow(true);
    }
  }, [loading, isAuthenticated, userProfile]);

  if (!show) return null;
  return <OnboardingModal onComplete={() => setShow(false)} />;
}

export default function AppRoutes() {
  return (
    <ThemeWrapper>
      <BrowserRouter>
        <OnboardingGate />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute requiredRole="client">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/check-in" element={<CheckInPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute requiredRole="admin">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/clients" element={<AdminClientsPage />} />
            <Route path="/admin/questionnaires" element={<AdminQuestionnairesPage />} />
            <Route path="/admin/resources" element={<AdminResourcesPage />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<div>CAUGHT: {window.location.pathname}</div>} />
          {/* // ! create action page not do page. todo} */}
        </Routes>
      </BrowserRouter>
    </ThemeWrapper>
  );
}
