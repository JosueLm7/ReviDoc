const logger = require("../utils/logger")

const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Recurso no encontrado"
    error = { message, statusCode: 404 }
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    const message = `El ${field} ya existe`
    error = { message, statusCode: 400 }
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = { message, statusCode: 400 }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Token inválido"
    error = { message, statusCode: 401 }
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expirado"
    error = { message, statusCode: 401 }
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "El archivo es demasiado grande"
    error = { message, statusCode: 400 }
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Tipo de archivo no permitido"
    error = { message, statusCode: 400 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Error interno del servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
