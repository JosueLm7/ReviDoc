"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { aiAPI } from "../../services/api"
import { setLoading } from "../../store/slices/uiSlice"
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LinkIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../ui/LoadingSpinner"
import { cn } from "../../lib/utils"

function PlagiarismChecker({ text, language = "es", onCheckComplete }) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const { plagiarismCheck: isLoading } = useSelector((state) => state.ui.loading)

  const checkPlagiarism = async () => {
    if (!text || text.trim().length < 50) {
      setError("El texto debe tener al menos 50 caracteres para verificar plagio")
      return
    }

    try {
      dispatch(setLoading({ key: "plagiarismCheck", value: true }))
      setError(null)

      const response = await aiAPI.checkPlagiarism({
        text,
        language,
      })

      setResult(response.data.plagiarismResult)
      onCheckComplete?.(response.data.plagiarismResult)
    } catch (err) {
      setError(err.response?.data?.message || "Error al verificar plagio")
    } finally {
      dispatch(setLoading({ key: "plagiarismCheck", value: false }))
    }
  }

  const getSimilarityColor = (similarity) => {
    if (similarity < 15) return "text-green-600"
    if (similarity < 30) return "text-yellow-600"
    return "text-red-600"
  }

  const getSimilarityBackground = (similarity) => {
    if (similarity < 15) return "bg-green-100 border-green-200"
    if (similarity < 30) return "bg-yellow-100 border-yellow-200"
    return "bg-red-100 border-red-200"
  }

  const getOriginalityIcon = (isOriginal) => {
    return isOriginal ? (
      <CheckCircleIcon className="w-6 h-6 text-green-500" />
    ) : (
      <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
    )
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ShieldCheckIcon className="w-6 h-6 text-secondary" />
          <h3 className="text-lg font-serif font-semibold text-card-foreground">Verificación de Plagio</h3>
        </div>

        <button
          onClick={checkPlagiarism}
          disabled={isLoading || !text}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <ShieldCheckIcon className="w-4 h-4" />}
          <span>{isLoading ? "Verificando..." : "Verificar Plagio"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Overall Result */}
          <div className={cn("p-6 rounded-lg border text-center", getSimilarityBackground(result.similarity))}>
            <div className="flex items-center justify-center mb-4">{getOriginalityIcon(result.isOriginal)}</div>

            <h4 className="text-xl font-semibold mb-2">
              {result.isOriginal ? "Contenido Original" : "Posible Plagio Detectado"}
            </h4>

            <div className="flex items-center justify-center space-x-4">
              <div>
                <p className={cn("text-3xl font-bold", getSimilarityColor(result.similarity))}>
                  {result.similarity.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">Similitud</p>
              </div>

              <div className="h-8 w-px bg-border"></div>

              <div>
                <p className="text-2xl font-bold text-foreground">{Math.round(result.confidence * 100)}%</p>
                <p className="text-sm text-muted-foreground">Confianza</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    result.similarity < 15 && "bg-green-500",
                    result.similarity >= 15 && result.similarity < 30 && "bg-yellow-500",
                    result.similarity >= 30 && "bg-red-500",
                  )}
                  style={{ width: `${Math.min(result.similarity, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>Original</span>
                <span>Sospechoso</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Interpretation */}
          <div className="bg-muted p-4 rounded-lg">
            <h5 className="font-semibold text-card-foreground mb-2">Interpretación</h5>
            <p className="text-sm text-muted-foreground">
              {result.similarity < 15 &&
                "El contenido parece ser original. El nivel de similitud está dentro del rango aceptable para trabajos académicos."}
              {result.similarity >= 15 &&
                result.similarity < 30 &&
                "Se detectó un nivel moderado de similitud. Revisa las citas y referencias para asegurar la atribución correcta."}
              {result.similarity >= 30 &&
                "Se detectó un alto nivel de similitud. Es recomendable revisar el contenido y asegurar que todas las fuentes estén correctamente citadas."}
            </p>
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-card-foreground mb-4 flex items-center">
                <LinkIcon className="w-5 h-5 text-secondary mr-2" />
                Fuentes Similares Encontradas ({result.sources.length})
              </h4>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {result.sources.map((source, index) => (
                  <div key={index} className="bg-muted p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-foreground text-sm">{source.title || "Fuente sin título"}</h5>
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          source.similarity < 20 && "bg-green-100 text-green-700",
                          source.similarity >= 20 && source.similarity < 40 && "bg-yellow-100 text-yellow-700",
                          source.similarity >= 40 && "bg-red-100 text-red-700",
                        )}
                      >
                        {source.similarity.toFixed(1)}%
                      </span>
                    </div>

                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-secondary hover:text-secondary/80 text-sm break-all"
                      >
                        {source.url}
                      </a>
                    )}

                    {source.matchedText && (
                      <div className="mt-3 p-3 bg-background rounded border-l-4 border-secondary">
                        <p className="text-xs text-muted-foreground mb-1">Texto coincidente:</p>
                        <p className="text-sm text-foreground italic">"{source.matchedText}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Recomendaciones
            </h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Asegúrate de citar correctamente todas las fuentes utilizadas</li>
              <li>• Usa comillas para citas textuales y proporciona la referencia completa</li>
              <li>• Parafrasea el contenido con tus propias palabras cuando sea apropiado</li>
              <li>• Incluye una lista de referencias completa al final del documento</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlagiarismChecker
