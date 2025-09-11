"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { DocumentTextIcon, PencilIcon, CloudArrowDownIcon, SparklesIcon } from "@heroicons/react/24/outline"
import { fetchDocument } from "../../store/slices/documentsSlice"

function DocumentViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { currentDocument, loading } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth)

  const [showReviews, setShowReviews] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchDocument(id))
    }
  }, [id, dispatch])

  const handleExport = () => {
    if (!currentDocument) return

    const element = document.createElement("a")
    const file = new Blob([currentDocument.content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${currentDocument.title}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
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

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DocumentTextIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-serif font-semibold text-foreground mb-2">Documento no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El documento que buscas no existe o no tienes permisos para verlo.
          </p>
          <button
            onClick={() => navigate("/documents")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Volver a Documentos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/documents")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
              <DocumentTextIcon className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-serif font-semibold text-card-foreground">{currentDocument.title}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentDocument.status)}`}
                  >
                    {getStatusText(currentDocument.status)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Modificado: {new Date(currentDocument.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowReviews(!showReviews)}
                className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Ver Análisis IA</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                <CloudArrowDownIcon className="w-4 h-4" />
                <span>Exportar</span>
              </button>

              {(user?.role === "admin" || currentDocument.author === user?._id) && (
                <button
                  onClick={() => navigate(`/documents/${id}/edit`)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg p-8">
              <div className="prose prose-lg max-w-none">
                <div
                  className="whitespace-pre-wrap text-foreground leading-relaxed"
                  style={{ fontFamily: "Source Sans Pro, sans-serif" }}
                >
                  {currentDocument.content}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Stats */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-serif font-semibold text-card-foreground mb-4">Estadísticas</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Palabras:</span>
                  <span className="font-medium text-foreground">{currentDocument.wordCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Caracteres:</span>
                  <span className="font-medium text-foreground">{currentDocument.content?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Párrafos:</span>
                  <span className="font-medium text-foreground">
                    {currentDocument.content?.split("\n\n").filter((p) => p.trim().length > 0).length || 0}
                  </span>
                </div>
                {currentDocument.aiScore && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Puntuación IA:</span>
                    <span className="font-medium text-foreground">{currentDocument.aiScore}/100</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Reviews */}
            {showReviews && currentDocument.reviews && currentDocument.reviews.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-serif font-semibold text-card-foreground mb-4">Análisis IA Recientes</h3>
                <div className="space-y-4">
                  {currentDocument.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {review.type === "grammar"
                            ? "Gramática"
                            : review.type === "plagiarism"
                              ? "Plagio"
                              : review.type === "structure"
                                ? "Estructura"
                                : "General"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.summary || "Análisis completado"}</p>
                      {review.score && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Puntuación: {review.score}/100</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-serif font-semibold text-card-foreground mb-4">Información</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Creado:</span>
                  <p className="font-medium text-foreground">
                    {new Date(currentDocument.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Autor:</span>
                  <p className="font-medium text-foreground">{currentDocument.authorName || "Usuario"}</p>
                </div>
                {currentDocument.category && (
                  <div>
                    <span className="text-muted-foreground">Categoría:</span>
                    <p className="font-medium text-foreground">{currentDocument.category}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentViewPage
