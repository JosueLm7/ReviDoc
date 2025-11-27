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
    const originalName = path.parse(file.originalname).name
    const extension = path.extname(file.originalname)
    cb(null, `${originalName}-${uniqueSuffix}${extension}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/octet-stream",
  ]

  const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"]
  const fileExtension = path.extname(file.originalname).toLowerCase()

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype} ${fileExtension}`), false)
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    cb(null, true)
  },
})

// @route   POST /api/documents
// @desc    Upload a new document
// @access  Private
router.post("/", authenticate, upload.array("documents", 10), validateDocumentUpload, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Archivo requerido",
      })
    }

    const results = []

    for (const file of req.files) {
      try {
        const { title, description, category, academicLevel, subject, citationStyle, tags } = req.body

        const content = await extractTextFromFile(file.path, file.mimetype)

        const publicUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/documents/file/${path.basename(file.path)}`

        const document = new Document({
          title: title || file.originalname,
          description: description || `Documento subido: ${file.originalname}`,
          content,
          originalFileName: file.originalname,
          filePath: file.path,
          fileUrl: publicUrl,
          fileSize: file.size,
          fileType: path.extname(file.originalname).substring(1).toLowerCase(),
          userId: req.user._id,
          category: category || "essay",
          academicLevel: academicLevel || "undergraduate",
          subject: subject || "General",
          citationStyle: citationStyle || "apa",
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        })

        await document.save()

        const savedDocument = await Document.findById(document._id).populate("userId", "name email")

        results.push(savedDocument)

        logger.info(`Documento subido: ${document.title} por ${req.user.email}`)
      } catch (fileError) {
        logger.error(`Error procesando archivo ${file.originalname}:`, fileError)
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        results.push({ error: `Error procesando ${file.originalname}: ${fileError.message}` })
      }
    }

    const successfulUploads = results.filter((r) => !r.error).length
    if (successfulUploads > 0) {
      await req.user.updateOne({ $inc: { "statistics.documentsUploaded": successfulUploads } })
    }

    res.status(201).json({
      success: true,
      message: `${successfulUploads} documento(s) subido(s) exitosamente`,
      data: {
        documents: results.filter((r) => !r.error),
      },
      errors: results.filter((r) => r.error).map((r) => r.error),
    })
  } catch (error) {
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      })
    }

    logger.error("Error subiendo documentos:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor: " + error.message,
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

// @route   GET /api/documents/file/:filename
// @desc    Get original file
// @access  Private
router.get("/file/:filename", authenticate, async (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(__dirname, "../uploads", filename)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado",
      })
    }

    const document = await Document.findOne({
      $or: [{ filePath: filePath }, { originalFileName: filename }],
    })

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado en la base de datos",
      })
    }

    if (req.user.role !== "admin" && document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este archivo",
      })
    }

    const mimeTypes = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
    }

    const fileExtension = path.extname(filename).toLowerCase().substring(1)
    const mimeType = mimeTypes[fileExtension] || "application/octet-stream"

    res.setHeader("Content-Type", mimeType)
    res.setHeader("Content-Disposition", `inline; filename="${document.originalFileName}"`)
    res.setHeader("Cache-Control", "public, max-age=3600")

    const fileStream = fs.createReadStream(filePath)
    fileStream.on("error", (error) => {
      logger.error("Error leyendo archivo:", error)
      res.status(500).json({
        success: false,
        message: "Error al leer el archivo",
      })
    })
    fileStream.pipe(res)
  } catch (error) {
    logger.error("Error sirviendo archivo:", error)
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
    const document = await Document.findById(req.params.id).populate("userId", "name email").populate({
      path: "reviews",
      model: "Review",
      select: "status overallScore scores summary createdAt type",
    })

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      })
    }

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

    if (req.user.role !== "admin" && document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para modificar este documento",
      })
    }

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

    if (req.user.role !== "admin" && document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para eliminar este documento",
      })
    }

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