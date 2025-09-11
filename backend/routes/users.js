const express = require("express")
const User = require("../models/User")
const { authenticate, authorize, authorizeOwnerOrAdmin } = require("../middleware/auth")
const { validateUserUpdate, validateObjectId, validatePagination } = require("../middleware/validation")
const logger = require("../utils/logger")

const router = express.Router()

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get("/", authenticate, authorize("admin"), validatePagination, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const sort = req.query.sort || "-createdAt"
    const search = req.query.search || ""
    const role = req.query.role || ""

    // Build query
    const query = {}
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { institution: { $regex: search, $options: "i" } },
      ]
    }
    if (role) {
      query.role = role
    }

    const skip = (page - 1) * limit

    const users = await User.find(query)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("documents", "title status createdAt")

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit,
        },
      },
    })
  } catch (error) {
    logger.error("Error obteniendo usuarios:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (own profile or admin)
router.get("/:id", authenticate, validateObjectId("id"), authorizeOwnerOrAdmin(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("documents", "title status createdAt overallScore")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    logger.error("Error obteniendo usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (own profile or admin)
router.put(
  "/:id",
  authenticate,
  validateObjectId("id"),
  validateUserUpdate,
  authorizeOwnerOrAdmin(),
  async (req, res) => {
    try {
      const { name, institution, department, preferences } = req.body

      const user = await User.findById(req.params.id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        })
      }

      // Update fields
      if (name) user.name = name
      if (institution) user.institution = institution
      if (department) user.department = department
      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences }
      }

      await user.save()

      const updatedUser = user.toObject()
      delete updatedUser.password

      logger.info(`Usuario actualizado: ${user.email}`)

      res.json({
        success: true,
        message: "Usuario actualizado exitosamente",
        data: { user: updatedUser },
      })
    } catch (error) {
      logger.error("Error actualizando usuario:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  },
)

// @route   DELETE /api/users/:id
// @desc    Deactivate user
// @access  Private/Admin
router.delete("/:id", authenticate, authorize("admin"), validateObjectId("id"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    user.isActive = false
    await user.save()

    logger.info(`Usuario desactivado: ${user.email}`)

    res.json({
      success: true,
      message: "Usuario desactivado exitosamente",
    })
  } catch (error) {
    logger.error("Error desactivando usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/users/:id/statistics
// @desc    Get user statistics
// @access  Private (own stats or admin)
router.get("/:id/statistics", authenticate, validateObjectId("id"), authorizeOwnerOrAdmin(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("statistics")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    res.json({
      success: true,
      data: { statistics: user.statistics },
    })
  } catch (error) {
    logger.error("Error obteniendo estadísticas de usuario:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

module.exports = router
