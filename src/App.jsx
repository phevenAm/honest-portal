import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { store } from './store/index.js'
import { selectThemeMode } from './store/slices/themeSlice.js'
import { selectIsAuthenticated, selectIsAdmin } from './store/slices/authSlice.js'

import LoginPage               from './pages/LoginPage.jsx'
import ClientDashboard         from './pages/client/ClientDashboard.jsx'
import CheckInPage             from './pages/client/CheckInPage.jsx'
import ResourcesPage           from './pages/client/ResourcesPage.jsx'
import AdminDashboard          from './pages/admin/AdminDashboard.jsx'
import AdminClientsPage        from './pages/admin/AdminClientsPage.jsx'
import AdminQuestionnairesPage from './pages/admin/AdminQuestionnairesPage.jsx'
import AdminResourcesPage      from './pages/admin/AdminResourcesPage.jsx'
import Navbar                  from './components/shared/Navbar.jsx'
import ProtectedRoute          from './components/shared/ProtectedRoute.jsx'

function ThemeWrapper({ children }) {
  const mode = useSelector(selectThemeMode)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])
  return <>{children}</>
}

function RootRedirect() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
    </>
  )
}

function AppRoutes() {
  return (
    <ThemeWrapper>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="client"><AppLayout><ClientDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/check-in"  element={<ProtectedRoute requiredRole="client"><AppLayout><CheckInPage /></AppLayout></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute requiredRole="client"><AppLayout><ResourcesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/admin"                  element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/clients"          element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminClientsPage /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/questionnaires"   element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminQuestionnairesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/resources"        element={<ProtectedRoute requiredRole="admin"><AppLayout><AdminResourcesPage /></AppLayout></ProtectedRoute>} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeWrapper>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  )
}