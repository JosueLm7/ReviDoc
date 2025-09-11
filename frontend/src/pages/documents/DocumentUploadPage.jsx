"use client"

import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { CloudArrowUpIcon, DocumentTextIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { uploadDocument } from "../../store/slices/documentsSlice"

function DocumentUploadPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      const validTypes = [
        "text/plain",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024 // 10MB limit
    })

    setFiles((prev) => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const newProgress = {}

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        newProgress[i] = 0
        setUploadProgress({ ...newProgress })

        const formData = new FormData()
        formData.append("file", file)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          newProgress[i] = Math.min(newProgress[i] + 10, 90)
          setUploadProgress({ ...newProgress })
        }, 200)

        try {
          await dispatch(uploadDocument(formData)).unwrap()
          clearInterval(progressInterval)
          newProgress[i] = 100
          setUploadProgress({ ...newProgress })
        } catch (error) {
          clearInterval(progressInterval)
          console.error("Error uploading file:", error)
        }
      }

      // Redirect to documents page after successful upload
      setTimeout(() => {
        navigate("/documents")
      }, 1000)
    } catch (error) {
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("word") || type.includes("document")) return "📝"
    return "📄"
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate("/documents")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Volver a Documentos
            </button>
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Subir Documentos</h1>
          <p className="text-muted-foreground mt-2">Sube tus documentos académicos para análisis y revisión con IA</p>
        </div>

        {/* Upload Area */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
              Arrastra y suelta tus archivos aquí
            </h3>
            <p className="text-muted-foreground mb-6">o haz clic para seleccionar archivos</p>

            <input
              type="file"
              multiple
              onChange={handleChange}
              accept=".txt,.pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors"
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Seleccionar Archivos</span>
            </label>

            <div className="mt-4 text-sm text-muted-foreground">
              <p>Formatos soportados: TXT, PDF, DOC, DOCX</p>
              <p>Tamaño máximo: 10MB por archivo</p>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-8">
              <h4 className="font-serif font-semibold text-foreground mb-4">Archivos seleccionados ({files.length})</h4>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(file.type)}</span>
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {uploading && uploadProgress[index] !== undefined && (
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-border rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[index]}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{uploadProgress[index]}%</span>
                        </div>
                      )}

                      {!uploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setFiles([])}
                  disabled={uploading}
                  className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  Limpiar Todo
                </button>
                <button
                  onClick={handleUpload}
                  disabled={files.length === 0 || uploading}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Subiendo..." : `Subir ${files.length} archivo${files.length > 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h4 className="font-serif font-semibold text-foreground mb-4">Consejos para mejores resultados</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Asegúrate de que el texto esté bien estructurado con párrafos claros</li>
            <li>• Los documentos en formato TXT proporcionan los mejores resultados de análisis</li>
            <li>• Incluye referencias y citas para un análisis más completo</li>
            <li>• Los documentos más largos (500+ palabras) obtienen análisis más detallados</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default DocumentUploadPage
