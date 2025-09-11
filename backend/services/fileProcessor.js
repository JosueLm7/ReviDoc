const fs = require("fs")
const path = require("path")
const pdfParse = require("pdf-parse")
const mammoth = require("mammoth")
const logger = require("../utils/logger")

/**
 * Extract text content from uploaded files
 * @param {string} filePath - Path to the uploaded file
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Extracted text content
 */
async function extractTextFromFile(filePath, mimeType) {
  try {
    switch (mimeType) {
      case "application/pdf":
        return await extractFromPDF(filePath)

      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return await extractFromWord(filePath)

      case "text/plain":
        return await extractFromText(filePath)

      default:
        throw new Error(`Tipo de archivo no soportado: ${mimeType}`)
    }
  } catch (error) {
    logger.error(`Error extrayendo texto de ${filePath}:`, error)
    throw new Error("Error procesando el archivo")
  }
}

/**
 * Extract text from PDF files
 */
async function extractFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath)
    const data = await pdfParse(dataBuffer)

    if (!data.text || data.text.trim().length === 0) {
      throw new Error("No se pudo extraer texto del PDF")
    }

    return cleanExtractedText(data.text)
  } catch (error) {
    logger.error("Error extrayendo texto de PDF:", error)
    throw new Error("Error procesando archivo PDF")
  }
}

/**
 * Extract text from Word documents
 */
async function extractFromWord(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath })

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("No se pudo extraer texto del documento Word")
    }

    if (result.messages && result.messages.length > 0) {
      logger.warn("Advertencias al procesar Word:", result.messages)
    }

    return cleanExtractedText(result.value)
  } catch (error) {
    logger.error("Error extrayendo texto de Word:", error)
    throw new Error("Error procesando documento Word")
  }
}

/**
 * Extract text from plain text files
 */
async function extractFromText(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")

    if (!content || content.trim().length === 0) {
      throw new Error("El archivo de texto está vacío")
    }

    return cleanExtractedText(content)
  } catch (error) {
    logger.error("Error leyendo archivo de texto:", error)
    throw new Error("Error procesando archivo de texto")
  }
}

/**
 * Clean and normalize extracted text
 */
function cleanExtractedText(text) {
  return (
    text
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, "")
      // Normalize line breaks
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // Remove excessive line breaks
      .replace(/\n{3,}/g, "\n\n")
      // Trim whitespace
      .trim()
  )
}

/**
 * Validate file before processing
 */
function validateFile(filePath, mimeType, maxSize = 10 * 1024 * 1024) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error("Archivo no encontrado")
    }

    // Check file size
    const stats = fs.statSync(filePath)
    if (stats.size > maxSize) {
      throw new Error(`Archivo demasiado grande. Máximo permitido: ${maxSize / 1024 / 1024}MB`)
    }

    // Check MIME type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]

    if (!allowedTypes.includes(mimeType)) {
      throw new Error("Tipo de archivo no permitido")
    }

    return true
  } catch (error) {
    logger.error("Error validando archivo:", error)
    throw error
  }
}

/**
 * Get file metadata
 */
function getFileMetadata(filePath) {
  try {
    const stats = fs.statSync(filePath)
    const ext = path.extname(filePath).toLowerCase()

    return {
      size: stats.size,
      extension: ext,
      created: stats.birthtime,
      modified: stats.mtime,
      isReadable: fs.constants.R_OK,
    }
  } catch (error) {
    logger.error("Error obteniendo metadatos del archivo:", error)
    throw new Error("Error accediendo al archivo")
  }
}

module.exports = {
  extractTextFromFile,
  validateFile,
  getFileMetadata,
  cleanExtractedText,
}
