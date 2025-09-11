const express = require("express")
const Review = require("../models/Review")
const Document = require("../models/Document")
const { authenticate, authorize } = require("../middleware/auth")
const { validateObjectId, validatePagination } = require("../middleware/validation")
const { analyzeText } = require("../services/aiService")
const logger = require("../utils/logger")
const processReviewAsync = require("../services/processReviewAsync") // Declare the variable before using it

const router = express.Router()

// @route   POST /api/reviews/:documentId
// @desc    Create a new review for a document
// @access  Private
router.post("/:documentId", authenticate, validateObjectId("documentId"), async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId)

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Documento no encontrado",
      })
    }

    // Check if user owns the document or is admin/teacher
    if (
      req.user.role !== "admin" &&
      req.user.role !== "teacher" &&
      document.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para revisar este documento",
      })
    }

    // Check if document already has a pending review
    const existingReview = await Review.findOne({
      documentId: req.params.documentId,
      status: { $in: ["pending", "processing"] },
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "El documento ya tiene una revisión en proceso",
      })
    }

    // Create new review
    const review = new Review({
      documentId: req.params.documentId,
      userId: req.user._id,
      status: "pending",
      aiAnalysis: {
        model: "openai-gpt-4",
        processingTime: 0,
        confidence: 0,
      },
    })

    await review.save()

    // Update document status
    document.status = "processing"
    await document.save()

    // Start AI analysis (async)
    processReviewAsync(review._id, document)

    logger.info(`Nueva revisión creada para documento: ${document.title}`)

    res.status(201).json({
      success: true,
      message: "Revisión iniciada exitosamente",
      data: { review },
    })
  } catch (error) {
    logger.error("Error creando revisión:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/reviews
// @desc    Get user's reviews or all reviews (admin)
// @access  Private
router.get("/", authenticate, validatePagination, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const sort = req.query.sort || "-createdAt"
    const status = req.query.status || ""

    // Build query
    const query = {}
    if (req.user.role !== "admin") {
      query.userId = req.user._id
    }
    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const reviews = await Review.find(query)
      .populate("documentId", "title category academicLevel")
      .populate("userId", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments(query)

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    })
  } catch (error) {
    logger.error("Error obteniendo revisiones:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/reviews/:id
// @desc    Get review by ID
// @access  Private (owner or admin)
router.get("/:id", authenticate, validateObjectId("id"), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("documentId", "title content category academicLevel")
      .populate("userId", "name email")

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Revisión no encontrada",
      })
    }

    // Check authorization
    if (req.user.role !== "admin" && review.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a esta revisión",
      })
    }

    res.json({
      success: true,
      data: { review },
    })
  } catch (error) {
    logger.error("Error obteniendo revisión:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   PUT /api/reviews/:id/feedback
// @desc    Add feedback to a review
// @access  Private (owner only)
router.put("/:id/feedback", authenticate, validateObjectId("id"), async (req, res) => {
  try {
    const { isHelpful, rating, comments } = req.body

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Revisión no encontrada",
      })
    }

    // Check if user is the owner of the review
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para agregar feedback a esta revisión",
      })
    }

    // Update review with feedback
    review.isHelpful = isHelpful
    review.rating = rating
    review.comments = comments

    await review.save()

    logger.info(`Feedback agregado a revisión: ${review._id}`)

    res.json({
      success: true,
      message: "Feedback agregado exitosamente",
      data: { review },
    })
  } catch (error) {
    logger.error("Error agregando feedback:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

module.exports = router
