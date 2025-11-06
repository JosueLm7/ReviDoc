import { describe, beforeEach, it } from "cypress"
import Cypress from "cypress"

describe("AI Analysis", () => {
  beforeEach(() => {
    cy.login("estudiante@test.com", "Test123456")
    cy.visit("/app/documents")
  })

  describe("Happy Path - Successful AI Analysis", () => {
    it("Should run AI analysis on document", () => {
      // Go to first document
      cy.get("a", { timeout: 10000 }).contains("Ver").first().click()

      // Wait for document to load
      cy.url().should("include", "/app/documents/")

      // Click AI Analysis button
      cy.get("button").contains("Análisis IA").click()

      // Should show loading state
      cy.get("button").contains("Análisis IA").should("be.disabled")

      // Wait for analysis to complete
      cy.contains("Análisis completo", { timeout: 30000 }).should("be.visible")

      // Analysis results should be visible
      cy.contains("Puntuación").should("be.visible")
    })
  })

  describe("Sad Path - Failed AI Analysis", () => {
    it("Should show error when AI analysis fails", () => {
      cy.get("a", { timeout: 10000 }).contains("Ver").first().click()
      cy.url().should("include", "/app/documents/")

      // Mock failed API call
      cy.intercept("POST", "**/api/reviews", {
        statusCode: 500,
        body: { message: "Error en análisis IA" },
      })

      // Click AI Analysis button
      cy.get("button").contains("Análisis IA").click()

      // Should show error message
      cy.contains("Error", { timeout: 10000 }).should("be.visible")
    })

    it("Should show error if document has no content", () => {
      // Create empty document
      cy.visit("/app/documents/upload")

      const emptyFile = "empty.txt"
      cy.get('input[type="file"]').selectFile({
        contents: Cypress.Buffer.from(""),
        fileName: emptyFile,
        mimeType: "text/plain",
      })

      cy.contains(emptyFile).should("be.visible")
      cy.get("button").contains("Subir").click()
      cy.url().should("include", "/app/documents", { timeout: 5000 })

      // Go to the uploaded document
      cy.get("a").contains("Ver").first().click()

      // Click AI Analysis
      cy.get("button").contains("Análisis IA").click()

      // Should show error about empty content
      cy.contains("contenido", { timeout: 10000 }).should("be.visible")
    })
  })
})