const jwt = require("jsonwebtoken")
const User = require("../models/User")
const logger = require("../utils/logger")

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      })
    }

    const token = authHeader.substring(7)

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select("-password")

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Usuario no encontrado o inactivo",
      })
    }

    req.user = user
    next()
  } catch (error) {
    logger.error("Error en autenticación:", error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
      })
    }

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}

// Check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este recurso",
      })
    }

    next()
  }
}

// Check if user owns resource or is admin
const authorizeOwnerOrAdmin = (resourceUserField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      })
    }

    // Admin can access everything
    if (req.user.role === "admin") {
      return next()
    }

    // Check if user owns the resource
    const resourceUserId = req.resource ? req.resource[resourceUserField] : req.params.userId

    if (resourceUserId && resourceUserId.toString() === req.user._id.toString()) {
      return next()
    }

    res.status(403).json({
      success: false,
      message: "No tienes permisos para acceder a este recurso",
    })
  }
}

module.exports = {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin,
}
