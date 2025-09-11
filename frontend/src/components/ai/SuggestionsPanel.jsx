"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { aiAPI } from "../../services/api"
import { setLoading } from "../../store/slices/uiSlice"
import {
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline"
import LoadingSpinner from "../ui/LoadingSpinner"
import { cn } from "../../lib/utils"

function SuggestionsPanel({
  text,
  language = "es",
  citationStyle = "apa",
  category = "essay",
  onSuggestionsGenerated,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const { suggestions: isLoading } = useSelector((state) => state.ui.loading)

  const generateSuggestions = async () => {
    if (!text || text.trim().length < 50) {
      setError("El texto debe tener al menos 50 caracteres para generar sugerencias")
      return
    }

    try {
      dispatch(setLoading({ key: "suggestions", value: true }))
      setError(null)

      const response = await aiAPI.generateSuggestions({
        text,
        language,
        citationStyle,
        category,
      })

      setSuggestions(response.data.suggestions)
      onSuggestionsGenerated?.(response.data.suggestions)
    } catch (err) {
      setError(err.response?.data?.message || "Error al generar sugerencias")
    } finally {
      dispatch(setLoading({ key: "suggestions", value: false }))
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
      case "medium":
        return <InformationCircleIcon className="w-5 h-5 text-yellow-500" />
      case "low":
        return <CheckCircleIcon className="w-5 h-5 text-blue-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-200 bg-red-50"
      case "medium":
        return "border-yellow-200 bg-yellow-50"
      case "low":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getCategoryLabel = (cat) => {
    const labels = {
      estructura: "Estructura",
      claridad: "Claridad",
      estilo: "Estilo",
      evidencia: "Evidencia",
      argumentación: "Argumentación",
    }
    return labels[cat] || cat
  }

  const groupedSuggestions = suggestions.reduce((groups, suggestion) => {
    const category = suggestion.category || "general"
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(suggestion)
    return groups
  }, {})

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <LightBulbIcon className="w-6 h-6 text-secondary" />
          <h3 className="text-lg font-serif font-semibold text-card-foreground">Sugerencias de Mejora</h3>
        </div>

        <button
          onClick={generateSuggestions}
          disabled={isLoading || !text}
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : <LightBulbIcon className="w-4 h-4" />}
          <span>{isLoading ? "Generando..." : "Generar Sugerencias"}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {suggestions.filter((s) => s.priority === "high").length}
                </p>
                <p className="text-sm text-muted-foreground">Alta Prioridad</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {suggestions.filter((s) => s.priority === "medium").length}
                </p>
                <p className="text-sm text-muted-foreground">Media Prioridad</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {suggestions.filter((s) => s.priority === "low").length}
                </p>
                <p className="text-sm text-muted-foreground">Baja Prioridad</p>
              </div>
            </div>
          </div>

          {/* Suggestions by Category */}
          {Object.entries(groupedSuggestions).map(([category, categorySuggestions]) => (
            <div key={category}>
              <h4 className="text-md font-semibold text-card-foreground mb-3 flex items-center">
                <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                {getCategoryLabel(category)} ({categorySuggestions.length})
              </h4>

              <div className="space-y-3">
                {categorySuggestions.map((suggestion, index) => (
                  <div key={index} className={cn("p-4 rounded-lg border", getPriorityColor(suggestion.priority))}>
                    <div className="flex items-start space-x-3">
                      {getPriorityIcon(suggestion.priority)}

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground capitalize">
                            {suggestion.priority} Prioridad
                          </span>
                        </div>

                        <h5 className="font-medium text-foreground mb-2">{suggestion.suggestion}</h5>

                        <p className="text-sm text-muted-foreground mb-3">{suggestion.explanation}</p>

                        {suggestion.example && (
                          <div className="bg-background p-3 rounded border-l-4 border-secondary">
                            <p className="text-xs text-muted-foreground mb-1">Ejemplo:</p>
                            <p className="text-sm text-foreground italic">{suggestion.example}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* General Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
              <LightBulbIcon className="w-4 h-4 mr-2" />
              Consejos Generales
            </h5>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
              <li>• Implementa las sugerencias de alta prioridad primero</li>
              <li>• Revisa la estructura general antes de los detalles</li>
              <li>• Asegúrate de que cada párrafo tenga una idea central clara</li>
              <li>• Utiliza conectores para mejorar la fluidez entre ideas</li>
              <li>• Revisa que las conclusiones se deriven lógicamente de los argumentos</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuggestionsPanel
