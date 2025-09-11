"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Link } from "react-router-dom"
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../../components/ui/LoadingSpinner"

function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    documents: 0,
    reviews: 0,
    averageScore: 0,
    pendingReviews: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading stats
    setTimeout(() => {
      setStats({
        documents: user?.statistics?.documentsUploaded || 0,
        reviews: user?.statistics?.reviewsReceived || 0,
        averageScore: user?.statistics?.averageScore || 0,
        pendingReviews: 2,
      })
      setIsLoading(false)
    }, 1000)
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const quickActions = [
    {
      title: "Subir Documento",
      description: "Sube un nuevo documento para revisión",
      href: "/app/documents/upload",
      icon: PlusIcon,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Ver Documentos",
      description: "Revisa tus documentos subidos",
      href: "/app/documents",
      icon: DocumentTextIcon,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Mis Revisiones",
      description: "Consulta el estado de tus revisiones",
      href: "/app/reviews",
      icon: ClipboardDocumentCheckIcon,
      color: "bg-accent text-accent-foreground",
    },
  ]

  const statCards = [
    {
      title: "Documentos Subidos",
      value: stats.documents,
      icon: DocumentTextIcon,
      color: "text-blue-600",
    },
    {
      title: "Revisiones Completadas",
      value: stats.reviews,
      icon: ClipboardDocumentCheckIcon,
      color: "text-green-600",
    },
    {
      title: "Puntuación Promedio",
      value: `${stats.averageScore.toFixed(1)}%`,
      icon: ChartBarIcon,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h1 className="text-2xl font-serif font-bold text-card-foreground mb-2">¡Bienvenido, {user?.name}!</h1>
        <p className="text-muted-foreground">
          {user?.role === "student" && "Aquí puedes gestionar tus documentos y ver el progreso de tus revisiones."}
          {user?.role === "teacher" && "Gestiona las revisiones de tus estudiantes y supervisa su progreso."}
          {user?.role === "admin" && "Panel de administración para gestionar usuarios y estadísticas del sistema."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="group bg-card p-6 rounded-lg border border-border hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <ArrowRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">{action.title}</h3>
              <p className="text-muted-foreground text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {stats.pendingReviews > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Revisiones Pendientes</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Tienes {stats.pendingReviews} revisiones en proceso.
                <Link to="/app/reviews" className="font-medium underline ml-1">
                  Ver detalles
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
