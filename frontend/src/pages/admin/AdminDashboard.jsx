"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"
import { fetchStatistics } from "../../store/slices/statisticsSlice"

function AdminDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { statistics, loading } = useSelector((state) => state.statistics)

  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    dispatch(fetchStatistics({ timeRange }))
  }, [dispatch, timeRange])

  const statCards = [
    {
      title: "Total Usuarios",
      value: statistics?.totalUsers || 0,
      change: statistics?.userGrowth || 0,
      icon: UsersIcon,
      color: "bg-blue-500",
    },
    {
      title: "Documentos Procesados",
      value: statistics?.totalDocuments || 0,
      change: statistics?.documentGrowth || 0,
      icon: DocumentTextIcon,
      color: "bg-green-500",
    },
    {
      title: "Análisis IA Realizados",
      value: statistics?.totalAnalyses || 0,
      change: statistics?.analysisGrowth || 0,
      icon: SparklesIcon,
      color: "bg-purple-500",
    },
    {
      title: "Puntuación Promedio",
      value: `${statistics?.averageScore || 0}/100`,
      change: statistics?.scoreChange || 0,
      icon: ChartBarIcon,
      color: "bg-orange-500",
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "document",
      message: "Nuevo documento subido por Juan Pérez",
      time: "Hace 5 minutos",
      status: "success",
    },
    {
      id: 2,
      type: "analysis",
      message: "Análisis IA completado para 'Ensayo sobre IA'",
      time: "Hace 12 minutos",
      status: "success",
    },
    {
      id: 3,
      type: "user",
      message: "Nuevo usuario registrado: María García",
      time: "Hace 1 hora",
      status: "info",
    },
    {
      id: 4,
      type: "error",
      message: "Error en análisis de plagio - documento ID: 12345",
      time: "Hace 2 horas",
      status: "error",
    },
    {
      id: 5,
      type: "system",
      message: "Mantenimiento programado completado",
      time: "Hace 3 horas",
      status: "success",
    },
  ]

  const getActivityIcon = (type, status) => {
    if (status === "error") return ExclamationTriangleIcon
    if (status === "success") return CheckCircleIcon
    return ClockIcon
  }

  const getActivityColor = (status) => {
    switch (status) {
      case "error":
        return "text-red-500"
      case "success":
        return "text-green-500"
      case "info":
        return "text-blue-500"
      default:
        return "text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Panel de Administración</h1>
            <p className="text-muted-foreground mt-2">Bienvenido, {user?.name}</p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="24h">Últimas 24 horas</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
            </select>

            <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <CogIcon className="w-4 h-4" />
              <span>Configuración</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm ${stat.change >= 0 ? "text-green-600" : "text-red-600"} font-medium`}>
                      {stat.change >= 0 ? "+" : ""}
                      {stat.change}%
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">vs período anterior</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Usage Chart */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-semibold text-card-foreground">Uso de la Plataforma</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">Documentos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">Análisis IA</span>
                  </div>
                </div>
              </div>

              {/* Simple Chart Placeholder */}
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartBarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Gráfico de uso de la plataforma</p>
                  <p className="text-sm text-muted-foreground mt-1">Integración con biblioteca de gráficos pendiente</p>
                </div>
              </div>
            </div>

            {/* Top Documents */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-serif font-semibold text-card-foreground mb-6">Documentos Más Analizados</h3>
              <div className="space-y-4">
                {[
                  { title: "Ensayo sobre Inteligencia Artificial", analyses: 45, score: 87 },
                  { title: "Investigación en Machine Learning", analyses: 32, score: 92 },
                  { title: "Tesis Doctoral - Capítulo 1", analyses: 28, score: 78 },
                  { title: "Artículo Científico - Metodología", analyses: 24, score: 85 },
                  { title: "Reporte de Investigación", analyses: 19, score: 81 },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">{doc.analyses} análisis realizados</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">{doc.score}/100</div>
                      <div className="text-sm text-muted-foreground">Puntuación promedio</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-serif font-semibold text-card-foreground mb-6">Actividad Reciente</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type, activity.status)
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <ActivityIcon className={`w-5 h-5 mt-0.5 ${getActivityColor(activity.status)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{activity.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-serif font-semibold text-card-foreground mb-6">Estado del Sistema</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Principal</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Operativo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base de Datos</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Operativo</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Servicios IA</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Carga Alta</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">n8n Automation</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Operativo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-serif font-semibold text-card-foreground mb-6">Acciones Rápidas</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                  <div className="font-medium text-foreground">Gestionar Usuarios</div>
                  <div className="text-sm text-muted-foreground">Ver y administrar cuentas de usuario</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                  <div className="font-medium text-foreground">Configurar IA</div>
                  <div className="text-sm text-muted-foreground">Ajustar parámetros de análisis</div>
                </button>
                <button className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors">
                  <div className="font-medium text-foreground">Ver Logs</div>
                  <div className="text-sm text-muted-foreground">Revisar logs del sistema</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
