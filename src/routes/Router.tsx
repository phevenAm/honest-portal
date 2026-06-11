import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import LoginPage from "../pages/client/LoginPage/LoginPage";
import SignUpPage from "../pages/SignUpPage/SignUpPage";
import ClientDashboard from "../pages/client/ClientDashboard/ClientDashboard";
import CheckInPage from "../pages/client/CheckInPage/CheckInPage";
import ResourcesPage from "../pages/client/ResourcesPage/ResourcesPage";
import AdminDashboard from "../pages/admin/AdminDashboard/AdminDashboard";
import AdminClientsPage from "../pages/admin/AdminClientsPage/AdminClientsPage";
import AdminQuestionnairesPage from "../pages/admin/AdminQuestionnairesPage/AdminQuestionnairesPage";
import AdminResourcesPage from "../pages/admin/AdminResourcesPage/AdminResourcesPage";
import ProtectedRoute from "../components/shared/ProtectedRoute/ProtectedRoute";
import Navbar from "../components/shared/Navbar/Navbar";
import Footer from "../components/shared/Footer/Footer";
import { selectThemeMode } from "../store/slices/themeSlice";
import { useAuth } from "../context/AuthContext";
import OnboardingModal from "../components/Onboarding/OnboardingModal";
import React, { useEffect, useRef, useState } from "react";

import { useAppSelector } from "../store/hooks";

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
  }, [location.pathname]);

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
  const { userProfile, isAdmin, isAuthenticated, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      !isAdmin &&
      userProfile !== null &&
      !userProfile.onboarding_completed
    ) {
      setShow(true);
    }
  }, [loading, isAuthenticated, isAdmin, userProfile]);

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
            <Route
              path="/admin/questionnaires"
              element={<AdminQuestionnairesPage />}
            />
            <Route path="/admin/resources" element={<AdminResourcesPage />} />
          </Route>

          <Route path="/" element={<RootRedirect />} />
          <Route
            path="*"
            element={<div>CAUGHT: {window.location.pathname}</div>}
          />
          {/* // ! create action page not do page. todo} */}
        </Routes>
      </BrowserRouter>
    </ThemeWrapper>
  );
}
