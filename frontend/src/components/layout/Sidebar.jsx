"use client"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"

function Sidebar() {
  const { user } = useAuth()
  const location = useLocation()

  const navigation = [
    {
      name: "Dashboard",
      href: "/app/dashboard",
      icon: HomeIcon,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Mis Documentos",
      href: "/app/documents",
      icon: DocumentTextIcon,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Subir Documento",
      href: "/app/documents/upload",
      icon: PlusIcon,
      roles: ["student", "teacher"],
    },
    {
      name: "Revisiones",
      href: "/app/reviews",
      icon: ClipboardDocumentCheckIcon,
      roles: ["student", "teacher", "admin"],
    },
    {
      name: "Mi Perfil",
      href: "/app/profile",
      icon: UserIcon,
      roles: ["student", "teacher", "admin"],
    },
  ]

  const adminNavigation = [
    {
      name: "Panel Admin",
      href: "/app/admin",
      icon: ChartBarIcon,
    },
    {
      name: "Usuarios",
      href: "/app/admin/users",
      icon: UsersIcon,
    },
    {
      name: "Estadísticas",
      href: "/app/admin/statistics",
      icon: ChartBarIcon,
    },
    {
      name: "Configuración",
      href: "/app/admin/settings",
      icon: Cog6ToothIcon,
    },
  ]

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user?.role))

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
      <nav className="p-4 space-y-2">
        {/* Main Navigation */}
        <div className="space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            )
          })}
        </div>

        {/* Admin Navigation */}
        {user?.role === "admin" && (
          <>
            <hr className="my-4 border-sidebar-border" />
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                Administración
              </h3>
              {adminNavigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </NavLink>
                )
              })}
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
