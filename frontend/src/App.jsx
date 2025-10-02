"use client"

import dynamic from "next/dynamic"
import { Provider } from "react-redux"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { store } from "./store/store"
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
import DocumentDetailPage from "./pages/documents/DocumentDetailPage"
import UploadPage from "./pages/documents/UploadPage"
import ReviewsPage from "./pages/reviews/ReviewsPage"
import ReviewDetailPage from "./pages/reviews/ReviewDetailPage"
import ProfilePage from "./pages/profile/ProfilePage"
import AdminDashboard from "./pages/admin/AdminDashboard"
import UsersManagement from "./pages/admin/UsersManagement"
import StatisticsPage from "./pages/admin/StatisticsPage"
import NotFoundPage from "./pages/NotFoundPage"

// ⛔ Importa BrowserRouter dinámicamente para que se ejecute solo en cliente
const Router = dynamic(
  () => import("react-router-dom").then(mod => mod.BrowserRouter),
  { ssr: false }
)
import { Routes, Route, Navigate } from "react-router-dom"

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
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

              {/* Toast Notifications */}
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                className="mt-16"
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default App