const express = require("express")
const { authenticate } = require("../middleware/auth")
const { analyzeText, detectPlagiarism, generateSuggestions } = require("../services/aiService")
const { body, validationResult } = require("express-validator")
const logger = require("../utils/logger")

const router = express.Router()

// Validation middleware for AI requests
const validateAIRequest = [
  body("text")
    .notEmpty()
    .withMessage("El texto es requerido")
    .isLength({ min: 10 })
    .withMessage("El texto debe tener al menos 10 caracteres"),
  body("language").optional().isIn(["es", "en"]).withMessage("Idioma inválido"),
  body("citationStyle").optional().isIn(["apa", "ieee", "mla", "chicago"]).withMessage("Estilo de citación inválido"),
]

// @route   POST /api/ai/analyze
// @desc    Analyze text with AI
// @access  Private
router.post("/analyze", authenticate, validateAIRequest, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Errores de validación",
        errors: errors.array(),
      })
    }

    const { text, language = "es", citationStyle = "apa" } = req.body

    const startTime = Date.now()

    // Perform AI analysis
    const analysis = await analyzeText(text, {
      language,
      citationStyle,
      userId: req.user._id,
    })

    const processingTime = Date.now() - startTime

    logger.info(`Análisis de IA completado en ${processingTime}ms para usuario: ${req.user.email}`)

    res.json({
      success: true,
      message: "Análisis completado exitosamente",
      data: {
        analysis,
        processingTime,
        metadata: {
          textLength: text.length,
          wordCount: text.split(/\s+/).length,
          language,
          citationStyle,
        },
      },
    })
  } catch (error) {
    logger.error("Error en análisis de IA:", error)
    res.status(500).json({
      success: false,
      message: "Error procesando el análisis",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// @route   POST /api/ai/plagiarism
// @desc    Check for plagiarism
// @access  Private
router.post("/plagiarism", authenticate, validateAIRequest, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Errores de validación",
        errors: errors.array(),
      })
    }

    const { text, language = "es" } = req.body

    const startTime = Date.now()

    // Perform plagiarism detection
    const plagiarismResult = await detectPlagiarism(text, {
      language,
      userId: req.user._id,
    })

    const processingTime = Date.now() - startTime

    logger.info(`Detección de plagio completada en ${processingTime}ms para usuario: ${req.user.email}`)

    res.json({
      success: true,
      message: "Detección de plagio completada",
      data: {
        plagiarismResult,
        processingTime,
        metadata: {
          textLength: text.length,
          wordCount: text.split(/\s+/).length,
          language,
        },
      },
    })
  } catch (error) {
    logger.error("Error en detección de plagio:", error)
    res.status(500).json({
      success: false,
      message: "Error procesando la detección de plagio",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// @route   POST /api/ai/suggestions
// @desc    Generate improvement suggestions
// @access  Private
router.post("/suggestions", authenticate, validateAIRequest, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Errores de validación",
        errors: errors.array(),
      })
    }

    const { text, language = "es", citationStyle = "apa", category = "essay" } = req.body

    const startTime = Date.now()

    // Generate suggestions
    const suggestions = await generateSuggestions(text, {
      language,
      citationStyle,
      category,
      userId: req.user._id,
    })

    const processingTime = Date.now() - startTime

    logger.info(`Sugerencias generadas en ${processingTime}ms para usuario: ${req.user.email}`)

    res.json({
      success: true,
      message: "Sugerencias generadas exitosamente",
      data: {
        suggestions,
        processingTime,
        metadata: {
          textLength: text.length,
          wordCount: text.split(/\s+/).length,
          language,
          citationStyle,
          category,
        },
      },
    })
  } catch (error) {
    logger.error("Error generando sugerencias:", error)
    res.status(500).json({
      success: false,
      message: "Error generando sugerencias",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// @route   GET /api/ai/models
// @desc    Get available AI models
// @access  Private
router.get("/models", authenticate, (req, res) => {
  try {
    const models = [
      {
        id: "gemini-2.5-flash",
        name: "flash-2.5",
        provider: "GeminiAI",
        capabilities: ["grammar", "style", "coherence", "suggestions"],
        languages: ["es", "en"],
        description: "Modelo avanzado para análisis completo de texto",
      },
      {
        id: "huggingface-bert",
        name: "BERT",
        provider: "Hugging Face",
        capabilities: ["grammar", "classification"],
        languages: ["es", "en"],
        description: "Modelo especializado en análisis gramatical",
      },
      {
        id: "natural-js",
        name: "Natural.js",
        provider: "Local",
        capabilities: ["tokenization", "sentiment", "classification"],
        languages: ["en"],
        description: "Procesamiento de lenguaje natural local",
      },
    ]

    res.json({
      success: true,
      data: { models },
    })
  } catch (error) {
    logger.error("Error obteniendo modelos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

module.exports = router
