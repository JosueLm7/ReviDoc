"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CloudArrowUpIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { fetchDocuments, deleteDocument } from "../../store/slices/documentsSlice"

function DocumentsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { documents, loading } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("updated")

  useEffect(() => {
    dispatch(fetchDocuments())
  }, [dispatch])

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === "all" || doc.status === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "created":
          return new Date(b.createdAt) - new Date(a.createdAt)
        case "updated":
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

  const handleDeleteDocument = async (docId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este documento?")) {
      try {
        await dispatch(deleteDocument(docId)).unwrap()
      } catch (error) {
        console.error("Error deleting document:", error)
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "reviewing":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "draft":
        return "Borrador"
      case "reviewing":
        return "En Revisión"
      case "completed":
        return "Completado"
      default:
        return "Desconocido"
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
            <h1 className="text-3xl font-serif font-bold text-foreground">Mis Documentos</h1>
            <p className="text-muted-foreground mt-2">Gestiona y revisa tus documentos académicos</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/documents/upload")}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              <span>Subir Archivo</span>
            </button>

            <button
              onClick={() => navigate("/documents/new")}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nuevo Documento</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar documentos..."
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
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todos los estados</option>
                  <option value="draft">Borradores</option>
                  <option value="reviewing">En Revisión</option>
                  <option value="completed">Completados</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="updated">Última modificación</option>
                <option value="created">Fecha de creación</option>
                <option value="title">Título</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-serif font-semibold text-foreground mb-2">No hay documentos</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterStatus !== "all"
                ? "No se encontraron documentos con los filtros aplicados"
                : "Comienza creando tu primer documento académico"}
            </p>
            <button
              onClick={() => navigate("/documents/new")}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Crear Documento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <div
                key={document._id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-serif font-semibold text-card-foreground mb-2 line-clamp-2">
                      {document.title}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}
                    >
                      {getStatusText(document.status)}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <p>Palabras: {document.wordCount || 0}</p>
                  <p>Modificado: {new Date(document.updatedAt).toLocaleDateString()}</p>
                  {document.lastReview && <p>Última revisión: {new Date(document.lastReview).toLocaleDateString()}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/documents/${document._id}`)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Ver documento"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/documents/${document._id}/edit`)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Editar documento"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    {(user?.role === "admin" || document.author === user?._id) && (
                      <button
                        onClick={() => handleDeleteDocument(document._id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        title="Eliminar documento"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {document.aiScore && (
                    <div className="text-sm text-muted-foreground">
                      Puntuación IA: <span className="font-medium">{document.aiScore}/100</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentsPage
