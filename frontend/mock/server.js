const jsonServer = require("json-server")
const server = jsonServer.create()
const router = jsonServer.router("db.json")
const middlewares = jsonServer.defaults()
const path = require("path")
const fs = require("fs")

// Configurar middlewares
server.use(middlewares)
server.use(jsonServer.bodyParser)

// Middleware para simular autenticación
server.use((req, res, next) => {
  // Agregar delay para simular latencia de red
  setTimeout(() => {
    // Permitir todas las peticiones sin autenticación en desarrollo
    console.log(`${req.method} ${req.url}`)
    next()
  }, 300)
})

// Endpoints personalizados

// POST /api/auth/login
server.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body
  const db = router.db
  const user = db.get("users").find({ email }).value()

  if (user && password === "password123") {
    res.json({
      token: "mock-jwt-token-" + user.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    })
  } else {
    res.status(401).json({ message: "Credenciales inválidas" })
  }
})

// POST /api/auth/register
server.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body
  const db = router.db
  const existingUser = db.get("users").find({ email }).value()

  if (existingUser) {
    return res.status(400).json({ message: "El usuario ya existe" })
  }

  const newUser = {
    id: String(Date.now()),
    email,
    name,
    role: "user",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  }

  db.get("users").push(newUser).write()

  res.status(201).json({
    token: "mock-jwt-token-" + newUser.id,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
    },
  })
})

// POST /api/auth/logout
server.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logout exitoso" })
})

// GET /api/auth/me
server.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: "No autorizado" })
  }

  const token = authHeader.replace("Bearer ", "")
  const userId = token.replace("mock-jwt-token-", "")
  const db = router.db
  const user = db.get("users").find({ id: userId }).value()

  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    })
  } else {
    res.status(401).json({ message: "Token inválido" })
  }
})

// POST /api/documents - Upload document
server.post("/api/documents", (req, res) => {
  const db = router.db
  const newDocument = {
    id: String(Date.now()),
    title: req.body.title || "Documento sin título",
    filename: `doc-${Date.now()}.pdf`,
    originalName: req.body.originalName || "documento.pdf",
    fileSize: Math.floor(Math.random() * 5000000) + 1000000,
    mimeType: "application/pdf",
    userId: req.body.userId || "2",
    status: "processing",
    uploadedAt: new Date().toISOString(),
    content: req.body.content || "Contenido del documento...",
    metadata: {
      pages: Math.floor(Math.random() * 50) + 10,
      wordCount: Math.floor(Math.random() * 10000) + 1000,
      language: "es",
    },
  }

  db.get("documents").push(newDocument).write()

  // Simular procesamiento asíncrono
  setTimeout(() => {
    db.get("documents")
      .find({ id: newDocument.id })
      .assign({
        status: "completed",
        processedAt: new Date().toISOString(),
      })
      .write()
  }, 3000)

  res.status(201).json(newDocument)
})

// POST /api/ai/analyze
server.post("/api/ai/analyze", (req, res) => {
  const { text, documentId } = req.body

  const analysis = {
    id: String(Date.now()),
    documentId,
    type: "text_analysis",
    createdAt: new Date().toISOString(),
    results: {
      readabilityScore: Math.floor(Math.random() * 30) + 70,
      sentimentScore: Math.random() * 0.5 + 0.5,
      keyPhrases: ["análisis de texto", "inteligencia artificial", "procesamiento de lenguaje", "resultados precisos"],
      summary: "Análisis completo del texto proporcionado con métricas de legibilidad y sentimiento.",
      wordCount: text ? text.split(" ").length : 1000,
      sentenceCount: text ? text.split(".").length : 50,
      paragraphCount: text ? text.split("\n\n").length : 10,
      averageWordsPerSentence: 20,
      complexityLevel: "intermediate",
    },
  }

  res.json(analysis)
})

// POST /api/ai/plagiarism
server.post("/api/ai/plagiarism", (req, res) => {
  const { text, documentId } = req.body

  const plagiarismCheck = {
    id: String(Date.now()),
    documentId,
    createdAt: new Date().toISOString(),
    overallSimilarity: Math.floor(Math.random() * 20) + 5,
    status: "completed",
    sources: [
      {
        url: "https://example.com/source-1",
        title: "Documento de referencia 1",
        similarity: Math.floor(Math.random() * 10) + 3,
        matchedText: "fragmento de texto coincidente",
      },
      {
        url: "https://example.com/source-2",
        title: "Documento de referencia 2",
        similarity: Math.floor(Math.random() * 8) + 2,
        matchedText: "otro fragmento similar",
      },
    ],
  }

  res.json(plagiarismCheck)
})

// POST /api/ai/suggestions
server.post("/api/ai/suggestions", (req, res) => {
  const { text, documentId } = req.body

  const suggestions = {
    id: String(Date.now()),
    documentId,
    createdAt: new Date().toISOString(),
    suggestions: [
      {
        type: "grammar",
        severity: "medium",
        text: "Se recomienda revisar la concordancia verbal",
        position: { start: 100, end: 150 },
        suggestion: "Cambiar el tiempo verbal para mantener consistencia",
      },
      {
        type: "style",
        severity: "low",
        text: "Considere usar un lenguaje más conciso",
        position: { start: 300, end: 400 },
        suggestion: "Simplificar la frase eliminando palabras innecesarias",
      },
      {
        type: "clarity",
        severity: "high",
        text: "Esta sección podría ser más clara",
        position: { start: 500, end: 600 },
        suggestion: "Reorganizar el párrafo para mejorar la comprensión",
      },
    ],
  }

  res.json(suggestions)
})

// GET /api/statistics/dashboard
server.get("/api/statistics/dashboard", (req, res) => {
  const db = router.db
  const stats = db.get("statistics").find({ id: "dashboard" }).value()
  res.json(stats.data)
})

// GET /api/statistics/trends
server.get("/api/statistics/trends", (req, res) => {
  const db = router.db
  const trends = db.get("statistics").find({ id: "trends" }).value()
  res.json(trends.data)
})

// Usar el router por defecto para el resto de endpoints
server.use("/api", router)

// Iniciar servidor
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Mock API Server corriendo en http://localhost:${PORT}`)
  console.log(`📊 Base de datos: mock/db.json`)
  console.log(`🔗 Endpoints disponibles:`)
  console.log(`   - POST http://localhost:${PORT}/api/auth/login`)
  console.log(`   - POST http://localhost:${PORT}/api/auth/register`)
  console.log(`   - GET  http://localhost:${PORT}/api/auth/me`)
  console.log(`   - GET  http://localhost:${PORT}/api/documents`)
  console.log(`   - POST http://localhost:${PORT}/api/documents`)
  console.log(`   - POST http://localhost:${PORT}/api/ai/analyze`)
  console.log(`   - POST http://localhost:${PORT}/api/ai/plagiarism`)
  console.log(`   - POST http://localhost:${PORT}/api/ai/suggestions`)
  console.log(`   - GET  http://localhost:${PORT}/api/statistics/dashboard`)
})
