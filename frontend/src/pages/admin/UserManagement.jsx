"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"

function UserManagement() {
  const dispatch = useDispatch()
  const { user: currentUser } = useSelector((state) => state.auth)

  const [users, setUsers] = useState([
    {
      _id: "1",
      name: "Juan Pérez",
      email: "juan@example.com",
      role: "student",
      status: "active",
      documentsCount: 12,
      lastLogin: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      _id: "2",
      name: "María García",
      email: "maria@example.com",
      role: "teacher",
      status: "active",
      documentsCount: 45,
      lastLogin: "2024-01-14T15:45:00Z",
      createdAt: "2023-12-15T00:00:00Z",
    },
    {
      _id: "3",
      name: "Carlos López",
      email: "carlos@example.com",
      role: "student",
      status: "inactive",
      documentsCount: 3,
      lastLogin: "2024-01-10T09:15:00Z",
      createdAt: "2024-01-05T00:00:00Z",
    },
    {
      _id: "4",
      name: "Ana Martínez",
      email: "ana@example.com",
      role: "admin",
      status: "active",
      documentsCount: 8,
      lastLogin: "2024-01-15T12:00:00Z",
      createdAt: "2023-11-20T00:00:00Z",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === "all" || user.role === filterRole
      const matchesStatus = filterStatus === "all" || user.status === filterStatus
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "email":
          return a.email.localeCompare(b.email)
        case "role":
          return a.role.localeCompare(b.role)
        case "lastLogin":
          return new Date(b.lastLogin) - new Date(a.lastLogin)
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt)
        default:
          return 0
      }
    })

  const handleDeleteUser = async (userId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      setUsers((prev) => prev.filter((user) => user._id !== userId))
    }
  }

  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, status: user.status === "active" ? "inactive" : "active" } : user,
      ),
    )
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "teacher":
        return "bg-blue-100 text-blue-800"
      case "student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleText = (role) => {
    switch (role) {
      case "admin":
        return "Administrador"
      case "teacher":
        return "Docente"
      case "student":
        return "Estudiante"
      default:
        return "Desconocido"
    }
  }

  const getStatusColor = (status) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status) => {
    return status === "active" ? "Activo" : "Inactivo"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-2">Administra las cuentas de usuario de la plataforma</p>
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <PlusIcon className="w-5 h-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="w-5 h-5 text-muted-foreground" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="teacher">Docentes</option>
                  <option value="student">Estudiantes</option>
                </select>
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">Nombre</option>
                <option value="email">Email</option>
                <option value="role">Rol</option>
                <option value="lastLogin">Último acceso</option>
                <option value="created">Fecha de registro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Último Acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-foreground">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                      >
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)} hover:opacity-80 transition-opacity`}
                      >
                        {getStatusText(user.status)}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{user.documentsCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowModal(true)
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Editar usuario"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        {user._id !== currentUser?._id && (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            title="Eliminar usuario"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">No se encontraron usuarios</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterRole !== "all" || filterStatus !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay usuarios registrados en el sistema"}
              </p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-serif font-semibold text-card-foreground">Detalles del Usuario</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-foreground">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rol</label>
                  <p className="text-foreground">{getRoleText(selectedUser.role)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <p className="text-foreground">{getStatusText(selectedUser.status)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Documentos</label>
                  <p className="text-foreground">{selectedUser.documentsCount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Último Acceso</label>
                  <p className="text-foreground">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Registro</label>
                  <p className="text-foreground">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cerrar
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserManagement
