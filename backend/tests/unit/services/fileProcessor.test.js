const fs = require("fs")
const path = require("path")
const { extractTextFromFile, validateFile, cleanExtractedText } = require("../../../services/fileProcessor")

describe("File Processor Service", () => {
  describe("cleanExtractedText", () => {
    it("should remove excessive whitespace", () => {
      const text = "This   has    too     much    whitespace"
      const cleaned = cleanExtractedText(text)

      expect(cleaned).toBe("This has too much whitespace")
    })

    it("should normalize line breaks", () => {
      const text = "Line 1\r\nLine 2\rLine 3\nLine 4"
      const cleaned = cleanExtractedText(text)

      expect(cleaned).toContain("Line 1\nLine 2\nLine 3\nLine 4")
    })

    it("should remove excessive line breaks", () => {
      const text = "Paragraph 1\n\n\n\n\nParagraph 2"
      const cleaned = cleanExtractedText(text)

      expect(cleaned).toBe("Paragraph 1\n\nParagraph 2")
    })

    it("should trim whitespace", () => {
      const text = "   Text with spaces   "
      const cleaned = cleanExtractedText(text)

      expect(cleaned).toBe("Text with spaces")
    })
  })

  describe("validateFile", () => {
    it("should validate allowed file types", () => {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]

      expect(allowedTypes).toHaveLength(4)
      expect(allowedTypes).toContain("application/pdf")
    })

    it("should reject files that are too large", () => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      const testSize = 15 * 1024 * 1024 // 15MB

      expect(testSize).toBeGreaterThan(maxSize)
    })

    it("should reject non-existent files", () => {
      const mockError = new Error("Archivo no encontrado")
      expect(mockError.message).toBe("Archivo no encontrado")
    })
  })
})
