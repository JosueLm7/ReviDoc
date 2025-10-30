"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { DocumentTextIcon, CloudArrowUpIcon, SparklesIcon } from "@heroicons/react/24/outline"
import AIToolbar from "../../components/ai/AIToolbar"
import ChatBot from "../../components/ai/ChatBot"
import { fetchDocumentById, updateDocument } from "../../store/slices/documentsSlice"

function DocumentEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { currentDocument, loading } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth)

  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [showChatBot, setShowChatBot] = useState(false)

  useEffect(() => {
    if (id && id !== "new") {
      dispatch(fetchDocumentById(id))
    }
  }, [id, dispatch])

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title)
      setContent(currentDocument.content)
    }
  }, [currentDocument])

  // Auto-save functionality
  useEffect(() => {
    if (!title && !content) return

    const autoSave = setTimeout(async () => {
      await handleSave(true)
    }, 5000) // Auto-save every 5 seconds

    return () => clearTimeout(autoSave)
  }, [title, content])

  const handleSave = async (isAutoSave = false) => {
    if (!title.trim()) return
  
    setIsSaving(true)
    try {
      const documentData = {
        title: title.trim(),
        content,
        ...(id === "new" ? {} : { id }),
      }
  
      // Cambia esta línea para enviar { id, data }
      if (id === "new") {
        // Para nuevo documento, no hay id todavía
        await dispatch(updateDocument({ data: documentData })).unwrap()
      } else {
        // Para documento existente
        await dispatch(updateDocument({ id, data: documentData })).unwrap()
      }
      
      setLastSaved(new Date())
  
      if (id === "new") {
        // Esto probablemente también necesite ajustarse
        navigate(`/documents/${documentData.id}`, { replace: true })
      }
    } catch (error) {
      console.error("Error saving document:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const element = document.createElement("a")
    const file = new Blob([content], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${title || "documento"}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (loading && id !== "new") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/app/documents`)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver
            </button>
            <DocumentTextIcon className="w-6 h-6 text-primary" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del documento"
              className="text-xl font-serif font-semibold bg-transparent border-none outline-none text-card-foreground placeholder-muted-foreground"
            />
          </div>

          <div className="flex items-center space-x-4">
            {lastSaved && (
              <span className="text-sm text-muted-foreground">Guardado {lastSaved.toLocaleTimeString()}</span>
            )}

            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <CloudArrowUpIcon className="w-4 h-4" />
              <span>{isSaving ? "Guardando..." : "Guardar"}</span>
            </button>

            <button
              onClick={handleExport}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Editor */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Content Editor */}
            <div className="bg-card border border-border rounded-lg p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comienza a escribir tu documento académico..."
                className="w-full h-96 bg-transparent border-none outline-none resize-none text-foreground placeholder-muted-foreground leading-relaxed"
                style={{ fontFamily: "Source Sans Pro, sans-serif" }}
              />
            </div>

            {/* AI Toolbar */}
            <AIToolbar text={content} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-card border-l border-border p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-serif font-semibold text-card-foreground mb-4">Estadísticas del Documento</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Palabras:</span>
                  <span>{content.split(/\s+/).filter((word) => word.length > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Caracteres:</span>
                  <span>{content.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Párrafos:</span>
                  <span>{content.split("\n\n").filter((p) => p.trim().length > 0).length}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif font-semibold text-card-foreground mb-4">Herramientas Rápidas</h3>
              <button
                onClick={() => setShowChatBot(true)}
                className="w-full flex items-center space-x-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <SparklesIcon className="w-5 h-5" />
                <span>Asistente IA</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ChatBot */}
      <ChatBot isOpen={showChatBot} onClose={() => setShowChatBot(false)} />
    </div>
  )
}

export default DocumentEditorPage
