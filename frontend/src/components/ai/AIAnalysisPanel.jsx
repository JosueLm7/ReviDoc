"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { aiAPI } from "../../services/api"
import { setLoading } from "../../store/slices/uiSlice"
import {
  SparklesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../ui/LoadingSpinner"
import { cn } from "../../lib/utils"

function AIAnalysisPanel({ text, language = "es", citationStyle = "apa", onAnalysisComplete }) {
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const { aiAnalysis: isLoading } = useSelector((state) => state.ui.loading)

  const analyzeText = async () => {
    if (!text || text.trim().length < 10) {
      setError("El texto debe tener al menos 10 caracteres")
      return
    }

    try {
      dispatch(setLoading({ key: "aiAnalysis", value: true }))
      setError(null)

      const response = await aiAPI.analyzeText({
        text,
        language,
        citationStyle,
      })

      setAnalysis(response.data.analysis)
      onAnalysisComplete?.(response.data.analysis)
    } catch (err) {
      setError(err.response?.data?.message || "Error al analizar el texto")
    } finally {
      dispatch(setLoading({ key: "aiAnalysis", value: false }))
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBackground = (score) => {
    if (score >= 80) return "bg-green-100 border-green-200"
    if (score >= 60) return "bg-yellow-100 border-yellow-200"
    return "bg-red-100 border-red-200"
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return <XCircleIcon className="w-4 h-4 text-red-500" />
      case "high":
        return <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
      case "medium":
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
      case "low":
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircleIcon className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-6 h-6 text-secondary" />
          <h3 className="text-lg font-serif font-semibold text-card-foreground">Análisis con IA</h3>
        </div>

        <button
          onClick={analyzeText}
          disabled={isLoading || !text}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <SparklesIcon className="w-4 h-4" />}
          <span>{isLoading ? "Analizando..." : "Analizar Texto"}</span>
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

      {analysis && (
        <div className="space-y-6">
          {/* Overall Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(analysis.scores).map(([category, score]) => (
              <div key={category} className={cn("p-4 rounded-lg border", getScoreBackground(score))}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {category === "grammar" && "Gramática"}
                      {category === "spelling" && "Ortografía"}
                      {category === "style" && "Estilo"}
                      {category === "coherence" && "Coherencia"}
                      {category === "citation" && "Citación"}
                      {category === "originality" && "Originalidad"}
                    </p>
                    <p className={cn("text-2xl font-bold", getScoreColor(score))}>{Math.round(score)}%</p>
                  </div>
                  <ChartBarIcon className={cn("w-6 h-6", getScoreColor(score))} />
                </div>
              </div>
            ))}
          </div>

          {/* Issues */}
          {analysis.issues && analysis.issues.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-card-foreground mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                Problemas Detectados ({analysis.issues.length})
              </h4>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {analysis.issues.map((issue, index) => (
                  <div key={index} className="bg-muted p-4 rounded-lg border border-border">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground capitalize">{issue.type}</span>
                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              issue.severity === "critical" && "bg-red-100 text-red-700",
                              issue.severity === "high" && "bg-orange-100 text-orange-700",
                              issue.severity === "medium" && "bg-yellow-100 text-yellow-700",
                              issue.severity === "low" && "bg-blue-100 text-blue-700",
                            )}
                          >
                            {issue.severity}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Texto original:</strong> "{issue.originalText}"
                        </p>

                        <p className="text-sm text-foreground mb-2">
                          <strong>Sugerencia:</strong> {issue.suggestion}
                        </p>

                        <p className="text-xs text-muted-foreground">{issue.explanation}</p>

                        {issue.confidence && (
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Confianza</span>
                              <span>{Math.round(issue.confidence * 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div
                                className="bg-secondary h-1 rounded-full"
                                style={{ width: `${issue.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {analysis.summary && (
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="text-md font-semibold text-card-foreground mb-3 flex items-center">
                <ChartBarIcon className="w-5 h-5 text-secondary mr-2" />
                Resumen del Análisis
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{analysis.summary.totalIssues}</p>
                  <p className="text-sm text-muted-foreground">Problemas Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{analysis.summary.criticalIssues}</p>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{analysis.summary.resolvedIssues || 0}</p>
                  <p className="text-sm text-muted-foreground">Resueltos</p>
                </div>
              </div>

              {analysis.summary.improvementSuggestions && analysis.summary.improvementSuggestions.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-card-foreground mb-2 flex items-center">
                    <LightBulbIcon className="w-4 h-4 text-yellow-500 mr-2" />
                    Sugerencias de Mejora
                  </h5>
                  <ul className="space-y-1">
                    {analysis.summary.improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-secondary mr-2">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Metadata */}
          {analysis.metadata && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Modelo:</span> {analysis.metadata.model}
                </div>
                <div>
                  <span className="font-medium">Tiempo:</span> {analysis.metadata.processingTime}ms
                </div>
                <div>
                  <span className="font-medium">Palabras:</span> {analysis.metadata.wordCount}
                </div>
                <div>
                  <span className="font-medium">Confianza:</span> {Math.round(analysis.metadata.confidence * 100)}%
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AIAnalysisPanel
