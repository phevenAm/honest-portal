import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import React, { useEffect, useState } from "react";

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

function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('hello, loaded, need to add skip to main link')
    // add event listener for tab press then perform clean up? but its always mounted sooo?
  },[])
  return (
    <>
      <Navbar />
      <main id="main-content">
        <div className="page-content">{children}</div>
        <Footer />
      </main>
    </>
  );
}


function OnboardingGate() {
  const { userProfile, isAdmin, isAuthenticated, loading } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin && userProfile !== null && !userProfile.onboarding_completed) {
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
            {/* // ! create action page not do page. todo} */}
        </Routes>
      </BrowserRouter>
    </ThemeWrapper>
  );
}