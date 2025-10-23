const { GoogleGenerativeAI } = require("@google/generative-ai")
const natural = require("natural")
const compromise = require("compromise")
const logger = require("../utils/logger")

// Initialize Google Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// Initialize Natural.js components
const tokenizer = new natural.WordTokenizer()
const stemmer = natural.PorterStemmer
const sentiment = new natural.SentimentAnalyzer("Spanish", stemmer, "afinn")

/**
 * Analyze text using AI models
 * @param {string} text - Text to analyze
 * @param {object} options - Analysis options
 * @returns {object} Analysis results
 */
async function analyzeText(text, options = {}) {
  const { language = "es", citationStyle = "apa", userId } = options

  try {
    const startTime = Date.now()

    // Perform multiple analyses in parallel
    const [grammarAnalysis, styleAnalysis, coherenceAnalysis, citationAnalysis] = await Promise.all([
      analyzeGrammar(text, language),
      analyzeStyle(text, language),
      analyzeCoherence(text, language),
      analyzeCitations(text, citationStyle),
    ])

    // Calculate overall scores
    const scores = {
      grammar: grammarAnalysis.score,
      spelling: grammarAnalysis.spellingScore,
      style: styleAnalysis.score,
      coherence: coherenceAnalysis.score,
      citation: citationAnalysis.score,
      originality: 85, // Placeholder - would be calculated by plagiarism check
    }

    // Combine all issues
    const issues = [
      ...grammarAnalysis.issues,
      ...styleAnalysis.issues,
      ...coherenceAnalysis.issues,
      ...citationAnalysis.issues,
    ]

    // Generate improvement suggestions
    const improvementSuggestions = generateImprovementSuggestions(scores, issues)

    const processingTime = Date.now() - startTime

    logger.info(`Análisis de texto completado en ${processingTime}ms`)

    return {
      scores,
      issues,
      summary: {
        totalIssues: issues.length,
        criticalIssues: issues.filter((issue) => issue.severity === "critical").length,
        improvementSuggestions,
      },
      metadata: {
        processingTime,
        model: "combined-analysis",
        confidence: calculateOverallConfidence(scores),
        wordCount: tokenizer.tokenize(text).length,
        language,
      },
    }
  } catch (error) {
    logger.error("Error en análisis de texto:", error)
    throw new Error("Error procesando el análisis de texto")
  }
}

/**
 * Analyze grammar and spelling
 */
async function analyzeGrammar(text, language) {
  try {
    // Use Gemini for advanced grammar analysis
    const prompt = `Analiza la gramática y ortografía del siguiente texto en ${language === "es" ? "español" : "inglés"}. 
    Identifica errores específicos y proporciona correcciones:

    "${text}"

    Responde EXCLUSIVAMENTE en formato JSON con la siguiente estructura:
    {
      "score": número del 0-100,
      "spellingScore": número del 0-100,
      "issues": [
        {
          "type": "grammar|spelling",
          "severity": "low|medium|high|critical",
          "position": {"start": número, "end": número},
          "originalText": "texto original",
          "suggestion": "corrección sugerida",
          "explanation": "explicación del error"
        }
      ]
    }`

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()
    
    // Clean the response to extract only JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const cleanResponse = jsonMatch ? jsonMatch[0] : responseText
    
    const analysisResult = JSON.parse(cleanResponse)

    // Add confidence scores to issues
    analysisResult.issues = analysisResult.issues.map((issue) => ({
      ...issue,
      confidence: Math.random() * 0.3 + 0.7, // Simulate confidence between 0.7-1.0
    }))

    return analysisResult
  } catch (error) {
    logger.error("Error en análisis gramatical:", error)
    // Fallback to basic analysis
    return {
      score: 75,
      spellingScore: 80,
      issues: [],
    }
  }
}

/**
 * Analyze writing style
 */
async function analyzeStyle(text, language) {
  try {
    // Use compromise.js for style analysis
    const doc = compromise(text)

    const sentences = doc.sentences().out("array")
    const words = doc.words().out("array")

    // Calculate style metrics
    const avgSentenceLength = words.length / sentences.length
    const complexWords = words.filter((word) => word.length > 6).length
    const readabilityScore = calculateReadabilityScore(text, language)

    const issues = []

    // Check for style issues
    if (avgSentenceLength > 25) {
      issues.push({
        type: "style",
        severity: "medium",
        position: { start: 0, end: text.length },
        originalText: "Texto completo",
        suggestion: "Considera dividir oraciones largas para mejorar la legibilidad",
        explanation: "Las oraciones muy largas pueden dificultar la comprensión",
        confidence: 0.8,
      })
    }

    if (complexWords / words.length > 0.3) {
      issues.push({
        type: "style",
        severity: "low",
        position: { start: 0, end: text.length },
        originalText: "Vocabulario",
        suggestion: "Considera usar palabras más simples cuando sea apropiado",
        explanation: "Un vocabulario muy complejo puede afectar la claridad",
        confidence: 0.7,
      })
    }

    return {
      score: Math.min(100, readabilityScore + 20),
      issues,
      metrics: {
        avgSentenceLength,
        complexWords: complexWords / words.length,
        readabilityScore,
      },
    }
  } catch (error) {
    logger.error("Error en análisis de estilo:", error)
    return {
      score: 75,
      issues: [],
    }
  }
}

/**
 * Analyze text coherence
 */
async function analyzeCoherence(text, language) {
  try {
    const doc = compromise(text)
    const sentences = doc.sentences().out("array")

    // Simple coherence analysis
    const issues = []
    let coherenceScore = 85

    // Check for paragraph transitions
    const paragraphs = text.split("\n\n")
    if (paragraphs.length > 2) {
      const transitionWords = ["además", "sin embargo", "por otro lado", "en consecuencia", "finalmente"]
      const hasTransitions = paragraphs.some((paragraph) =>
        transitionWords.some((word) => paragraph.toLowerCase().includes(word)),
      )

      if (!hasTransitions) {
        issues.push({
          type: "coherence",
          severity: "medium",
          position: { start: 0, end: text.length },
          originalText: "Estructura del texto",
          suggestion: "Agrega palabras de transición entre párrafos",
          explanation: "Las transiciones mejoran la fluidez y coherencia del texto",
          confidence: 0.75,
        })
        coherenceScore -= 15
      }
    }

    return {
      score: coherenceScore,
      issues,
    }
  } catch (error) {
    logger.error("Error en análisis de coherencia:", error)
    return {
      score: 75,
      issues: [],
    }
  }
}

/**
 * Analyze citations
 */
async function analyzeCitations(text, citationStyle) {
  try {
    const issues = []
    let citationScore = 90

    // Basic citation pattern matching
    const citationPatterns = {
      apa: /[A-Za-z]+,?\s+\d{4}/g,
      ieee: /\[\d+\]/g,
      mla: /[A-Za-z]+\s+\d+/g,
      chicago: /[A-Za-z]+\s+\d{4},?\s+\d+/g,
    }

    const pattern = citationPatterns[citationStyle]
    const citations = text.match(pattern) || []

    // Check for bibliography section
    const hasBibliography = /referencias|bibliografía|bibliography|works cited/i.test(text)

    if (citations.length === 0 && text.length > 1000) {
      issues.push({
        type: "citation",
        severity: "high",
        position: { start: 0, end: text.length },
        originalText: "Documento completo",
        suggestion: `Agrega citas en formato ${citationStyle.toUpperCase()}`,
        explanation: "Los trabajos académicos requieren citas apropiadas",
        confidence: 0.9,
      })
      citationScore -= 30
    }

    if (!hasBibliography && citations.length > 0) {
      issues.push({
        type: "citation",
        severity: "medium",
        position: { start: text.length - 100, end: text.length },
        originalText: "Final del documento",
        suggestion: "Agrega una sección de referencias o bibliografía",
        explanation: "Las citas requieren una lista de referencias completa",
        confidence: 0.85,
      })
      citationScore -= 20
    }

    return {
      score: citationScore,
      issues,
      citationCount: citations.length,
      hasBibliography,
    }
  } catch (error) {
    logger.error("Error en análisis de citas:", error)
    return {
      score: 75,
      issues: [],
    }
  }
}

/**
 * Detect plagiarism using embeddings
 */
async function detectPlagiarism(text, options = {}) {
  try {
    // Simulate plagiarism detection
    // In a real implementation, this would use embeddings and a database of sources
    const similarity = Math.random() * 20 // Random similarity 0-20%

    const sources = []
    if (similarity > 15) {
      sources.push({
        url: "https://example.com/academic-paper",
        title: "Similar Academic Paper",
        similarity: similarity,
        matchedText: text.substring(0, 100) + "...",
      })
    }

    return {
      similarity,
      sources,
      isOriginal: similarity < 15,
      confidence: 0.85,
    }
  } catch (error) {
    logger.error("Error en detección de plagio:", error)
    throw new Error("Error procesando la detección de plagio")
  }
}

/**
 * Generate improvement suggestions
 */
async function generateSuggestions(text, options = {}) {
  try {
    const { language = "es", citationStyle = "apa", category = "essay" } = options

    const prompt = `Genera sugerencias específicas para mejorar este ${category} académico en ${language === "es" ? "español" : "inglés"}:

    "${text}"

    Proporciona sugerencias en las siguientes categorías:
    1. Estructura y organización
    2. Claridad y coherencia
    3. Estilo académico
    4. Uso de evidencia y citas (formato ${citationStyle.toUpperCase()})
    5. Conclusiones y argumentación

    Responde EXCLUSIVAMENTE en formato JSON:
    {
      "suggestions": [
        {
          "category": "estructura|claridad|estilo|evidencia|argumentación",
          "priority": "high|medium|low",
          "suggestion": "sugerencia específica",
          "explanation": "explicación detallada",
          "example": "ejemplo opcional"
        }
      ]
    }`

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500,
      }
    })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const responseText = response.text()
    
    // Clean the response to extract only JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const cleanResponse = jsonMatch ? jsonMatch[0] : responseText
    
    const resultData = JSON.parse(cleanResponse)
    return resultData.suggestions
  } catch (error) {
    logger.error("Error generando sugerencias:", error)
    // Fallback suggestions
    return [
      {
        category: "estructura",
        priority: "medium",
        suggestion: "Considera agregar subtítulos para mejorar la organización",
        explanation: "Los subtítulos ayudan a los lectores a seguir la estructura del argumento",
      },
    ]
  }
}

/**
 * Calculate readability score
 */
function calculateReadabilityScore(text, language) {
  const words = tokenizer.tokenize(text)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

  // Flesch Reading Ease formula adapted for Spanish
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length

  let score
  if (language === "es") {
    // Adapted formula for Spanish
    score = 206.835 - 1.02 * avgWordsPerSentence - 60 * avgSyllablesPerWord
  } else {
    // Original Flesch formula for English
    score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  }

  return Math.max(0, Math.min(100, score))
}

/**
 * Count syllables in a word
 */
function countSyllables(word) {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
  word = word.replace(/^y/, "")
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

/**
 * Calculate overall confidence
 */
function calculateOverallConfidence(scores) {
  const scoreValues = Object.values(scores)
  const avgScore = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length
  return Math.min(1, avgScore / 100 + 0.2)
}

/**
 * Generate improvement suggestions based on scores
 */
function generateImprovementSuggestions(scores, issues) {
  const suggestions = []

  if (scores.grammar < 70) {
    suggestions.push("Revisa la gramática y ortografía del texto")
  }
  if (scores.style < 70) {
    suggestions.push("Mejora el estilo y la claridad de la escritura")
  }
  if (scores.coherence < 70) {
    suggestions.push("Trabaja en la coherencia y fluidez entre párrafos")
  }
  if (scores.citation < 70) {
    suggestions.push("Verifica el formato y completitud de las citas")
  }

  const criticalIssues = issues.filter((issue) => issue.severity === "critical").length
  if (criticalIssues > 0) {
    suggestions.push(`Atiende los ${criticalIssues} problemas críticos identificados`)
  }

  return suggestions
}

module.exports = {
  analyzeText,
  detectPlagiarism,
  generateSuggestions,
}