const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()

// Health check endpoint
router.get("/", (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage(),
  }

  try {
    res.status(200).json({
      success: true,
      data: healthCheck,
    })
  } catch (error) {
    healthCheck.message = error.message
    res.status(503).json({
      success: false,
      data: healthCheck,
    })
  }
})

module.exports = router
