"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Provider, useDispatch, useSelector } from "react-redux"

// ELIMINAR estas líneas:
// import { ToastContainer } from "react-toastify"
// import "react-toastify/dist/ReactToastify.css"

import { store } from "./store/store"
import { fetchCurrentUser } from "./store/slices/authSlice"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"

// Layout Components
import Layout from "./components/layout/Layout"
import PublicLayout from "./components/layout/PublicLayout"

// Auth Components
import ProtectedRoute from "./components/auth/ProtectedRoute"
import RoleBasedRoute from "./components/auth/RoleBasedRoute"

// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import DashboardPage from "./pages/dashboard/DashboardPage"
import DocumentsPage from "./pages/documents/DocumentsPage"
import DocumentDetailPage from "./pages/documents/DocumentViewPage"
import DocumentEditPage from "./pages/documents/DocumentEditorPage"
import UploadPage from "./pages/documents/DocumentUploadPage"
import ReviewsPage from "./pages/reviews/ReviewsPage"
import ReviewDetailPage from "./pages/reviews/ReviewDetailPage"
import ProfilePage from "./pages/profile/ProfilePage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import UsersManagement from "./pages/admin/UsersManagement"
import StatisticsPage from "./pages/admin/StatisticsPage"
import NotFoundPage from "./pages/NotFoundPage"

// Router imports
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

function AppInitializer({ children }) {
  const dispatch = useDispatch()
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token")
      if (token && !isAuthenticated) {
        dispatch(fetchCurrentUser())
      }
    }
  }, [dispatch, isAuthenticated])

  if (!isClient) {
    return <div>Loading...</div>
  }

  return children
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <AppInitializer>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/app/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />

                    {/* Documents */}
                    <Route path="documents" element={<DocumentsPage />} />
                    <Route path="documents/upload" element={<UploadPage />} />
                    <Route path="documents/:id" element={<DocumentDetailPage />} />
                    <Route path="documents/:id/edit" element={<DocumentEditPage />} />

                    {/* Reviews */}
                    <Route path="reviews" element={<ReviewsPage />} />
                    <Route path="reviews/:id" element={<ReviewDetailPage />} />

                    {/* Profile */}
                    <Route path="profile" element={<ProfilePage />} />

                    {/* Admin Routes */}
                    <Route
                      path="admin"
                      element={
                        <RoleBasedRoute allowedRoles={["admin"]}>
                          <AdminDashboard />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="admin/users"
                      element={
                        <RoleBasedRoute allowedRoles={["admin"]}>
                          <UsersManagement />
                        </RoleBasedRoute>
                      }
                    />
                    <Route
                      path="admin/statistics"
                      element={
                        <RoleBasedRoute allowedRoles={["admin"]}>
                          <StatisticsPage />
                        </RoleBasedRoute>
                      }
                    />
                  </Route>

                  {/* 404 Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>

                {/* ELIMINAR COMPLETAMENTE ToastContainer */}
                {/* No necesitas ToastContainer para que tu app funcione */}
              </div>
            </Router>
          </AppInitializer>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default App