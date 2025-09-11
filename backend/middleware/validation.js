const { body, param, query, validationResult } = require("express-validator")
const mongoose = require("mongoose")

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Errores de validación",
      errors: errors.array().map((error) => ({
        field: error.param,
        message: error.msg,
        value: error.value,
      })),
    })
  }

  next()
}

// User validation rules
const validateUserRegistration = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("email").isEmail().normalizeEmail().withMessage("Debe ser un email válido"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("La contraseña debe contener al menos una minúscula, una mayúscula y un número"),

  body("role").optional().isIn(["student", "teacher", "admin"]).withMessage("Rol inválido"),

  handleValidationErrors,
]

const validateUserLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Debe ser un email válido"),

  body("password").notEmpty().withMessage("La contraseña es requerida"),

  handleValidationErrors,
]

const validateUserUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("institution")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("La institución no puede exceder 200 caracteres"),

  body("department")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("El departamento no puede exceder 100 caracteres"),

  handleValidationErrors,
]

// Document validation rules
const validateDocumentUpload = [
  body("title").trim().isLength({ min: 1, max: 200 }).withMessage("El título debe tener entre 1 y 200 caracteres"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("La descripción no puede exceder 1000 caracteres"),

  body("category").optional().isIn(["essay", "thesis", "article", "report", "other"]).withMessage("Categoría inválida"),

  body("academicLevel")
    .optional()
    .isIn(["undergraduate", "graduate", "postgraduate", "phd"])
    .withMessage("Nivel académico inválido"),

  body("subject").optional().trim().isLength({ max: 100 }).withMessage("La materia no puede exceder 100 caracteres"),

  body("citationStyle").optional().isIn(["apa", "ieee", "mla", "chicago"]).withMessage("Estilo de citación inválido"),

  handleValidationErrors,
]

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("ID inválido")
    }
    return true
  }),

  handleValidationErrors,
]

// Pagination validation
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("La página debe ser un número entero mayor a 0"),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("El límite debe ser un número entre 1 y 100"),

  query("sort")
    .optional()
    .isIn(["createdAt", "-createdAt", "title", "-title", "status", "-status"])
    .withMessage("Ordenamiento inválido"),

  handleValidationErrors,
]

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateDocumentUpload,
  validateObjectId,
  validatePagination,
}
