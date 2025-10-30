const express = require("express")
const User = require("../models/User")
const { authenticate } = require("../middleware/auth")
const { validateUserRegistration, validateUserLogin } = require("../middleware/validation")
const logger = require("../utils/logger")

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, role, institution, department } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe con este email",
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: role || "student",
      institution,
      department,
    })

    await user.save()

    // Generate token
    const token = user.generateAuthToken()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    logger.info(`Nuevo usuario registrado: ${email}`)

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: userResponse,
      token,
    })
  } catch (error) {
    logger.error("Error en registro:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      })
    }

    // Update last login
    await user.updateLastLogin()

    // Generate token
    const token = user.generateAuthToken()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    logger.info(`Usuario logueado: ${email}`)

    res.json({
      success: true,
      message: "Login exitoso",
      user: userResponse,
      token,
    })
  } catch (error) {
    logger.error("Error en login:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("documents", "title status createdAt").select("-password")

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    logger.error("Error obteniendo usuario actual:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { firstName, lastName, email, phone, bio, location, institution, department, preferences } = req.body

    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName
    if (email) user.email = email
    if (phone) user.phone = phone
    if (bio) user.bio = bio
    if (location) user.location = location
    if (institution) user.institution = institution
    if (department) user.department = department
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences }
    }

    await user.save()

    const userResponse = user.toObject()
    delete userResponse.password

    logger.info(`Perfil actualizado: ${user.email}`)

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: { user: userResponse },
    })
  } catch (error) {
    logger.error("Error actualizando perfil:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   PUT /api/auth/password
// @desc    Change user password
// @access  Private
router.put("/password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Contraseña actual y nueva son requeridas",
      })
    }

    const user = await User.findById(req.user._id).select("+password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      })
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Contraseña actual incorrecta",
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    logger.info(`Contraseña actualizada: ${user.email}`)

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    })
  } catch (error) {
    logger.error("Error cambiando contraseña:", error)
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authenticate, (req, res) => {
  logger.info(`Usuario deslogueado: ${req.user.email}`)

  res.json({
    success: true,
    message: "Logout exitoso",
  })
})

module.exports = router