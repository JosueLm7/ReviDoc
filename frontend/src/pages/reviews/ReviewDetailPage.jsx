"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { fetchReviewById, updateReview } from "../../store/slices/reviewsSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { Badge } from "../../../../components/ui/badge"
import { Textarea } from "../../../../components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs"
import { Progress } from "../../../../components/ui/progress"
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Download,
  Edit,
  MessageSquare,
  TrendingUp,
  Target,
  BookOpen,
} from "lucide-react"
import { toast } from "react-toastify"

const ReviewDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { currentReview: review, isLoading, error } = useSelector((state) => state.reviews)
  const { user } = useSelector((state) => state.auth)

  const [feedback, setFeedback] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (id) {
      dispatch(fetchReviewById(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (review) {
      setFeedback(review.feedback?.comments || "")
    }
  }, [review])

  const handleSaveFeedback = async () => {
    try {
      await dispatch(
        updateReview({
          id: review._id,
          teacherFeedback: feedback,
          status: "reviewed",
        }),
      ).unwrap()

      setIsEditing(false)
      toast.success("Retroalimentación guardada correctamente")
    } catch (error) {
      toast.error("No se pudo guardar la retroalimentación")
    }
  }

  const getStatusColor = (status) => {
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

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const downloadReport = () => {
    const reportData = {
      document: review.documentId?.title || "Documento",
      scores: review.scores,
      issues: review.issues,
      plagiarismCheck: review.plagiarismCheck,
      date: new Date(review.createdAt).toLocaleDateString(),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `reporte-${review.documentId?.title || "documento"}-${new Date().toISOString().split("T")[0]}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error al cargar la revisión</h2>
          <p className="text-gray-600 mb-4">{error || "Revisión no encontrada"}</p>
          <Button onClick={() => navigate("/reviews")}>Volver a Revisiones</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Revisión: {review.documentId?.title || "Documento"}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {review.documentId?.author || "Autor desconocido"}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
            <Badge className={getStatusColor(review.status)}>
              {review.status === "completed"
                ? "Completado"
                : review.status === "processing"
                  ? "Procesando"
                  : review.status === "reviewed"
                    ? "Revisado"
                    : "Fallido"}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Descargar Reporte
          </Button>
          {user?.role === "teacher" && (
            <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "secondary" : "default"}>
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          )}
        </div>
      </div>

      {/* Puntuación general */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Puntuación General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(review.overallScore || 0)}`}>
                {review.overallScore || 0}%
              </div>
              <p className="text-sm text-gray-600">Puntuación Total</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(review.scores?.grammar || 0)}`}>
                {review.scores?.grammar || 0}%
              </div>
              <p className="text-sm text-gray-600">Gramática</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(review.scores?.coherence || 0)}`}>
                {review.scores?.coherence || 0}%
              </div>
              <p className="text-sm text-gray-600">Coherencia</p>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(review.scores?.style || 0)}`}>
                {review.scores?.style || 0}%
              </div>
              <p className="text-sm text-gray-600">Estilo</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">
            <Brain className="w-4 h-4 mr-2" />
            Análisis IA
          </TabsTrigger>
          <TabsTrigger value="plagiarism">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Plagio
          </TabsTrigger>
          <TabsTrigger value="issues">
            <Target className="w-4 h-4 mr-2" />
            Problemas
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="w-4 h-4 mr-2" />
            Retroalimentación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Gramatical</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Puntuación</span>
                    <span className="font-semibold">{review.scores?.grammar || 0}%</span>
                  </div>
                  <Progress value={review.scores?.grammar || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Coherencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Puntuación de coherencia</span>
                    <span className="font-semibold">{review.scores?.coherence || 0}%</span>
                  </div>
                  <Progress value={review.scores?.coherence || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Estilo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Puntuación de estilo</span>
                    <span className="font-semibold">{review.scores?.style || 0}%</span>
                  </div>
                  <Progress value={review.scores?.style || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análisis de Citas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Puntuación de citas</span>
                    <span className="font-semibold">{review.scores?.citation || 0}%</span>
                  </div>
                  <Progress value={review.scores?.citation || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plagiarism">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Detección de Plagio
              </CardTitle>
              <CardDescription>Análisis de similitud con fuentes externas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-bold mb-2 ${
                    (review.plagiarismCheck?.similarity || 0) < 15
                      ? "text-green-600"
                      : (review.plagiarismCheck?.similarity || 0) < 30
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {review.plagiarismCheck?.similarity || 0}%
                </div>
                <p className="text-gray-600">Similitud detectada</p>
              </div>

              {review.plagiarismCheck?.sources?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4">Fuentes encontradas:</h4>
                  <div className="space-y-4">
                    {review.plagiarismCheck.sources.map((source, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{source.title}</h5>
                          <Badge variant="outline">{source.similarity}% similar</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{source.matchedText}</p>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Ver fuente original
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(review.plagiarismCheck?.similarity || 0) === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-600 mb-2">No se detectó plagio</h3>
                  <p className="text-gray-600">El documento parece ser original</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Problemas Encontrados
              </CardTitle>
              <CardDescription>Total: {review.summary?.totalIssues || 0} problemas</CardDescription>
            </CardHeader>
            <CardContent>
              {review.issues && review.issues.length > 0 ? (
                <div className="space-y-4">
                  {review.issues.map((issue, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium capitalize">{issue.type}</h4>
                        <Badge variant={issue.severity === "critical" ? "destructive" : "secondary"}>
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{issue.explanation}</p>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <strong>Original:</strong> {issue.originalText}
                      </div>
                      <div className="bg-green-50 p-2 rounded text-sm mt-2">
                        <strong>Sugerencia:</strong> {issue.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron problemas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Retroalimentación del Docente
              </CardTitle>
              <CardDescription>Comentarios y sugerencias personalizadas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Escribe tu retroalimentación aquí..."
                    rows={8}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSaveFeedback} disabled={isLoading}>
                      {isLoading ? "Guardando..." : "Guardar Retroalimentación"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  {review.feedback?.comments ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{review.feedback.comments}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Aún no hay retroalimentación del docente</p>
                      {user?.role === "teacher" && (
                        <Button className="mt-4" onClick={() => setIsEditing(true)}>
                          Agregar Retroalimentación
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReviewDetailPage