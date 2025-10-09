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
    // ✅ CORREGIDO: Mantener nombre original + timestamp para evitar duplicados
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const originalName = path.parse(file.originalname).name // nombre sin extensión
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
    "application/octet-stream" // ← AGREGAR ESTO
  ]

  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt']
  const fileExtension = path.extname(file.originalname).toLowerCase()

  console.log("🔍 Validando archivo:", {
    nombre: file.originalname,
    mimeType: file.mimetype,
    extension: fileExtension,
    tamaño: file.size
  })

  // ✅ PERMITIR por MIME type O por extensión
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    console.log("✅ Archivo aceptado")
    cb(null, true)
  } else {
    console.log("❌ Archivo rechazado - Tipo no permitido")
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype} ${fileExtension}`), false)
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // ✅ CONFIGURACIÓN TEMPORAL MÁS PERMISIVA
    console.log("🔍 Archivo recibido:", {
      nombre: file.originalname,
      tipo: file.mimetype,
      tamaño: file.size
    });
    
    // Permitir cualquier archivo temporalmente para testing
    cb(null, true);
    
    /* 
    // Luego cambiar a esto:
    const allowed = [
      "application/pdf",
      "application/msword", 
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/octet-stream"
    ];
    
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo no permitido: ${file.mimetype}`), false);
    }
    */
  }
})

// @route   POST /api/documents
// @desc    Upload a new document
// @access  Private
router.post("/", authenticate, upload.array("documents", 10), validateDocumentUpload, async (req, res) => {
  try {
    console.log("📥 Request recibida - Archivos:", req.files?.length || 0);
    console.log("📥 Body:", req.body);
    console.log("📥 Headers:", req.headers);

    if (!req.files || req.files.length === 0) {
      console.log("❌ No se recibieron archivos");
      return res.status(400).json({
        success: false,
        message: "Archivo requerido",
      })
    }

    const results = []
    
    for (const file of req.files) {
      try {
        console.log(`📄 Procesando archivo: ${file.originalname}`);
        
        const { title, description, category, academicLevel, subject, citationStyle, tags } = req.body

        // Extraer texto para análisis
        const content = await extractTextFromFile(file.path, file.mimetype)

        // ✅ CORREGIDO: Crear URL pública correctamente
        const fileUrl = `${req.protocol}://${req.get('host')}/api/documents/file/${file.filename}`

        console.log("🔗 FileURL generado:", fileUrl);

        // Crear documento
        const document = new Document({
          title: title || file.originalname,
          description: description || `Documento subido: ${file.originalname}`,
          content,
          originalFileName: file.originalname,
          filePath: file.path,
          fileUrl, // ← ESTE CAMPO DEBERÍA GUARDARSE
          fileSize: file.size,
          fileType: path.extname(file.originalname).substring(1).toLowerCase(),
          userId: req.user._id,
          category: category || "essay",
          academicLevel: academicLevel || "undergraduate",
          subject: subject || "General",
          citationStyle: citationStyle || "apa",
          tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
        })

        console.log("💾 Guardando documento en BD...");
        await document.save()

        // DEBUG: Verificar qué se guardó realmente
          const docFromDB = await Document.findById(document._id).lean();
          console.log("🔍 DOCUMENTO EN BD:", {
            fileUrl: docFromDB.fileUrl,
            fileURL: docFromDB.fileURL, // Por si se guarda con mayúsculas
            campos: Object.keys(docFromDB).filter(key => key.includes('file'))
          });
        
        // Populate para tener datos completos
        const savedDocument = await Document.findById(document._id)
          .populate("userId", "name email")
        
        console.log("✅ Documento guardado:", {
          id: savedDocument._id,
          title: savedDocument.title,
          fileUrl: savedDocument.fileUrl, // ← VERIFICAR SI SE GUARDÓ
          filePath: savedDocument.filePath
        });
        const rawDoc = await Document.findById(document._id).lean();
console.log("📊 CAMPOS EN BD:", Object.keys(rawDoc).filter(key => key.includes('file')));

        results.push(savedDocument)

        logger.info(`Documento subido: ${document.title} por ${req.user.email}`)
      } catch (fileError) {
        console.error(`❌ Error procesando archivo ${file.originalname}:`, fileError);
        logger.error(`Error procesando archivo ${file.originalname}:`, fileError)
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
        results.push({ error: `Error procesando ${file.originalname}: ${fileError.message}` })
      }
    }

    // Actualizar estadísticas
    const successfulUploads = results.filter(r => !r.error).length
    if (successfulUploads > 0) {
      await req.user.updateOne({ $inc: { "statistics.documentsUploaded": successfulUploads } })
    }

    res.status(201).json({
      success: true,
      message: `${successfulUploads} documento(s) subido(s) exitosamente`,
      data: { 
        documents: results.filter(r => !r.error) 
      },
      errors: results.filter(r => r.error).map(r => r.error)
    })
  } catch (error) {
    // Limpiar archivos
    if (req.files) {
      req.files.forEach(file => {
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

// AGREGAR ESTE ENDPOINT AL BACKEND
// @route   GET /api/documents/file/:filename
// @desc    Get original file
// @access  Private
router.get("/file/:filename", authenticate, async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename);

    console.log("📁 Buscando archivo:", filePath);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Archivo no encontrado",
      });
    }

    // Buscar documento relacionado para verificar permisos
    const document = await Document.findOne({ 
      $or: [
        { filePath: filePath },
        { originalFileName: filename }
      ]
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado en la base de datos",
      });
    }

    // Verificar autorización
    if (req.user.role !== "admin" && document.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este archivo",
      });
    }

    // Determinar el tipo de contenido
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };

    const fileExtension = path.extname(filename).toLowerCase().substring(1);
    const mimeType = mimeTypes[fileExtension] || 'application/octet-stream';

    // Servir el archivo
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalFileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    logger.error("Error sirviendo archivo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
});

// Función auxiliar para obtener MIME type
function getMimeType(fileType) {
  const mimeMap = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain'
  }
  return mimeMap[fileType.toLowerCase()] || 'application/octet-stream'
}

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
