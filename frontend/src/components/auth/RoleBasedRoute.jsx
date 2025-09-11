"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import LoadingSpinner from "../ui/LoadingSpinner"

function RoleBasedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children
}

export default RoleBasedRoute
