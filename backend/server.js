const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const compression = require("compression")
const rateLimit = require("express-rate-limit")
const path = require("path")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const documentRoutes = require("./routes/documents")
const reviewRoutes = require("./routes/reviews")
const aiRoutes = require("./routes/ai")
const statisticsRoutes = require("./routes/statistics")
const healthRoutes = require("./routes/health")

// Import middleware
const errorHandler = require("./middleware/errorHandler")
const logger = require("./utils/logger")

const app = express()

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' http://localhost:3000");
  next();
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
  },
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Compression middleware
app.use(compression())

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? ["https://yourdomain.com"] : ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Logging middleware
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
)

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    logger.info("Conectado a MongoDB exitosamente")
  })
  .catch((error) => {
    logger.error("Error conectando a MongoDB:", error)
    process.exit(1)
  })

// Routes
app.use("/api/health", healthRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/statistics", statisticsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Ruta no encontrada",
  })
})

// Error handling middleware
app.use(errorHandler)

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM recibido, cerrando servidor...")
  mongoose.connection.close(() => {
    logger.info("Conexión a MongoDB cerrada")
    process.exit(0)
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  logger.info(`Servidor ejecutándose en puerto ${PORT}`)
})

module.exports = app
