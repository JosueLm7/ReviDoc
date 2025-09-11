const express = require("express")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const Document = require("../models/Document")
const { authenticate, authorize, authorizeOwnerOrAdmin } = require("../middleware/auth")
const { validateDocumentUpload, validateObjectId, validatePagination } = require("../middleware/validation")
const { extractTextFromFile } = require("../services/fileProcessor")
const logger = require("../utils/logger")

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads")
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Tipo de archivo no permitido"), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
})

// @route   POST /api/documents
// @desc    Upload a new document
// @access  Private
router.post("/", authenticate, upload.single("document"), validateDocumentUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Archivo requerido",
      })
    }

    const { title, description, category, academicLevel, subject, citationStyle, tags } = req.body

    // Extract text from uploaded file
    const content = await extractTextFromFile(req.file.path, req.file.mimetype)

    // Create document
    const document = new Document({
      title,
      description,
      content,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      fileType: path.extname(req.file.originalname).substring(1).toLowerCase(),
      userId: req.user._id,
      category: category || "essay",
      academicLevel: academicLevel || "undergraduate",
      subject,
      citationStyle: citationStyle || "apa",
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
    })

    await document.save()

    // Update user statistics
    await req.user.updateOne({ $inc: { "statistics.documentsUploaded": 1 } })

    logger.info(`Documento subido: ${title} por ${req.user.email}`)

    res.status(201).json({
      success: true,
      message: "Documento subido exitosamente",
      data: { document },
    })
  } catch (error) {
    // Clean up uploaded file if document creation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    logger.error("Error subiendo documento:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/documents
// @desc    Get user's documents or all documents (admin)
// @access  Private
router.get("/", authenticate, validatePagination, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const sort = req.query.sort || "-createdAt"
    const status = req.query.status || ""
    const category = req.query.category || ""

    // Build query
    const query = {}
    if (req.user.role !== "admin") {
      query.userId = req.user._id
    }
    if (status) {
      query.status = status
    }
    if (category) {
      query.category = category
    }

    const skip = (page - 1) * limit

    const documents = await Document.find(query)
      .populate("userId", "name email")
      .populate("latestReview", "overallScore status createdAt")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Document.countDocuments(query)

    res.json({
      success: true,
      data: {
        documents,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    })
  } catch (error) {
    logger.error("Error obteniendo documentos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/documents/:id
// @desc    Get document by ID
// @access  Private (owner or admin)
router.get("/:id", authenticate, validateObjectId("id"), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id).populate("userId", "name email").populate("reviews")

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      })
    }

    // Check authorization
    if (req.user.role !== "admin" && document.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este documento",
      })
    }

    res.json({
      success: true,
      data: { document },
    })
  } catch (error) {
    logger.error("Error obteniendo documento:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   PUT /api/documents/:id
// @desc    Update document
// @access  Private (owner or admin)
router.put("/:id", authenticate, validateObjectId("id"), async (req, res) => {
  try {
    const { title, description, category, academicLevel, subject, citationStyle, tags } = req.body

    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      })
    }

    // Check authorization
    if (req.user.role !== "admin" && document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para modificar este documento",
      })
    }

    // Update fields
    if (title) document.title = title
    if (description) document.description = description
    if (category) document.category = category
    if (academicLevel) document.academicLevel = academicLevel
    if (subject) document.subject = subject
    if (citationStyle) document.citationStyle = citationStyle
    if (tags) document.tags = tags.split(",").map((tag) => tag.trim())

    await document.save()

    logger.info(`Documento actualizado: ${document.title}`)

    res.json({
      success: true,
      message: "Documento actualizado exitosamente",
      data: { document },
    })
  } catch (error) {
    logger.error("Error actualizando documento:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   DELETE /api/documents/:id
// @desc    Delete document
// @access  Private (owner or admin)
router.delete("/:id", authenticate, validateObjectId("id"), async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      })
    }

    // Check authorization
    if (req.user.role !== "admin" && document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar este documento",
      })
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath)
    }

    await document.deleteOne()

    logger.info(`Documento eliminado: ${document.title}`)

    res.json({
      success: true,
      message: "Documento eliminado exitosamente",
    })
  } catch (error) {
    logger.error("Error eliminando documento:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

module.exports = router
