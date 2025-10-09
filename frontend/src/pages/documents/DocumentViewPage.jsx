"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { 
  DocumentTextIcon, 
  PencilIcon, 
  CloudArrowDownIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  CalendarDaysIcon,
  UserIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline"
import { fetchDocumentById } from "../../store/slices/documentsSlice"

function DocumentViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { currentDocument, isLoading, error } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth || {})

  const [showReviews, setShowReviews] = useState(false)

  useEffect(() => {
    console.log("🔄 Buscando documento con ID:", id)
    if (id) {
      dispatch(fetchDocumentById(id))
    }
  }, [id, dispatch])

  // Debug
  useEffect(() => {
    console.log("📊 currentDocument:", currentDocument)
    console.log("❌ Error:", error)
    console.log("👤 User:", user)
  }, [currentDocument, error, user])

  const getDocumentData = () => {
    if (!currentDocument) return null
    
    // Diferentes estructuras que puede tener la respuesta
    if (currentDocument.data?.document) {
      console.log("📁 Estructura: currentDocument.data.document")
      return currentDocument.data.document
    }
    if (currentDocument.document) {
      console.log("📁 Estructura: currentDocument.document")
      return currentDocument.document
    }
    if (currentDocument.data) {
      console.log("📁 Estructura: currentDocument.data")
      return currentDocument.data
    }
    console.log("📁 Estructura: currentDocument (directo)")
    return currentDocument
  }

  const documentData = getDocumentData()

  const handleExport = () => {
    if (!documentData) return

    // Si tenemos URL del archivo original, usarla
    if (documentData.fileUrl) {
      window.open(`${process.env.REACT_APP_API_URL}${documentData.fileUrl}`, '_blank')
      return
    }

    // Fallback: exportar como texto
    const element = document.createElement("a")
    const file = new Blob([documentData.content || "Sin contenido"], { 
      type: "text/plain" 
    })
    element.href = URL.createObjectURL(file)
    element.download = `${documentData.title || 'documento'}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha desconocida"
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const countWords = (text) => {
    if (!text) return 0
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const countParagraphs = (text) => {
    if (!text) return 0
    return text.split('\n').filter(paragraph => paragraph.trim().length > 0).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Cargando documento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <DocumentTextIcon className="w-20 h-20 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar documento</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-6">ID: {id}</p>
          <button
            onClick={() => navigate("/app/documents")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg"
          >
            Volver a Documentos
          </button>
        </div>
      </div>
    )
  }

  if (!documentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <DocumentTextIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Documento no encontrado</h2>
          <p className="text-gray-600 mb-4">
            El documento que buscas no existe o no tienes permisos para verlo.
          </p>
          <p className="text-sm text-gray-500 mb-6">ID: {id}</p>
          <button
            onClick={() => navigate("/app/documents")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg"
          >
            Volver a Documentos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header Mejorado */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <button
                  onClick={() => navigate("/app/documents")}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Volver a documentos</span>
                </button>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {documentData.title || "Documento sin título"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(documentData.status)}`}>
                      <span>{getStatusText(documentData.status)}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-sm text-gray-600">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>Modificado: {formatDate(documentData.updatedAt)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>Análisis IA</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                <CloudArrowDownIcon className="w-5 h-5" />
                <span>Exportar</span>
              </button>

              {(user?.role === "admin" || documentData.userId === user?._id) && (
                <button
                  onClick={() => navigate(`/app/documents/${id}/edit`)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg"
                >
                  <PencilIcon className="w-5 h-5" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
              {/* Content Header */}
              <div className="border-b border-gray-100 px-8 py-6 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Contenido del Documento</h2>
                  {documentData.fileType === 'pdf' && documentData.fileUrl ? (
                    <div className="w-full h-96 mb-6">
                      <iframe 
                        src={`${process.env.REACT_APP_API_URL}${documentData.fileUrl}`}
                        className="w-full h-full border rounded-lg"
                        title={`PDF: ${documentData.title}`}
                      />
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Vista previa del PDF. Usa el botón "Exportar" para descargar el archivo original.
                      </p>
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg font-light"
                        style={{ fontFamily: "Source Sans Pro, sans-serif", lineHeight: '1.8' }}>
                        {documentData.content || "Este documento no tiene contenido."}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Document Content */}
              <div className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg font-light"
                    style={{ fontFamily: "Source Sans Pro, sans-serif", lineHeight: '1.8' }}>
                    {documentData.content || "Este documento no tiene contenido."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Stats */}
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Estadísticas</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Palabras:</span>
                  <span className="font-semibold text-gray-900">{countWords(documentData.content)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Caracteres:</span>
                  <span className="font-semibold text-gray-900">{documentData.content?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Párrafos:</span>
                  <span className="font-semibold text-gray-900">{countParagraphs(documentData.content)}</span>
                </div>
                {documentData.aiScore && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Puntuación IA:</span>
                    <span className="font-semibold text-blue-600">{documentData.aiScore}/100</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Info */}
            <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <DocumentTextIcon className="w-5 h-5" />
                <span>Información</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 py-2 border-b border-gray-100">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Creado</p>
                    <p className="font-medium text-gray-900">{formatDate(documentData.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 py-2 border-b border-gray-100">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Autor</p>
                    <p className="font-medium text-gray-900">
                      {documentData.userId?.name || user?.name || "Usuario"}
                    </p>
                  </div>
                </div>

                {documentData.category && (
                  <div className="py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">Categoría</p>
                    <p className="font-medium text-gray-900">{documentData.category}</p>
                  </div>
                )}

                {documentData.academicLevel && (
                  <div className="py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">Nivel Académico</p>
                    <p className="font-medium text-gray-900">{documentData.academicLevel}</p>
                  </div>
                )}

                {documentData.subject && (
                  <div className="py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-600">Materia</p>
                    <p className="font-medium text-gray-900">{documentData.subject}</p>
                  </div>
                )}

                {documentData.fileSize && (
                  <div className="py-2">
                    <p className="text-sm text-gray-600">Tamaño del archivo</p>
                    <p className="font-medium text-gray-900">
                      {(documentData.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Reviews */}
            {showReviews && documentData.reviews && documentData.reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <SparklesIcon className="w-5 h-5" />
                  <span>Análisis IA</span>
                </h3>
                <div className="space-y-4">
                  {documentData.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {review.type || "general"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {review.createdAt ? formatDate(review.createdAt) : "Fecha desconocida"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {review.summary || "Análisis completado"}
                      </p>
                      {review.score && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Puntuación:</span>
                          <span className="text-sm font-semibold text-purple-600">{review.score}/100</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentViewPage