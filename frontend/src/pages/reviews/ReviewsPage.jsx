"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { fetchReviews, deleteReview } from "../../store/slices/reviewsSlice"
import { Card, CardContent } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  FileText,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react"
import { toast } from "../../../../hooks/use-toast"

const ReviewsPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // ✅ Validaciones seguras para useSelector
  const { reviews = [], loading = false, error = null, pagination = {} } = useSelector((state) => state.reviews || {})
  const { user = {} } = useSelector((state) => state.auth || {})

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: statusFilter !== "all" ? statusFilter : undefined,
      sortBy,
      sortOrder,
    }

    dispatch(fetchReviews(filters))
  }, [dispatch, currentPage, searchTerm, statusFilter, sortBy, sortOrder])

  const handleViewReview = (reviewId) => {
    if (!reviewId) {
      toast({
        title: "Error",
        description: "ID de revisión no válido",
        variant: "destructive",
      })
      return
    }
    navigate(`/reviews/${reviewId}`)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) {
      toast({
        title: "Error",
        description: "ID de revisión no válido",
        variant: "destructive",
      })
      return
    }

    if (window.confirm("¿Estás seguro de que quieres eliminar esta revisión?")) {
      try {
        await dispatch(deleteReview(reviewId)).unwrap()
        toast({
          title: "Revisión eliminada",
          description: "La revisión ha sido eliminada correctamente.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: error?.message || "No se pudo eliminar la revisión.",
          variant: "destructive",
        })
      }
    }
  }

  // ✅ Función segura para obtener color de estado
  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800"
    
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "reviewed":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // ✅ Función segura para obtener ícono de estado
  const getStatusIcon = (status) => {
    if (!status) return <Clock className="w-4 h-4" />
    
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "processing":
        return <Clock className="w-4 h-4" />
      case "reviewed":
        return <Eye className="w-4 h-4" />
      case "failed":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  // ✅ Función segura para obtener etiqueta de estado
  const getStatusLabel = (status) => {
    if (!status) return "Desconocido"
    
    switch (status) {
      case "completed": return "Completado"
      case "processing": return "Procesando"
      case "reviewed": return "Revisado"
      case "failed": return "Fallido"
      default: return status
    }
  }

  // ✅ Función segura para obtener color de puntuación
  const getScoreColor = (score) => {
    const numericScore = Number(score) || 0
    if (numericScore >= 80) return "text-green-600"
    if (numericScore >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // ✅ Función segura para obtener color de similitud
  const getSimilarityColor = (similarity) => {
    const numericSimilarity = Number(similarity) || 0
    if (numericSimilarity < 15) return "text-green-600"
    if (numericSimilarity < 30) return "text-yellow-600"
    return "text-red-600"
  }

  // ✅ Función segura para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible"
    try {
      return new Date(dateString).toLocaleDateString("es-ES")
    } catch (error) {
      return "Fecha inválida"
    }
  }

  // ✅ Validación segura para reviews array
  const safeReviews = Array.isArray(reviews) ? reviews : []
  
  // ✅ Validación segura para paginación
  const safePagination = pagination && typeof pagination === 'object' ? pagination : {}
  const totalPages = Number(safePagination.totalPages) || 1

  if (loading && safeReviews.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary mr-2" />
        <span>Cargando revisiones...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Revisiones</h1>
          <p className="text-gray-600 mt-2">Gestiona y revisa todos los análisis de documentos</p>
        </div>
        <Button onClick={() => navigate("/documents/upload")} className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Nueva Revisión
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar revisiones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="processing">Procesando</option>
              <option value="completed">Completado</option>
              <option value="reviewed">Revisado</option>
              <option value="failed">Fallido</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="createdAt">Fecha de creación</option>
              <option value="updatedAt">Última actualización</option>
              <option value="overallScore">Puntuación</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Mensaje de error */}
      {error && (
        <Card className="mb-8 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>Error al cargar las revisiones: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de revisiones */}
      <div className="space-y-6">
        {/* ✅ Validación segura para array vacío */}
        {!safeReviews || safeReviews.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay revisiones disponibles</h3>
                <p className="text-gray-600 mb-4">Comienza subiendo un documento para análisis</p>
                <Button onClick={() => navigate("/documents/upload")} className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Subir Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          safeReviews.map((review) => {
            // ✅ Validaciones seguras para cada review
            if (!review) return null
            
            const reviewId = review._id || review.id
            const reviewStatus = review.status || "unknown"
            const document = review.document || {}
            const analysis = review.analysis || {}
            const plagiarismCheck = review.plagiarismCheck || {}

            return (
              <Card key={reviewId} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.title || "Título no disponible"}
                        </h3>
                        <Badge className={getStatusColor(reviewStatus)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(reviewStatus)}
                            {getStatusLabel(reviewStatus)}
                          </div>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(review.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {document.type || "Tipo no especificado"}
                        </div>
                        {analysis.overallScore !== undefined && (
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className={getScoreColor(analysis.overallScore)}>
                              {analysis.overallScore}% puntuación
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Métricas de análisis */}
                      {analysis && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${getScoreColor(analysis.grammarScore || 0)}`}>
                              {analysis.grammarScore || 0}%
                            </div>
                            <div className="text-xs text-gray-600">Gramática</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${getScoreColor(analysis.coherenceScore || 0)}`}>
                              {analysis.coherenceScore || 0}%
                            </div>
                            <div className="text-xs text-gray-600">Coherencia</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${getScoreColor(analysis.styleScore || 0)}`}>
                              {analysis.styleScore || 0}%
                            </div>
                            <div className="text-xs text-gray-600">Estilo</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded">
                            <div className={`text-lg font-bold ${getSimilarityColor(plagiarismCheck.similarityPercentage || 0)}`}>
                              {plagiarismCheck.similarityPercentage || 0}%
                            </div>
                            <div className="text-xs text-gray-600">Similitud</div>
                          </div>
                        </div>
                      )}

                      {/* Retroalimentación del profesor */}
                      {review.teacherFeedback && (
                        <div className="bg-blue-50 p-3 rounded mb-4">
                          <p className="text-sm text-blue-800">
                            <strong>Retroalimentación:</strong>{" "}
                            {review.teacherFeedback.length > 150 
                              ? `${review.teacherFeedback.substring(0, 150)}...`
                              : review.teacherFeedback
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <Button 
                        size="sm" 
                        onClick={() => handleViewReview(reviewId)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Ver Detalles
                      </Button>

                      {/* ✅ Validación segura para permisos de eliminación */}
                      {(user?.role === "admin" || document.author === user?.email) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteReview(reviewId)}
                          className="text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  )
}

export default ReviewsPage