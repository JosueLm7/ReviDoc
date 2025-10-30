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
  ClockIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline"
import { fetchDocuments, deleteDocument } from "../../store/slices/documentsSlice"

function DocumentsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { documents, isLoading, error } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth || {})

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortBy, setSortBy] = useState("updated")

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        await dispatch(fetchDocuments()).unwrap()
      } catch (error) {
        console.error("❌ Error cargando documentos:", error)
      }
    }

    loadDocuments()
  }, [dispatch])

  const filteredDocuments = (documents || [])
    .filter((doc) => {
      const matchesSearch =
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false
      const matchesFilter = filterStatus === "all" || doc.status === filterStatus
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title || "").localeCompare(b.title || "")
        case "created":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case "updated":
        default:
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      }
    })

  const handleDeleteDocument = async (docId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este documento?")) {
      try {
        await dispatch(deleteDocument(docId)).unwrap()
        dispatch(fetchDocuments())
      } catch (error) {
        console.error("Error deleting document:", error)
        alert("Error al eliminar el documento")
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "reviewing":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "completed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "draft":
        return "📝"
      case "reviewing":
        return "🔍"
      case "completed":
        return "✅"
      default:
        return "📄"
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

  const getFileTypeIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case "pdf":
        return "📕"
      case "doc":
      case "docx":
        return "📘"
      case "txt":
        return "📙"
      default:
        return "📄"
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha desconocida"
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getPreviewText = (content, maxLength = 120) => {
    if (!content) return "Sin contenido disponible para previsualización..."
    const cleanContent = content.replace(/[#*`]/g, "").trim()
    return cleanContent.length > maxLength ? cleanContent.substring(0, maxLength) + "..." : cleanContent
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Cargando tus documentos...</p>
          <p className="text-sm text-gray-500 mt-2">Preparando todo para ti</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <DocumentTextIcon className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchDocuments())}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Mejorado */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-700 bg-clip-text text-transparent">
                Mis Documentos
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Gestiona y revisa tus documentos académicos
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {documents?.length || 0} documentos
              </span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/app/documents/upload")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              <span className="font-medium">Subir Archivo</span>
            </button>

            <button
              onClick={() => navigate("/documents/new")}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="font-medium">Nuevo Documento</span>
            </button>
          </div>
        </div>

        {/* Filtros y Búsqueda Mejorados */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-xl">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título, descripción o materia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-transparent text-gray-700 focus:outline-none border-none"
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
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="updated">Última modificación</option>
                <option value="created">Fecha de creación</option>
                <option value="title">Orden alfabético</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Documentos Mejorado */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="max-w-md mx-auto">
              <DocumentTextIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {documents && documents.length === 0 ? "No hay documentos aún" : "No se encontraron resultados"}
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchTerm || filterStatus !== "all"
                  ? "Prueba ajustando los filtros de búsqueda"
                  : "Comienza subiendo tu primer documento académico"}
              </p>
              <button
                onClick={() => navigate("/documents/upload")}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-medium"
              >
                <CloudArrowUpIcon className="w-6 h-6" />
                <span>Subir Mi Primer Documento</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <div
                key={document._id}
                className="group bg-white rounded-2xl border border-gray-200/60 hover:border-blue-300/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Header de la tarjeta */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="text-xl">{getFileTypeIcon(document.fileType)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {document.title || "Documento sin título"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                          {document.description || "Sin descripción"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estado y badges */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(document.status)}`}
                    >
                      <span>{getStatusIcon(document.status)}</span>
                      <span>{getStatusText(document.status)}</span>
                    </span>
                    {document.academicLevel && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {document.academicLevel}
                      </span>
                    )}
                    {document.subject && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {document.subject}
                      </span>
                    )}
                  </div>
                </div>

                {/* Previsualización del contenido */}
                <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-1">
                      <DocumentChartBarIcon className="w-4 h-4" />
                      <span>Previsualización</span>
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                      {getPreviewText(document.content)}
                    </p>
                  </div>
                </div>

                {/* Metadatos */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatFileSize(document.fileSize)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>{formatDate(document.updatedAt)}</span>
                    </div>
                    {document.wordCount && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <DocumentTextIcon className="w-4 h-4" />
                        <span>{document.wordCount.toLocaleString()} palabras</span>
                      </div>
                    )}
                    {document.aiScore && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ChartBarIcon className="w-4 h-4" />
                        <span className="font-semibold text-blue-600">{document.aiScore}/100</span>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => navigate(`/app/documents/${document._id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Ver documento"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/app/documents/${document._id}/edit`)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Editar documento"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      {(user?.role === "admin" || document.userId === user?._id) && (
                        <button
                          onClick={() => handleDeleteDocument(document._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Eliminar documento"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
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