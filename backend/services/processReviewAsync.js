const Review = require("../models/Review")
const Document = require("../models/Document")
const User = require("../models/User")
const { analyzeText, detectPlagiarism } = require("./aiService")
const logger = require("../utils/logger")

/**
 * Process review asynchronously
 * @param {string} reviewId - Review ID to process
 * @param {object} document - Document object
 */
async function processReviewAsync(reviewId, document) {
  try {
    logger.info(`Iniciando procesamiento de revisión: ${reviewId}`)

    const review = await Review.findById(reviewId)
    if (!review) {
      throw new Error("Revisión no encontrada")
    }

    // Update review status to processing
    review.status = "processing"
    await review.save()

    const startTime = Date.now()

    // Perform AI analysis
    const analysis = await analyzeText(document.content, {
      language: document.language || "es",
      citationStyle: document.citationStyle || "apa",
      userId: document.userId,
    })

    // Perform plagiarism check
    const plagiarismResult = await detectPlagiarism(document.content, {
      language: document.language || "es",
      userId: document.userId,
    })

    const processingTime = Date.now() - startTime

    // Update review with results
    review.status = "completed"
    review.overallScore = calculateOverallScore(analysis.scores)
    review.scores = analysis.scores
    review.issues = analysis.issues
    review.summary = analysis.summary
    review.aiAnalysis = {
      model: analysis.metadata.model,
      processingTime,
      confidence: analysis.metadata.confidence,
      metadata: analysis.metadata,
    }
    review.plagiarismCheck = plagiarismResult

    await review.save()

    document.status = "completed"
    document.metadata.processingTime = processingTime
    document.metadata.aiModel = analysis.metadata.model
    document.metadata.confidence = analysis.metadata.confidence
    await document.save()

    // Update user statistics
    const user = await User.findById(document.userId)
    if (user) {
      user.statistics.reviewsReceived += 1
      user.statistics.averageScore =
        (user.statistics.averageScore * (user.statistics.reviewsReceived - 1) + review.overallScore) /
        user.statistics.reviewsReceived
      await user.save()
    }

    logger.info(`Revisión completada exitosamente: ${reviewId} en ${processingTime}ms`)

    // TODO: Send notification to user (integrate with n8n)
    // await sendNotification(user, review, document)
  } catch (error) {
    logger.error(`Error procesando revisión ${reviewId}:`, error)

    // Update review status to failed
    try {
      const review = await Review.findById(reviewId)
      if (review) {
        review.status = "failed"
        await review.save()
      }

      // Update document status
      const document = await Document.findById(review.documentId)
      if (document) {
        document.status = "failed"
        await document.save()
      }
    } catch (updateError) {
      logger.error("Error actualizando estado de revisión fallida:", updateError)
    }
  }
}

/**
 * Calculate overall score from individual scores
 */
function calculateOverallScore(scores) {
  const weights = {
    grammar: 0.25,
    spelling: 0.15,
    style: 0.2,
    coherence: 0.2,
    citation: 0.15,
    originality: 0.05,
  }

  let totalScore = 0
  let totalWeight = 0

  for (const [category, score] of Object.entries(scores)) {
    if (weights[category] && typeof score === "number") {
      totalScore += score * weights[category]
      totalWeight += weights[category]
    }
  }

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
}

module.exports = processReviewAsync