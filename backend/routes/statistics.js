const express = require("express")
const Statistics = require("../models/Statistics")
const User = require("../models/User")
const Document = require("../models/Document")
const Review = require("../models/Review")
const { authenticate, authorize } = require("../middleware/auth")
const { validatePagination } = require("../middleware/validation")
const logger = require("../utils/logger")

const router = express.Router()

// @route   GET /api/statistics/dashboard
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get("/dashboard", authenticate, authorize("admin"), async (req, res) => {
  try {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get current statistics
    const [totalUsers, activeUsers, totalDocuments, totalReviews, pendingReviews] = await Promise.all([
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, lastLogin: { $gte: lastWeek } }),
      Document.countDocuments(),
      Review.countDocuments(),
      Review.countDocuments({ status: { $in: ["pending", "processing"] } }),
    ])

    // Get growth statistics
    const [newUsersThisWeek, newDocumentsThisWeek, newReviewsThisWeek] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      Document.countDocuments({ createdAt: { $gte: lastWeek } }),
      Review.countDocuments({ createdAt: { $gte: lastWeek } }),
    ])

    // Get average scores
    const avgScoreResult = await Review.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, avgScore: { $avg: "$overallScore" } } },
    ])

    const averageScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0

    // Get issue distribution
    const issueDistribution = await Review.aggregate([
      { $match: { status: "completed" } },
      { $unwind: "$issues" },
      { $group: { _id: "$issues.type", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Get user role distribution
    const userRoleDistribution = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ])

    // Get document category distribution
    const documentCategoryDistribution = await Document.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const dashboardStats = {
      overview: {
        totalUsers,
        activeUsers,
        totalDocuments,
        totalReviews,
        pendingReviews,
        averageScore: Math.round(averageScore * 100) / 100,
      },
      growth: {
        newUsersThisWeek,
        newDocumentsThisWeek,
        newReviewsThisWeek,
      },
      distributions: {
        issues: issueDistribution,
        userRoles: userRoleDistribution,
        documentCategories: documentCategoryDistribution,
      },
    }

    res.json({
      success: true,
      data: { statistics: dashboardStats },
    })
  } catch (error) {
    logger.error("Error obteniendo estadísticas del dashboard:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/statistics/trends
// @desc    Get trend statistics
// @access  Private/Admin
router.get("/trends", authenticate, authorize("admin"), validatePagination, async (req, res) => {
  try {
    const days = Number.parseInt(req.query.days) || 30
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get daily statistics
    const dailyStats = await Statistics.find({
      date: { $gte: startDate },
    })
      .sort({ date: 1 })
      .limit(days)

    // If no statistics exist, generate them
    if (dailyStats.length === 0) {
      await generateDailyStatistics(startDate, new Date())
      const newDailyStats = await Statistics.find({
        date: { $gte: startDate },
      })
        .sort({ date: 1 })
        .limit(days)

      return res.json({
        success: true,
        data: { trends: newDailyStats },
      })
    }

    res.json({
      success: true,
      data: { trends: dailyStats },
    })
  } catch (error) {
    logger.error("Error obteniendo tendencias:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/statistics/users
// @desc    Get user statistics
// @access  Private/Admin
router.get("/users", authenticate, authorize("admin"), async (req, res) => {
  try {
    // Most active users
    const mostActiveUsers = await User.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "documents",
          localField: "_id",
          foreignField: "userId",
          as: "documents",
        },
      },
      {
        $addFields: {
          documentCount: { $size: "$documents" },
        },
      },
      { $sort: { documentCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          documentCount: 1,
          lastLogin: 1,
          createdAt: 1,
        },
      },
    ])

    // User registration trends
    const registrationTrends = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ])

    res.json({
      success: true,
      data: {
        mostActiveUsers,
        registrationTrends,
      },
    })
  } catch (error) {
    logger.error("Error obteniendo estadísticas de usuarios:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   POST /api/statistics/generate
// @desc    Generate statistics for a date range
// @access  Private/Admin
router.post("/generate", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { startDate, endDate } = req.body

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Fechas de inicio y fin son requeridas",
      })
    }

    await generateDailyStatistics(new Date(startDate), new Date(endDate))

    logger.info(`Estadísticas generadas desde ${startDate} hasta ${endDate}`)

    res.json({
      success: true,
      message: "Estadísticas generadas exitosamente",
    })
  } catch (error) {
    logger.error("Error generando estadísticas:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// Helper function to generate daily statistics
async function generateDailyStatistics(startDate, endDate) {
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const nextDate = new Date(currentDate)
    nextDate.setDate(nextDate.getDate() + 1)

    // Check if statistics already exist for this date
    const existingStats = await Statistics.findOne({
      date: {
        $gte: currentDate,
        $lt: nextDate,
      },
    })

    if (!existingStats) {
      // Generate statistics for this date
      const [users, documents, reviews] = await Promise.all([
        User.aggregate([
          {
            $facet: {
              total: [{ $match: { createdAt: { $lte: currentDate } } }, { $count: "count" }],
              new: [
                {
                  $match: {
                    createdAt: { $gte: currentDate, $lt: nextDate },
                  },
                },
                { $count: "count" },
              ],
              byRole: [
                { $match: { createdAt: { $lte: currentDate } } },
                { $group: { _id: "$role", count: { $sum: 1 } } },
              ],
            },
          },
        ]),
        Document.aggregate([
          {
            $facet: {
              total: [{ $match: { createdAt: { $lte: currentDate } } }, { $count: "count" }],
              uploaded: [
                {
                  $match: {
                    createdAt: { $gte: currentDate, $lt: nextDate },
                  },
                },
                { $count: "count" },
              ],
              byCategory: [
                { $match: { createdAt: { $lte: currentDate } } },
                { $group: { _id: "$category", count: { $sum: 1 } } },
              ],
            },
          },
        ]),
        Review.aggregate([
          {
            $facet: {
              total: [{ $match: { createdAt: { $lte: currentDate } } }, { $count: "count" }],
              completed: [
                {
                  $match: {
                    createdAt: { $gte: currentDate, $lt: nextDate },
                    status: "completed",
                  },
                },
                { $count: "count" },
              ],
              avgScore: [
                {
                  $match: {
                    createdAt: { $lte: currentDate },
                    status: "completed",
                  },
                },
                { $group: { _id: null, avg: { $avg: "$overallScore" } } },
              ],
            },
          },
        ]),
      ])

      const statsData = {
        date: currentDate,
        users: {
          total: users[0].total[0]?.count || 0,
          new: users[0].new[0]?.count || 0,
          byRole: {
            students: users[0].byRole.find((r) => r._id === "student")?.count || 0,
            teachers: users[0].byRole.find((r) => r._id === "teacher")?.count || 0,
            admins: users[0].byRole.find((r) => r._id === "admin")?.count || 0,
          },
        },
        documents: {
          total: documents[0].total[0]?.count || 0,
          uploaded: documents[0].uploaded[0]?.count || 0,
          byCategory: {
            essay: documents[0].byCategory.find((c) => c._id === "essay")?.count || 0,
            thesis: documents[0].byCategory.find((c) => c._id === "thesis")?.count || 0,
            article: documents[0].byCategory.find((c) => c._id === "article")?.count || 0,
            report: documents[0].byCategory.find((c) => c._id === "report")?.count || 0,
            other: documents[0].byCategory.find((c) => c._id === "other")?.count || 0,
          },
        },
        reviews: {
          total: reviews[0].total[0]?.count || 0,
          completed: reviews[0].completed[0]?.count || 0,
          averageScore: reviews[0].avgScore[0]?.avg || 0,
        },
      }

      await Statistics.create(statsData)
    }

    currentDate.setDate(currentDate.getDate() + 1)
  }
}

module.exports = router
